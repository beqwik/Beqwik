# API Conventions — Beqwik

**Last Updated:** June 2026

This document defines how all database queries, edge function calls, and service functions should be written in the Beqwik codebase.

---

## 1. Supabase Client

There is **one** Supabase client instance for the entire application:

```typescript
// src/services/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Rules:**
- Import `supabase` from `../../services/supabase` in all service files
- Never call `createClient()` anywhere else in the frontend
- Never import `supabase` directly in page or component files — always go through a service function

---

## 2. Service Layer Pattern

All data access goes through service functions. Pages and components call services, not Supabase directly.

```
Page/Component
    ↓  (calls)
Service function   src/services/*/serviceName.ts
    ↓  (uses)
supabase client    src/services/supabase.ts
    ↓  (calls)
Supabase REST / Edge Functions
```

### Service Function Template

```typescript
// src/services/superAdmin/organizationService.ts

import { supabase } from "../supabase";
import type { Organization } from "../../types/organization";

export async function getOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase
    .from("organizations")
    .select("id, organization_name, organization_type, organization_code, email, active, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getOrganizations:", error);
    return [];
  }

  return data ?? [];
}
```

### Rules

- Always name functions with a verb: `getX`, `createX`, `updateX`, `deleteX`
- Always handle errors — return empty array `[]` or `null` on error, never throw from services that feed UI state
- Always specify columns in `select()` — avoid `select("*")` except during early development
- Return typed data where possible — avoid `any` in service return types
- Always `order()` list queries with a meaningful column

---

## 3. Select Column Conventions

Never return columns to the frontend that shouldn't be there:

```typescript
// ❌ Bad — exposes all columns including sensitive ones
.select("*")

// ✅ Good — explicit column list
.select("id, organization_name, organization_type, email, active, created_at")
```

For joined tables, specify nested columns:

```typescript
// ✅ Correct join syntax
.select(`
  id,
  status,
  start_date,
  end_date,
  organizations (
    organization_name
  ),
  subscription_plans (
    name,
    monthly_price
  )
`)
```

---

## 4. Error Handling

### In services

```typescript
// Pattern 1: Return empty/null on error (for list pages)
if (error) {
  console.error("serviceName:", error.message);
  return [];
}

// Pattern 2: Return Result object (for forms/mutations)
export async function createOrganization(payload: CreateOrgPayload) {
  const { data, error } = await supabase.from("organizations").insert(payload).select().single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, organization: data };
}
```

### In pages

```typescript
// Use sonner for user-facing feedback — not alert()
import { toast } from "sonner";

const result = await createOrganization(payload);
if (!result.success) {
  toast.error(result.error ?? "Something went wrong");
  return;
}
toast.success("Organization created!");
```

---

## 5. Edge Functions

### Calling Edge Functions

```typescript
// Template for calling a Supabase Edge Function
const { data, error } = await supabase.functions.invoke("function-name", {
  body: { param1: "value1" },
});

if (error) throw error;
if (!data.success) throw new Error(data.error);

return data;
```

### Writing Edge Functions (Deno)

```typescript
// supabase/functions/function-name/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Use SERVICE_ROLE_KEY — this bypasses RLS
    const supabase = createClient(
      Deno.env.get("PROJECT_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    // ... business logic ...

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

### Edge Function Response Contract

All edge functions return the same shape:

```typescript
// Success
{ success: true, data?: any, member?: any, organization?: any }

// Failure
{ success: false, error: string }
```

---

## 6. Authentication Patterns

### Org Admin (Supabase Auth)

```typescript
// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Sign in with Google
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: { redirectTo: `${window.location.origin}/admin` },
});

// Sign in with email/password
const { error } = await supabase.auth.signInWithPassword({ email, password });

// Sign out
await supabase.auth.signOut();
```

### Member Auth

Members use custom auth via Edge Functions. Session is stored in `localStorage`:

```typescript
// Login
const result = await loginMember({ organizationCode, email, password });
if (result.success) {
  localStorage.setItem("member", JSON.stringify(result.member));
  localStorage.setItem("organization", JSON.stringify(result.organization));
}

// Get current member
const member = JSON.parse(localStorage.getItem("member") ?? "null");

// Logout
localStorage.removeItem("member");
localStorage.removeItem("organization");
```

### Super Admin Auth (Target — not yet implemented)

```typescript
// Target implementation — via edge function
const result = await supabase.functions.invoke("super-admin-login", {
  body: { email, password },
});
// Store returned JWT, validate on each route
```

---

## 7. Pagination Pattern

All list queries that may return more than 20 rows must be paginated:

```typescript
const PAGE_SIZE = 20;

export async function getOrganizations(page = 0): Promise<{ data: Organization[]; count: number }> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await supabase
    .from("organizations")
    .select("id, organization_name, organization_type, active", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("getOrganizations:", error);
    return { data: [], count: 0 };
  }

  return { data: data ?? [], count: count ?? 0 };
}
```

---

## 8. Realtime Subscriptions (Future)

When realtime updates are needed, use Supabase's `channel` API:

```typescript
const channel = supabase
  .channel("member-notifications")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "member_notifications", filter: `member_id=eq.${memberId}` },
    (payload) => {
      setNotifications((prev) => [payload.new, ...prev]);
    }
  )
  .subscribe();

// Cleanup
return () => { supabase.removeChannel(channel); };
```

---

## 9. File Naming Conventions for Services

```
src/services/
├── supabase.ts                    ← Supabase client (singleton)
├── organization/
│   └── organizationService.ts     ← CRUD for organizations
├── member/
│   ├── memberAuth.ts              ← Member login/register
│   ├── memberService.ts           ← Member profile CRUD
│   ├── memberSubscriptionService.ts
│   └── memberNotificationService.ts
└── superAdmin/
    ├── analyticsService.ts
    ├── dashboardService.ts
    ├── memberService.ts
    ├── organizationService.ts
    ├── paymentService.ts
    ├── subscriptionService.ts
    └── superAdminAuth.ts
```

Service files are named `[domain]Service.ts` or `[domain]Auth.ts`.  
One service file per domain entity. Do not create one service file per endpoint.
