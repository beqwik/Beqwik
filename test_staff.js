const url = "https://woboulyogmydoygjaaxz.supabase.co/rest/v1/staff?select=email";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvYm91bHlvZ215ZG95Z2phYXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwOTI4NzgsImV4cCI6MjA5NjY2ODg3OH0.nhlR30zuPPinF-ZEkjLhJLhOw9tc3q4AA1NKXgdGq-8";

fetch(url, { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } })
  .then(res => res.text())
  .then(console.log)
  .catch(console.error);
