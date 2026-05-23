const url = "https://kkavuorzirylkfgghnag.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYXZ1b3J6aXJ5bGtmZ2dobmFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzODM4MjUsImV4cCI6MjA5NDk1OTgyNX0.K6VbVSlSUfGUu4ACElRZUJGf2vASmmV2N8OklPJE3Lo";

async function main() {
  console.log("Fetching OpenAPI spec...");
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`
      }
    });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    
    console.log("Paths available:");
    console.log(Object.keys(data.paths));
    
    console.log("\nDefinitions available:");
    console.log(Object.keys(data.definitions));
    
    if (data.definitions.user_usage) {
      console.log("\nuser_usage columns:", JSON.stringify(data.definitions.user_usage.properties, null, 2));
    }
    
    if (data.definitions.profiles) {
      console.log("\nprofiles columns:", JSON.stringify(data.definitions.profiles.properties, null, 2));
    }

    if (data.definitions.analyses) {
      console.log("\nanalyses columns:", JSON.stringify(data.definitions.analyses.properties, null, 2));
    }
  } catch (e) {
    console.error("Failed:", e);
  }
}

main();
