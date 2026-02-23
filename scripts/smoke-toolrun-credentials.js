/* scripts/smoke-toolrun-credentials.js
   Smoke test: ensure ToolRun client keeps cookie auth behavior.

   Fails if:
   - lib/toolRun/client.ts is missing
   - fetch call to /api/tool-runs is missing
   - credentials: 'include' is missing
*/

const fs = require("fs");
const path = require("path");

function fail(msg) {
  console.error(`❌ ToolRun Smoke Test FAILED: ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`✅ ${msg}`);
}

const target = path.join(process.cwd(), "lib", "toolRun", "client.ts");

if (!fs.existsSync(target)) {
  fail(`File not found: ${target}`);
}

const content = fs.readFileSync(target, "utf8");

// 1) Must call /api/tool-runs
if (!content.includes("'/api/tool-runs'") && !content.includes('"/api/tool-runs"')) {
  fail("Missing fetch target '/api/tool-runs' in lib/toolRun/client.ts");
}

// 2) Must include cookie credentials
// We accept single or double quotes and optional spaces
const credentialsInclude =
  content.includes("credentials: 'include'") ||
  content.includes('credentials: "include"') ||
  /credentials\s*:\s*['"]include['"]/.test(content);

if (!credentialsInclude) {
  fail("Missing credentials: 'include' in saveToolRun fetch options (cookie auth will break)");
}

// 3) Must export saveToolRun (contract lock)
const hasExport =
  content.includes("export async function saveToolRun") ||
  /export\s+async\s+function\s+saveToolRun\s*\(/.test(content);

if (!hasExport) {
  fail("Missing export async function saveToolRun(...) (contract changed)");
}

ok("ToolRun client contract looks good: /api/tool-runs + credentials: include + saveToolRun export");
process.exit(0);