# Beqwik Platform — Documentation Hub

**Beqwik** is a multi-tenant SaaS platform for service-based and subscription-based businesses. It is not a hostel management system — hostel management is one of many business modules built on top of the platform.

---

## Quick Links

| Document | Description |
|---|---|
| [PRODUCT_REQUIREMENTS_DOCUMENT.md](./PRODUCT_REQUIREMENTS_DOCUMENT.md) | Product vision, user roles, features, roadmap |
| [TECHNICAL_ARCHITECTURE_DOCUMENT.md](./TECHNICAL_ARCHITECTURE_DOCUMENT.md) | Engineering handbook — folder structure, routing, state, security |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Every table, column, relationship, and ERD diagram |
| [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) | Sprint tracker, bug log, technical debt, future ideas |
| [BUSINESS_MODULE_GUIDE.md](./BUSINESS_MODULE_GUIDE.md) | How business modules plug into the platform |
| [API_CONVENTIONS.md](./API_CONVENTIONS.md) | Supabase, Edge Functions, service layer conventions |
| [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) | Naming, folder, component, TypeScript, Tailwind standards |
| [CHANGELOG.md](./CHANGELOG.md) | Release history |

---

## Platform Overview

```
Beqwik SaaS Platform
│
├── Super Admin Portal     (/super-admin/*)
│   └── Platform-wide oversight: organizations, members, revenue, subscriptions
│
├── Organization Admin Portal  (/admin)
│   └── Per-org management: members, subscriptions, notifications, settings
│   └── Business Modules: Gym slots, Hostel menu, Academy classes, etc.
│
├── Member Portal          (/member/*)
│   └── End-user view: subscription status, notifications, profile
│
└── Public / Onboarding    (/, /register, /login, /create-organization, /select-plan)
    └── Marketing site, signup flow, org creation, plan selection
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript 6 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| State | Zustand v5 |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth + custom member auth) |
| Edge Functions | Deno (Supabase Edge Functions) |
| Charts | Recharts v3 |
| Forms | React Hook Form v7 + Zod v4 |
| Icons | Lucide React |
| Toasts | Sonner v2 |
| Export | xlsx |

---

## Getting Started

```bash
cd hostel-meal-saas
npm install
npm run dev
```

Environment variables required in `.env`:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Edge function environment variables (set in Supabase dashboard):
```
PROJECT_URL=your_supabase_project_url
SERVICE_ROLE_KEY=your_service_role_key
```

---

## Project Root

```
hostel-meal-saas/
├── docs/              ← You are here
├── src/               ← All application source code
├── supabase/          ← Edge functions and config
├── public/            ← Static assets
├── package.json
├── vite.config.ts
└── .env               ← Never commit to version control
```
