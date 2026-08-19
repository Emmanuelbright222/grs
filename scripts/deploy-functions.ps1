# Deploy All Supabase Edge Functions
# Usage: .\scripts\deploy-functions.ps1

Write-Host "⚡ Deploying All Supabase Edge Functions..." -ForegroundColor Cyan
Write-Host ""

$functions = @(
    "send-contact-email",
    "notify-new-artist",
    "notify-demo-submission",
    "send-demo-status-email",
    "spotify-oauth",
    "spotify-sync",
    "apple-music-oauth",
    "apple-music-sync",
    "youtube-oauth",
    "youtube-sync",
    "audiomack-oauth",
    "audiomack-sync",
    "boomplay-oauth",
    "boomplay-sync",
    "sync-streaming-data",
    "delete-user"
)

$successCount = 0
$failedFunctions = @()

foreach ($func in $functions) {
    Write-Host "Deploying $func..." -ForegroundColor Gray
    try {
        supabase functions deploy $func
        Write-Host "✅ $func deployed successfully" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "❌ Failed to deploy $func" -ForegroundColor Red
        $failedFunctions += $func
    }
    Write-Host ""
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Deployment Summary" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Successfully deployed: $successCount/$($functions.Count)" -ForegroundColor Green

if ($failedFunctions.Count -gt 0) {
    Write-Host "❌ Failed functions:" -ForegroundColor Red
    foreach ($func in $failedFunctions) {
        Write-Host "   - $func" -ForegroundColor Yellow
    }
}

