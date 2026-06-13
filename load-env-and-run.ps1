# load-env-and-run.ps1
# Reads .env from the project root, exports each variable,
# then runs: mvn spring-boot:run

$envFile = Join-Path $PSScriptRoot ".env"

if (-Not (Test-Path $envFile)) {
    Write-Error ".env file not found at $envFile"
    exit 1
}

# Parse .env: skip blank lines and comments
$envVars = @{}
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#")) {
        $parts = $line -split "=", 2
        if ($parts.Length -eq 2) {
            $key   = $parts[0].Trim()
            $value = $parts[1].Trim()
            $envVars[$key] = $value
            [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "  Loaded: $key"
        }
    }
}

Write-Host ""
Write-Host "Starting Spring Boot with $($envVars.Count) env vars from .env ..."
Write-Host ""

mvn spring-boot:run
