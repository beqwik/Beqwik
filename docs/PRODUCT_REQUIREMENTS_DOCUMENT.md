# Product Requirements Document — Beqwik

**Version:** 0.1  
**Status:** Active Development  
**Last Updated:** June 2026

---

## 1. Product Vision

### Mission

Empower any service-based or subscription-based business to manage their operations, members, payments, and growth from a single modern platform — without needing custom software development.

### Vision

Beqwik becomes the operating system for local subscription businesses across India: gyms, hostels, academies, clubs, coworking spaces, salons, libraries, and beyond. Every business owner who manages recurring memberships should be able to run their operations on Beqwik without needing a technical background.

### Product Philosophy

- **Platform-first, module-second.** Beqwik is the platform. Business-specific features (gym slots, hostel menus, academy classes) are modules layered on top.
- **Simple by default, powerful when needed.** The core experience must work out of the box. Advanced features unlock progressively.
- **Multi-tenant from day one.** Every feature, every query, every permission must be scoped to an organization. Data isolation is non-negotiable.
- **Mobile-first for members.** Members are end users on phones. The member portal must feel like a native app.

---

## 2. What Beqwik Is (and Is Not)

| Beqwik IS | Beqwik is NOT |
|---|---|
| A SaaS platform for subscription businesses | A hostel management system |
| A multi-tenant architecture serving many orgs | A single-tenant custom app |
| A marketplace of business modules | A fixed-feature product |
| A platform that earns subscription revenue from org owners | A tool for managing hostel meals |

The hostel/mess module is one of many modules running on Beqwik. It does not define the platform.

---

## 3. User Roles

### 3.1 Super Admin

**Who:** Beqwik platform operator (internal team only)

**Access:** `/super-admin/*`

**Responsibilities:**
- View all organizations registered on the platform
- Monitor subscription revenue and payment history
- Manage platform-level settings
- Observe member counts platform-wide

**Current implementation:**
- Custom login via `super_admins` table with bcrypt password check
- Session stored in `localStorage` (no JWT, no expiry — see security roadmap)
- Cannot create/delete organizations yet (read-only currently)

**Permissions (current):** Read-only view across all orgs, payments, subscriptions, members

---

### 3.2 Organization Owner / Admin

**Who:** A business owner who registered on Beqwik

**Access:** `/admin`

**Responsibilities:**
- Create and manage their organization profile
- Add and manage members
- Assign and track member subscriptions
- Broadcast notifications to members
- View organization-level analytics
- Access business-type-specific modules (gym slots, hostel menu, etc.)

**Current implementation:**
- Authenticated via Supabase Auth (Google OAuth; email/password login is broken — see bug tracker)
- Organization linked via `organization_users` table
- Access protected by `ProtectedRoute` + `OnboardingGuard`

---

### 3.3 Organization Staff

**Who:** An employee of an organization (future role)

**Access:** `/admin` (restricted view)

**Status:** Role exists in `organization_users.role` column but no separate UI or permission enforcement exists yet

---

### 3.4 Member / Customer

**Who:** End-user of an organization (gym member, hostel resident, academy student, etc.)

**Access:** `/member/*`

**Responsibilities:**
- View their subscription status and remaining days
- Read notifications from the organization
- View and update their profile

**Current implementation:**
- Registered by org admin or via self-registration with org code
- Auth via Supabase Edge Functions (`member-login`, `member-register`) using bcrypt in Deno
- Session stored in `localStorage` (member JSON + organization JSON)
- No Supabase Auth account — separate credential system in `member_credentials` table

---

### 3.5 Future Roles (Planned)

| Role | Description |
|---|---|
| Organization Staff | Can manage members but not billing or settings |
| Super Admin Viewer | Read-only platform view for auditors |
| Branch Manager | Manages a specific branch of a multi-branch org |
| Member (Self-Service) | Can renew subscription, update payment method |

---

## 4. Supported Organization Types

### 4.1 Currently Implemented

The following types are available in the organization creation form and respected in the Admin Dashboard module routing:

| Type | Module Routing | Status |
|---|---|---|
| Gym | Slots + Equipment tabs | ✅ UI exists (localStorage-based) |
| Hostel / Mess | Menu + Meals tabs | ✅ UI exists |
| Academy | Classes tab | ✅ UI exists |
| Coworking | — | ⚠️ Registered but no module |
| NGO | — | ⚠️ Registered but no module |
| Society | — | ⚠️ Registered but no module |
| Other | DefaultSection | ✅ Fallback exists |

### 4.2 Planned Organization Types

| Type | Notes |
|---|---|
| Library | Book lending, seat reservations |
| Club | Event management, membership tiers |
| Swimming Pool | Lane bookings, sessions |
| Salon / Spa | Appointment scheduling |
| Coaching Institute | Batch management, attendance |
| Restaurant Membership | Prepaid meal plans |
| Coworking Space | Desk/cabin booking |

### 4.3 Scalability Model

Each organization type should correspond to a business module. Modules are conditionally rendered based on `organization.organization_type`. The module system must remain additive — adding a new module must not affect existing modules or the core platform.

See [BUSINESS_MODULE_GUIDE.md](./BUSINESS_MODULE_GUIDE.md) for the full module architecture.

---

## 5. Platform Features

### 5.1 Authentication

| Feature | Status | Notes |
|---|---|---|
| Org Admin — Google OAuth login | ✅ Working | Via Supabase Auth |
| Org Admin — Email/Password login | ❌ Broken | Form exists, handler missing |
| Org Admin — Forgot Password | ❌ Missing | Button exists, no handler |
| Member login via org code + credentials | ✅ Working | Via Edge Function |
| Member registration | ✅ Working | Via Edge Function |
| Super Admin login | ✅ Working | bcrypt on client (security issue) |
| Session management — Org Admin | ✅ Supabase Auth session | Standard JWT |
| Session management — Member | ⚠️ localStorage only | No expiry, no JWT |
| Session management — Super Admin | ⚠️ localStorage only | No expiry, bypassable |

---

### 5.2 Organizations

| Feature | Status | Notes |
|---|---|---|
| Register organization | ✅ Working | Multi-step: create → select plan |
| Auto-generate org code (e.g., GYM001) | ✅ Working | Based on name initials |
| View all organizations (Super Admin) | ✅ Working | Live Supabase data |
| Filter/search organizations | ❌ Missing | |
| Pagination | ❌ Missing | |
| Export organizations | ❌ Missing | xlsx installed but not wired |
| Edit organization profile | ✅ Working | In Admin settings tab |
| Deactivate organization | ❌ Missing | `active` field exists in DB |
| Organization type switching | ❌ Missing | Type is set at creation |

---

### 5.3 Members

| Feature | Status | Notes |
|---|---|---|
| Add member (by admin) | ✅ Working | Via Edge Function |
| Self-register (by member with org code) | ✅ Working | Via Edge Function |
| View member list (admin) | ✅ Working | With search |
| View members (Super Admin) | ✅ Working | Platform-wide |
| Activate/deactivate member | ✅ Working | |
| Member profile editing | ⚠️ Page exists | Service exists, UI not verified |
| Member search (Super Admin) | ❌ Missing | |
| Member export | ❌ Missing | |
| Pagination | ❌ Missing | |

---

### 5.4 Subscriptions

Two subscription systems exist and serve different purposes:

**Platform Subscriptions (B2B):** Org pays Beqwik for a SaaS plan
- Table: `organization_subscriptions`
- Super Admin page: `/super-admin/subscriptions`
- Onboarding: `/select-plan`

**Member Subscriptions (B2C):** Member pays org for service access
- Table: `subscriptions`
- Admin assigns via Admin Dashboard
- Member views via `/member/subscription`

| Feature | Status | Notes |
|---|---|---|
| Select SaaS plan at onboarding | ✅ Working | From `subscription_plans` table |
| View org subscription history (Super Admin) | ⚠️ Partial | Org name column shows blank — field name bug |
| Assign member subscription (admin) | ✅ Working | Manual plan name + amount |
| View member subscription | ✅ Working | Member portal |
| Subscription expiry tracking | ✅ Working | Days remaining calculation |
| Auto-renewal | ❌ Missing | `auto_renew` field exists in DB |
| Subscription expiry notifications | ❌ Missing | |
| Payment gateway integration | ❌ Missing | |
| Search/filter subscriptions (Super Admin) | ❌ Missing | |

---

### 5.5 Payments

| Feature | Status | Notes |
|---|---|---|
| View payment ledger (Super Admin) | ⚠️ Partial | Missing Organization + Plan columns |
| Payment stats (total revenue, success, failed) | ✅ Working | Calculated from `payments` table |
| Payment gateway collection | ❌ Missing | Razorpay/Stripe not integrated |
| Search/filter payments | ❌ Missing | |
| Export payments | ❌ Missing | |
| Pagination | ❌ Missing | |

---

### 5.6 Analytics

| Feature | Status | Notes |
|---|---|---|
| Organization type distribution (pie chart) | ✅ Working | Live from `organizations` table |
| Plan distribution (bar chart) | ✅ Working | Live from `subscriptions` + `subscription_plans` |
| Revenue trend over time | ❌ Missing | Chart exists but uses mock data |
| Platform stat cards | ✅ Working | Live counts from DB |

---

### 5.7 Notifications

| Feature | Status | Notes |
|---|---|---|
| Admin broadcasts alert to all members | ✅ Working | Inserts into `member_notifications` |
| Member views notifications | ✅ Working | Via service |
| Member marks notification as read | ✅ Service exists | UI needs verification |
| Mark all as read | ✅ Service exists | UI needs verification |
| Unread count badge | ✅ Working | Member dashboard |
| Push / Email notifications | ❌ Missing | |

---

### 5.8 Settings

| Feature | Status | Notes |
|---|---|---|
| Organization settings edit (admin) | ✅ Working | In Admin Dashboard settings tab |
| Super Admin settings page | ❌ Static only | Page is decorative, no persistence |
| Platform configuration | ❌ Missing | |

---

### 5.9 Exports

| Feature | Status | Notes |
|---|---|---|
| xlsx package installed | ✅ Present | |
| `exportExcel.ts` utility exists | ✅ Present | |
| Export wired to any page | ❌ Missing | Not connected to any UI |

---

## 6. Business Modules

Business modules are organization-type-specific features accessible through the Admin Dashboard. They are conditionally rendered based on `organization.organization_type`.

### 6.1 Currently Built Modules

#### Gym Module
- **Tabs:** Training Slots, Equipment Tracker
- **Storage:** `localStorage` (scoped by `organizationId`)
- **Features:** Add/delete slots, book members to slots, track equipment status
- **Limitation:** Data is browser-local, not in Supabase — not shared across devices, not persistent

#### Hostel / Mess Module
- **Tabs:** Menu Management, Meal Tracker
- **Component:** `HostelMessSection.tsx`
- **Status:** Component exists, full UI needs inspection

#### Academy Module
- **Tab:** Classes
- **Component:** `AcademySection.tsx`
- **Status:** Component exists, full UI needs inspection

#### Default Module
- **Component:** `DefaultSection.tsx`
- **Purpose:** Fallback for org types with no dedicated module

### 6.2 Planned Modules

| Module | Priority | Notes |
|---|---|---|
| Library | Medium | Book catalog, lending, seat booking |
| Club | Medium | Events, membership tiers |
| Swimming Pool | Medium | Lane booking, session management |
| Salon / Spa | Low | Appointment scheduling |
| Coworking | Medium | Desk/cabin booking |
| Coaching Institute | Medium | Batch management, attendance |

See [BUSINESS_MODULE_GUIDE.md](./BUSINESS_MODULE_GUIDE.md) for how to build and register modules.

---

## 7. Onboarding Flow

The complete org admin registration journey:

```
/register → Supabase auth.signUp()
    ↓
/create-organization → Insert into organizations + organization_users
    ↓
/select-plan → Insert into organization_subscriptions
    ↓
/admin → Admin Dashboard
```

**Current issues in this flow:**
- `/select-plan` attempts a duplicate insert into `organization_users` (already done in `/create-organization`)
- Email verification flow after `/register` is not handled (no redirect post-verification)

---

## 8. Product Roadmap

### Current Sprint (June 2026)

See [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) for detailed sprint breakdown.

**Focus:** Critical bug fixes + security improvements

### Near-Term (3 months)

- Fix all identified bugs
- Email/password login for org admins
- Payment gateway integration (Razorpay)
- Search + pagination on all tables
- Export functionality

### Medium-Term (6 months)

- Mobile-responsive member portal
- Subscription auto-renewal
- Email notification system
- Member self-service renewal
- Staff role enforcement

### Long-Term (12+ months)

- Mobile app (React Native or PWA)
- Multi-branch organizations
- Business module marketplace
- Public API + developer SDK
- White-label options
- AI-powered insights

---

## 9. Success Metrics

| Metric | Definition |
|---|---|
| Organizations | Total orgs registered on platform |
| Active Organizations | Orgs with active subscription and at least 1 member |
| Members | Total member accounts across all orgs |
| MRR | Sum of monthly prices of all active org subscriptions |
| ARR | MRR × 12 |
| Churn Rate | % of orgs that cancelled in a given month |
| Average Members per Org | Total members / total active orgs |
| Payment Success Rate | Successful payments / total payment attempts |
