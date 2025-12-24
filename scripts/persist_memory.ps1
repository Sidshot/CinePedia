$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$Source = "docs/memory.md"
$Vault = "archive/memory_vault"
$MasterBackup = "archive/MASTER_MEMORY_BACKUP.md"
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$Snapshot = "$Vault/memory_$Timestamp.md"

Write-Host "Persisting Memory Log..."

# 1. Verify Source Exists
if (-not (Test-Path $Source)) {
    Write-Error "CRITICAL: docs/memory.md not found!"
}

# 2. Create Timestamped Snapshot (The "Time Machine")
Copy-Item $Source $Snapshot
Write-Host "Created snapshot: $Snapshot"

# 3. Update Master Backup (The "Undeletable" Anchor)
Copy-Item $Source $MasterBackup -Force
Write-Host "Updated Master Backup: $MasterBackup"

# 4. Git Persistence (The "Cloud" Backup)
Write-Host "Committing to Git..."
git add $Source $MasterBackup $Vault
git commit -m "chore(memory): secure persistent snapshot $Timestamp"

Write-Host "Memory Secure. Session Persisted."
