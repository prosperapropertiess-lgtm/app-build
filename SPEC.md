# Project X — MVP Build Plan

## Overview

Project X is a Progressive Web App (PWA) that replaces property management companies for small-scale landlords. It handles everything a property management company does—except physically visiting properties. Landlords manage properties, tenants, rent, maintenance, finances, contractors, and communications from one app. Tenants get their own portal.

**Stage 1 MVP:** Up to 5 properties per landlord account.

**Target user:** Small-scale landlords (1-5 properties) in Ontario, Canada.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16 + React (TypeScript) | App framework, SSR, PWA |
| Styling | Tailwind CSS | Mobile-first responsive UI |
| Backend/DB | Supabase (PostgreSQL) | Database, auth, storage, edge functions |
| Auth | Supabase Auth | Landlord + tenant login, invite system |
| File Storage | Supabase Storage | Lease docs, maintenance photos, receipts |
| Payments | Stripe Connect | Rent collection + contractor payments |
| AI Engine | OpenClaw + Minimax (self-hosted) | Maintenance triage, form prefill |
| Notifications | Supabase Edge Functions + Resend | Email notifications |
| Push Notifications | Web Push API | Browser/PWA push alerts |
| Forms | React Hook Form + Zod | Validation |
| State | React Context + hooks | Global state management |

---

## Database Schema

### landlords
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Supabase auth user ID |
| email | text | Login email |
| full_name | text | |
| phone | text | |
| company_name | text | Optional |
| stripe_account_id | text | Stripe Connect account |
| max_properties | int | Default 5 for MVP |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### properties
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| landlord_id | uuid (FK) | References landlords |
| address_line_1 | text | |
| address_line_2 | text | Optional |
| city | text | |
| province | text | |
| postal_code | text | |
| property_type | enum | single_family, duplex, triplex, fourplex, multi_unit |
| total_units | int | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### units
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| property_id | uuid (FK) | References properties |
| unit_number | text | e.g. "1", "A", "Basement" |
| bedrooms | int | |
| bathrooms | decimal | e.g. 1.5 |
| square_footage | int | Optional |
| rent_amount | decimal | Monthly rent |
| status | enum | vacant, occupied, notice_given |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### tenants
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Supabase auth user ID |
| landlord_id | uuid (FK) | References landlords |
| unit_id | uuid (FK) | References units |
| email | text | |
| full_name | text | |
| phone | text | |
| invite_status | enum | pending, accepted |
| payment_streak | int | Consecutive on-time payments |
| auto_pay_enabled | boolean | Default false |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### leases
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| unit_id | uuid (FK) | References units |
| tenant_id | uuid (FK) | References tenants |
| landlord_id | uuid (FK) | References landlords |
| start_date | date | |
| end_date | date | Null for month-to-month |
| rent_amount | decimal | Monthly amount |
| rent_due_day | int | Day of month (1-28) |
| late_fee_amount | decimal | Auto-applied late fee |
| late_fee_grace_days | int | Days before late fee (default 0) |
| security_deposit | decimal | |
| lease_document_url | text | Supabase Storage path |
| status | enum | active, expired, terminated |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### payments
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| lease_id | uuid (FK) | References leases |
| tenant_id | uuid (FK) | References tenants |
| landlord_id | uuid (FK) | References landlords |
| amount | decimal | |
| type | enum | rent, late_fee, security_deposit |
| status | enum | pending, completed, failed, refunded |
| stripe_payment_id | text | Stripe reference |
| payment_method | enum | stripe, manual |
| due_date | date | |
| paid_date | timestamptz | |
| is_late | boolean | |
| receipt_url | text | |
| created_at | timestamptz | |

### maintenance_requests
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| unit_id | uuid (FK) | References units |
| tenant_id | uuid (FK) | References tenants |
| landlord_id | uuid (FK) | References landlords |
| title | text | Short description |
| description | text | Tenant's full explanation |
| photos | text[] | Array of Supabase Storage URLs |
| priority | enum | low, normal, urgent, emergency |
| status | enum | submitted, reviewed, assigned, in_progress, completed, closed |
| ai_analysis | jsonb | AI triage output |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### contractors
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| landlord_id | uuid (FK) | References landlords |
| name | text | |
| company_name | text | Optional |
| email | text | |
| phone | text | |
| specialty | enum | plumbing, electrical, hvac, general, appliance, roofing, pest_control, cleaning, other |
| notes | text | Optional |
| created_at | timestamptz | |

### work_orders
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| maintenance_request_id | uuid (FK) | References maintenance_requests |
| contractor_id | uuid (FK) | References contractors |
| landlord_id | uuid (FK) | References landlords |
| description | text | AI-generated description sent to contractor |
| ai_suggestions | text | AI-generated possible solutions |
| status | enum | sent, viewed, in_progress, completed, paid |
| contractor_notes | text | Contractor's update |
| completion_photos | text[] | Photos uploaded by contractor |
| quoted_amount | decimal | Optional |
| final_amount | decimal | Actual cost |
| payment_method | enum | stripe, manual |
| stripe_payment_id | text | |
| access_token | text | Unique token for contractor link (no login required) |
| sent_at | timestamptz | When message was sent to contractor |
| completed_at | timestamptz | |
| paid_at | timestamptz | |
| created_at | timestamptz | |

### expenses
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| landlord_id | uuid (FK) | References landlords |
| property_id | uuid (FK) | References properties |
| unit_id | uuid (FK) | Optional |
| category | enum | maintenance, insurance, tax, mortgage, utility, management, other |
| description | text | |
| amount | decimal | |
| date | date | |
| payment_id | uuid (FK) | Optional, links to payments table |
| work_order_id | uuid (FK) | Optional, links to work_orders table |
| receipt_url | text | Optional |
| created_at | timestamptz | |

### income
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| landlord_id | uuid (FK) | References landlords |
| property_id | uuid (FK) | References properties |
| unit_id | uuid (FK) | Optional |
| category | enum | rent, late_fee, parking, laundry, other |
| description | text | |
| amount | decimal | |
| date | date | |
| payment_id | uuid (FK) | Optional, links to payments table |
| created_at | timestamptz | |

### notifications
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK) | Landlord or tenant ID |
| user_type | enum | landlord, tenant |
| type | enum | rent_reminder, rent_paid, rent_late, maintenance_submitted, maintenance_updated, work_order_completed, general |
| title | text | |
| message | text | |
| is_read | boolean | Default false |
| email_sent | boolean | |
| push_sent | boolean | |
| created_at | timestamptz | |

### messages
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| sender_id | uuid | |
| sender_type | enum | landlord, tenant |
| recipient_id | uuid | |
| recipient_type | enum | landlord, tenant |
| unit_id | uuid (FK) | Context: which unit this conversation is about |
| content | text | |
| is_read | boolean | Default false |
| created_at | timestamptz | |

### documents
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| landlord_id | uuid (FK) | |
| property_id | uuid (FK) | Optional |
| unit_id | uuid (FK) | Optional |
| tenant_id | uuid (FK) | Optional |
| type | enum | lease, inspection, insurance, receipt, n4, n1, n2, other |
| name | text | Display name |
| file_url | text | Supabase Storage path |
| created_at | timestamptz | |

---

## Row Level Security (RLS) Policies

All tables must have RLS enabled. Core rules:

- **Landlords** can only read/write their own data (where landlord_id = auth.uid())
- **Tenants** can only read their own tenant record, their unit, their lease, their payments, their maintenance requests, and messages to/from them
- **Tenants** can create maintenance_requests and messages
- **Tenants** can create payments (initiate rent payment)
- **Contractors** access work_orders via access_token only (public route, no auth)
- **No cross-landlord data access ever**

---

## Build Order (Phase-by-Phase)

### Phase 1: Foundation
1. Initialize Next.js project with TypeScript + Tailwind ✅ (done)
2. Set up Supabase project (database, auth, storage)
3. Create all database tables + RLS policies
4. Set up PWA (manifest, service worker, icons)
5. Build authentication (signup, login, session management)
6. Build layout shell (sidebar nav, mobile bottom nav, header)

### Phase 2: Property Management Core
7. Properties CRUD
8. Units CRUD
9. Landlord dashboard

### Phase 3: Tenant System
10. Tenant invite flow
11. Tenant login + dashboard

### Phase 4: Lease Management
12. Create lease
13. Lease document upload

### Phase 5: Rent Collection
14. Stripe Connect onboarding
15. Tenant payment page
16. Auto-pay setup

### Phase 6: Financials
17. Income/expense tracking
18. Financial dashboard

### Phase 7: Maintenance System
19. Tenant submits request + photo upload
20. AI triage integration
21. Work order flow + contractor portal

### Phase 8: Communication
22. In-app messaging
23. Notifications

### Phase 9: Documents & Legal
24. Document upload
25. Auto-generate N4/N1/N2

### Phase 10: Polish & Launch
26. PWA install prompt
27. Mobile audit
28. Security audit

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# AI (OpenClaw + Minimax)
AI_API_URL=
AI_API_KEY=

# Email (Resend)
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Success Criteria for MVP

- [ ] Landlord can sign up, add a property, add units, invite a tenant
- [ ] Tenant can accept invite, log in, see their dashboard
- [ ] Tenant can pay rent through Stripe
- [ ] Landlord gets notified, receipt generated, financials updated
- [ ] Payment streak tracks correctly
- [ ] Late rent triggers reminder → N4 auto-generated on day 2
- [ ] Late fee auto-applied
- [ ] Tenant can submit maintenance request with photos
- [ ] AI triage analyzes the request
- [ ] Landlord can assign contractor, send prefilled message
- [ ] Contractor can view job, update status, upload photos via public link
- [ ] Landlord can pay contractor via Stripe or mark manual
- [ ] Expense auto-logged
- [ ] Landlord and tenant can message each other
- [ ] Notifications work (in-app + email + push)
- [ ] Financial dashboard shows real-time income/expenses
- [ ] App installable as PWA on phone
- [ ] All data properly isolated per landlord (RLS)
- [ ] App works on mobile (375px+)