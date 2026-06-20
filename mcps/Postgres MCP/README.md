# PostgreSQL MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server written in Node.js that exposes a full set of tools for running **DDL** and **DML** operations against a PostgreSQL database.

---

## Features

| Tool | Category | Description |
|---|---|---|
| `pg_ping` | Utility | Test DB connection & get server version |
| `pg_query` | DQL | Run a SELECT / EXPLAIN (read-only) |
| `pg_execute` | DML | Run INSERT / UPDATE / DELETE / MERGE |
| `pg_ddl` | DDL | Run CREATE / ALTER / DROP / TRUNCATE |
| `pg_transaction` | DML+DDL | Run multiple statements atomically |
| `pg_list_schemas` | Introspection | List all schemas |
| `pg_list_tables` | Introspection | List tables in a schema |
| `pg_describe_table` | Introspection | Show columns, types, PK, nullability |
| `pg_list_indexes` | Introspection | Show indexes for a table |

---

## Prerequisites

- **Node.js >= 18**
- A running **PostgreSQL** instance

---

## Setup

```bash
# 1. Install dependencies
cd "Postgres MCP"
npm install

# 2. Create your .env file
copy .env.example .env
# Then edit .env with your database credentials
```

### `.env` fields

| Variable | Required | Default | Description |
|---|---|---|---|
| `POSTGRES_HOST` | No | `localhost` | DB host |
| `POSTGRES_PORT` | No | `5432` | DB port |
| `POSTGRES_DB` | **Yes** | — | Database name |
| `POSTGRES_USER` | **Yes** | — | DB username |
| `POSTGRES_PASSWORD` | **Yes** | — | DB password |
| `POSTGRES_MAX_CONNECTIONS` | No | `10` | Pool size |
| `POSTGRES_IDLE_TIMEOUT_MS` | No | `30000` | Idle timeout (ms) |
| `POSTGRES_CONNECTION_TIMEOUT_MS` | No | `5000` | Connect timeout (ms) |

---

## Running

```bash
# Start the server (communicates over stdio)
npm start

# Development mode (restarts on file changes)
npm run dev
```

---

## Register with Claude Desktop / MCP Client

Add this to your MCP client config (e.g., `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "postgres": {
      "command": "node",
      "args": ["C:/Pooja Data/services-app/mcps/Postgres MCP/src/index.js"],
      "env": {
        "POSTGRES_HOST": "localhost",
        "POSTGRES_PORT": "5432",
        "POSTGRES_DB": "your_database",
        "POSTGRES_USER": "your_username",
        "POSTGRES_PASSWORD": "your_password"
      }
    }
  }
}
```

---

## Tool Usage Examples

### Run a SELECT query
```json
{
  "tool": "pg_query",
  "sql": "SELECT * FROM users WHERE status = $1 LIMIT 10",
  "params": ["active"]
}
```

### Insert a row
```json
{
  "tool": "pg_execute",
  "sql": "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id",
  "params": ["Alice", "alice@example.com"],
  "returning": true
}
```

### Create a table
```json
{
  "tool": "pg_ddl",
  "sql": "CREATE TABLE IF NOT EXISTS products (id SERIAL PRIMARY KEY, name TEXT NOT NULL, price NUMERIC(10,2))"
}
```

### Run a transaction
```json
{
  "tool": "pg_transaction",
  "statements": [
    { "sql": "UPDATE accounts SET balance = balance - $1 WHERE id = $2", "params": [100, 1] },
    { "sql": "UPDATE accounts SET balance = balance + $1 WHERE id = $2", "params": [100, 2] }
  ]
}
```

---

## Safety

- **`pg_query`** only allows DQL statements (SELECT, EXPLAIN, etc.) — DML/DDL are rejected.
- **`pg_execute`** only allows DML — DDL is rejected.
- **`pg_ddl`** only allows DDL.
- **`pg_transaction`** wraps all statements in BEGIN/COMMIT and rolls back on any error.
- Transaction control keywords (BEGIN, COMMIT, ROLLBACK) in raw SQL are blocked — use `pg_transaction` instead.
- Results are capped at **200 rows** to avoid oversized payloads.
