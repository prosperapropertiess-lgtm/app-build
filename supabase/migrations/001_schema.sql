-- ============================================================
-- Project X — Supabase Schema Migration
-- All 14 tables + RLS policies for property management PWA
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE property_type_enum AS ENUM (
  'single_family', 'duplex', 'triplex', 'fourplex', 'multi_unit'
);

CREATE TYPE unit_status_enum AS ENUM (
  'vacant', 'occupied', 'notice_given'
);

CREATE TYPE invite_status_enum AS ENUM (
  'pending', 'accepted'
);

CREATE TYPE lease_status_enum AS ENUM (
  'active', 'expired', 'terminated'
);

CREATE TYPE payment_type_enum AS ENUM (
  'rent', 'late_fee', 'security_deposit'
);

CREATE TYPE payment_status_enum AS ENUM (
  'pending', 'completed', 'failed', 'refunded'
);

CREATE TYPE payment_method_enum AS ENUM (
  'stripe', 'manual'
);

CREATE TYPE maintenance_priority_enum AS ENUM (
  'low', 'normal', 'urgent', 'emergency'
);

CREATE TYPE maintenance_status_enum AS ENUM (
  'submitted', 'reviewed', 'assigned', 'in_progress', 'completed', 'closed'
);

CREATE TYPE contractor_specialty_enum AS ENUM (
  'plumbing', 'electrical', 'hvac', 'general', 'appliance',
  'roofing', 'pest_control', 'cleaning', 'other'
);

CREATE TYPE work_order_status_enum AS ENUM (
  'sent', 'viewed', 'in_progress', 'completed', 'paid'
);

CREATE TYPE expense_category_enum AS ENUM (
  'maintenance', 'insurance', 'tax', 'mortgage', 'utility', 'management', 'other'
);

CREATE TYPE income_category_enum AS ENUM (
  'rent', 'late_fee', 'parking', 'laundry', 'other'
);

CREATE TYPE notification_type_enum AS ENUM (
  'rent_reminder', 'rent_paid', 'rent_late', 'maintenance_submitted',
  'maintenance_updated', 'work_order_completed', 'general'
);

CREATE TYPE user_type_enum AS ENUM (
  'landlord', 'tenant'
);

CREATE TYPE message_sender_type_enum AS ENUM (
  'landlord', 'tenant'
);

CREATE TYPE message_recipient_type_enum AS ENUM (
  'landlord', 'tenant'
);

CREATE TYPE document_type_enum AS ENUM (
  'lease', 'inspection', 'insurance', 'receipt', 'n4', 'n1', 'n2', 'other'
);

CREATE TYPE sender_type_enum AS ENUM (
  'landlord', 'tenant'
);

CREATE TYPE recipient_type_enum AS ENUM (
  'landlord', 'tenant'
);

-- ============================================================
-- LANDLORDS
-- ============================================================

CREATE TABLE landlords (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  company_name TEXT,
  stripe_account_id TEXT,
  max_properties INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROPERTIES
-- ============================================================

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landlord_id UUID NOT NULL REFERENCES landlords(id) ON DELETE CASCADE,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  province TEXT NOT NULL DEFAULT 'Ontario',
  postal_code TEXT NOT NULL,
  property_type property_type_enum NOT NULL,
  total_units INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- UNITS
-- ============================================================

CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  bedrooms INT NOT NULL DEFAULT 1,
  bathrooms DECIMAL(3,1) NOT NULL DEFAULT 1.0,
  square_footage INT,
  rent_amount DECIMAL(10,2) NOT NULL,
  status unit_status_enum NOT NULL DEFAULT 'vacant',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TENANTS
-- ============================================================

CREATE TABLE tenants (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES landlords(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  invite_status invite_status_enum NOT NULL DEFAULT 'pending',
  payment_streak INT NOT NULL DEFAULT 0,
  auto_pay_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LEASES
-- ============================================================

CREATE TABLE leases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  landlord_id UUID NOT NULL REFERENCES landlords(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  rent_amount DECIMAL(10,2) NOT NULL,
  rent_due_day INT NOT NULL CHECK (rent_due_day BETWEEN 1 AND 28),
  late_fee_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  late_fee_grace_days INT NOT NULL DEFAULT 0,
  security_deposit DECIMAL(10,2) NOT NULL DEFAULT 0,
  lease_document_url TEXT,
  status lease_status_enum NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS
-- ============================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE RESTRICT,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES landlords(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  type payment_type_enum NOT NULL DEFAULT 'rent',
  status payment_status_enum NOT NULL DEFAULT 'pending',
  stripe_payment_id TEXT,
  payment_method payment_method_enum NOT NULL DEFAULT 'manual',
  due_date DATE NOT NULL,
  paid_date TIMESTAMPTZ,
  is_late BOOLEAN NOT NULL DEFAULT FALSE,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MAINTENANCE_REQUESTS
-- ============================================================

CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES landlords(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  priority maintenance_priority_enum NOT NULL DEFAULT 'normal',
  status maintenance_status_enum NOT NULL DEFAULT 'submitted',
  ai_analysis JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CONTRACTORS
-- ============================================================

CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landlord_id UUID NOT NULL REFERENCES landlords(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  specialty contractor_specialty_enum NOT NULL DEFAULT 'general',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- WORK_ORDERS
-- ============================================================

CREATE TABLE work_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  maintenance_request_id UUID NOT NULL REFERENCES maintenance_requests(id) ON DELETE RESTRICT,
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE RESTRICT,
  landlord_id UUID NOT NULL REFERENCES landlords(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  ai_suggestions TEXT,
  status work_order_status_enum NOT NULL DEFAULT 'sent',
  contractor_notes TEXT,
  completion_photos TEXT[] DEFAULT '{}',
  quoted_amount DECIMAL(10,2),
  final_amount DECIMAL(10,2),
  payment_method payment_method_enum,
  stripe_payment_id TEXT,
  access_token TEXT NOT NULL UNIQUE DEFAULT uuid_generate_v4()::TEXT,
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EXPENSES
-- ============================================================

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landlord_id UUID NOT NULL REFERENCES landlords(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  category expense_category_enum NOT NULL DEFAULT 'other',
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INCOME
-- ============================================================

CREATE TABLE income (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landlord_id UUID NOT NULL REFERENCES landlords(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  category income_category_enum NOT NULL DEFAULT 'rent',
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  user_type user_type_enum NOT NULL,
  type notification_type_enum NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  push_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MESSAGES
-- ============================================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL,
  sender_type sender_type_enum NOT NULL,
  recipient_id UUID NOT NULL,
  recipient_type recipient_type_enum NOT NULL,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOCUMENTS
-- ============================================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landlord_id UUID NOT NULL REFERENCES landlords(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  type document_type_enum NOT NULL DEFAULT 'other',
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TENANT_INVITES (for invite flow)
-- ============================================================

CREATE TABLE tenant_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landlord_id UUID NOT NULL REFERENCES landlords(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE DEFAULT uuid_generate_v4()::TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_landlords_updated_at
  BEFORE UPDATE ON landlords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_units_updated_at
  BEFORE UPDATE ON units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leases_updated_at
  BEFORE UPDATE ON leases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_requests_updated_at
  BEFORE UPDATE ON maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- AUTO-CREATE LANDLORD ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_landlord()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO landlords (id, email)
  VALUES (
    NEW.id,
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_landlord();

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE landlords ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_invites ENABLE ROW LEVEL SECURITY;

-- LANDLORDS: own data only
CREATE POLICY "Landlords can view own record"
  ON landlords FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Landlords can update own record"
  ON landlords FOR UPDATE
  USING (auth.uid() = id);

-- PROPERTIES: landlord owns them
CREATE POLICY "Landlords can view own properties"
  ON properties FOR SELECT
  USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can insert own properties"
  ON properties FOR INSERT
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update own properties"
  ON properties FOR UPDATE
  USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can delete own properties"
  ON properties FOR DELETE
  USING (auth.uid() = landlord_id);

-- UNITS: through property ownership
CREATE POLICY "Landlords can view own units"
  ON units FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = units.property_id
      AND properties.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can insert own units"
  ON units FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = units.property_id
      AND properties.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can update own units"
  ON units FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = units.property_id
      AND properties.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can delete own units"
  ON units FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = units.property_id
      AND properties.landlord_id = auth.uid()
    )
  );

-- TENANTS: landlord sees their own tenants, tenant sees self
CREATE POLICY "Landlords can view own tenants"
  ON tenants FOR SELECT
  USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can insert own tenants"
  ON tenants FOR INSERT
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update own tenants"
  ON tenants FOR UPDATE
  USING (auth.uid() = landlord_id);

CREATE POLICY "Tenants can view own record"
  ON tenants FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Tenants can update own record"
  ON tenants FOR UPDATE
  USING (auth.uid() = id);

-- LEASES: landlord owns, tenant is linked
CREATE POLICY "Landlords can view own leases"
  ON leases FOR SELECT
  USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can insert own leases"
  ON leases FOR INSERT
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update own leases"
  ON leases FOR UPDATE
  USING (auth.uid() = landlord_id);

CREATE POLICY "Tenants can view own lease"
  ON leases FOR SELECT
  USING (auth.uid() = tenant_id);

-- PAYMENTS: landlord sees all, tenant sees own
CREATE POLICY "Landlords can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can insert own payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update own payments"
  ON payments FOR UPDATE
  USING (auth.uid() = landlord_id);

CREATE POLICY "Tenants can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = tenant_id);

CREATE POLICY "Tenants can insert own payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = tenant_id);

-- MAINTENANCE REQUESTS: landlord sees, tenant sees own
CREATE POLICY "Landlords can view own maintenance requests"
  ON maintenance_requests FOR SELECT
  USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update own maintenance requests"
  ON maintenance_requests FOR UPDATE
  USING (auth.uid() = landlord_id);

CREATE POLICY "Tenants can view own maintenance requests"
  ON maintenance_requests FOR SELECT
  USING (auth.uid() = tenant_id);

CREATE POLICY "Tenants can insert own maintenance requests"
  ON maintenance_requests FOR INSERT
  WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Tenants can update own maintenance requests"
  ON maintenance_requests FOR UPDATE
  USING (auth.uid() = tenant_id);

-- CONTRACTORS: landlord only
CREATE POLICY "Landlords can view own contractors"
  ON contractors FOR SELECT
  USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can insert own contractors"
  ON contractors FOR INSERT
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update own contractors"
  ON contractors FOR UPDATE
  USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can delete own contractors"
  ON contractors FOR DELETE
  USING (auth.uid() = landlord_id);

-- WORK ORDERS: landlord sees, contractor via token handled separately
CREATE POLICY "Landlords can view own work orders"
  ON work_orders FOR SELECT
  USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can insert own work orders"
  ON work_orders FOR INSERT
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update own work orders"
  ON work_orders FOR UPDATE
  USING (auth.uid() = landlord_id);

-- EXPENSES: landlord only
CREATE POLICY "Landlords can view own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can insert own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can delete own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = landlord_id);

-- INCOME: landlord only
CREATE POLICY "Landlords can view own income"
  ON income FOR SELECT
  USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can insert own income"
  ON income FOR INSERT
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update own income"
  ON income FOR UPDATE
  USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can delete own income"
  ON income FOR DELETE
  USING (auth.uid() = landlord_id);

-- NOTIFICATIONS: user sees their own
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- MESSAGES: sender or recipient
CREATE POLICY "Users can view own messages as sender"
  ON messages FOR SELECT
  USING (sender_id = auth.uid());

CREATE POLICY "Users can view own messages as recipient"
  ON messages FOR SELECT
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can insert own messages"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- DOCUMENTS: landlord owns all, tenant can view own
CREATE POLICY "Landlords can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can delete own documents"
  ON documents FOR DELETE
  USING (auth.uid() = landlord_id);

CREATE POLICY "Tenants can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() = tenant_id);

-- TENANT_INVITES: landlord manages
CREATE POLICY "Landlords can view own invites"
  ON tenant_invites FOR SELECT
  USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can insert own invites"
  ON tenant_invites FOR INSERT
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can delete own invites"
  ON tenant_invites FOR DELETE
  USING (auth.uid() = landlord_id);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES
  ('landlord-files', 'landlord-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for landlord files
CREATE POLICY "Landlords can upload own files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'landlord-files');

CREATE POLICY "Landlords can view own files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'landlord-files');

CREATE POLICY "Landlords can delete own files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'landlord-files');

-- ============================================================
-- SUMMARY VIEW: landlord dashboard summary
-- ============================================================

CREATE OR REPLACE VIEW dashboard_summary AS
SELECT
  l.id AS landlord_id,
  COUNT(DISTINCT p.id) AS total_properties,
  COUNT(DISTINCT u.id) AS total_units,
  COUNT(DISTINCT t.id) FILTER (WHERE t.invite_status = 'accepted') AS total_tenants,
  COALESCE(SUM(CASE WHEN pay.status = 'completed' AND pay.type = 'rent' THEN pay.amount END), 0) AS total_rent_collected,
  COALESCE(SUM(CASE WHEN exp.id IS NOT NULL THEN exp.amount END), 0) AS total_expenses,
  COUNT(DISTINCT mr.id) FILTER (WHERE mr.status NOT IN ('completed', 'closed')) AS open_maintenance
FROM landlords l
LEFT JOIN properties p ON p.landlord_id = l.id
LEFT JOIN units u ON u.property_id = p.id
LEFT JOIN tenants t ON t.landlord_id = l.id
LEFT JOIN leases le ON le.tenant_id = t.id AND le.status = 'active'
LEFT JOIN payments pay ON pay.landlord_id = l.id
LEFT JOIN expenses exp ON exp.landlord_id = l.id
LEFT JOIN maintenance_requests mr ON mr.landlord_id = l.id
GROUP BY l.id;

-- Grant usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES TO anon, authenticated;
GRANT ALL ON storage.buckets TO anon, authenticated;
GRANT ALL ON storage.objects TO anon, authenticated;