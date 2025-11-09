# 🚀 Supabase Migration Guide

This guide will help you migrate your Grace Rhythm Sounds project from one Supabase instance to another.

## 📋 Migration Checklist

- [ ] Export database schema and data
- [ ] Migrate all SQL migrations
- [ ] Deploy all Edge Functions
- [ ] Configure secrets/environment variables
- [ ] Update client configuration
- [ ] Migrate storage buckets and files
- [ ] Update frontend environment variables
- [ ] Test all functionality

---

## Step 1: Prepare Your New Supabase Project

### 1.1 Create New Project

1. Go to https://supabase.com
2. Click **"New Project"**
3. Fill in:
   - **Project Name**: Grace Rhythm Sounds (or your preferred name)
   - **Database Password**: Create a strong password (save it securely!)
   - **Region**: Choose the closest region to your users
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

### 1.2 Get New Project Credentials

1. Go to **Settings** → **API**
2. Copy these values (you'll need them later):
   - **Project URL**: `https://your-new-project-id.supabase.co`
   - **anon/public key**: `eyJhbGc...`
   - **service_role key**: `eyJhbGc...` (keep secret!)

---

## Step 2: Migrate Database Schema (SQL Migrations)

### Option A: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link to your NEW project**:
   ```bash
   supabase link --project-ref YOUR_NEW_PROJECT_REF
   ```
   - Find your project ref in: Dashboard → Settings → General → Reference ID

4. **Apply all migrations**:
   ```bash
   supabase db push
   ```
   This will apply all migrations from `supabase/migrations/` folder in order.

### Option B: Using Supabase Dashboard (Manual)

1. Go to your **NEW** Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open each migration file from `supabase/migrations/` in chronological order
4. Copy and paste the SQL content
5. Click **"Run"** for each migration
6. **Important**: Run them in this exact order:
   ```
   20251101100726_remix_batch_1_migrations.sql
   20251101102356_c338f3d1-cfd8-4bed-b643-4a3abf67bc06.sql
   20251101103430_fb498e35-838a-4238-a954-80d3dabf1fe0.sql
   20251101103629_b4cc2575-beb6-4074-a42e-6dba70bba426.sql
   20251101103711_b9253d31-3676-490d-9c33-7f20520ed642.sql
   20251102000000_fix_storage_public_uploads.sql
   20251102000001_add_admin_demo_update_policy.sql
   20251103000000_create_avatars_storage.sql
   20251103000001_fix_profile_rls_policies.sql
   20251103000002_add_artist_image.sql
   20251103000003_fix_admin_view_and_email.sql
   20251103000004_fix_profile_insert_urgent.sql
   20251103000005_auto_create_profile_trigger.sql
   20251103000006_complete_profile_fix.sql
   20251103000007_add_phone_number.sql
   20251103000008_fix_foreign_key_and_add_tables.sql
   20251103000009_create_event_release_storage.sql
   20251103000010_add_is_featured_to_profiles.sql
   20251103000011_add_admin_delete_demo_policy.sql
   20251103000012_add_admin_create_profile.sql
   20251103000013_add_is_latest_release.sql
   20251103000014_create_news_table.sql
   20251103000015_create_news_storage.sql
   20251103000016_create_streaming_platform_connections.sql
   20251104000000_add_is_approved_to_profiles.sql
   20251104000001_add_admin_delete_profiles.sql
   20251105000000_add_streaming_platforms_and_needs_improvement.sql
   20251105000001_update_admin_create_profile_streaming_urls.sql
   20251105000002_create_audio_demos_bucket.sql
   20251106000000_add_gender_to_profiles.sql
   ```

### Option C: Using Migration Script (Automated)

Run the provided migration script:
```bash
# Windows PowerShell
.\scripts\migrate-supabase.ps1

# Or manually run SQL files in order
```

---

## Step 3: Migrate Edge Functions

### 3.1 List of Functions to Deploy

You have **16 Edge Functions** to deploy:

1. `send-contact-email`
2. `notify-new-artist`
3. `notify-demo-submission`
4. `send-demo-status-email`
5. `spotify-oauth`
6. `spotify-sync`
7. `apple-music-oauth`
8. `apple-music-sync`
9. `youtube-oauth`
10. `youtube-sync`
11. `audiomack-oauth`
12. `audiomack-sync`
13. `boomplay-oauth`
14. `boomplay-sync`
15. `sync-streaming-data`
16. `delete-user`

### 3.2 Deploy All Functions

**Using Supabase CLI** (Recommended):

```bash
# Make sure you're linked to the new project
supabase link --project-ref YOUR_NEW_PROJECT_REF

# Deploy all functions at once
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

**Or use the batch script** (see `scripts/deploy-functions.sh` or `scripts/deploy-functions.ps1`)

---

## Step 4: Configure Secrets (Environment Variables)

### 4.1 Required Secrets for Edge Functions

Go to your **NEW** Supabase project → **Settings** → **Edge Functions** → **Secrets**

Add these secrets (copy from your OLD project if migrating):

#### Email Configuration
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=Grace Rhythm Sounds <info@gracerhythmsounds.com>
RESEND_TO_EMAIL=gracerhythmsounds@gmail.com
ADMIN_EMAIL=gracerhythmsounds@gmail.com
```

#### Spotify Integration
```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=https://your-domain.com/auth/spotify/callback
```

#### Apple Music Integration
```
APPLE_MUSIC_CLIENT_ID=your_apple_music_client_id
APPLE_MUSIC_CLIENT_SECRET=your_apple_music_client_secret
APPLE_MUSIC_REDIRECT_URI=https://your-domain.com/auth/apple-music/callback
APPLE_MUSIC_TEAM_ID=your_team_id
APPLE_MUSIC_KEY_ID=your_key_id
APPLE_MUSIC_PRIVATE_KEY=your_private_key
```

#### YouTube Integration
```
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REDIRECT_URI=https://your-domain.com/auth/youtube/callback
```

#### Audiomack Integration
```
AUDIOMACK_CLIENT_ID=your_audiomack_client_id
AUDIOMACK_CLIENT_SECRET=your_audiomack_client_secret
AUDIOMACK_REDIRECT_URI=https://your-domain.com/auth/audiomack/callback
```

#### Boomplay Integration
```
BOOMPLAY_CLIENT_ID=your_boomplay_client_id
BOOMPLAY_CLIENT_SECRET=your_boomplay_client_secret
BOOMPLAY_REDIRECT_URI=https://your-domain.com/auth/boomplay/callback
```

#### Frontend URL
```
FRONTEND_URL=https://your-domain.com
```

### 4.2 How to Add Secrets

**Using Supabase CLI**:
```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
supabase secrets set RESEND_FROM_EMAIL="Grace Rhythm Sounds <info@gracerhythmsounds.com>"
# ... repeat for each secret
```

**Using Dashboard**:
1. Go to **Settings** → **Edge Functions** → **Secrets**
2. Click **"Add new secret"**
3. Enter key and value
4. Click **"Save"**

---

## Step 5: Migrate Storage Buckets

### 5.1 Create Storage Buckets

Go to **Storage** in your NEW Supabase dashboard and create these buckets:

1. **`avatars`** - Public bucket for user avatars
2. **`artist-images`** - Public bucket for artist images
3. **`releases`** - Public bucket for release covers
4. **`events`** - Public bucket for event images
5. **`news`** - Public bucket for news images
6. **`audio-demos`** - Private bucket for demo submissions

### 5.2 Configure Bucket Policies

The storage policies should be created automatically by migrations, but verify:

- **`avatars`**: Public read, authenticated write
- **`artist-images`**: Public read, authenticated write
- **`releases`**: Public read, authenticated write
- **`events`**: Public read, authenticated write
- **`news`**: Public read, authenticated write
- **`audio-demos`**: Private (authenticated read/write)

### 5.3 Migrate Files (If Needed)

If you have existing files in your OLD project:

1. **Export from old project** (using Supabase CLI or dashboard)
2. **Import to new project** (using Supabase CLI or dashboard)

**Using Supabase CLI**:
```bash
# Export from old project
supabase storage download --bucket avatars --local-path ./storage-backup/avatars

# Link to new project
supabase link --project-ref NEW_PROJECT_REF

# Upload to new project
supabase storage upload --bucket avatars --local-path ./storage-backup/avatars
```

---

## Step 6: Update Frontend Configuration

### 6.1 Update Environment Variables

Update your `.env.local` file (or production environment variables):

```env
# OLD VALUES (replace these)
# VITE_SUPABASE_URL=https://old-project-id.supabase.co
# VITE_SUPABASE_PUBLISHABLE_KEY=old-anon-key

# NEW VALUES
VITE_SUPABASE_URL=https://your-new-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-new-anon-key
```

### 6.2 Update Supabase Config

The client configuration in `src/integrations/supabase/client.ts` will automatically use the new environment variables. No code changes needed!

### 6.3 Update config.toml (Optional)

If you're using Supabase CLI, update `supabase/config.toml`:

```toml
project_id = "your-new-project-ref"
```

---

## Step 7: Migrate Data (Optional)

If you need to migrate existing data:

### 7.1 Export Data from Old Project

**Using Supabase Dashboard**:
1. Go to **Table Editor**
2. For each table, click **"..."** → **"Export as CSV"**
3. Download all CSV files

**Using Supabase CLI**:
```bash
# Link to old project first
supabase link --project-ref OLD_PROJECT_REF

# Export data
supabase db dump --data-only -f backup.sql
```

### 7.2 Import Data to New Project

**Using Supabase Dashboard**:
1. Go to **Table Editor**
2. For each table, click **"Insert"** → **"Import data from CSV"**
3. Upload the CSV file

**Using Supabase CLI**:
```bash
# Link to new project
supabase link --project-ref NEW_PROJECT_REF

# Import data
supabase db reset --db-url postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres < backup.sql
```

**Important Notes**:
- Export/import users separately (they're in `auth.users` table)
- Be careful with foreign key relationships
- Test with a small dataset first

---

## Step 8: Update OAuth Redirect URIs

If you're using OAuth integrations, update redirect URIs in each platform:

### 8.1 Update in Platform Dashboards

1. **Spotify**: Spotify Developer Dashboard → Your App → Redirect URIs
2. **Apple Music**: Apple Developer Portal
3. **YouTube**: Google Cloud Console → OAuth 2.0 Client IDs
4. **Audiomack**: Audiomack Developer Portal
5. **Boomplay**: Boomplay Developer Portal

Update to:
```
https://your-domain.com/auth/spotify/callback
https://your-domain.com/auth/apple-music/callback
https://your-domain.com/auth/youtube/callback
https://your-domain.com/auth/audiomack/callback
https://your-domain.com/auth/boomplay/callback
```

### 8.2 Update in Supabase Secrets

Make sure `FRONTEND_URL` and all `*_REDIRECT_URI` secrets match your new domain.

---

## Step 9: Test Everything

### 9.1 Test Checklist

- [ ] **Authentication**: Sign up, login, logout
- [ ] **Email Functions**: Submit contact form, check email delivery
- [ ] **Artist Registration**: Create new artist account
- [ ] **Demo Submission**: Submit a demo, check notifications
- [ ] **OAuth Connections**: Test Spotify, Apple Music, YouTube, etc.
- [ ] **Storage**: Upload avatar, artist image, release cover
- [ ] **Admin Functions**: Access admin panel, manage artists
- [ ] **Streaming Sync**: Connect platform and sync data
- [ ] **Public Pages**: Homepage, artists, releases, events, news

### 9.2 Common Issues

**Issue**: Functions not working
- **Solution**: Check secrets are set correctly
- **Solution**: Verify function deployment succeeded

**Issue**: OAuth not working
- **Solution**: Update redirect URIs in platform dashboards
- **Solution**: Update `FRONTEND_URL` secret

**Issue**: Storage uploads failing
- **Solution**: Verify bucket policies are set
- **Solution**: Check RLS policies on storage buckets

**Issue**: Database errors
- **Solution**: Verify all migrations ran successfully
- **Solution**: Check RLS policies are enabled

---

## Step 10: Update Production Environment

If you have a production deployment:

1. **Vercel/Netlify**: Update environment variables in dashboard
2. **Other platforms**: Update environment variables accordingly
3. **Redeploy**: Trigger a new deployment

---

## Quick Migration Script

For a faster migration, you can use the provided scripts:

### Windows PowerShell
```powershell
.\scripts\migrate-supabase.ps1 -OldProjectRef "old-ref" -NewProjectRef "new-ref"
```

### Linux/Mac Bash
```bash
./scripts/migrate-supabase.sh old-ref new-ref
```

---

## Migration Summary

After completing all steps, you should have:

✅ Database schema migrated (all tables, RLS policies, triggers)  
✅ All Edge Functions deployed  
✅ All secrets configured  
✅ Storage buckets created  
✅ Frontend pointing to new project  
✅ OAuth redirect URIs updated  
✅ All functionality tested  

---

## Need Help?

If you encounter issues during migration:

1. Check Supabase logs: Dashboard → Logs → Edge Functions
2. Check database logs: Dashboard → Logs → Postgres Logs
3. Verify all environment variables are set correctly
4. Ensure migrations ran in correct order
5. Test each function individually

---

## Rollback Plan

If something goes wrong:

1. Keep your old Supabase project active until migration is verified
2. Update `.env.local` to point back to old project
3. Fix issues in new project
4. Re-attempt migration

---

**Last Updated**: November 2024

