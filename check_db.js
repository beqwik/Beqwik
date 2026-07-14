import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envContent = fs.readFileSync(".env", "utf8");
const env = {};
envContent.split("\n").forEach(line => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join("=").trim();
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function check() {
  // Try inserting a test notification to see what columns are available
  const { data, error } = await supabase.from("member_notifications").insert({
    member_id: "6b91c7da-2097-436a-8565-9ab4aed797a6",
    organization_id: "test-org-id",
    title: "Test",
    message: "Test message",
    is_read: false,
  }).select();
  
  console.log("Insert result:", data);
  console.log("Insert error:", error);
}

check();
