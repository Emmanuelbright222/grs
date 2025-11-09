# 🚀 Supabase Migration Quick Start

## Quick Migration Steps

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Login to Supabase
```bash
supabase login
```

### 3. Link to Your New Project
```bash
supabase link --project-ref YOUR_NEW_PROJECT_REF
```
Find your project ref: Dashboard → Settings → General → Reference ID

### 4. Apply All Migrations
```bash
supabase db push
```

### 5. Deploy All Functions
**Windows:**
```powershell
.\scripts\deploy-functions.ps1
```

**Linux/Mac:**
```bash
./scripts/deploy-functions.sh
```

**Or manually:**
```bash
supabase functions deploy send-contact-email
supabase functions deploy notify-new-artist
supabase functions deploy notify-demo-submission
supabase functions deploy send-demo-status-email
supabase functions deploy spotify-oauth
supabase functions deploy spotify-sync
supabase functions deploy apple-music-oauth
supabase functions deploy apple-music-sync
supabase functions deploy youtube-oauth
supabase functions deploy youtube-sync
supabase functions deploy audiomack-oauth
supabase functions deploy audiomack-sync
supabase functions deploy boomplay-oauth
supabase functions deploy boomplay-sync
supabase functions deploy sync-streaming-data
supabase functions deploy delete-user
```

### 6. Configure Secrets

Go to: **Settings → Edge Functions → Secrets**

Add all required secrets (see `SUPABASE_MIGRATION_GUIDE.md` for full list):

**Required:**
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_TO_EMAIL`
- `ADMIN_EMAIL`
- `FRONTEND_URL`

**OAuth (if using):**
- `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET`
- `APPLE_MUSIC_CLIENT_ID` / `APPLE_MUSIC_CLIENT_SECRET`
- `YOUTUBE_CLIENT_ID` / `YOUTUBE_CLIENT_SECRET`
- `AUDIOMACK_CLIENT_ID` / `AUDIOMACK_CLIENT_SECRET`
- `BOOMPLAY_CLIENT_ID` / `BOOMPLAY_CLIENT_SECRET`

### 7. Update Frontend Environment Variables

Update `.env.local`:
```env
VITE_SUPABASE_URL=https://YOUR_NEW_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_NEW_ANON_KEY
```

### 8. Update OAuth Redirect URIs

Update redirect URIs in each platform's developer dashboard to point to your new domain.

---

## Automated Migration (Recommended)

**Windows PowerShell:**
```powershell
.\scripts\migrate-supabase.ps1 -NewProjectRef "your-new-project-ref"
```

**Linux/Mac:**
```bash
./scripts/migrate-supabase.sh your-new-project-ref
```

---

## What Gets Migrated?

✅ Database schema (all tables, RLS policies, triggers)  
✅ Edge Functions (all 16 functions)  
⚠️ Secrets (must be configured manually)  
⚠️ Storage files (must be migrated separately if needed)  
⚠️ Data (must be exported/imported separately if needed)  

---

## Need More Details?

See `SUPABASE_MIGRATION_GUIDE.md` for comprehensive instructions.

