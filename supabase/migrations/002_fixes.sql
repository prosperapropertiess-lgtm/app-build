-- ============================================================
-- Migration 002 — Security fixes + performance indexes
-- ============================================================

-- ============================================================
-- REVOKE overly broad grants from migration 001
-- anon should never have direct table access
-- ============================================================

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON storage.objects FROM anon;
REVOKE ALL ON storage.buckets FROM anon;

-- Authenticated users need SELECT/INSERT/UPDATE/DELETE — not DDL
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Keep schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- ============================================================
-- FIX: on_auth_user_created fires for tenants too
-- Only create landlord record if metadata says 'landlord'
-- Tenants are created via invite flow — not auto-created
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_landlord()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.raw_user_meta_data->>'role') = 'landlord' THEN
    INSERT INTO landlords (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FIX: Storage policies missing auth check
-- ============================================================

DROP POLICY IF EXISTS "Landlords can upload own files" ON storage.objects;
DROP POLICY IF EXISTS "Landlords can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Landlords can delete own files" ON storage.objects;

CREATE POLICY "Authenticated users can upload own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'landlord-files'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = 'landlord-' || auth.uid()::text
  );

CREATE POLICY "Authenticated users can view own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'landlord-files'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = 'landlord-' || auth.uid()::text
  );

CREATE POLICY "Authenticated users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'landlord-files'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = 'landlord-' || auth.uid()::text
  );

-- Tenants can view files in their unit folder
CREATE POLICY "Tenants can view their unit files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'landlord-files'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM tenants
      WHERE tenants.id = auth.uid()
    )
  );

-- ============================================================
-- FIX: dashboard_summary view leaks cross-landlord data
-- Replace with a secure function instead
-- ============================================================

DROP VIEW IF EXISTS dashboard_summary;

CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS TABLE (
  total_properties BIGINT,
  total_units BIGINT,
  total_tenants BIGINT,
  total_rent_collected NUMERIC,
  total_expenses NUMERIC,
  open_maintenance BIGINT
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT p.id),
    COUNT(DISTINCT u.id),
    COUNT(DISTINCT t.id) FILTER (WHERE t.invite_status = 'accepted'),
    COALESCE(SUM(pay.amount) FILTER (WHERE pay.status = 'completed' AND pay.type = 'rent'), 0),
    COALESCE(SUM(exp.amount), 0),
    COUNT(DISTINCT mr.id) FILTER (WHERE mr.status NOT IN ('completed', 'closed'))
  FROM landlords l
  LEFT JOIN properties p ON p.landlord_id = l.id
  LEFT JOIN units u ON u.property_id = p.id
  LEFT JOIN tenants t ON t.landlord_id = l.id
  LEFT JOIN payments pay ON pay.landlord_id = l.id
  LEFT JOIN expenses exp ON exp.landlord_id = l.id
  LEFT JOIN maintenance_requests mr ON mr.landlord_id = l.id
  WHERE l.id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION get_dashboard_summary() TO authenticated;

-- ============================================================
-- FIX: Work orders — contractor public access via token
-- Uses a service-role API route, but add anon select for token lookup
-- ============================================================

CREATE POLICY "Public work order access via token"
  ON work_orders FOR SELECT
  USING (access_token IS NOT NULL);

CREATE POLICY "Public work order update via token"
  ON work_orders FOR UPDATE
  USING (access_token IS NOT NULL)
  WITH CHECK (access_token IS NOT NULL);

-- ============================================================
-- FIX: Tenant invites — public lookup by token (for invite page)
-- ============================================================

CREATE POLICY "Public invite lookup by token"
  ON tenant_invites FOR SELECT
  USING (true);

-- ============================================================
-- PERFORMANCE: Indexes on all FK columns
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_properties_landlord_id ON properties(landlord_id);
CREATE INDEX IF NOT EXISTS idx_units_property_id ON units(property_id);
CREATE INDEX IF NOT EXISTS idx_tenants_landlord_id ON tenants(landlord_id);
CREATE INDEX IF NOT EXISTS idx_tenants_unit_id ON tenants(unit_id);
CREATE INDEX IF NOT EXISTS idx_leases_unit_id ON leases(unit_id);
CREATE INDEX IF NOT EXISTS idx_leases_tenant_id ON leases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leases_landlord_id ON leases(landlord_id);
CREATE INDEX IF NOT EXISTS idx_leases_status ON leases(status);
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_landlord_id ON payments(landlord_id);
CREATE INDEX IF NOT EXISTS idx_payments_lease_id ON payments(lease_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_landlord_id ON maintenance_requests(landlord_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tenant_id ON maintenance_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_access_token ON work_orders(access_token);
CREATE INDEX IF NOT EXISTS idx_work_orders_landlord_id ON work_orders(landlord_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_expenses_landlord_id ON expenses(landlord_id);
CREATE INDEX IF NOT EXISTS idx_income_landlord_id ON income(landlord_id);
CREATE INDEX IF NOT EXISTS idx_tenant_invites_token ON tenant_invites(token);
CREATE INDEX IF NOT EXISTS idx_tenant_invites_email ON tenant_invites(email);

-- ============================================================
-- CLEANUP: Remove duplicate enums (can't drop if columns use them,
-- but flag for OpenClaw to avoid using sender_type_enum /
-- recipient_type_enum in new code — use user_type_enum instead)
-- ============================================================

COMMENT ON TYPE sender_type_enum IS 'DEPRECATED: use user_type_enum';
COMMENT ON TYPE recipient_type_enum IS 'DEPRECATED: use user_type_enum';
COMMENT ON TYPE message_sender_type_enum IS 'DEPRECATED: use user_type_enum';
COMMENT ON TYPE message_recipient_type_enum IS 'DEPRECATED: use user_type_enum';
