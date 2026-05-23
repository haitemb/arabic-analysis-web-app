const url = "https://kkavuorzirylkfgghnag.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYXZ1b3J6aXJ5bGtmZ2dobmFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzODM4MjUsImV4cCI6MjA5NDk1OTgyNX0.K6VbVSlSUfGUu4ACElRZUJGf2vASmmV2N8OklPJE3Lo";

async function main() {
  console.log("Testing user_usage table columns...");
  // Let's do a POST to insert an empty object to see what fields are expected or check Postgres errors.
  try {
    const res = await fetch(`${url}/rest/v1/user_usage`, {
      method: "POST",
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        invalid_field_name_xyz: 123
      })
    });
    console.log(`Status: ${res.status}`);
    const json = await res.json();
    console.log("Error details:", JSON.stringify(json, null, 2));
  } catch (e) {
    console.log("Failed:", e.message);
  }
}

main();
