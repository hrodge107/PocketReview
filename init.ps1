# PocketReview agent harness bootstrap (Windows PowerShell)
$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot
Write-Host "==> Working directory: $(Get-Location)"
npm ci
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
npm run verify
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host 'Baseline verified. Start development with npm run dev.'
