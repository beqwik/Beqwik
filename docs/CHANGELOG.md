# Changelog — Beqwik

All notable changes to the Beqwik platform are documented here.

Format: `[version] — YYYY-MM-DD`

---

## [0.1.0] — June 2026

### Initial Platform Release (Internal / Development)

This is the first documented version of the Beqwik platform. All features below were built prior to this changelog being established.

---

### Platform Foundation

- Initialized project with Vite + React 19 + TypeScript 6
- Configured Tailwind CSS v4 with custom brand color tokens (brand-peach, brand-coral, brand-purple)
- Set up React Router v7 with nested layouts
- Configured Supabase JS v2 client
- Set up Zustand v5 for state management
- Configured ESLint and TypeScript strict mode

---

### Public Pages

- **Landing page** — Full marketing page with navbar, hero section, features, how-it-works, pricing (3 tiers), testimonials, CTA, and footer
- **Register page** — Email/password signup via `supabase.auth.signUp()` + Google OAuth option
- **Login page** — Google OAuth via `supabase.auth.signInWithOAuth()` (email/password form UI present but not functional)

---

### Onboarding Flow

- **Create Organization page** — Form to capture org name, type, email, phone, address
- **Auto-generate organization code** — Derived from org name initials (e.g., "Sunny Academy" → SAC001)
- **Select Plan page** — Fetches active subscription plans from DB, allows org to subscribe
- Organization and user linked via `organization_users` table on creation

---

### Super Admin Portal

- Super Admin login page with email + bcrypt password verification against `super_admins` table
- Super Admin layout with glassmorphism sidebar and top header
- **Dashboard** — 4 live stat cards (organizations, members, revenue, subscriptions); revenue area chart (mock data); org types pie chart (proportional estimate)
- **Organizations page** — Live table of all organizations with status badges; 3 stat cards
- **Members page** — Live table of all members with active/inactive status; 3 stat cards
- **Payments page** — Live payment transactions; 3 stat cards (total revenue, successful, failed)
- **Subscriptions page** — Live org subscriptions with plan, price, dates, auto-renew, status
- **Analytics page** — Org type distribution pie chart + plan distribution bar chart (both live from DB)
- **Settings page** — Platform info, notifications toggles, security overview, danger zone (UI only — not persisted)

---

### Organization Admin Portal

- Admin layout (protected by Supabase Auth session + onboarding check)
- **Admin Dashboard — Overview tab** — org stats, member count with capacity bar, MRR, SaaS plan status, quick actions panel, broadcast history
- **Admin Dashboard — Members tab** — Member list with search, add member modal (calls edge function), activate/deactivate toggle
- **Admin Dashboard — Subscriptions tab** — Member subscription log, grant subscription modal
- **Admin Dashboard — Notifications tab** — Broadcast alert form, notification history
- **Admin Dashboard — Settings tab** — Edit org name/type/email/phone/address, org code display and copy

---

### Business Modules (Admin Dashboard)

- **Gym module** — Training slots management (add/delete/book members), equipment tracker with status cycling
  - Data storage: localStorage (known limitation, planned migration to Supabase)
- **Hostel/Mess module** — Menu and meal tracking component (exists, full feature set not audited)
- **Academy module** — Class scheduling component (exists, full feature set not audited)
- **Default section** — Fallback for unrecognized org types

---

### Member Portal

- Member login page — authenticates via `member-login` edge function with org code + email + password
- Member registration page — registers via `member-register` edge function
- Member layout
- **Member Dashboard** — Subscription status card, days remaining, unread notification count, active subscription banner, quick action links
- **Member Notifications page** — View and interact with org notifications
- **Member Profile page** — View/edit profile (full functionality pending audit)
- **Member Subscription page** — View subscription details (full functionality pending audit)

---

### Supabase Edge Functions

- `member-register` — Creates member record + hashed credential in DB (Deno + bcryptjs + SERVICE_ROLE_KEY)
- `member-login` — Validates credentials, updates last_login, returns member + org data (Deno + bcryptjs + SERVICE_ROLE_KEY)

---

### Known Issues at Release

See [DEVELOPMENT_ROADMAP.md — Bug Tracker](./DEVELOPMENT_ROADMAP.md) for the full list.

Critical issues at this version:
- BUG-001: Subscriptions page shows blank org names (field name mismatch)
- BUG-002: Stray `~` character visible on member dashboard
- BUG-003: Email/password login for org admins does not work
- BUG-004: SelectPlan page attempts duplicate organization_users insert
- BUG-005: Payments page missing Organization and Plan columns
- BUG-007: Super admin bcrypt runs in browser (security risk)

---

## Upcoming

See [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) for the full sprint-by-sprint plan.

Next version will focus on:
- All P0 bug fixes
- Super admin security hardening
- Real revenue chart data
- Settings page persistence
