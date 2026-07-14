import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Load .env
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
  const { data, error } = await supabase.from("payments").select("*");
  if (error) {
    console.error("Error fetching payments:", error);
  } else {
    console.log("Payments count:", data.length);
    console.log("Payments rows:", JSON.stringify(data, null, 2));
  }
}

check();
