const url = "https://woboulyogmydoygjaaxz.supabase.co/rest/v1/";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

fetch(url, { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } })
  .then(res => res.text())
  .then(console.log)
  .catch(console.error);
