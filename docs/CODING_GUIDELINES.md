# Coding Guidelines — Beqwik

**Last Updated:** June 2026

These guidelines define how code should be written in the Beqwik codebase. They exist to ensure consistency across the project and make onboarding new developers straightforward.

---

## 1. File and Folder Naming

| Type | Convention | Example |
|---|---|---|
| React components | `PascalCase.tsx` | `OrganizationCard.tsx` |
| Page components | `PascalCase.tsx` | `Dashboard.tsx` |
| Service files | `camelCase.ts` | `organizationService.ts` |
| Hook files | `camelCase.ts` prefixed with `use` | `useMemberAuth.ts` |
| Store files | `camelCase.ts` suffixed with `Store` | `superAdminStore.ts` |
| Type files | `camelCase.ts` | `organization.ts` |
| Utility files | `camelCase.ts` | `helpers.ts` |
| Directories | `camelCase` | `superAdmin/`, `member/` |

---

## 2. Component Conventions

### Exports

```typescript
// ✅ Pages use default export
export default function Dashboard() { ... }

// ✅ Reusable components use named export
export function StatsCard({ title, value }: StatsCardProps) { ... }
```

### Props Interface

```typescript
// ✅ Always define a Props interface above the component
interface OrganizationCardProps {
  organization: Organization;
  onEdit?: () => void;
}

export function OrganizationCard({ organization, onEdit }: OrganizationCardProps) {
  // ...
}
```

### No Inline Types in Props

```typescript
// ❌ Avoid
function MyComponent({ name, age }: { name: string; age: number }) {}

// ✅ Use a named interface
interface MyComponentProps {
  name: string;
  age: number;
}
function MyComponent({ name, age }: MyComponentProps) {}
```

### Component Size

If a component exceeds ~200 lines, split it into smaller focused components. The Admin Dashboard at ~1200 lines is a known violation that must be refactored.

---

## 3. TypeScript Conventions

### Avoid `any`

```typescript
// ❌ Bad
const [members, setMembers] = useState<any[]>([]);

// ✅ Good
const [members, setMembers] = useState<Member[]>([]);
```

### Type Interfaces vs Types

Use `interface` for object shapes, `type` for unions or intersections:

```typescript
// ✅ Interface for object shapes
interface Organization {
  id: string;
  organization_name: string;
  organization_type: string;
  active: boolean;
}

// ✅ Type alias for unions
type SubscriptionStatus = "active" | "expired" | "cancelled";
```

### Null Safety

```typescript
// ❌ Unsafe
const name = organization.organization_name.toUpperCase();

// ✅ Safe
const name = organization?.organization_name?.toUpperCase() ?? "Unknown";
```

---

## 4. Tailwind CSS Conventions

### Beqwik Brand Colors

The brand color system uses custom Tailwind classes:

| Token | Value | Usage |
|---|---|---|
| `brand-peach` | `#ff9c74` | Warm accent, gradients start |
| `brand-coral` | `#e05275` | Primary action color |
| `brand-purple` | `#b55fe6` | Secondary accent, gradients end |

```tsx
// ✅ Use brand gradient
className="bg-gradient-to-r from-brand-peach via-brand-coral to-brand-purple text-white"

// ✅ Use individual brand colors
className="text-brand-coral hover:text-brand-purple"
```

### Border Radius Pattern

The UI uses large rounded corners throughout:

```tsx
// Cards: rounded-[2rem]
// Buttons: rounded-xl or rounded-2xl
// Inputs: rounded-2xl
// Badges/pills: rounded-xl
```

### Card Shadow Pattern

```tsx
// Standard card
className="bg-white rounded-[2rem] border border-slate-100/80 shadow-[0_10px_30px_rgba(0,0,0,0.015)]"
```

### Responsive Grid

```tsx
// Two-column → four-column
className="grid md:grid-cols-2 xl:grid-cols-4 gap-6"
```

### No Magic Numbers in Styles

```tsx
// ❌ Avoid unexplained magic values
className="p-[17px] mt-[13px]"

// ✅ Use Tailwind scale
className="p-4 mt-3"
```

---

## 5. Hook Conventions

```typescript
// ✅ Hook naming: always starts with "use"
export function useMemberSubscription(memberId: string) {
  const [subscription, setSubscription] = useState<MemberSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!memberId) return;
    getActiveSubscription(memberId)
      .then(setSubscription)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [memberId]);

  return { subscription, loading, error };
}
```

Hooks should return a consistent shape: `{ data, loading, error }` or `{ value, loading, error }`.

---

## 6. State Management Conventions

### Local state vs Zustand

| Use case | Tool |
|---|---|
| Data needed by only one page | `useState` in the page |
| Data needed by multiple components or persists across routes | Zustand store |
| Auth session | Zustand store (initialized from localStorage) |
| Form values | `react-hook-form` |

### Zustand Store Pattern

```typescript
// src/store/exampleStore.ts
import { create } from "zustand";

interface ExampleState {
  items: Item[];
  loading: boolean;
  setItems: (items: Item[]) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useExampleStore = create<ExampleState>((set) => ({
  items: [],
  loading: false,
  setItems: (items) => set({ items }),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ items: [], loading: false }),
}));
```

---

## 7. Form Conventions

All forms should use `react-hook-form` with `zod` validation. Both packages are already installed.

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    // data is typed and validated
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <p>{errors.email.message}</p>}
    </form>
  );
}
```

---

## 8. Error Display Conventions

Do not use browser `alert()` or `confirm()` in production code. Use `sonner` for notifications.

```typescript
import { toast } from "sonner";

// ❌ Old pattern (remove all occurrences)
alert("Organization created!");
confirm("Are you sure?");

// ✅ New pattern
toast.success("Organization created successfully!");
toast.error("Failed to create organization. Please try again.");
toast.loading("Creating organization...");

// ✅ For destructive confirmations, use a modal component
// (Implement a shared ConfirmModal component)
```

---

## 9. Service Call Pattern in Pages

```typescript
// ✅ Standard data fetching pattern in pages
const [data, setData] = useState<Item[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadData();
}, []);

async function loadData() {
  setLoading(true);
  try {
    const result = await getItems();
    setData(result);
  } catch (err) {
    console.error("loadData:", err);
    toast.error("Failed to load data.");
  } finally {
    setLoading(false);
  }
}
```

---

## 10. Import Order

Maintain this import order within files:

```typescript
// 1. React imports
import { useEffect, useState } from "react";

// 2. External packages
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

// 3. Internal services / hooks / stores
import { getOrganizations } from "../../services/superAdmin/organizationService";
import { useOrganizationStore } from "../../store/organizationStore";

// 4. Internal components
import { StatsCard } from "../../components/superAdmin/cards/StatsCard";

// 5. Types
import type { Organization } from "../../types/organization";
```

---

## 11. Comments

Write comments only when the **why** is not obvious from the code itself:

```typescript
// ❌ Useless comment — code explains itself
// Get all organizations
const organizations = await getOrganizations();

// ✅ Useful comment — explains a non-obvious reason
// Email is queried instead of user_id because OAuth users may not have user_id populated yet
const { data: orgUser } = await supabase
  .from("organization_users")
  .select("organization_id")
  .eq("email", user.email)
  .single();
```

Do not write multi-line JSDoc blocks for internal helper functions. Reserve docs for exported public functions in service files.

---

## 12. Console Logs

- Development debug logs: `console.log()` — acceptable during development
- Production: Remove all `console.log()` calls before merging to main
- Errors: Always use `console.error("context:", error)` — include a context prefix

The current codebase has many `console.log()` debug statements that should be cleaned up before production.
