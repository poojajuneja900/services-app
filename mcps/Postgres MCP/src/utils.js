/**
 * Classify a SQL string as DDL, DML, DQL, or TCL.
 * Returns { type, verb }
 */
export function classifySQL(sql) {
  const normalized = sql.trim().replace(/\s+/g, " ").toUpperCase();

  const DDL_VERBS = ["CREATE", "ALTER", "DROP", "TRUNCATE", "RENAME", "COMMENT"];
  const DML_VERBS = ["INSERT", "UPDATE", "DELETE", "MERGE", "UPSERT", "COPY"];
  const DQL_VERBS = ["SELECT", "WITH", "TABLE", "VALUES", "EXPLAIN", "ANALYZE"];
  const TCL_VERBS = ["BEGIN", "COMMIT", "ROLLBACK", "SAVEPOINT", "RELEASE"];

  const firstWord = normalized.split(" ")[0];

  if (DDL_VERBS.includes(firstWord)) return { type: "DDL", verb: firstWord };
  if (DML_VERBS.includes(firstWord)) return { type: "DML", verb: firstWord };
  if (DQL_VERBS.includes(firstWord)) return { type: "DQL", verb: firstWord };
  if (TCL_VERBS.includes(firstWord)) return { type: "TCL", verb: firstWord };

  return { type: "UNKNOWN", verb: firstWord };
}

/**
 * Basic SQL safety check – rejects obviously dangerous patterns when
 * allowDDL or allowDML is false (defensive opt-in guard).
 */
export function validateSQL(sql, { allowDDL = true, allowDML = true } = {}) {
  const { type } = classifySQL(sql);

  if (type === "DDL" && !allowDDL) {
    throw new Error(
      `DDL statements are disabled. SQL starts with a DDL verb: ${sql.substring(0, 80)}`
    );
  }
  if (type === "DML" && !allowDML) {
    throw new Error(
      `DML statements are disabled. SQL starts with a DML verb: ${sql.substring(0, 80)}`
    );
  }
  if (type === "TCL") {
    throw new Error(
      "Transaction control statements (BEGIN / COMMIT / ROLLBACK) are managed automatically by the server."
    );
  }

  // Prevent inline transaction control mixed into arbitrary SQL
  const upper = sql.toUpperCase();
  const dangerousPatterns = [/;\s*DROP\s+DATABASE/i, /;\s*DROP\s+SCHEMA\s+public/i];
  for (const pattern of dangerousPatterns) {
    if (pattern.test(sql)) {
      throw new Error(
        `Potentially dangerous statement detected. Please verify: ${sql.substring(0, 120)}`
      );
    }
  }
}

/**
 * Format a query result object into a human-readable markdown table.
 */
export function formatResultAsMarkdown(result) {
  const { rows, rowCount, fields } = result;

  if (!rows || rows.length === 0) {
    return `*Query executed successfully. Rows affected: ${rowCount ?? 0}*`;
  }

  const columns = fields ? fields.map((f) => f.name) : Object.keys(rows[0]);
  const header = `| ${columns.join(" | ")} |`;
  const separator = `| ${columns.map(() => "---").join(" | ")} |`;
  const dataRows = rows
    .slice(0, 200) // cap at 200 rows to avoid huge payloads
    .map((row) => `| ${columns.map((c) => String(row[c] ?? "NULL")).join(" | ")} |`)
    .join("\n");

  const note =
    rows.length > 200
      ? `\n\n> ⚠️ Result truncated to 200 rows (total: ${rowCount}).`
      : "";

  return [header, separator, dataRows].join("\n") + note;
}
