const url = "https://kkavuorzirylkfgghnag.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYXZ1b3J6aXJ5bGtmZ2dobmFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzODM4MjUsImV4cCI6MjA5NDk1OTgyNX0.K6VbVSlSUfGUu4ACElRZUJGf2vASmmV2N8OklPJE3Lo";

async function main() {
  console.log("Fetching a sample profile...");
  try {
    const res = await fetch(`${url}/rest/v1/profiles?limit=1`, {
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`
      }
    });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log("Profile data:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Failed:", e);
  }
}

main();
