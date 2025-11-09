#!/bin/bash
# Deploy All Supabase Edge Functions
# Usage: ./scripts/deploy-functions.sh

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m'

echo -e "${CYAN}⚡ Deploying All Supabase Edge Functions...${NC}"
echo ""

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

SUCCESS_COUNT=0
FAILED_FUNCTIONS=()

for func in "${FUNCTIONS[@]}"; do
    echo -e "${GRAY}Deploying $func...${NC}"
    if supabase functions deploy "$func"; then
        echo -e "${GREEN}✅ $func deployed successfully${NC}"
        ((SUCCESS_COUNT++))
    else
        echo -e "${RED}❌ Failed to deploy $func${NC}"
        FAILED_FUNCTIONS+=("$func")
    fi
    echo ""
done

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Deployment Summary${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Successfully deployed: $SUCCESS_COUNT/${#FUNCTIONS[@]}${NC}"

if [ ${#FAILED_FUNCTIONS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Failed functions:${NC}"
    for func in "${FAILED_FUNCTIONS[@]}"; do
        echo -e "${YELLOW}   - $func${NC}"
    done
fi

