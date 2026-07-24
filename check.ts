import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://woboulyogmydoygjaaxz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvYm91bHlvZ215ZG95Z2phYXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwOTI4NzgsImV4cCI6MjA5NjY2ODg3OH0.nhlR30zuPPinF-ZEkjLhJLhOw9tc3q4AA1NKXgdGq-8');
async function check() {
  const { data, error } = await supabase.from('organization_members').select('role').limit(1);
  console.log("ROLE ERROR:", error);
  console.log("DATA:", data);
}
check();
