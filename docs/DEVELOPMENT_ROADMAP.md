# Development Roadmap — Beqwik

**Last Updated:** June 2026  
**Overall Progress:** ~45% of core platform complete

---

## Progress Overview

```
Platform Foundation        ████████████████░░░░  80% complete
Super Admin Portal         ██████████████░░░░░░  70% complete
Organization Admin Portal  ████████████░░░░░░░░  60% complete
Member Portal              ██████████░░░░░░░░░░  50% complete
Security                   ████░░░░░░░░░░░░░░░░  20% complete
Business Modules           ████░░░░░░░░░░░░░░░░  20% complete
Payment Gateway            ░░░░░░░░░░░░░░░░░░░░   0% complete
```

---

## Completed Features

### Infrastructure
- [x] Vite + React 19 + TypeScript project setup
- [x] Tailwind CSS v4 configuration
- [x] React Router v7 with nested layouts
- [x] Supabase client initialization
- [x] Zustand stores defined (authStore, memberStore, organizationStore, superAdminStore, uiStore)
- [x] Route guard architecture (ProtectedRoute, OnboardingGuard, SuperAdminGuard)
- [x] Environment variable configuration

### Public Pages
- [x] Landing page (full marketing page with navbar, hero, features, pricing, testimonials, CTA, footer)
- [x] Register page (Supabase auth.signUp + Google OAuth)
- [x] Login page (Google OAuth only — email/password form UI only)

### Onboarding Flow
- [x] Create Organization page (name, type, email, phone, address)
- [x] Auto-generate organization code from name initials (e.g., GYM001)
- [x] Select Plan page (fetches live plans from subscription_plans table)
- [x] Organization user link created in organization_users

### Super Admin Portal
- [x] Super Admin login (email + bcrypt password — security issue noted)
- [x] Super Admin layout with sidebar navigation
- [x] Dashboard with 4 live stat cards (orgs, members, revenue, subscriptions)
- [x] Dashboard org types pie chart (proportional — not real type breakdown)
- [x] Organizations page — live data, status badges
- [x] Members page — live data, active/inactive status
- [x] Payments page — live data (missing org + plan columns)
- [x] Subscriptions page — live data (org name field name bug)
- [x] Analytics page — org type pie chart + plan distribution bar chart (both live)
- [x] Settings page (UI only — not connected to DB)

### Organization Admin Portal
- [x] Admin layout with Outlet
- [x] Admin dashboard — Overview tab (org stats, member count, MRR, SaaS plan status)
- [x] Admin dashboard — Members tab with search, add member modal, activate/deactivate
- [x] Admin dashboard — Subscriptions tab (member subscriptions list, grant subscription modal)
- [x] Admin dashboard — Notifications tab (broadcast alert form, history)
- [x] Admin dashboard — Settings tab (edit org name, type, email, phone, address)
- [x] GymSection — Training slots management (localStorage-based)
- [x] GymSection — Equipment tracker (localStorage-based)
- [x] HostelMessSection component (exists, full UI needs verification)
- [x] AcademySection component (exists, full UI needs verification)
- [x] DefaultSection fallback

### Member Portal
- [x] Member login page (via Edge Function)
- [x] Member registration page (via Edge Function)
- [x] Member dashboard (subscription status, days remaining, unread notifications, quick actions)
- [x] Member notifications page
- [x] Member profile page (page exists, full functionality needs verification)
- [x] Member subscription page (page exists, full functionality needs verification)
- [x] Member layout

### Services / Backend
- [x] `member-register` edge function (Deno, bcrypt, SERVICE_ROLE_KEY)
- [x] `member-login` edge function (Deno, bcrypt, SERVICE_ROLE_KEY, last_login update)
- [x] Organization CRUD service (`services/organization/organizationService.ts`)
- [x] Dashboard stats service
- [x] Super admin analytics service
- [x] Member notification service (get, getUnread, getUnreadCount, markRead, markAllRead, delete)
- [x] Member subscription service (get, getActive, purchase, cancel, renew)

---

## In Progress

- [ ] **Fixing subscription org name bug** — `organizations(organization)` must change to `organizations(organization_name)`
- [ ] **Documentation** — this document set

---

## Pending — Priority Order

### 🔴 P0 — Critical Bugs (Block production use)

| ID | Task | File | Complexity |
|---|---|---|---|
| BUG-001 | Fix subscription org name field mismatch | `services/superAdmin/subscriptionService.ts:38` | Low |
| BUG-002 | Fix MemberDashboard stray `~` character | `pages/member/Dashboard.tsx:82` | Low |
| BUG-003 | Fix LoginPage email/password — add `signInWithPassword` handler | `pages/public/LoginPage.tsx` | Low |
| BUG-004 | Fix SelectPlan double insert into `organization_users` | `pages/onboarding/SelectPlan.tsx:73-86` | Low |
| BUG-005 | Fix Payments page — add org + plan joins | `services/superAdmin/paymentService.ts` | Medium |

### 🔴 P1 — Security (Must fix before any real users)

| ID | Task | Complexity | Notes |
|---|---|---|---|
| SEC-001 | Create `super-admin-login` edge function | Medium | Move bcrypt off client |
| SEC-002 | Set RLS on `super_admins` table — deny anon reads | Low | Supabase dashboard |
| SEC-003 | Validate `superAdmin` localStorage item as a signed JWT | Medium | Replace string check |
| SEC-004 | Add session expiry to member localStorage | Low | Add `exp` field, check on load |
| SEC-005 | Implement proper Forgot Password flow | Low | `supabase.auth.resetPasswordForEmail()` |

### 🟡 P2 — Core Feature Completion

| ID | Task | Complexity | Notes |
|---|---|---|---|
| FEAT-001 | Connect Settings page to DB | Medium | Read/write super admin data |
| FEAT-002 | Real revenue trend chart | Medium | Query payments grouped by month |
| FEAT-003 | Real org types pie chart | Low | Group organizations by type |
| FEAT-004 | Fix Landing page branding | Low | Replace "Subsphere" → "Beqwik" everywhere |
| FEAT-005 | Add search to Subscriptions page | Medium | Filter by org name, status |
| FEAT-006 | Add search to Payments page | Medium | Filter by gateway, status, date |
| FEAT-007 | Add pagination to all Super Admin tables | Medium | All 4 pages |
| FEAT-008 | Wire export buttons to exportExcel.ts | Medium | Organizations, Members, Payments |
| FEAT-009 | Admin dashboard sidebar/tab navigation | Medium | Currently no visible tab nav in AdminLayout |
| FEAT-010 | Fix Dashboard date picker | Low | Wire to actual date range filtering |

### 🟡 P3 — Module Data Migration to Supabase

| ID | Task | Complexity | Notes |
|---|---|---|---|
| MOD-001 | Create `gym_slots` Supabase table | Medium | Replace localStorage |
| MOD-002 | Create `gym_slot_bookings` Supabase table | Medium | Replace localStorage |
| MOD-003 | Create `gym_equipment` Supabase table | Medium | Replace localStorage |
| MOD-004 | Migrate GymSection to use Supabase | High | Full rewrite of data layer |
| MOD-005 | Verify HostelMessSection functionality | Medium | Unknown current state |
| MOD-006 | Verify AcademySection functionality | Medium | Unknown current state |

### 🟢 P4 — UX/Polish

| ID | Task | Complexity | Notes |
|---|---|---|---|
| UX-001 | Add loading skeletons to all pages | Medium | Replace text "Loading..." |
| UX-002 | Replace all `alert()` calls with sonner toasts | Medium | 15+ occurrences |
| UX-003 | Replace all `confirm()` with modal dialogs | Medium | 5+ occurrences |
| UX-004 | Mobile-responsive Super Admin sidebar | High | Hamburger drawer |
| UX-005 | Mobile-responsive Member portal | Medium | Already mostly responsive |
| UX-006 | Empty state illustrations | Low | For tables with no data |

### 🟢 P5 — Payment Gateway

| ID | Task | Complexity | Notes |
|---|---|---|---|
| PAY-001 | Integrate Razorpay for org subscription payments | High | |
| PAY-002 | Webhook handler for payment confirmation | High | Supabase Edge Function |
| PAY-003 | Member self-service subscription renewal | High | |
| PAY-004 | Invoice generation | Medium | |

---

## Sprint Planning

### Sprint 1 (Current) — Bug Fixes + Critical Security

**Duration:** 1 week  
**Goal:** Make the platform safe and correct for internal testing

| Task | Priority |
|---|---|
| BUG-001: Fix subscription org name | P0 |
| BUG-002: Fix `~` in member dashboard | P0 |
| BUG-003: Fix login email/password | P0 |
| BUG-004: Fix SelectPlan double insert | P0 |
| BUG-005: Fix Payments joins | P0 |
| FEAT-004: Fix branding (Subsphere → Beqwik) | P2 |
| SEC-001: Super admin edge function | P1 |
| SEC-004: Member session expiry | P1 |

---

### Sprint 2 — Dashboard + Settings

**Duration:** 1 week  
**Goal:** Make all existing pages show real, accurate data

| Task | Priority |
|---|---|
| FEAT-001: Connect Settings page | P2 |
| FEAT-002: Real revenue chart | P2 |
| FEAT-003: Real org types chart | P2 |
| FEAT-010: Dashboard date filter (basic) | P2 |
| FEAT-009: Admin sidebar tab navigation | P2 |
| UX-002: Replace alert() with sonner | P4 |

---

### Sprint 3 — Tables + Export

**Duration:** 1 week  
**Goal:** Usable data tables with search, pagination, and export

| Task | Priority |
|---|---|
| FEAT-005: Search on Subscriptions | P2 |
| FEAT-006: Search on Payments | P2 |
| FEAT-007: Pagination (all 4 SA pages) | P2 |
| FEAT-008: Export functionality | P2 |

---

### Sprint 4 — Module Database Migration

**Duration:** 2 weeks  
**Goal:** Business modules use Supabase instead of localStorage

| Task | Priority |
|---|---|
| MOD-001 to MOD-004: Gym module to Supabase | P3 |
| MOD-005: Verify Hostel module | P3 |
| MOD-006: Verify Academy module | P3 |

---

### Sprint 5 — Payment Gateway

**Duration:** 3 weeks  
**Goal:** Orgs can pay for SaaS plans online; members can renew subscriptions

| Task | Priority |
|---|---|
| PAY-001: Razorpay integration | P5 |
| PAY-002: Payment webhook handler | P5 |
| PAY-003: Member renewal flow | P5 |

---

## Bug Tracker

| ID | Status | Severity | Description | File | Line |
|---|---|---|---|---|---|
| BUG-001 | 🔴 Open | Critical | Subscriptions page shows blank org names — wrong column name in query | `subscriptionService.ts` | 38 |
| BUG-002 | 🔴 Open | Medium | Stray `~` character renders in member dashboard | `pages/member/Dashboard.tsx` | 82 |
| BUG-003 | 🔴 Open | High | Login page email/password submit does nothing | `pages/public/LoginPage.tsx` | 123 |
| BUG-004 | 🔴 Open | High | SelectPlan attempts duplicate insert into organization_users | `pages/onboarding/SelectPlan.tsx` | 73 |
| BUG-005 | 🔴 Open | Medium | Payments page missing Organization and Plan columns | `pages/superAdmin/Payments.tsx` | — |
| BUG-006 | 🟡 Open | High | Super Admin guard bypassable via localStorage | `guards/SuperAdminGuard.tsx` | 8 |
| BUG-007 | 🟡 Open | Critical | bcrypt runs in browser for super admin login | `services/superAdmin/superAdminAuth.ts` | 26 |
| BUG-008 | 🟡 Open | Low | superAdminStore is set but never read by guards/layout | `store/superAdminStore.ts` | — |
| BUG-009 | 🟢 Open | Low | Dashboard shows hardcoded "May 20 - Jun 20, 2025" (past date) | `pages/superAdmin/Dashboard.tsx` | 95 |
| BUG-010 | 🟢 Open | Low | Dashboard percentage changes ("↑ 8.4%") are hardcoded | `pages/superAdmin/Dashboard.tsx` | 122 |

---

## Technical Debt

### Dead Code

| Item | Location | Action |
|---|---|---|
| 4 empty hook files | `src/hooks/superAdmin/*.ts` | Populate or delete |
| 4 empty type files | `src/types/superAdmin/*.ts` | Populate or delete |
| 6 empty service directories | `src/services/admin/`, `menus/`, `payments/`, `staff/`, `students/`, `subscriptions/` | Delete or populate |
| 2 empty module directories | `src/modules/gym/`, `src/modules/hostel/` | Implement or remove |

### Duplicate Code

| Duplicate | Canonical Location | To Remove |
|---|---|---|
| Organization service | `services/organization/organizationService.ts` | `services/organization.ts` (root) |
| Member register form | `components/member/forms/MemberRegisterForm.tsx` | `components/forms/MemberRegisterForm.tsx` |
| Super admin card components | Pages use inline markup | `components/superAdmin/cards/` — wire in or remove |
| Super admin chart components | Pages use inline markup | `components/superAdmin/charts/` — wire in or remove |
| Super admin table components | Pages use inline markup | `components/superAdmin/tables/` — wire in or remove |

### Large Files Requiring Splitting

| File | Lines | Split Into |
|---|---|---|
| `pages/admin/Dashboard.tsx` | ~1200 | OverviewTab, MembersTab, SubscriptionsTab, NotificationsTab, SettingsTab |

### Code Quality Issues

| Issue | Count | Action |
|---|---|---|
| `any` type used for state | ~20 occurrences | Replace with proper TypeScript interfaces |
| `alert()` used | ~15 occurrences | Replace with sonner toast |
| `confirm()` used | ~5 occurrences | Replace with modal component |
| Direct Supabase calls in pages | ~8 occurrences | Move to service files |
| Zod validation missing | All forms | Add Zod schemas (package already installed) |

---

## Future Ideas (Backlog)

| Idea | Category | Notes |
|---|---|---|
| Business module marketplace | Platform | Org owners browse and enable modules |
| Plugin/module registry system | Architecture | Dynamic module loading at runtime |
| White-label product | Business | Custom domain, branding per org |
| Mobile app | Platform | React Native or PWA |
| AI assistant for org admins | Feature | Insights, anomaly detection, suggestions |
| Multi-branch organizations | Feature | One org, multiple physical locations |
| Hierarchical role system | Feature | Owner > Manager > Staff > Member |
| Audit logs | Security | Track all admin actions with who/what/when |
| Webhooks | API | Notify external systems on events |
| Public REST API | API | Enable third-party integrations |
| Developer SDK | API | JavaScript/TypeScript client |
| Attendance tracking with QR | Feature | Member check-in via QR code |
| Automated expiry emails | Feature | Subscription renewal reminders |
| Multi-currency support | Billing | For international expansion |
| Referral system | Growth | Orgs refer other businesses |
| Analytics dashboard v2 | Analytics | Revenue trends, retention cohorts, LTV |
