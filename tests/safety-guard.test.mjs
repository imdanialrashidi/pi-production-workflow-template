import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const source = await fs.readFile(
  path.join(repositoryRoot, ".pi/extensions/safety-guard.js"),
  "utf8",
);
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const previousWorkflowEdit = process.env.PI_WORKFLOW_EDIT;
delete process.env.PI_WORKFLOW_EDIT;
const { default: registerGuard } = await import(moduleUrl);
if (previousWorkflowEdit === undefined) delete process.env.PI_WORKFLOW_EDIT;
else process.env.PI_WORKFLOW_EDIT = previousWorkflowEdit;

let handler;
registerGuard({
  on(eventName, callback) {
    assert.equal(eventName, "tool_call");
    handler = callback;
  },
});

process.env.PI_WORKFLOW_EDIT = "1";
const { default: registerEditEnabledGuard } = await import(`${moduleUrl}#workflow-edit`);
if (previousWorkflowEdit === undefined) delete process.env.PI_WORKFLOW_EDIT;
else process.env.PI_WORKFLOW_EDIT = previousWorkflowEdit;

let editEnabledHandler;
registerEditEnabledGuard({
  on(_eventName, callback) {
    editEnabledHandler = callback;
  },
});

async function guard(toolName, input) {
  return handler({ toolName, input }, { cwd: repositoryRoot });
}

test("allows a normal read inside the repository", async () => {
  assert.equal(await guard("read", { path: "README.md" }), undefined);
});

test("blocks secret files through direct tools and shell", async () => {
  assert.match((await guard("read", { path: ".env" })).reason, /Sensitive file/);
  assert.match((await guard("bash", { command: "sed -n '1p' .env" })).reason, /secrets/i);
});

test("blocks writes outside the repository", async () => {
  const result = await guard("write", { path: "/tmp/pi-guard-test.txt" });
  assert.equal(result.block, true);
  assert.match(result.reason, /outside the repository/);
});

test("blocks destructive deletion and privilege escalation", async () => {
  assert.match((await guard("bash", { command: "rm -rf build" })).reason, /deletion/i);
  assert.match((await guard("bash", { command: "sudo systemctl restart app" })).reason, /Privilege/);
});

test("blocks git mutation with and without global options", async () => {
  assert.match((await guard("bash", { command: "git commit -m test" })).reason, /Git history/);
  assert.match((await guard("bash", { command: "git -C . commit -m test" })).reason, /Git history/);
  assert.match((await guard("bash", { command: "git --no-pager push origin main" })).reason, /Git history/);
});

test("blocks workflow edits unless explicitly enabled before startup", async () => {
  const result = await guard("edit", { path: ".pi/settings.json" });
  assert.equal(result.block, true);
  assert.match(result.reason, /Workflow policy/);
});

test("allows workflow edits when the explicit startup flag is enabled", async () => {
  assert.equal(
    await editEnabledHandler(
      { toolName: "edit", input: { path: ".pi/settings.json" } },
      { cwd: repositoryRoot },
    ),
    undefined,
  );
});

test("blocks unsafe MCP tools and external navigation", async () => {
  assert.match((await guard("mcp", { tool: "browser_evaluate", args: {} })).reason, /Unsafe MCP/);
  assert.match(
    (await guard("mcp", { tool: "browser_navigate", args: { url: "https://example.com" } })).reason,
    /local development origins/,
  );
  assert.equal(
    await guard("mcp", { tool: "browser_navigate", args: { url: "http://localhost:3000" } }),
    undefined,
  );
});
