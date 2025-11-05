# Grace Rhythm Sounds - Complete Deployment Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Project Setup](#project-setup)
4. [Environment Variables](#environment-variables)
5. [Database Setup (Supabase)](#database-setup-supabase)
6. [Email Configuration](#email-configuration)
7. [Streaming Platforms Setup](#streaming-platforms-setup)
8. [Deployment Options](#deployment-options)
9. [Post-Deployment](#post-deployment)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Grace Rhythm Sounds is a music platform that allows artists to:
- Create and manage their profiles
- Connect streaming platforms (Spotify, YouTube, Apple Music, etc.)
- Track music analytics and performance
- Submit demos for review
- Manage releases, events, and news

This guide will walk you through deploying the application step-by-step, even if you're not technical.

---

## ✅ Prerequisites

Before you begin, you'll need:

1. **A Computer** with internet connection
2. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Choose the LTS (Long Term Support) version
3. **Git** (optional, for version control)
   - Download from: https://git-scm.com/
4. **A Supabase Account** (free tier available)
   - Sign up at: https://supabase.com/
5. **A Vercel Account** (free tier available)
   - Sign up at: https://vercel.com/
6. **A Resend Account** (for emails)
   - Sign up at: https://resend.com/
7. **Domain Name** (optional, for custom email)

---

## 📦 Project Setup

### Step 1: Download the Project

1. If you have the project files, skip to Step 2
2. If using Git, open terminal/command prompt and run:
   ```bash
   git clone https://github.com/your-repo/rhythm-grace-sounds.git
   cd rhythm-grace-sounds
   ```

### Step 2: Install Dependencies

1. Open terminal/command prompt in the project folder
2. Run this command:
   ```bash
   npm install
   ```
3. Wait for installation to complete (may take 2-5 minutes)

### Step 3: Test Locally

Run the development server:
```bash
npm run dev
```

Open your browser and go to: `http://localhost:5173`

You should see the Grace Rhythm Sounds homepage.

---

## 🔐 Environment Variables

Environment variables store sensitive information like API keys. You'll need to create a file called `.env.local` in the project root.

### Create `.env.local` File

1. In the project root folder, create a new file named `.env.local`
2. Copy and paste this template:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Streaming Platforms (Optional - can add later)
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_YOUTUBE_CLIENT_ID=your_youtube_client_id
VITE_APPLE_MUSIC_CLIENT_ID=your_apple_music_client_id
VITE_AUDIOMACK_CLIENT_ID=your_audiomack_client_id
VITE_BOOMPLAY_CLIENT_ID=your_boomplay_client_id

# hCaptcha (Optional)
VITE_HCAPTCHA_SITE_KEY=your_hcaptcha_site_key
```

**Important:** Never commit `.env.local` to Git. It contains secrets!

---

## 🗄️ Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to https://supabase.com/
2. Click "New Project"
3. Fill in:
   - **Project Name:** Grace Rhythm Sounds
   - **Database Password:** (create a strong password, save it!)
   - **Region:** Choose closest to your users
4. Click "Create new project"
5. Wait 2-3 minutes for setup

### Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → Paste into `VITE_SUPABASE_URL`
   - **anon/public key** → Paste into `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Also copy the **service_role key** (keep it secret!)

### Step 3: Run Database Migrations

1. Install Supabase CLI (optional, or use Supabase Dashboard):
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Run migrations:
   ```bash
   supabase db push
   ```

**OR** use Supabase Dashboard:
1. Go to **SQL Editor** in Supabase Dashboard
2. Copy SQL from `supabase/migrations/` files
3. Run them one by one in order

### Step 4: Set Up Storage Buckets

1. Go to **Storage** in Supabase Dashboard
2. Create these buckets:
   - `avatars` (public)
   - `audio-demos` (public)
   - `artist-images` (public)
   - `releases` (public)
   - `events` (public)
   - `news` (public)

### Step 5: Configure RLS (Row Level Security)

The migrations should set this up, but verify:
1. Go to **Authentication** → **Policies**
2. Ensure policies exist for `profiles`, `releases`, `events`, `news` tables

---

## 📧 Email Configuration

### Option 1: Resend (Recommended)

1. Sign up at https://resend.com/
2. Go to **API Keys** → Create new API key
3. Copy the API key
4. In Supabase Dashboard → **Settings** → **Secrets**, add:
   - `RESEND_API_KEY` = your_resend_api_key
   - `RESEND_FROM_EMAIL` = Grace Rhythm Sounds <noreply@yourdomain.com>
   - `RESEND_TO_EMAIL` = your-email@yourdomain.com

### Option 2: Vercel Receive Email (Testing Only)

**Yes, you can use Vercel Receive Email for testing!**

1. In Vercel Dashboard → **Settings** → **Inboxes**
2. Create a new inbox
3. Use the inbox email as `RESEND_TO_EMAIL`
4. **Note:** This is only for testing. For production, use Resend with a verified domain.

### Domain Verification (For Production)

1. In Resend Dashboard → **Domains** → **Add Domain**
2. Enter your domain (e.g., `yourdomain.com`)
3. Add DNS records provided by Resend to your domain registrar
4. Wait for verification (usually 5-30 minutes)
5. Once verified, update `RESEND_FROM_EMAIL` to use your domain

---

## 🎵 Streaming Platforms Setup

See `STREAMING_PLATFORMS_SETUP.md` for detailed instructions on:
- Spotify
- YouTube Music
- Apple Music
- Audiomack
- Boomplay

**Quick Summary:**
1. Create developer account for each platform
2. Create app/application
3. Get Client ID and Client Secret
4. Add to Supabase Secrets
5. Deploy OAuth and sync functions

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

#### Step 1: Prepare for Deployment

1. Build the project:
   ```bash
   npm run build
   ```
2. Test the build locally:
   ```bash
   npm run preview
   ```

#### Step 2: Deploy to Vercel

**Method A: Using Vercel Dashboard**
1. Go to https://vercel.com/
2. Click "Add New" → "Project"
3. Import your Git repository (GitHub/GitLab)
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add Environment Variables (see below)
6. Click "Deploy"

**Method B: Using Vercel CLI**
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Login:
   ```bash
   vercel login
   ```
3. Deploy:
   ```bash
   vercel
   ```
4. Follow prompts

#### Step 3: Add Environment Variables in Vercel

**Important**: `.env.local` files are NOT uploaded to Vercel. You must add all environment variables in the Vercel Dashboard.

1. Go to your project in Vercel Dashboard
2. **Settings** → **Environment Variables**
3. Add all variables from `.env.local`:
   - `VITE_SUPABASE_URL` (required)
   - `VITE_SUPABASE_PUBLISHABLE_KEY` (required)
   - `VITE_SPOTIFY_CLIENT_ID` (optional - if using Spotify)
   - `VITE_YOUTUBE_CLIENT_ID` (optional - if using YouTube)
   - `VITE_APPLE_MUSIC_CLIENT_ID` (optional - if using Apple Music)
   - `VITE_AUDIOMACK_CLIENT_ID` (optional - if using Audiomack)
   - `VITE_BOOMPLAY_CLIENT_ID` (optional - if using Boomplay)
   - `VITE_HCAPTCHA_SITE_KEY` (recommended - forms work with test key fallback, but production should use real key)
4. Select environments: **Production, Preview, Development** (or select all)
5. Click "Save"
6. Redeploy your project (Vercel usually auto-redeploys after adding variables)

**Note**: hCaptcha works locally with a test key fallback (`10000000-ffff-ffff-ffff-000000000001`), but for production you should use your real site key from hCaptcha dashboard. See `HCAPTCHA_SETUP.md` for details.

#### Step 4: Deploy Supabase Edge Functions

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login:
   ```bash
   supabase login
   ```

3. Link project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Deploy all functions:
   ```bash
   supabase functions deploy send-contact-email
   supabase functions deploy notify-new-artist
   supabase functions deploy send-demo-status-email
   supabase functions deploy delete-user
   supabase functions deploy spotify-oauth
   supabase functions deploy spotify-sync
   supabase functions deploy apple-music-oauth
   supabase functions deploy youtube-oauth
   supabase functions deploy youtube-sync
   supabase functions deploy audiomack-oauth
   supabase functions deploy boomplay-oauth
   ```

5. Set Supabase Secrets:
   ```bash
   supabase secrets set RESEND_API_KEY=your_resend_api_key
   supabase secrets set RESEND_FROM_EMAIL="Grace Rhythm Sounds <noreply@yourdomain.com>"
   supabase secrets set RESEND_TO_EMAIL=your-email@yourdomain.com
   supabase secrets set SPOTIFY_CLIENT_ID=your_spotify_client_id
   supabase secrets set SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   supabase secrets set FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

---

### Option 2: IONOS Hosting (Static Files)

**Yes, you can deploy to IONOS!** Here's how:

#### Step 1: Build the Project

1. Build the production files:
   ```bash
   npm run build
   ```
2. This creates a `dist` folder with all static files

#### Step 2: Upload to IONOS

**Method A: Using File Manager**
1. Log in to your IONOS control panel
2. Go to **Website** → **File Manager**
3. Navigate to your domain's `public_html` or `www` folder
4. Upload all files from the `dist` folder
5. Ensure `index.html` is in the root

**Method B: Using FTP**
1. Get FTP credentials from IONOS
2. Use an FTP client (FileZilla, WinSCP)
3. Connect to your server
4. Upload all files from `dist` folder to `public_html` or `www`

#### Step 3: Configure for Single Page Application (SPA)

IONOS needs special configuration for React Router:

1. Create a `.htaccess` file in your `public_html` folder:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

2. Upload this file along with your `dist` files

#### Step 4: Environment Variables (IONOS Limitation)

**Important:** IONOS doesn't support environment variables for static hosting.

**Solution:** Create a config file:
1. Create `src/config.ts`:
   ```typescript
   export const config = {
     supabaseUrl: 'your_supabase_url',
     supabaseKey: 'your_supabase_key',
     // ... other config
   };
   ```
2. Update code to use `config` instead of `import.meta.env`
3. Rebuild and upload

**Note:** This exposes your keys. For production, consider:
- Using a backend proxy
- Restricting Supabase RLS policies
- Using environment-specific builds

#### Step 5: Update Supabase URLs

1. In Supabase Dashboard → **Settings** → **API**
2. Update **Redirect URLs** to include your IONOS domain
3. Update `FRONTEND_URL` in Supabase Secrets to your IONOS domain

---

## 📝 Post-Deployment Checklist

### 1. Test Authentication
- [ ] Sign up a test account
- [ ] Verify email works
- [ ] Test login
- [ ] Test password reset

### 2. Test Admin Features
- [ ] Create admin account (add to `user_roles` table)
- [ ] Test admin dashboard
- [ ] Test artist management
- [ ] Test viewing artist dashboard as admin

### 3. Test Streaming Platforms
- [ ] Connect Spotify
- [ ] Sync Spotify data
- [ ] Connect YouTube
- [ ] Sync YouTube data
- [ ] Test other platforms

### 4. Test Forms
- [ ] Contact form
- [ ] Demo submission
- [ ] Collaboration form
- [ ] Verify hCaptcha works

### 5. Test Uploads
- [ ] Profile picture upload
- [ ] Artist image upload
- [ ] Demo file upload

### 6. Verify Email
- [ ] Test contact form email
- [ ] Test demo status email
- [ ] Test artist registration notification

---

## 🔧 Troubleshooting

### Issue: Blank Page After Deployment

**Solution:**
1. Check browser console for errors
2. Verify environment variables are set in Vercel/IONOS
3. Check `vite.config.ts` has `base: '/'`
4. Ensure `index.html` is in the root

### Issue: 404 Errors on Refresh

**Solution:**
1. For Vercel: Add `vercel.json` with rewrite rules
2. For IONOS: Ensure `.htaccess` is uploaded correctly

### Issue: Can't Connect to Supabase

**Solution:**
1. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are correct
2. Check Supabase project is active
3. Verify RLS policies allow access

### Issue: Email Not Sending

**Solution:**
1. Check `RESEND_API_KEY` in Supabase Secrets
2. Verify domain is verified (for production)
3. Check Resend dashboard for logs
4. For testing, use Vercel Receive Email

### Issue: Admin Can't View Artist Profile

**Solution:**
1. Ensure admin role exists in `user_roles` table
2. Check URL parameter: `/dashboard?artist_id=artist_profile_id`
3. Verify artist profile exists in `profiles` table
4. Check browser console for errors

### Issue: Streaming Platform Connection Fails

**Solution:**
1. Verify Client ID and Secret in Supabase Secrets
2. Check redirect URIs match in platform dashboard
3. Ensure edge functions are deployed
4. Check CORS settings in edge functions

---

## 📚 Additional Resources

- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Resend Docs:** https://resend.com/docs
- **Vite Docs:** https://vitejs.dev/guide/
- **React Router Docs:** https://reactrouter.com/

---

## 🆘 Need Help?

If you encounter issues:
1. Check the Troubleshooting section above
2. Review browser console for errors
3. Check Supabase logs (Dashboard → Logs)
4. Check Vercel deployment logs

---

## 📄 License

This project is proprietary software for Grace Rhythm Sounds.

---

**Last Updated:** January 2025

