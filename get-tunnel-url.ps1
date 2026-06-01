Write-Host "=== FAR Lessons — Current Tunnel URL ===" -ForegroundColor Cyan
$urlFile = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "current-tunnel-url.txt"
if (Test-Path $urlFile) {
  $url = Get-Content $urlFile -First 1
  Write-Host "URL: $url" -ForegroundColor Green
} else {
  Write-Host "No saved URL found." -ForegroundColor Yellow
}
$tunnelOut = "$env:TEMP\tunnel_out.txt"
if (Test-Path $tunnelOut) {
  $line = Select-String -Path $tunnelOut -Pattern "https://.*\.trycloudflare\.com" | Select-Object -First 1
  if ($line) {
    Write-Host "URL (from tunnel output): $($line.Matches.Value.Trim())" -ForegroundColor Green
  }
}
Write-Host ""
Write-Host "PM2 status:" -ForegroundColor Gray
& pm2 status far-app 2>$null
