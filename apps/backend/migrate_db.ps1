
$ErrorActionPreference = "Stop"

Write-Host "Retrying D1 Database Migrations (No Flags)..."
# In non-interactive terminals, wrangler should skip confirmation automatically
npx wrangler d1 migrations apply DB --remote

Write-Host "Migration Command Finished."
