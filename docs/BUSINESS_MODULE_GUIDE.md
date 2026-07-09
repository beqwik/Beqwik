# Business Module Guide — Beqwik

**Last Updated:** June 2026

---

## What Is a Business Module?

A business module is an optional set of features available only to organizations of a specific type. The core Beqwik platform handles members, subscriptions, payments, and notifications for all organizations. Modules add domain-specific tools on top.

```
Beqwik Core Platform
├── Member Management         ← All orgs
├── Subscription Management   ← All orgs
├── Payment Tracking          ← All orgs
├── Notifications             ← All orgs
│
└── Business Modules (conditional by org type)
    ├── Gym Module           → Training Slots, Equipment Tracker
    ├── Hostel/Mess Module   → Menu Management, Meal Tracking
    ├── Academy Module       → Class Scheduling
    └── [Future modules...]
```

---

## Current Modules

### Gym Module

**Org type:** `"Gym"`  
**Admin tabs:** `slots`, `equipment`  
**Component:** `src/components/admin/sections/GymSection.tsx`

**Features:**
- Training slot management (trainer, day, time, capacity)
- Member slot booking
- Equipment tracker with status cycling (Working → Under Maintenance → Broken)

**Current data storage:** `localStorage` (keyed by `organizationId`)

```javascript
localStorage.setItem(`gym_slots_${organizationId}`, JSON.stringify(slots));
localStorage.setItem(`gym_bookings_${organizationId}`, JSON.stringify(bookings));
localStorage.setItem(`gym_equipment_${organizationId}`, JSON.stringify(equipment));
```

**Known limitation:** Data is browser-local. Not shared across staff, not queryable from analytics, not backed up. Must be migrated to Supabase tables.

**Target Supabase tables:**

```sql
CREATE TABLE gym_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  trainer_name text NOT NULL,
  day_of_week text NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  max_capacity integer NOT NULL DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE gym_slot_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid REFERENCES gym_slots(id) ON DELETE CASCADE,
  member_id uuid REFERENCES members(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(slot_id, member_id)
);

CREATE TABLE gym_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  name text NOT NULL,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'Working',
  last_inspection date,
  created_at timestamptz DEFAULT now()
);
```

---

### Hostel / Mess Module

**Org types:** `"Hostel"`, `"Mess"`  
**Admin tabs:** `menu`, `meals`  
**Component:** `src/components/admin/sections/HostelMessSection.tsx`

**Status:** Component exists in codebase but full functionality has not been audited in this documentation cycle. Assume similar localStorage pattern to GymSection.

---

### Academy Module

**Org type:** `"Academy"`  
**Admin tabs:** `classes`  
**Component:** `src/components/admin/sections/AcademySection.tsx`

**Status:** Component exists but not fully audited.

---

### Default Module

**Org types:** All others  
**Component:** `src/components/admin/sections/DefaultSection.tsx`  
**Purpose:** Fallback for org types with no dedicated module. Shows a placeholder or basic view.

---

## How Modules Are Loaded (Current System)

The `renderSectionTabs()` function inside `src/pages/admin/Dashboard.tsx` conditionally renders the correct module based on `organization.organization_type`:

```typescript
const renderSectionTabs = () => {
  const type = organization?.organization_type || "";

  if (type === "Gym") {
    if (activeTab === "slots" || activeTab === "equipment") {
      return <GymSection activeTab={activeTab} organizationId={organization?.id} members={members} />;
    }
  }

  if (type === "Hostel" || type === "Mess") {
    if (activeTab === "menu" || activeTab === "meals") {
      return <HostelMessSection activeTab={activeTab} organizationId={organization?.id} members={members} />;
    }
  }

  if (type === "Academy") {
    if (activeTab === "classes") {
      return <AcademySection organizationId={organization?.id} members={members} />;
    }
  }

  const customTabs = ["slots", "equipment", "menu", "meals", "classes"];
  if (customTabs.includes(activeTab)) {
    return <DefaultSection activeTab={activeTab} organizationId={organization?.id} />;
  }

  return null;
};
```

**Problem with this approach:** Adding a new module requires editing `AdminDashboard.tsx`. As the number of modules grows, this function becomes an unmaintainable chain of `if/else` blocks.

---

## Target Module Architecture

### Module Registry

The recommended architecture replaces the `if/else` chain with a declarative registry:

```typescript
// src/modules/registry.ts

export interface ModuleConfig {
  organizationType: string | string[];
  tabs: ModuleTab[];
  component: React.LazyExoticComponent<React.ComponentType<ModuleProps>>;
}

export interface ModuleTab {
  key: string;
  label: string;
  icon: React.ComponentType;
}

export interface ModuleProps {
  activeTab: string;
  organizationId: string;
  members: Member[];
}

export const MODULE_REGISTRY: ModuleConfig[] = [
  {
    organizationType: "Gym",
    tabs: [
      { key: "slots", label: "Training Slots", icon: CalendarIcon },
      { key: "equipment", label: "Equipment", icon: DumbbellIcon },
    ],
    component: React.lazy(() => import("./gym/GymModule")),
  },
  {
    organizationType: ["Hostel", "Mess"],
    tabs: [
      { key: "menu", label: "Menu", icon: UtensilsIcon },
      { key: "meals", label: "Meals", icon: PlateIcon },
    ],
    component: React.lazy(() => import("./hostel/HostelModule")),
  },
  {
    organizationType: "Academy",
    tabs: [
      { key: "classes", label: "Classes", icon: BookIcon },
    ],
    component: React.lazy(() => import("./academy/AcademyModule")),
  },
];
```

### Admin Dashboard Using the Registry

```typescript
// AdminDashboard.tsx — simplified with registry

import { MODULE_REGISTRY } from "../../modules/registry";

const activeModule = MODULE_REGISTRY.find((mod) => {
  const types = Array.isArray(mod.organizationType)
    ? mod.organizationType
    : [mod.organizationType];
  return types.includes(organization?.organization_type);
});

const activeModuleTabs = activeModule?.tabs ?? [];
const moduleTabs = activeModuleTabs.map((t) => t.key);

const isModuleTab = moduleTabs.includes(activeTab);
const ModuleComponent = activeModule?.component;

// In render:
{isModuleTab && ModuleComponent && (
  <Suspense fallback={<div>Loading module...</div>}>
    <ModuleComponent
      activeTab={activeTab}
      organizationId={organization.id}
      members={members}
    />
  </Suspense>
)}
```

### Benefits of the Registry

1. Adding a new module requires only adding an entry to `MODULE_REGISTRY` and creating the module component — no changes to the core dashboard
2. Modules are lazy-loaded (code splitting)
3. Tab navigation in the sidebar is auto-generated from the registry
4. Future: modules can be stored in the DB and dynamically enabled per org

---

## How to Build a New Module

### Step 1 — Create the module directory

```
src/modules/library/
├── LibraryModule.tsx      ← Main component
├── services.ts            ← Supabase queries for this module
├── types.ts               ← TypeScript interfaces
└── index.ts               ← Re-export
```

### Step 2 — Create Supabase tables

Create tables scoped to the module. All tables should have an `organization_id` column:

```sql
CREATE TABLE library_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  title text NOT NULL,
  author text,
  isbn text,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

Set RLS: users can only see/edit books belonging to their organization.

### Step 3 — Write the service layer

```typescript
// src/modules/library/services.ts
import { supabase } from "../../services/supabase";

export async function getLibraryBooks(organizationId: string) {
  const { data, error } = await supabase
    .from("library_books")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
```

### Step 4 — Build the module component

```typescript
// src/modules/library/LibraryModule.tsx
import { useEffect, useState } from "react";
import { getLibraryBooks } from "./services";

interface Props {
  activeTab: string;
  organizationId: string;
  members: any[];
}

export default function LibraryModule({ activeTab, organizationId }: Props) {
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === "books") {
      getLibraryBooks(organizationId).then(setBooks).catch(console.error);
    }
  }, [activeTab, organizationId]);

  return (
    <div>
      {activeTab === "books" && (
        <div>
          {/* Book catalog UI */}
        </div>
      )}
    </div>
  );
}
```

### Step 5 — Register the module

```typescript
// src/modules/registry.ts — add entry:
{
  organizationType: "Library",
  tabs: [
    { key: "books", label: "Book Catalog", icon: BookOpenIcon },
    { key: "lending", label: "Lending Log", icon: ArrowRightLeftIcon },
  ],
  component: React.lazy(() => import("./library/LibraryModule")),
}
```

### Step 6 — Add org type to CreateOrganization form

```tsx
// pages/onboarding/CreateOrganization.tsx
<option>Library</option>
```

That's it. The module is now available to any organization of type "Library".

---

## Module Data Guidelines

| Rule | Reason |
|---|---|
| Always include `organization_id` on every module table | Multi-tenant data isolation |
| Set RLS on all module tables | Prevent cross-org data leakage |
| Never use `localStorage` for module data | Not shared, not persistent, not queryable |
| Scope all queries by `organization_id` | Correctness + security |
| Use the shared `members` table, not a module-specific members table | Members are org-level, not module-level |
| Export service functions from a `services.ts` file | Separation of concerns |
| Define TypeScript interfaces in a `types.ts` file | Type safety |
