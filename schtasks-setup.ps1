<#
.SYNOPSIS
  Registers a Windows scheduled task to start FAR Lessons server + tunnel on startup.
  Run this script ONCE (as Administrator) to persist the service across reboots.
.DESCRIPTION
  - Creates a task that runs start-prod.ps1 at system startup
  - The task runs as the current user (runs console apps in session 0)
  - To run as Administrator: right-click PowerShell → Run as administrator
    then: powershell -File schtasks-setup.ps1
.NOTES
  The tunnel URL changes on every restart. To see the current URL:
    1. Check C:\Users\salah\OneDrive\Desktop\FAR\cours\current-tunnel-url.txt
    2. Or run: Get-Content "$env:TEMP\tunnel_out.txt" -Wait
#>

$TaskName = "FARLessons"
$ScriptPath = "C:\Users\salah\OneDrive\Desktop\FAR\cours\start-prod.ps1"
$TaskDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Verify script exists
if (!(Test-Path $ScriptPath)) {
  Write-Host "ERROR: start-prod.ps1 not found at $ScriptPath" -ForegroundColor Red
  exit 1
}

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
  Write-Host "WARNING: Not running as Administrator. The task will be created but may not run at startup." -ForegroundColor Yellow
  Write-Host "To fix: right-click PowerShell → Run as administrator, then run this script again." -ForegroundColor Yellow
}

# Remove existing task if any
& schtasks /Delete /TN $TaskName /F 2>$null

# Create the task
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NoLogo -NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`""

$trigger = New-ScheduledTaskTrigger -AtStartup

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -ExecutionTimeLimit (New-TimeSpan -Days 365)

$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" `
  -RunLevel Limited `
  -LogonType Interactive

try {
  Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force
  Write-Host "OK - Scheduled task '$TaskName' registered." -ForegroundColor Green
  Write-Host ""
  Write-Host "The server + tunnel will start automatically on next reboot." -ForegroundColor Cyan
  Write-Host ""
  Write-Host "To test now, reboot or run: schtasks /Run /TN $TaskName" -ForegroundColor Gray
  Write-Host "To view status:            schtasks /Query /TN $TaskName" -ForegroundColor Gray
  Write-Host "To get tunnel URL:         Get-Content `"$env:TEMP\tunnel_out.txt`"" -ForegroundColor Gray
} catch {
  Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}
