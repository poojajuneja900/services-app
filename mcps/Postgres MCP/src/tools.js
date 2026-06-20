import { z } from "zod";
import { query, runTransaction } from "./db.js";
import { validateSQL, classifySQL, formatResultAsMarkdown } from "./utils.js";

/**
 * Register all PostgreSQL tools on the given McpServer instance.
 * Each tool uses server.registerTool() with an explicit inputSchema (Zod) and a typed callback.
 *
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 */
export function registerAllTools(server) {

  // ── pg_ping ────────────────────────────────────────────────────────────────
  server.registerTool(
    "pg_ping",
    {
      description:
        "Test the connection to the PostgreSQL database. Returns server version, database name, and current timestamp.",
      inputSchema: z.object({}),
    },
    async () => {
      const result = await query(
        "SELECT version() AS version, current_database() AS database, now() AS server_time"
      );
      return {
        content: [
          {
            type: "text",
            text: `**PostgreSQL connection OK.**\n\n` + formatResultAsMarkdown(result),
          },
        ],
      };
    }
  );

  // ── pg_query (SELECT / EXPLAIN – read-only) ────────────────────────────────
  server.registerTool(
    "pg_query",
    {
      description:
        "Run a read-only SQL query (SELECT, EXPLAIN, etc.) and return results as a formatted table.",
      inputSchema: z.object({
        sql: z.string().describe("The SELECT or EXPLAIN SQL statement to execute."),
        params: z
          .array(z.any())
          .optional()
          .default([])
          .describe("Optional parameterized values — use $1, $2 … in your SQL."),
      }),
    },
    async ({ sql, params = [] }) => {
      validateSQL(sql, { allowDDL: false, allowDML: false });
      const result = await query(sql, params);
      return {
        content: [{ type: "text", text: formatResultAsMarkdown(result) }],
      };
    }
  );

  // ── pg_execute (INSERT / UPDATE / DELETE / MERGE) ──────────────────────────
  server.registerTool(
    "pg_execute",
    {
      description:
        "Execute a single DML statement (INSERT, UPDATE, DELETE, MERGE). Returns rows affected, or returned rows if a RETURNING clause is included.",
      inputSchema: z.object({
        sql: z.string().describe("The DML SQL statement to execute."),
        params: z
          .array(z.any())
          .optional()
          .default([])
          .describe("Optional parameterized values."),
        returning: z
          .boolean()
          .optional()
          .default(false)
          .describe("Set true if the statement has a RETURNING clause."),
      }),
    },
    async ({ sql, params = [], returning = false }) => {
      validateSQL(sql, { allowDDL: false, allowDML: true });
      const result = await query(sql, params);
      const { type } = classifySQL(sql);

      let text;
      if (returning && result.rows.length > 0) {
        text = `**${type} executed successfully.**\n\n` + formatResultAsMarkdown(result);
      } else {
        text = `**${type} executed successfully.** Rows affected: \`${result.rowCount}\``;
      }
      return { content: [{ type: "text", text }] };
    }
  );

  // ── pg_ddl (CREATE / ALTER / DROP / TRUNCATE …) ────────────────────────────
  server.registerTool(
    "pg_ddl",
    {
      description:
        "Execute a DDL statement (CREATE TABLE/INDEX/VIEW, ALTER TABLE, DROP TABLE, TRUNCATE, etc.). DDL is auto-committed by PostgreSQL — use with care.",
      inputSchema: z.object({
        sql: z.string().describe("The DDL SQL statement to execute."),
      }),
    },
    async ({ sql }) => {
      validateSQL(sql, { allowDDL: true, allowDML: false });
      const { type, verb } = classifySQL(sql);
      if (type !== "DDL") {
        throw new Error(
          `Expected a DDL statement but got type '${type}'. Use pg_execute for DML.`
        );
      }
      await query(sql);
      return {
        content: [{ type: "text", text: `**DDL (${verb}) executed successfully.**` }],
      };
    }
  );

  // ── pg_transaction (atomic multi-statement) ────────────────────────────────
  server.registerTool(
    "pg_transaction",
    {
      description:
        "Execute multiple SQL statements atomically inside a single transaction. Rolls back automatically on any error. Ideal for multi-step DML (or mixed DML+DDL) operations.",
      inputSchema: z.object({
        statements: z
          .array(
            z.object({
              sql: z.string().describe("SQL statement."),
              params: z
                .array(z.any())
                .optional()
                .default([])
                .describe("Optional parameterized values for this statement."),
            })
          )
          .min(1)
          .describe("Ordered list of SQL statements to run inside the transaction."),
      }),
    },
    async ({ statements }) => {
      for (const { sql } of statements) {
        validateSQL(sql, { allowDDL: true, allowDML: true });
      }
      const results = await runTransaction(statements);
      const summary = results
        .map(
          (r, i) =>
            `Statement ${i + 1}: rows affected = \`${r.rowCount ?? 0}\`` +
            (r.rows && r.rows.length > 0 ? "\n" + formatResultAsMarkdown(r) : "")
        )
        .join("\n\n");
      return {
        content: [
          { type: "text", text: `**Transaction committed successfully.**\n\n${summary}` },
        ],
      };
    }
  );

  // ── pg_list_schemas ────────────────────────────────────────────────────────
  server.registerTool(
    "pg_list_schemas",
    {
      description: "List all schemas in the connected PostgreSQL database.",
      inputSchema: z.object({}),
    },
    async () => {
      const result = await query(
        `SELECT schema_name, schema_owner
         FROM information_schema.schemata
         ORDER BY schema_name`
      );
      return {
        content: [
          { type: "text", text: `**Database schemas:**\n\n` + formatResultAsMarkdown(result) },
        ],
      };
    }
  );

  // ── pg_list_tables ─────────────────────────────────────────────────────────
  server.registerTool(
    "pg_list_tables",
    {
      description: "List all user-defined tables in a given schema (default: public).",
      inputSchema: z.object({
        schema: z
          .string()
          .optional()
          .default("public")
          .describe("Schema name to list tables from."),
      }),
    },
    async ({ schema = "public" }) => {
      const result = await query(
        `SELECT table_name, table_type
         FROM information_schema.tables
         WHERE table_schema = $1
         ORDER BY table_name`,
        [schema]
      );
      const text =
        result.rows.length === 0
          ? `No tables found in schema \`${schema}\`.`
          : `**Tables in schema \`${schema}\`:**\n\n` + formatResultAsMarkdown(result);
      return { content: [{ type: "text", text }] };
    }
  );

  // ── pg_describe_table ──────────────────────────────────────────────────────
  server.registerTool(
    "pg_describe_table",
    {
      description:
        "Describe the columns, data types, nullability, default values, and primary key status for a given table.",
      inputSchema: z.object({
        table: z.string().describe("Table name to describe."),
        schema: z
          .string()
          .optional()
          .default("public")
          .describe("Schema name. Defaults to 'public'."),
      }),
    },
    async ({ table, schema = "public" }) => {
      const result = await query(
        `SELECT
           c.column_name,
           c.data_type,
           c.character_maximum_length,
           c.is_nullable,
           c.column_default,
           CASE WHEN pk.column_name IS NOT NULL THEN 'YES' ELSE 'NO' END AS is_primary_key
         FROM information_schema.columns c
         LEFT JOIN (
           SELECT ku.column_name
           FROM information_schema.table_constraints tc
           JOIN information_schema.key_column_usage ku
             ON tc.constraint_name = ku.constraint_name
            AND tc.table_schema = ku.table_schema
            AND tc.table_name = ku.table_name
           WHERE tc.constraint_type = 'PRIMARY KEY'
             AND tc.table_name = $1
             AND tc.table_schema = $2
         ) pk ON pk.column_name = c.column_name
         WHERE c.table_name = $1
           AND c.table_schema = $2
         ORDER BY c.ordinal_position`,
        [table, schema]
      );
      const text =
        result.rows.length === 0
          ? `Table \`${schema}.${table}\` not found or has no columns.`
          : `**Structure of \`${schema}.${table}\`:**\n\n` + formatResultAsMarkdown(result);
      return { content: [{ type: "text", text }] };
    }
  );

  // ── pg_list_indexes ────────────────────────────────────────────────────────
  server.registerTool(
    "pg_list_indexes",
    {
      description: "List all indexes defined on a specific table.",
      inputSchema: z.object({
        table: z.string().describe("Table name."),
        schema: z
          .string()
          .optional()
          .default("public")
          .describe("Schema name. Defaults to 'public'."),
      }),
    },
    async ({ table, schema = "public" }) => {
      const result = await query(
        `SELECT
           i.relname AS index_name,
           ix.indisunique AS is_unique,
           ix.indisprimary AS is_primary,
           array_agg(a.attname ORDER BY array_position(ix.indkey, a.attnum)) AS columns
         FROM
           pg_class t
           JOIN pg_index ix ON t.oid = ix.indrelid
           JOIN pg_class i ON i.oid = ix.indexrelid
           JOIN pg_namespace n ON n.oid = t.relnamespace
           JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
         WHERE
           t.relkind = 'r'
           AND t.relname = $1
           AND n.nspname = $2
         GROUP BY i.relname, ix.indisunique, ix.indisprimary
         ORDER BY i.relname`,
        [table, schema]
      );
      const text =
        result.rows.length === 0
          ? `No indexes found for \`${schema}.${table}\`.`
          : `**Indexes on \`${schema}.${table}\`:**\n\n` + formatResultAsMarkdown(result);
      return { content: [{ type: "text", text }] };
    }
  );
}
