const url = "https://kkavuorzirylkfgghnag.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYXZ1b3J6aXJ5bGtmZ2dobmFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzODM4MjUsImV4cCI6MjA5NDk1OTgyNX0.K6VbVSlSUfGUu4ACElRZUJGf2vASmmV2N8OklPJE3Lo";

const potentialColumns = [
  "analyses_count", "attempts", "attempts_count", "counter", "runs", "used", "uses", 
  "amount", "credits", "num_analyses", "analysis_count", "daily_count", "current_usage", 
  "usage_today", "today_usage", "value", "score", "active", "status", "date", "created"
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
      [col]: 1
    })
  });
  const json = await res.json();
  const exists = !(json.code === "PGRST204");
  console.log(`Column '${col}': ${exists ? "EXISTS" : "DOES NOT EXIST"}`);
  return exists;
}

async function main() {
  console.log("Checking more columns...");
  for (const col of potentialColumns) {
    await checkColumn(col);
  }
}

main();
