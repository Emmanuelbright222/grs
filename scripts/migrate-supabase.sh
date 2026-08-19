#!/bin/bash
# Supabase Migration Script for Linux/Mac
# Usage: ./scripts/migrate-supabase.sh [old-ref] new-ref

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Parse arguments
OLD_PROJECT_REF="${1:-}"
NEW_PROJECT_REF="${2:-}"

if [ -z "$NEW_PROJECT_REF" ]; then
    echo -e "${RED}❌ Error: New project ref is required${NC}"
    echo "Usage: ./scripts/migrate-supabase.sh [old-ref] new-ref"
    exit 1
fi

echo -e "${GREEN}🚀 Starting Supabase Migration...${NC}"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found. Please install it first:${NC}"
    echo -e "${YELLOW}   npm install -g supabase${NC}"
    exit 1
fi

SUPABASE_VERSION=$(supabase --version)
echo -e "${GREEN}✅ Supabase CLI found: $SUPABASE_VERSION${NC}"

# Step 1: Link to new project
echo ""
echo -e "${CYAN}📌 Step 1: Linking to new Supabase project...${NC}"
echo -e "${GRAY}   Project Ref: $NEW_PROJECT_REF${NC}"

if supabase link --project-ref "$NEW_PROJECT_REF"; then
    echo -e "${GREEN}✅ Successfully linked to new project${NC}"
else
    echo -e "${RED}❌ Failed to link to project. Please check:${NC}"
    echo -e "${YELLOW}   1. You're logged in: supabase login${NC}"
    echo -e "${YELLOW}   2. Project ref is correct${NC}"
    echo -e "${YELLOW}   3. You have access to the project${NC}"
    exit 1
fi

# Step 2: Apply migrations
echo ""
echo -e "${CYAN}📦 Step 2: Applying database migrations...${NC}"

if supabase db push; then
    echo -e "${GREEN}✅ Migrations applied successfully${NC}"
else
    echo -e "${RED}❌ Failed to apply migrations${NC}"
    echo -e "${YELLOW}   You may need to apply them manually via Supabase Dashboard${NC}"
    exit 1
fi

# Step 3: Deploy Edge Functions
echo ""
echo -e "${CYAN}⚡ Step 3: Deploying Edge Functions...${NC}"

FUNCTIONS=(
    "send-contact-email"
    "notify-new-artist"
    "notify-demo-submission"
    "send-demo-status-email"
    "spotify-oauth"
    "spotify-sync"
    "apple-music-oauth"
    "apple-music-sync"
    "youtube-oauth"
    "youtube-sync"
    "audiomack-oauth"
    "audiomack-sync"
    "boomplay-oauth"
    "boomplay-sync"
    "sync-streaming-data"
    "delete-user"
)

FAILED_FUNCTIONS=()
SUCCESS_COUNT=0

for func in "${FUNCTIONS[@]}"; do
    echo -e "${GRAY}   Deploying $func...${NC}"
    if supabase functions deploy "$func"; then
        echo -e "${GREEN}   ✅ $func deployed${NC}"
        ((SUCCESS_COUNT++))
    else
        echo -e "${RED}   ❌ $func failed to deploy${NC}"
        FAILED_FUNCTIONS+=("$func")
    fi
done

if [ ${#FAILED_FUNCTIONS[@]} -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Some functions failed to deploy:${NC}"
    for func in "${FAILED_FUNCTIONS[@]}"; do
        echo -e "${YELLOW}   - $func${NC}"
    done
    echo -e "${YELLOW}   Please deploy them manually${NC}"
else
    echo ""
    echo -e "${GREEN}✅ All functions deployed successfully${NC}"
fi

# Step 4: Export data from old project (if specified)
if [ -n "$OLD_PROJECT_REF" ]; then
    echo ""
    echo -e "${CYAN}💾 Step 4: Exporting data from old project...${NC}"
    echo -e "${YELLOW}   This step requires manual intervention${NC}"
    echo -e "${YELLOW}   Please export data from old project dashboard or use:${NC}"
    echo -e "${GRAY}   supabase link --project-ref $OLD_PROJECT_REF${NC}"
    echo -e "${GRAY}   supabase db dump --data-only -f backup.sql${NC}"
fi

# Summary
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📋 Migration Summary${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✅ Database migrations: Applied${NC}"
echo -e "${GREEN}✅ Edge Functions: Deployed ($SUCCESS_COUNT/${#FUNCTIONS[@]})${NC}"
echo ""
echo -e "${YELLOW}⚠️  Next Steps:${NC}"
echo -e "${NC}   1. Configure secrets in Supabase Dashboard:"
echo -e "${GRAY}      Settings → Edge Functions → Secrets${NC}"
echo -e "${NC}   2. Update .env.local with new project credentials:"
echo -e "${GRAY}      VITE_SUPABASE_URL=https://$NEW_PROJECT_REF.supabase.co${NC}"
echo -e "${NC}   3. Update OAuth redirect URIs in platform dashboards"
echo -e "${NC}   4. Test all functionality"
echo ""
echo -e "${CYAN}📖 See SUPABASE_MIGRATION_GUIDE.md for detailed instructions${NC}"
echo ""

