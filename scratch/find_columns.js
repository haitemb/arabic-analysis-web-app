const url = "https://kkavuorzirylkfgghnag.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYXZ1b3J6aXJ5bGtmZ2dobmFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzODM4MjUsImV4cCI6MjA5NDk1OTgyNX0.K6VbVSlSUfGUu4ACElRZUJGf2vASmmV2N8OklPJE3Lo";

const potentialColumns = [
  "user_id", "usage_count", "last_reset", "reset_at", "created_at", "updated_at",
  "count", "daily_usage", "usage", "limit", "id"
];

async function checkColumn(col) {
  const res = await fetch(`${url}/rest/v1/user_usage`, {
    method: "POST",
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify({
      [col]: (col === 'user_id' || col === 'id') ? "00000000-0000-0000-0000-000000000000" : 1
    })
  });
  const json = await res.json();
  const exists = !(json.code === "PGRST204");
  console.log(`Column '${col}': ${exists ? "EXISTS" : "DOES NOT EXIST"} (status ${res.status}, code ${json.code}, msg: ${json.message})`);
  return exists;
}

async function main() {
  console.log("Checking columns one by one...");
  for (const col of potentialColumns) {
    await checkColumn(col);
  }
}

main();
