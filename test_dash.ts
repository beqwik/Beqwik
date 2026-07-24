import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const supabase = createClient(
  Deno.env.get("PROJECT_URL")!,
  Deno.env.get("SERVICE_ROLE_KEY")! // Wait, dashboardService runs as the user. I should run this as the user! But I don't have the user's JWT. 
);
