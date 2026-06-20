import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

/**
 * Singleton connection pool for PostgreSQL.
 * Reads connection parameters from environment variables with sensible defaults.
 */
let pool = null;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.POSTGRES_HOST || "localhost",
      port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      max: parseInt(process.env.POSTGRES_MAX_CONNECTIONS || "10", 10),
      idleTimeoutMillis: parseInt(process.env.POSTGRES_IDLE_TIMEOUT_MS || "30000", 10),
      connectionTimeoutMillis: parseInt(process.env.POSTGRES_CONNECTION_TIMEOUT_MS || "5000", 10),
    });

    pool.on("error", (err) => {
      console.error("[postgres-mcp] Unexpected pool error:", err.message);
    });
  }
  return pool;
}

/**
 * Execute a single SQL query, returning { rows, rowCount, fields }.
 * Acquires a client from the pool and releases it automatically.
 */
export async function query(sql, params = []) {
  const client = await getPool().connect();
  try {
    const result = await client.query(sql, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount,
      fields: (result.fields || []).map((f) => ({ name: f.name, dataTypeID: f.dataTypeID })),
    };
  } finally {
    client.release();
  }
}

/**
 * Execute multiple statements inside a single transaction.
 * Rolls back automatically on any error.
 * @param {Array<{sql: string, params?: any[]}>} statements
 */
export async function runTransaction(statements) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const results = [];
    for (const { sql, params = [] } of statements) {
      const result = await client.query(sql, params);
      results.push({
        rows: result.rows,
        rowCount: result.rowCount,
      });
    }
    await client.query("COMMIT");
    return results;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/** Gracefully close the pool (called on process exit). */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
