# Supabase Migration Script for Windows PowerShell
# Usage: .\scripts\migrate-supabase.ps1 -OldProjectRef "old-ref" -NewProjectRef "new-ref"

param(
    [Parameter(Mandatory=$false)]
    [string]$OldProjectRef = "",
    
    [Parameter(Mandatory=$true)]
    [string]$NewProjectRef,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipData = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipStorage = $false
)

Write-Host "🚀 Starting Supabase Migration..." -ForegroundColor Green
Write-Host ""

# Check if Supabase CLI is installed
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Step 1: Link to new project
Write-Host ""
Write-Host "📌 Step 1: Linking to new Supabase project..." -ForegroundColor Cyan
Write-Host "   Project Ref: $NewProjectRef" -ForegroundColor Gray

try {
    supabase link --project-ref $NewProjectRef
    Write-Host "✅ Successfully linked to new project" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to link to project. Please check:" -ForegroundColor Red
    Write-Host "   1. You're logged in: supabase login" -ForegroundColor Yellow
    Write-Host "   2. Project ref is correct" -ForegroundColor Yellow
    Write-Host "   3. You have access to the project" -ForegroundColor Yellow
    exit 1
}

# Step 2: Apply migrations
Write-Host ""
Write-Host "📦 Step 2: Applying database migrations..." -ForegroundColor Cyan

try {
    supabase db push
    Write-Host "✅ Migrations applied successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to apply migrations" -ForegroundColor Red
    Write-Host "   You may need to apply them manually via Supabase Dashboard" -ForegroundColor Yellow
    exit 1
}

# Step 3: Deploy Edge Functions
Write-Host ""
Write-Host "⚡ Step 3: Deploying Edge Functions..." -ForegroundColor Cyan

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

$failedFunctions = @()

foreach ($func in $functions) {
    Write-Host "   Deploying $func..." -ForegroundColor Gray
    try {
        supabase functions deploy $func
        Write-Host "   ✅ $func deployed" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ $func failed to deploy" -ForegroundColor Red
        $failedFunctions += $func
    }
}

if ($failedFunctions.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  Some functions failed to deploy:" -ForegroundColor Yellow
    foreach ($func in $failedFunctions) {
        Write-Host "   - $func" -ForegroundColor Yellow
    }
    Write-Host "   Please deploy them manually" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "✅ All functions deployed successfully" -ForegroundColor Green
}

# Step 4: Export data from old project (if specified)
if (-not $SkipData -and $OldProjectRef -ne "") {
    Write-Host ""
    Write-Host "💾 Step 4: Exporting data from old project..." -ForegroundColor Cyan
    Write-Host "   This step requires manual intervention" -ForegroundColor Yellow
    Write-Host "   Please export data from old project dashboard or use:" -ForegroundColor Yellow
    Write-Host "   supabase link --project-ref $OldProjectRef" -ForegroundColor Gray
    Write-Host "   supabase db dump --data-only -f backup.sql" -ForegroundColor Gray
}

# Step 5: Migrate storage (if not skipped)
if (-not $SkipStorage) {
    Write-Host ""
    Write-Host "📁 Step 5: Storage migration..." -ForegroundColor Cyan
    Write-Host "   Storage buckets should be created by migrations" -ForegroundColor Yellow
    Write-Host "   To migrate files, use Supabase Dashboard or CLI:" -ForegroundColor Yellow
    Write-Host "   supabase storage download --bucket <bucket-name>" -ForegroundColor Gray
    Write-Host "   supabase storage upload --bucket <bucket-name>" -ForegroundColor Gray
}

# Summary
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📋 Migration Summary" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Database migrations: Applied" -ForegroundColor Green
Write-Host "✅ Edge Functions: Deployed ($($functions.Count - $failedFunctions.Count)/$($functions.Count))" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Configure secrets in Supabase Dashboard:" -ForegroundColor White
Write-Host "      Settings → Edge Functions → Secrets" -ForegroundColor Gray
Write-Host "   2. Update .env.local with new project credentials:" -ForegroundColor White
Write-Host "      VITE_SUPABASE_URL=https://$NewProjectRef.supabase.co" -ForegroundColor Gray
Write-Host "   3. Update OAuth redirect URIs in platform dashboards" -ForegroundColor White
Write-Host "   4. Test all functionality" -ForegroundColor White
Write-Host ""
Write-Host "📖 See SUPABASE_MIGRATION_GUIDE.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""

