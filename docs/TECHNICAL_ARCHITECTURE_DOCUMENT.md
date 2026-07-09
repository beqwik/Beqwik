# Technical Architecture Document — Beqwik

**Version:** 0.1  
**Status:** Active Development  
**Last Updated:** June 2026

---

## 1. Current Folder Structure

```
hostel-meal-saas/
├── docs/                          ← Project documentation
├── public/                        ← Static assets (favicon, icons.svg)
├── supabase/
│   ├── config.toml                ← Supabase project config
│   └── functions/
│       ├── member-login/          ← Deno edge function
│       └── member-register/       ← Deno edge function
└── src/
    ├── App.tsx                    ← Root component (BrowserRouter)
    ├── main.tsx                   ← ReactDOM.createRoot
    ├── app/
    │   ├── router.tsx             ← All route definitions
    │   ├── providers.tsx          ← Global providers (currently minimal)
    │   ├── guards/
    │   │   ├── AdminGuard.tsx
    │   │   ├── AuthGuard.tsx
    │   │   ├── StudentGuard.tsx
    │   │   └── SuperAdminGuard.tsx
    │   └── layouts/
    │       ├── AdminLayout.tsx
    │       ├── MemberLayout.tsx
    │       ├── PublicLayout.tsx
    │       ├── StudentLayout.tsx
    │       └── SuperAdminLayout.tsx
    ├── components/
    │   ├── admin/
    │   │   └── sections/          ← Business module sections
    │   │       ├── GymSection.tsx
    │   │       ├── HostelMessSection.tsx
    │   │       ├── AcademySection.tsx
    │   │       └── DefaultSection.tsx
    │   ├── auth/
    │   │   ├── ProtectedRoute.tsx
    │   │   └── OnboardingGuard.tsx
    │   ├── common/                ← Button, Card, Input, Logo
    │   ├── forms/                 ← MemberRegisterForm (DUPLICATE — see tech debt)
    │   ├── layout/                ← Generic Header, Footer, Sidebar, Navbar
    │   ├── member/                ← Member-specific UI components
    │   │   ├── cards/             ← NotificationCard, ProfileCard, SubscriptionCard
    │   │   ├── forms/             ← MemberLoginForm, MemberRegisterForm
    │   │   └── Auth*.tsx          ← Auth UI helpers
    │   ├── superAdmin/
    │   │   ├── cards/             ← OrganizationCard, PlanCard, RevenueCard, StatsCard
    │   │   │                      ← NOTE: These are BUILT but NOT imported by any page
    │   │   ├── charts/            ← MemberGrowthChart, PlanDistributionChart, RevenueChart
    │   │   │                      ← NOTE: These are BUILT but NOT imported by any page
    │   │   ├── layout/            ← Header.tsx, Sidebar.tsx (empty files)
    │   │   └── tables/            ← MembersTable, OrganizationsTable, PaymentsTable
    │   │                          ← NOTE: These are BUILT but NOT imported by any page
    │   ├── charts/                ← (empty directory)
    │   ├── dashboard/             ← (empty directory)
    │   └── tables/                ← (empty directory)
    ├── config/
    │   ├── env.ts                 ← Environment variable access
    │   └── routes.ts              ← Route constants
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useOrganization.ts
    │   ├── member/                ← useMemberAuth, useMemberNotifications, useMemberProfile, useMemberSubscription
    │   └── superAdmin/            ← useDashboard, useMembers, useOrganizations, usePayments
    │                              ← NOTE: All 4 superAdmin hooks are EMPTY files
    ├── lib/
    │   ├── constants.ts
    │   ├── helpers.ts
    │   ├── validators.ts
    │   └── superAdmin/
    │       ├── constants.ts
    │       └── exportExcel.ts     ← xlsx export utility (built, not wired to UI)
    ├── modules/
    │   ├── gym/                   ← (empty directory — module lives in components/admin/sections)
    │   └── hostel/                ← (empty directory — module lives in components/admin/sections)
    ├── pages/
    │   ├── admin/
    │   │   └── Dashboard.tsx      ← ~1200 lines — handles all 6 admin tabs
    │   ├── member/
    │   │   ├── Dashboard.tsx
    │   │   ├── MemberLogin.tsx
    │   │   ├── MemberRegister.tsx
    │   │   ├── Notifications.tsx
    │   │   ├── Profile.tsx
    │   │   └── Subscription.tsx
    │   ├── onboarding/
    │   │   ├── CreateOrganization.tsx
    │   │   └── SelectPlan.tsx
    │   ├── public/
    │   │   ├── LandingPage.tsx
    │   │   ├── LoginPage.tsx
    │   │   └── RegisterPage.tsx
    │   ├── student/
    │   │   └── Home.tsx           ← Placeholder only
    │   └── superAdmin/
    │       ├── Analytics.tsx
    │       ├── Dashboard.tsx
    │       ├── Members.tsx
    │       ├── Organizations.tsx
    │       ├── Payments.tsx
    │       ├── Settings.tsx       ← Currently static, no DB reads/writes
    │       ├── Subscriptions.tsx
    │       └── SuperAdminLogin.tsx
    ├── services/
    │   ├── supabase.ts            ← createClient() — single Supabase client instance
    │   ├── organization.ts        ← DUPLICATE of services/organization/organizationService.ts
    │   ├── admin/                 ← EMPTY directory
    │   ├── menus/                 ← EMPTY directory
    │   ├── organization/
    │   │   └── organizationService.ts  ← Create, update, get org; generate org code
    │   ├── member/
    │   │   ├── memberAuth.ts           ← Login/register via Edge Functions; localStorage session
    │   │   ├── memberService.ts        ← Member profile CRUD
    │   │   ├── memberSubscriptionService.ts  ← Member sub CRUD
    │   │   └── memberNotificationService.ts  ← Notifications CRUD
    │   ├── payments/              ← EMPTY directory
    │   ├── staff/                 ← EMPTY directory
    │   ├── students/              ← EMPTY directory
    │   ├── subscriptions/         ← EMPTY directory
    │   └── superAdmin/
    │       ├── analyticsService.ts
    │       ├── dashboardService.ts
    │       ├── memberService.ts
    │       ├── organizationService.ts
    │       ├── paymentService.ts
    │       ├── subscriptionService.ts
    │       └── superAdminAuth.ts
    ├── store/
    │   ├── authStore.ts
    │   ├── memberStore.ts
    │   ├── organizationStore.ts
    │   ├── superAdminStore.ts     ← Defined but NOT used by guards or layout
    │   └── uiStore.ts
    ├── styles/
    │   └── globals.css
    └── types/
        ├── auth.ts
        ├── member.ts
        ├── memberCredential.ts
        ├── memberNotification.ts
        ├── memberSubscription.ts
        ├── organization.ts
        ├── student.ts
        ├── subscription.ts
        └── superAdmin/
            ├── dashboard.ts       ← EMPTY
            ├── member.ts          ← EMPTY
            ├── organization.ts    ← EMPTY
            └── payment.ts         ← EMPTY
```

---

## 2. Routing Architecture

All routes are defined in `src/app/router.tsx`.

```mermaid
graph TD
    A[BrowserRouter] --> B[Router]
    B --> C[PublicLayout]
    B --> D[MemberLayout]
    B --> E[StudentLayout]
    B --> F[ProtectedRoute + OnboardingGuard + AdminLayout]
    B --> G[SuperAdminGuard + SuperAdminLayout]

    C --> C1[/ - LandingPage]
    C --> C2[/login - LoginPage]
    C --> C3[/register - RegisterPage]
    C --> C4[/create-organization]
    C --> C5[/select-plan]
    C --> C6[/member/login]
    C --> C7[/member/register]
    C --> C8[/super-admin/login]

    D --> D1[/member/dashboard]
    D --> D2[/member/profile]
    D --> D3[/member/subscription]
    D --> D4[/member/notifications]

    E --> E1[/student - Placeholder]

    F --> F1[/admin - AdminDashboard]

    G --> G1[/super-admin/dashboard]
    G --> G2[/super-admin/organizations]
    G --> G3[/super-admin/members]
    G --> G4[/super-admin/payments]
    G --> G5[/super-admin/subscriptions]
    G --> G6[/super-admin/analytics]
    G --> G7[/super-admin/settings]
```

### Route Guards

| Guard | Location | Method | Issue |
|---|---|---|---|
| `ProtectedRoute` | Admin routes | Supabase Auth session | Standard, works correctly |
| `OnboardingGuard` | Admin routes | Checks `organization_users` row | Works correctly |
| `SuperAdminGuard` | Super admin routes | `localStorage.getItem("superAdmin")` | **Bypassable** — any string value grants access |
| Member auth | No guard component | Pages check `getCurrentMember()` | No redirect on unauthenticated access |

### Admin Dashboard Tab Routing

The Admin Dashboard at `/admin` uses URL search params for tab navigation:

```
/admin?tab=overview       → Overview stats
/admin?tab=members        → Members list
/admin?tab=subscriptions  → Member subscriptions
/admin?tab=notifications  → Broadcast alerts
/admin?tab=settings       → Org settings
/admin?tab=slots          → Gym: Training slots
/admin?tab=equipment      → Gym: Equipment tracker
/admin?tab=menu           → Hostel/Mess: Menu
/admin?tab=meals          → Hostel/Mess: Meals
/admin?tab=classes        → Academy: Classes
```

There is currently no visible sidebar in the Admin Layout — tabs are not easily discoverable.

---

## 3. Database Architecture

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for full table documentation.

### Known Tables (inferred from service queries)

| Table | Purpose |
|---|---|
| `organizations` | All registered organizations |
| `organization_users` | Maps Supabase auth users to organizations |
| `organization_subscriptions` | Platform-level SaaS subscriptions (B2B) |
| `subscription_plans` | Available SaaS plans |
| `payments` | Payment transaction history |
| `members` | Member profiles (separate from Supabase Auth) |
| `member_credentials` | Hashed passwords for member auth |
| `subscriptions` | Member-level service subscriptions (B2C) |
| `member_notifications` | Notifications sent by admin to members |
| `super_admins` | Platform admin accounts with hashed passwords |

### Two Subscription Systems

This is an important architectural distinction:

```
organization_subscriptions   ← Org pays Beqwik (B2B — SaaS billing)
subscriptions               ← Member pays Org (B2C — service billing)
```

These must never be confused. The naming is currently ambiguous and should be clarified in all code and queries.

---

## 4. Supabase Architecture

### 4.1 Client Initialization

Single client instance created in `src/services/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

All services import this singleton. Do not create additional client instances.

### 4.2 Edge Functions

Two edge functions are deployed to Supabase:

| Function | Path | Purpose | Auth Method |
|---|---|---|---|
| `member-register` | `supabase/functions/member-register/index.ts` | Register a new member to an org | SERVICE_ROLE_KEY |
| `member-login` | `supabase/functions/member-login/index.ts` | Authenticate member with org code + email + password | SERVICE_ROLE_KEY |

Both functions:
- Use Deno runtime
- Use `npm:bcryptjs` for password hashing
- Use `SERVICE_ROLE_KEY` (bypasses RLS) — correct approach for server-side auth
- Return `{ success: boolean, error?: string }` shape

### 4.3 Authentication Systems

Three separate auth systems exist in parallel:

```
1. Supabase Auth (for org admins)
   → Google OAuth → redirect to /admin
   → email/password → signInWithPassword (BROKEN — not implemented)
   → Session managed by Supabase JS client

2. Custom Member Auth (for members)
   → Edge function validates org code + email + bcrypt password
   → Returns member JSON + organization JSON
   → Stored in localStorage (no expiry)

3. Custom Super Admin Auth (for super admins)
   → Client-side bcrypt.compare against super_admins table
   → Stored in localStorage as JSON (no expiry, bypassable)
   → SECURITY RISK — should be moved to edge function
```

### 4.4 Service Layer Pattern

All database access goes through service files in `src/services/`. Pages and components must not call `supabase` directly.

```
Page/Component
    ↓
Service Function  (src/services/*/serviceName.ts)
    ↓
supabase client  (src/services/supabase.ts)
    ↓
Supabase REST API / Edge Functions
```

Current violations of this pattern: `CreateOrganization.tsx`, `SelectPlan.tsx`, `AdminDashboard.tsx`, and several member pages call `supabase` directly — these should be refactored to use service functions.

---

## 5. Module Architecture

### 5.1 Current Module System

Business modules are React components conditionally rendered inside `AdminDashboard.tsx` based on `organization.organization_type`:

```typescript
// src/pages/admin/Dashboard.tsx — renderSectionTabs()
if (type === "Gym") {
  if (activeTab === "slots" || activeTab === "equipment") {
    return <GymSection ... />;
  }
}
if (type === "Hostel" || type === "Mess") {
  if (activeTab === "menu" || activeTab === "meals") {
    return <HostelMessSection ... />;
  }
}
if (type === "Academy") {
  if (activeTab === "classes") {
    return <AcademySection ... />;
  }
}
return <DefaultSection ... />;
```

Module components live in `src/components/admin/sections/`.

### 5.2 Module Storage (Current Problem)

The Gym module currently stores all data in `localStorage`:
```typescript
localStorage.setItem(`gym_slots_${organizationId}`, JSON.stringify(slots));
```

This is not production-ready. All module data should be stored in Supabase tables.

### 5.3 Target Module Architecture

The target architecture uses a module registry and dedicated Supabase tables per module:

```typescript
// Future: src/modules/registry.ts
const MODULE_REGISTRY = {
  Gym: {
    tabs: ["slots", "equipment"],
    component: () => import("../modules/gym/GymModule"),
    tables: ["gym_slots", "gym_slot_bookings", "gym_equipment"],
  },
  Hostel: {
    tabs: ["menu", "meals"],
    component: () => import("../modules/hostel/HostelModule"),
    tables: ["hostel_menu_items", "hostel_meals"],
  },
  // ...
};
```

See [BUSINESS_MODULE_GUIDE.md](./BUSINESS_MODULE_GUIDE.md) for the full guide.

---

## 6. State Management

### 6.1 Zustand Stores

| Store | File | Used? | Notes |
|---|---|---|---|
| `authStore` | `store/authStore.ts` | Partially | Defined but not actively wired to guards |
| `memberStore` | `store/memberStore.ts` | Partially | |
| `organizationStore` | `store/organizationStore.ts` | Partially | |
| `superAdminStore` | `store/superAdminStore.ts` | **Not used** | Login sets it but guards/layout ignore it, reading from localStorage instead |
| `uiStore` | `store/uiStore.ts` | Unknown | Likely minimal |

### 6.2 Current State Strategy

Most pages manage their own state with `useState` and fetch on mount with `useEffect`. This is functional but leads to duplicate fetch logic across pages.

### 6.3 Recommended State Strategy

For data that is needed by multiple components or persists across navigations, use Zustand stores. For page-local data, local state is appropriate.

The `superAdminStore` should be made authoritative — guards and layouts should read from it instead of `localStorage`. On page load, restore from `localStorage` into the store.

---

## 7. Coding Standards

See [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) for the complete guide.

### Quick Reference

**File naming:** `PascalCase.tsx` for components, `camelCase.ts` for services, hooks, and utilities

**Component convention:**
```typescript
// Named export for components (not default export)
export function MyComponent({ prop }: Props) { ... }
// Exception: pages use default exports
export default function PageName() { ... }
```

**Service convention:**
```typescript
// Named async functions, return data or throw
export async function getOrganizations(): Promise<Organization[]> { ... }
```

---

## 8. Performance Guidelines

### Current Issues

1. `getAnalyticsData()` fetches entire tables with no pagination — scales poorly
2. `getDashboardStats()` makes 4 parallel DB calls — can be a single RPC function
3. All routes load synchronously — no code splitting
4. No caching layer (no `react-query` or `SWR`)

### Recommended Approach

**Pagination:** All list queries must include `.range(from, to)` based on page number.

**RPC functions:** Complex aggregations (dashboard stats, analytics) should use Supabase RPC:
```typescript
const { data } = await supabase.rpc("get_dashboard_stats", { org_id });
```

**Lazy loading:** Add `React.lazy` and `Suspense` for route-level code splitting.

**Caching:** For frequently read, rarely changing data (subscription plans, org types), implement a simple cache or use `react-query`.

---

## 9. Security Guidelines

### Current Security Issues (Priority Order)

| Priority | Issue | Fix |
|---|---|---|
| 🔴 Critical | bcrypt runs in browser for Super Admin login | Create `super-admin-login` edge function |
| 🔴 High | Super Admin guard is bypassable via localStorage | Use Supabase Auth or signed JWT |
| 🔴 High | Member session has no expiry | Add expiry timestamp + validate on load |
| 🟡 Medium | `select("*")` overfetches — returns all columns to client | Select only needed columns |
| 🟡 Medium | No Zod validation on most forms (package installed, unused) | Add Zod schemas to all forms |
| 🟢 Low | Anon key in `.env` is expected for client-side Supabase | Move to `.env.local`, add to `.gitignore` |

### RLS (Row Level Security)

RLS policies cannot be verified from the frontend codebase. They must be configured in the Supabase dashboard. Required policies:

| Table | Read | Write |
|---|---|---|
| `organizations` | Org users can read their own | Org users can update their own |
| `members` | Members can read their own; admin reads all in org | Admin can insert/update |
| `member_credentials` | Service role only | Service role only (edge functions) |
| `super_admins` | **No anon reads** (currently exposed) | Service role only |
| `organization_subscriptions` | Org users can read their own | Platform billing system |
| `payments` | Org users read their own | Platform billing system |

### Super Admin Authentication — Target Architecture

```
Current (insecure):
Browser → supabase.from("super_admins").select("*") → bcrypt.compare() in browser

Target (secure):
Browser → supabase.functions.invoke("super-admin-login", { email, password })
        → Edge Function: bcrypt.compare() server-side
        → Return signed JWT or Supabase Auth session
        → Validate JWT on each protected route server-side
```

---

## 10. Deployment

### Current Setup

The project is a Vite SPA. The Supabase project is hosted (not self-hosted).

**Development:**
```bash
npm run dev       # Vite dev server
```

**Build:**
```bash
npm run build     # TypeScript check + Vite build
npm run preview   # Preview production build locally
```

**Edge Functions:**
```bash
supabase functions deploy member-login
supabase functions deploy member-register
```

### Recommended Hosting

| Service | Use |
|---|---|
| Vercel or Netlify | Frontend (SPA) |
| Supabase Cloud | Database, Auth, Edge Functions, Storage |

### Environment Variables

**Frontend (Vite):** Variables must be prefixed with `VITE_` to be accessible in the browser.

**Edge Functions (Deno):** Set in Supabase dashboard → Settings → Edge Functions. Never expose `SERVICE_ROLE_KEY` to the frontend.
