// scripts/get-toolruns.ts

// IMPORTANT:
// - This script is dev-only.
// - Keep declarations unique to avoid TS "Cannot redeclare" when the project type-checks scripts.

export {};

const USER_ID_VALUE = "cmlsjpww90000utdwlmowv7jv";

async function main() {
  const res = await fetch(
    `http://localhost:3000/api/tool-runs?userId=${encodeURIComponent(USER_ID_VALUE)}`,
    { method: "GET" }
  );

  const text = await res.text();

  // Print raw response to help debugging.
  // If the endpoint returns JSON, you can parse it in your console.
  console.log(text);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});