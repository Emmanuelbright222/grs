# 📁 Storage Files Migration Guide

## ⚠️ Important: Files Are NOT Automatically Migrated

When you migrate to a new Supabase project:
- ✅ **Database schema** - Migrated via SQL migrations
- ✅ **Edge Functions** - Deployed to new project
- ✅ **Secrets** - Manually copied
- ❌ **Storage files** - **NOT automatically migrated** - Must be done manually
- ❌ **User accounts** - **NOT automatically migrated** - Users must sign up again

---

## 🔍 Check Which Supabase You're Currently Using

### Step 1: Check Your Environment Variables

Your app uses `VITE_SUPABASE_URL` to connect to Supabase. Check:

1. **In Vercel** (if deployed):
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Check `VITE_SUPABASE_URL`
   - If it shows your **OLD** project URL, you're still using the old Supabase

2. **Locally** (if testing):
   - Check your `.env.local` file
   - Look for `VITE_SUPABASE_URL`

### Step 2: Verify in Browser

1. Open your website
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Type: `localStorage.getItem('sb-')` or check Network tab
5. Look for requests to Supabase - the URL will show which project you're using

---

## 📦 What Gets Migrated vs What Doesn't

### ✅ Automatically Migrated (via migrations):
- Database tables
- Database functions
- RLS policies
- Storage bucket **structure** (buckets are created, but empty)

### ❌ NOT Migrated (must do manually):
- **Storage files** (images, avatars, demos, etc.)
- **User accounts** (users must sign up again)
- **User data** (profiles, but users need to recreate accounts)

---

## 📤 How to Migrate Storage Files

### Option A: Using Supabase Dashboard (Manual - Small Amounts)

1. **Export from Old Project:**
   - Go to old Supabase → **Storage**
   - For each bucket, download files manually
   - Or use Supabase CLI (see Option B)

2. **Import to New Project:**
   - Go to new Supabase → **Storage**
   - Upload files to corresponding buckets

### Option B: Using Supabase CLI (Recommended for Large Amounts)

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Link to OLD project:**
   ```bash
   supabase link --project-ref OLD_PROJECT_REF
   ```

3. **Download files:**
   ```bash
   # Download all files from a bucket
   supabase storage download --bucket avatars --local-path ./storage-backup/avatars
   supabase storage download --bucket releases --local-path ./storage-backup/releases
   supabase storage download --bucket events --local-path ./storage-backup/events
   supabase storage download --bucket news --local-path ./storage-backup/news
   supabase storage download --bucket artist-images --local-path ./storage-backup/artist-images
   supabase storage download --bucket audio-demos --local-path ./storage-backup/audio-demos
   ```

4. **Link to NEW project:**
   ```bash
   supabase link --project-ref NEW_PROJECT_REF
   ```

5. **Upload files:**
   ```bash
   supabase storage upload --bucket avatars --local-path ./storage-backup/avatars
   supabase storage upload --bucket releases --local-path ./storage-backup/releases
   supabase storage upload --bucket events --local-path ./storage-backup/events
   supabase storage upload --bucket news --local-path ./storage-backup/news
   supabase storage upload --bucket artist-images --local-path ./storage-backup/artist-images
   supabase storage upload --bucket audio-demos --local-path ./storage-backup/audio-demos
   ```

### Option C: Using Supabase Dashboard (For Each Bucket)

1. **Old Project:**
   - Go to **Storage** → Select bucket
   - Download files individually or in bulk

2. **New Project:**
   - Go to **Storage** → Select bucket
   - Upload files

---

## 👥 User Accounts Migration

**User accounts are NOT automatically migrated.** Users need to:

1. **Sign up again** on the new Supabase project
2. **Re-upload their avatars** (if they had any)
3. **Reconnect streaming platforms** (if they had any)

**For Admin:**
- After users sign up, you need to manually assign admin role again (see admin setup guide)

---

## ✅ Migration Checklist

- [ ] Database schema migrated (via `supabase db push`)
- [ ] Edge Functions deployed
- [ ] Secrets configured
- [ ] Storage buckets created (structure)
- [ ] **Storage files migrated** (if you have existing files)
- [ ] Environment variables updated (`VITE_SUPABASE_URL`)
- [ ] Site URL and Redirect URLs configured in new Supabase
- [ ] SMTP configured in new Supabase
- [ ] Test signup/login
- [ ] Recreate admin account
- [ ] Test file uploads

---

## 🚨 If You Can Still Login with Old Credentials

This means you're **still connected to the OLD Supabase project**. 

**To switch to new project:**

1. **Update Environment Variables:**
   - In Vercel: Update `VITE_SUPABASE_URL` to new project URL
   - In `.env.local`: Update `VITE_SUPABASE_URL` to new project URL

2. **Clear Browser Storage:**
   - Clear localStorage (old auth tokens)
   - Clear cookies
   - Or use incognito mode

3. **Redeploy:**
   - If on Vercel, it should auto-redeploy
   - Or manually trigger redeploy

4. **Test:**
   - Try logging in - should now use new Supabase
   - Old credentials won't work (users need to sign up again)

---

## 📝 Quick Check: Which Supabase Am I Using?

**Check your Vercel environment variables:**
- Go to Vercel Dashboard → Project → Settings → Environment Variables
- Look at `VITE_SUPABASE_URL`
- Compare with your old and new Supabase project URLs

**Old project URL format:** `https://[old-project-ref].supabase.co`
**New project URL format:** `https://[new-project-ref].supabase.co`

If they match your OLD project, you need to update them!

---

**Last Updated:** November 2024

