param([int]$Port = 3000)

$ErrorActionPreference = "Stop"
$AppDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDir = Join-Path $AppDir "logs"
$null = New-Item -ItemType Directory -Path $LogDir -Force

$env:NODE_ENV = "production"
$env:PATH = "$env:APPDATA\npm;$env:PATH"

Write-Host "=== FAR Lessons ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Start Next.js via PM2
Write-Host "[1/2] Starting Next.js via PM2 on port $Port..." -ForegroundColor Yellow

# Kill any existing PM2 process for far-app
& pm2 delete far-app 2>$null

Start-Process -FilePath "cmd.exe" -ArgumentList "/c pm2 start ecosystem.config.js --env production" -NoNewWindow -Wait

$serverUp = $false
for ($i = 0; $i -lt 45; $i++) {
  Start-Sleep -Seconds 1
  try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    if ($tcp.ConnectAsync("127.0.0.1", $Port).Wait(2000) -and $tcp.Connected) {
      $serverUp = $true
      break
    }
  } catch {}
}
if ($serverUp) {
  & pm2 save
  Write-Host "  OK - Server running on http://localhost:$Port" -ForegroundColor Green
} else {
  Write-Host "  FAIL - Server did not start. Check: pm2 logs far-app" -ForegroundColor Red
  exit 1
}

# Step 2: Start Cloudflare Tunnel
Write-Host "[2/2] Starting Cloudflare Tunnel..." -ForegroundColor Yellow

$tunnelExe = "$env:APPDATA\npm\node_modules\cloudflared\bin\cloudflared.exe"
if (!(Test-Path $tunnelExe)) {
  Write-Host "  FAIL - cloudflared not found at $tunnelExe" -ForegroundColor Red
  Write-Host "  Install: npm install -g cloudflared" -ForegroundColor Yellow
  exit 1
}

$tunnelOut = Join-Path $env:TEMP "tunnel_out.txt"
Remove-Item $tunnelOut -ErrorAction SilentlyContinue

# Detach tunnel so it survives script exit
$wshell = New-Object -ComObject WScript.Shell
$wshell.Run("cmd /c `"`"$tunnelExe`" tunnel --url http://127.0.0.1:$Port --http-host-header localhost:$Port > $tunnelOut 2>&1`"", 0, $false)

Write-Host "  Waiting for tunnel..." -ForegroundColor Gray
$tunnelUrl = $null
for ($i = 0; $i -lt 40; $i++) {
  Start-Sleep -Seconds 1
  if (Test-Path $tunnelOut) {
    $line = Select-String -Path $tunnelOut -Pattern "https://.*\.trycloudflare\.com" | Select-Object -First 1
    if ($line) {
      $tunnelUrl = $line.Matches.Value.Trim()
      break
    }
  }
}

# Save URL to file for reference
if ($tunnelUrl) {
  $tunnelUrl | Out-File (Join-Path $AppDir "current-tunnel-url.txt")
  Write-Host "  OK - Tunnel created!" -ForegroundColor Green
  Write-Host ""
  Write-Host "==============================================" -ForegroundColor Cyan
  Write-Host "  PUBLIC URL:  $tunnelUrl" -ForegroundColor Green
  Write-Host "  LOCAL URL:   http://localhost:$Port" -ForegroundColor Gray
  Write-Host "  SAVED TO:    current-tunnel-url.txt" -ForegroundColor Gray
  Write-Host "==============================================" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "Server is managed by PM2. Tunnel is running in background." -ForegroundColor Yellow
  Write-Host "To view PM2 status: pm2 status" -ForegroundColor Gray
  Write-Host "To view PM2 logs:   pm2 logs far-app" -ForegroundColor Gray
  Write-Host "To stop server:     pm2 stop far-app" -ForegroundColor Gray
  Write-Host ""
} else {
  Write-Host "  FAIL - Could not get tunnel URL" -ForegroundColor Red
  Write-Host "  Check $tunnelOut for details" -ForegroundColor Yellow
}
