-- ============================================================
-- Screen Build Queue + Progress Tracker
-- ============================================================

CREATE TABLE IF NOT EXISTS screen_build_queue (
  id SERIAL PRIMARY KEY,
  screen_folder TEXT NOT NULL UNIQUE,
  route TEXT,
  component_path TEXT,
  phase INTEGER NOT NULL DEFAULT 0,
  phase_name TEXT NOT NULL DEFAULT 'Uncategorized',
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  built_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_screen_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_screen_build_queue_updated_at
  BEFORE UPDATE ON screen_build_queue
  FOR EACH ROW EXECUTE FUNCTION update_screen_queue_updated_at();

-- ============================================================
-- Full screen queue seed (all 98 screens in order)
-- ============================================================

INSERT INTO screen_build_queue (screen_folder, route, component_path, phase, phase_name, priority, notes) VALUES
-- Phase 0: Infrastructure
('login_landlord_1', '/login', 'src/app/(auth)/login/page.tsx', 0, 'Infrastructure', 10, 'Auth - landlord login'),
('login_tenant_1', '/tenant/login', 'src/app/(tenant)/tenant/login/page.tsx', 0, 'Infrastructure', 10, 'Auth - tenant login'),
('sign_up_landlord', '/signup', 'src/app/(auth)/signup/page.tsx', 0, 'Infrastructure', 10, 'Auth - landlord signup'),
('login_landlord_2', '/login', 'src/app/(auth)/login/page.tsx', 0, 'Infrastructure', 9, 'Auth - landlord login variant'),
('login_tenant_2', '/tenant/login', 'src/app/(tenant)/tenant/login/page.tsx', 0, 'Infrastructure', 9, 'Auth - tenant login variant'),
('forgot_password', '/forgot-password', 'src/app/(auth)/forgot-password/page.tsx', 0, 'Infrastructure', 8, 'Auth - forgot password'),
('onboarding_welcome', '/onboarding', 'src/app/(landlord)/onboarding/page.tsx', 0, 'Infrastructure', 7, 'Onboarding welcome'),
('onboarding_profile_setup', '/onboarding/profile', 'src/app/(landlord)/onboarding/profile/page.tsx', 0, 'Infrastructure', 7, 'Onboarding profile'),
('onboarding_payment_setup', '/onboarding/payment', 'src/app/(landlord)/onboarding/payment/page.tsx', 0, 'Infrastructure', 7, 'Onboarding payment'),
('onboarding_first_property_1', '/onboarding/property', 'src/app/(landlord)/onboarding/property/page.tsx', 0, 'Infrastructure', 7, 'Onboarding first property'),
('onboarding_success', '/onboarding/success', 'src/app/(landlord)/onboarding/success/page.tsx', 0, 'Infrastructure', 7, 'Onboarding success'),
-- Phase 1: Landlord Core
('landlord_dashboard_1', '/dashboard', 'src/app/(landlord)/dashboard/page.tsx', 1, 'Landlord Core', 10, 'Main dashboard'),
('landlord_dashboard_empty_state_1', '/dashboard', 'src/app/(landlord)/dashboard/page.tsx', 1, 'Landlord Core', 9, 'Dashboard empty state'),
('landlord_dashboard_2', '/dashboard', 'src/app/(landlord)/dashboard/page.tsx', 1, 'Landlord Core', 8, 'Dashboard variant'),
('landlord_dashboard_3', '/dashboard', 'src/app/(landlord)/dashboard/page.tsx', 1, 'Landlord Core', 7, 'Dashboard variant'),
('landlord_dashboard_4', '/dashboard', 'src/app/(landlord)/dashboard/page.tsx', 1, 'Landlord Core', 6, 'Dashboard variant'),
('landlord_dashboard_5', '/dashboard', 'src/app/(landlord)/dashboard/page.tsx', 1, 'Landlord Core', 5, 'Dashboard variant'),
('landlord_dashboard_empty_state_2', '/dashboard', 'src/app/(landlord)/dashboard/page.tsx', 1, 'Landlord Core', 4, 'Dashboard empty state variant'),
('master_landlord_hub', '/dashboard', 'src/app/(landlord)/dashboard/page.tsx', 1, 'Landlord Core', 3, 'Master hub variant'),
('tenant_profile', '/tenants/[id]', 'src/app/(landlord)/tenants/[id]/page.tsx', 1, 'Landlord Core', 6, 'Tenant profile detail'),
-- Phase 2: Property Management
('my_properties_1', '/properties', 'src/app/(landlord)/properties/page.tsx', 2, 'Property Management', 10, 'Properties list'),
('my_properties_2', '/properties', 'src/app/(landlord)/properties/page.tsx', 2, 'Property Management', 9, 'Properties list variant'),
('add_property', '/properties/new', 'src/app/(landlord)/properties/new/page.tsx', 2, 'Property Management', 10, 'Add property form'),
('property_details_1', '/properties/[id]', 'src/app/(landlord)/properties/[id]/page.tsx', 2, 'Property Management', 10, 'Property detail'),
('property_details_2', '/properties/[id]', 'src/app/(landlord)/properties/[id]/page.tsx', 2, 'Property Management', 9, 'Property detail variant'),
('manage_units_1', '/properties/[id]/units', 'src/app/(landlord)/properties/[id]/units/page.tsx', 2, 'Property Management', 10, 'Manage units'),
('manage_units_2', '/properties/[id]/units', 'src/app/(landlord)/properties/[id]/units/page.tsx', 2, 'Property Management', 9, 'Manage units variant'),
('unit_details', '/properties/[id]/units/[unitId]', 'src/app/(landlord)/properties/[id]/units/[unitId]/page.tsx', 2, 'Property Management', 10, 'Unit detail'),
-- Phase 3: Tenant Management
('invite_tenant_1', '/tenants/invite', 'src/app/(landlord)/tenants/invite/page.tsx', 3, 'Tenant Management', 10, 'Invite tenant'),
('invite_tenant_2', '/tenants/invite', 'src/app/(landlord)/tenants/invite/page.tsx', 3, 'Tenant Management', 9, 'Invite tenant variant'),
('add_manual_tenant', '/tenants/new', 'src/app/(landlord)/tenants/new/page.tsx', 3, 'Tenant Management', 8, 'Add manual tenant'),
-- Phase 4: Tenant Portal
('tenant_dashboard_1', '/tenant/dashboard', 'src/app/(tenant)/tenant/dashboard/page.tsx', 4, 'Tenant Portal', 10, 'Tenant dashboard'),
('tenant_dashboard_2', '/tenant/dashboard', 'src/app/(tenant)/tenant/dashboard/page.tsx', 4, 'Tenant Portal', 9, 'Tenant dashboard variant'),
('tenant_dashboard_3', '/tenant/dashboard', 'src/app/(tenant)/tenant/dashboard/page.tsx', 4, 'Tenant Portal', 8, 'Tenant dashboard variant'),
('tenant_dashboard_4', '/tenant/dashboard', 'src/app/(tenant)/tenant/dashboard/page.tsx', 4, 'Tenant Portal', 7, 'Tenant dashboard variant'),
('tenant_dashboard_5', '/tenant/dashboard', 'src/app/(tenant)/tenant/dashboard/page.tsx', 4, 'Tenant Portal', 6, 'Tenant dashboard variant'),
('pay_rent_1', '/tenant/pay', 'src/app/(tenant)/tenant/pay/page.tsx', 4, 'Tenant Portal', 10, 'Pay rent'),
('pay_rent_2', '/tenant/pay', 'src/app/(tenant)/tenant/pay/page.tsx', 4, 'Tenant Portal', 9, 'Pay rent variant'),
('tenant_ai_help_desk_1', '/tenant/help', 'src/app/(tenant)/tenant/help/page.tsx', 4, 'Tenant Portal', 7, 'AI help desk'),
('tenant_ai_help_desk_2', '/tenant/help', 'src/app/(tenant)/tenant/help/page.tsx', 4, 'Tenant Portal', 6, 'AI help desk variant'),
-- Phase 5: Maintenance Landlord
('maintenance_request_1', '/maintenance', 'src/app/(landlord)/maintenance/page.tsx', 5, 'Maintenance', 10, 'Maintenance list'),
('maintenance_request_2', '/maintenance/[id]', 'src/app/(landlord)/maintenance/[id]/page.tsx', 5, 'Maintenance', 10, 'Maintenance detail'),
('maintenance_request_3', '/maintenance/[id]', 'src/app/(landlord)/maintenance/[id]/page.tsx', 5, 'Maintenance', 9, 'Maintenance detail variant'),
('maintenance_request_4', '/maintenance/new', 'src/app/(landlord)/maintenance/new/page.tsx', 5, 'Maintenance', 9, 'New maintenance form'),
-- Phase 6: Maintenance Tenant
('maintenance_request_1_tenant', '/tenant/maintenance/new', 'src/app/(tenant)/tenant/maintenance/new/page.tsx', 6, 'Maintenance Tenant', 10, 'Tenant submit request'),
-- Phase 7: Work Orders
('contractor_work_order_1', '/work-orders/[id]', 'src/app/(contractor)/contractor/dashboard/page.tsx', 7, 'Work Orders', 10, 'Contractor work order'),
('contractor_work_order_2', '/work-orders/[id]', 'src/app/(contractor)/contractor/dashboard/page.tsx', 7, 'Work Orders', 9, 'Work order variant'),
('contractor_work_order_3', '/work-orders/[id]', 'src/app/(contractor)/contractor/dashboard/page.tsx', 7, 'Work Orders', 8, 'Work order variant'),
('ai_contractor_messaging', '/work-orders/[id]/message', 'src/app/(landlord)/work-orders/[id]/message/page.tsx', 7, 'Work Orders', 7, 'AI contractor messaging'),
-- Phase 8: Financials
('financials_dashboard_1', '/financials', 'src/app/(landlord)/financials/page.tsx', 8, 'Financials', 10, 'Financials dashboard'),
('financials_dashboard_2', '/financials', 'src/app/(landlord)/financials/page.tsx', 8, 'Financials', 9, 'Financials dashboard variant'),
('financial_export_1', '/export', 'src/app/(landlord)/export/page.tsx', 8, 'Financials', 10, 'Financial export'),
('financial_export_2', '/export', 'src/app/(landlord)/export/page.tsx', 8, 'Financials', 9, 'Financial export variant'),
('ai_expense_scanner_1', '/financials/expenses/scan', 'src/app/(landlord)/financials/expenses/scan/page.tsx', 8, 'Financials', 7, 'AI expense scanner'),
('ai_expense_scanner_2', '/financials/expenses/scan', 'src/app/(landlord)/financials/expenses/scan/page.tsx', 8, 'Financials', 6, 'AI expense scanner variant'),
-- Phase 9: Messages
('messages_list_landlord_1', '/messages', 'src/app/(landlord)/messages/page.tsx', 9, 'Messages', 10, 'Messages list'),
('messages_list_landlord_2', '/messages', 'src/app/(landlord)/messages/page.tsx', 9, 'Messages', 9, 'Messages list variant'),
('chat_thread_landlord', '/messages/[tenantId]', 'src/app/(landlord)/messages/[tenantId]/page.tsx', 9, 'Messages', 10, 'Chat thread'),
-- Phase 10: Documents
('document_vault_landlord_1', '/documents', 'src/app/(landlord)/documents/page.tsx', 10, 'Documents', 10, 'Document vault'),
('document_vault_landlord_2', '/documents', 'src/app/(landlord)/documents/page.tsx', 10, 'Documents', 9, 'Document vault variant'),
('lease_agreement_tenant', '/tenant/documents', 'src/app/(tenant)/tenant/documents/page.tsx', 10, 'Documents', 10, 'Lease agreement'),
('my_documents_tenant_1', '/tenant/documents', 'src/app/(tenant)/tenant/documents/page.tsx', 10, 'Documents', 9, 'Tenant documents'),
('my_documents_tenant_2', '/tenant/documents', 'src/app/(tenant)/tenant/documents/page.tsx', 10, 'Documents', 8, 'Tenant documents variant'),
-- Phase 11: Settings + Onboarding
('settings', '/settings', 'src/app/(landlord)/settings/page.tsx', 11, 'Settings', 10, 'Settings page'),
('settings_stripe_setup_1', '/settings/stripe', 'src/app/(landlord)/settings/stripe/page.tsx', 11, 'Settings', 10, 'Stripe setup'),
('settings_stripe_setup_2', '/settings/stripe', 'src/app/(landlord)/settings/stripe/page.tsx', 11, 'Settings', 9, 'Stripe setup variant'),
('notification_preferences', '/settings/notifications', 'src/app/(landlord)/settings/notifications/page.tsx', 11, 'Settings', 8, 'Notification preferences'),
('onboarding_checklist_landlord_1', '/onboarding/checklist', 'src/app/(landlord)/onboarding/checklist/page.tsx', 11, 'Settings', 7, 'Onboarding checklist'),
('onboarding_checklist_landlord_2', '/onboarding/checklist', 'src/app/(landlord)/onboarding/checklist/page.tsx', 11, 'Settings', 6, 'Onboarding checklist variant'),
('onboarding_checklist_landlord_gamified', '/onboarding/checklist', 'src/app/(landlord)/onboarding/checklist/page.tsx', 11, 'Settings', 5, 'Onboarding gamified'),
('onboarding_checklist_tenant_1', '/tenant/onboarding', 'src/app/(tenant)/tenant/onboarding/page.tsx', 11, 'Settings', 7, 'Tenant onboarding checklist'),
('onboarding_checklist_tenant_2', '/tenant/onboarding', 'src/app/(tenant)/tenant/onboarding/page.tsx', 11, 'Settings', 6, 'Tenant onboarding checklist variant'),
('onboarding_gamified_checklist', '/tenant/onboarding', 'src/app/(tenant)/tenant/onboarding/page.tsx', 11, 'Settings', 5, 'Tenant onboarding gamified'),
-- Phase 12: Lease
('smart_lease_renewal_1', '/leases/renew', 'src/app/(landlord)/leases/renew/page.tsx', 12, 'Lease Management', 10, 'Smart lease renewal'),
('smart_lease_renewal_2', '/leases/renew', 'src/app/(landlord)/leases/renew/page.tsx', 12, 'Lease Management', 9, 'Smart lease renewal variant'),
('smart_lease_renewal_3', '/leases/renew', 'src/app/(landlord)/leases/renew/page.tsx', 12, 'Lease Management', 8, 'Smart lease renewal variant'),
('end_lease_workflow', '/leases/[id]/end', 'src/app/(landlord)/leases/[id]/end/page.tsx', 12, 'Lease Management', 7, 'End lease workflow'),
-- Phase 13: AI Features
('ai_deposit_reconciliation_1', '/maintenance/[id]/deposit', 'src/app/(landlord)/maintenance/[id]/deposit/page.tsx', 13, 'AI Features', 10, 'AI deposit reconciliation'),
('ai_deposit_reconciliation_2', '/maintenance/[id]/deposit', 'src/app/(landlord)/maintenance/[id]/deposit/page.tsx', 13, 'AI Features', 9, 'AI deposit reconciliation variant'),
('ai_move_out_inspection_1', '/units/[id]/inspection', 'src/app/(landlord)/units/[id]/inspection/page.tsx', 13, 'AI Features', 10, 'AI move-out inspection'),
('ai_move_out_inspection_2', '/units/[id]/inspection', 'src/app/(landlord)/units/[id]/inspection/page.tsx', 13, 'AI Features', 9, 'AI move-out inspection variant'),
-- Phase 14: Automations + Network
('invisible_automations_log_1', '/automations', 'src/app/(landlord)/automations/page.tsx', 14, 'Automations', 10, 'Automations log'),
('invisible_automations_log_2', '/automations', 'src/app/(landlord)/automations/page.tsx', 14, 'Automations', 9, 'Automations log variant'),
('peer_network_insights_1', '/network', 'src/app/(landlord)/network/page.tsx', 14, 'Automations', 8, 'Peer network insights'),
('peer_network_insights_2', '/network', 'src/app/(landlord)/network/page.tsx', 14, 'Automations', 7, 'Peer network insights variant'),
('refined_peer_network_insights', '/network', 'src/app/(landlord)/network/page.tsx', 14, 'Automations', 6, 'Refined peer network'),
('vetted_vendor_directory', '/vendors', 'src/app/(landlord)/vendors/page.tsx', 14, 'Automations', 7, 'Vetted vendor directory'),
-- Phase 15: Public + Growth
('public_property_listing', '/listing/[id]', 'src/app/(public)/listing/[id]/page.tsx', 15, 'Public', 10, 'Public property listing'),
('welcome_home_portal', '/welcome', 'src/app/(public)/welcome/page.tsx', 15, 'Public', 9, 'Welcome home portal'),
('digital_welcome_book', '/tenant/welcome', 'src/app/(tenant)/tenant/welcome/page.tsx', 15, 'Public', 8, 'Digital welcome book'),
('digital_welcome_book_ai_concierge_1', '/tenant/welcome', 'src/app/(tenant)/tenant/welcome/page.tsx', 15, 'Public', 7, 'Welcome book AI concierge'),
('digital_welcome_book_ai_concierge_3', '/tenant/welcome', 'src/app/(tenant)/tenant/welcome/page.tsx', 15, 'Public', 6, 'Welcome book AI concierge variant'),
-- Reference screens (informational only)
('prospera_mvp_master_map', NULL, NULL, 99, 'Reference', 0, 'MASTER MAP - visual reference only'),
('prospera_mvp_master_canvas_v3', NULL, NULL, 99, 'Reference', 0, 'MASTER CANVAS - visual reference only'),
('prospera_mvp_functional_prototype', NULL, NULL, 99, 'Reference', 0, 'FUNCTIONAL PROTOTYPE - reference only'),
('a_clean_professional_infographic_diagram_showing_an_invisible_automation_flow', NULL, NULL, 99, 'Reference', 0, 'INFOGRAPHIC - reference only'),
('1737183555333.jpeg', NULL, NULL, 99, 'Reference', 0, 'JUNK - discard')
ON CONFLICT (screen_folder) DO NOTHING;