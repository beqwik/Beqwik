import fs from "fs";
import path from "path";
import { createRequire } from "module";

const envContent = fs.readFileSync(".env", "utf8");
const env = {};
envContent.split("\n").forEach(line => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join("=").trim();
  }
});

// Read the function source
const functionPath = path.join("supabase", "functions", "member_purchase_plan", "index.ts");
const functionSource = fs.readFileSync(functionPath, "utf8");

const PROJECT_REF = "woboulyogmydoygjaaxz";

// We need the Supabase access token - check if it's in env
const accessToken = env.SUPABASE_ACCESS_TOKEN || env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Function source length:", functionSource.length);
console.log("Project ref:", PROJECT_REF);
console.log("Note: To deploy edge functions, you need to use the Supabase Dashboard or CLI.");
console.log("\nGo to: https://supabase.com/dashboard/project/" + PROJECT_REF + "/functions");
console.log("Click 'New function', name it 'member_purchase_plan', paste the code from:");
console.log(path.resolve(functionPath));
