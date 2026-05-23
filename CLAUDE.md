@AGENTS.md

# Project X — Agent Instructions

## What You're Building
A Progressive Web App (PWA) that replaces property management companies for small-scale landlords. Full plan is in `/Users/jaizonebin/Downloads/project-x-mvp-plan.md` — read it before starting any work.

## Build Tracker (REQUIRED)
All 55 build tasks are tracked in Supabase. **You must update task status as you work.**

**Supabase project:** `hwaroazxbzgmjjasgtdb`  
**Table:** `build_tasks`  
**Columns:** `id` (int), `status` ('todo' | 'in_progress' | 'done')

### How to update a task
Use the Supabase MCP tool or run this in a server context:

```ts
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// Mark in progress before starting
await supabase.from("build_tasks").update({ status: "in_progress" }).eq("id", TASK_ID);

// Mark done when complete
await supabase.from("build_tasks").update({ status: "done" }).eq("id", TASK_ID);
```

### Task ID reference
| ID | Task |
|----|------|
| 1 | Initialize Next.js project |
| 2 | Set up Supabase project |
| 3 | Create all DB tables + RLS policies |
| 4 | Set up PWA |
| 5 | Build authentication |
| 6 | Build layout shell |
| 7 | Properties CRUD |
| 8 | Units CRUD |
| 9 | Landlord dashboard |
| 10 | Tenant invite flow |
| 11 | Manual tenant creation |
| 12 | Tenant login + dashboard |
| 13 | Tenant profile page |
| 14 | Create lease |
| 15 | Lease detail view |
| 16 | Lease document upload |
| 17 | Stripe Connect onboarding |
| 18 | Tenant payment page |
| 19 | Auto-pay setup |
| 20 | Payment confirmation + receipts |
| 21 | Payment history |
| 22 | Payment streak tracker |
| 23 | Auto late fee logic |
| 24 | Rent reminders (cron) |
| 25 | Late rent alerts (cron) |
| 26 | Income auto-logging |
| 27 | Expense tracking |
| 28 | Financial dashboard |
| 29 | CSV export |
| 30 | Tenant maintenance request form |
| 31 | AI triage integration |
| 32 | Landlord maintenance list + detail |
| 33 | Contractor CRUD |
| 34 | Work order creation |
| 35 | AI contractor message draft |
| 36 | Contractor public portal |
| 37 | Work order completion flow |
| 38 | Contractor payment |
| 39 | Auto expense from work orders |
| 40 | In-app messaging |
| 41 | Message notifications |
| 42 | Notification center |
| 43 | Email notifications (Resend) |
| 44 | Push notifications |
| 45 | Document upload + listing |
| 46 | Auto-generate N4 |
| 47 | Auto-generate N1/N2 |
| 48 | Document categorization |
| 49 | Onboarding flow |
| 50 | Empty states |
| 51 | Loading states + error handling |
| 52 | Mobile responsiveness audit |
| 53 | PWA install prompt |
| 54 | Performance optimization |
| 55 | Security audit |

## Rules
- Always mark a task `in_progress` before starting it
- Always mark it `done` immediately after completing and testing it
- Work through tasks in order (lowest ID first) unless instructed otherwise
- Never skip tasks — each phase builds on the last
- Read `node_modules/next/dist/docs/` before writing any Next.js code (breaking changes in this version)
- `.env.local` already has Supabase credentials
