import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";

import { closePool } from "./db.js";
import { registerAllTools } from "./tools.js";

// Load .env from the project root
dotenv.config();

// ─── Validate required environment variables ───────────────────────────────────
const REQUIRED_ENV = ["POSTGRES_DB", "POSTGRES_USER", "POSTGRES_PASSWORD"];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(
    `[postgres-mcp] Missing required environment variables: ${missing.join(", ")}\n` +
    `Please copy .env.example to .env and fill in the values.`
  );
  process.exit(1);
}

// ─── Create MCP Server ────────────────────────────────────────────────────────
const server = new McpServer({
  name: "postgres-mcp-server",
  version: "1.0.0",
});

// ─── Register all tools ───────────────────────────────────────────────────────
registerAllTools(server);

// ─── Graceful shutdown ────────────────────────────────────────────────────────
async function shutdown(signal) {
  console.error(`[postgres-mcp] Received ${signal}. Shutting down…`);
  await closePool();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// ─── Start server ─────────────────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[postgres-mcp] Server running on stdio transport. Ready.");
