# start-mcp.ps1
# Loads .env from the project root (two levels up from this script),
# maps DB_* variables to POSTGRES_* names expected by db.js,
# then starts the Postgres MCP server.

$envFile = Join-Path $PSScriptRoot "..\..\\.env"

if (-Not (Test-Path $envFile)) {
    Write-Error ".env file not found at $envFile"
    exit 1
}

# Parse .env: skip blank lines and comments
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#")) {
        $parts = $line -split "=", 2
        if ($parts.Length -eq 2) {
            $key   = $parts[0].Trim()
            $value = $parts[1].Trim()
            [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

# Map Spring Boot / generic .env names → POSTGRES_* names that db.js expects
# Only set POSTGRES_* if not already defined directly in .env
if (-not $env:POSTGRES_HOST)     { $env:POSTGRES_HOST     = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" } }
if (-not $env:POSTGRES_PORT)     { $env:POSTGRES_PORT     = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" } }
if (-not $env:POSTGRES_DB)       { $env:POSTGRES_DB       = if ($env:DB_NAME) { $env:DB_NAME } else { "serviceapp" } }
if (-not $env:POSTGRES_USER)     { $env:POSTGRES_USER     = $env:DB_USERNAME }
if (-not $env:POSTGRES_PASSWORD) { $env:POSTGRES_PASSWORD = $env:DB_PASSWORD }

# Start the MCP server
$indexJs = Join-Path $PSScriptRoot "src\index.js"
node $indexJs
