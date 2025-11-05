# 🎵 Streaming Platforms Setup Guide

Complete step-by-step guide to connect Spotify, Apple Music, YouTube Music, Audiomack, and Boomplay to your Grace Rhythm Sounds platform.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Spotify Setup](#1-spotify-setup)
3. [Apple Music Setup](#2-apple-music-setup)
4. [YouTube Music Setup](#3-youtube-music-setup)
5. [Audiomack Setup](#4-audiomack-setup)
6. [Boomplay Setup](#5-boomplay-setup)
7. [Supabase Configuration](#supabase-configuration)
8. [Vercel Configuration](#vercel-configuration)
9. [Deploy Edge Functions](#deploy-edge-functions)
10. [Testing](#testing)
11. [Troubleshooting](#troubleshooting)

---

## Overview

Each streaming platform requires:
- **Developer Account** - Create an account on the platform's developer portal
- **App Registration** - Create an OAuth application
- **Client ID & Secret** - Get credentials from the app
- **Redirect URI** - Configure callback URL
- **Supabase Secrets** - Store credentials securely
- **Vercel Environment Variables** - Client IDs for frontend
- **Edge Functions** - Deploy OAuth handlers

---

## 1. Spotify Setup

### Step 1: Create Spotify Developer Account

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account (or create one)
3. Accept the Developer Terms of Service

### Step 2: Create a Spotify App

1. Click **"Create App"**
2. Fill in the form:
   - **App Name**: `Grace Rhythm Sounds` (or your preferred name)
   - **App Description**: `Record label platform for managing artists and streaming data`
   - **Website**: `https://your-vercel-domain.vercel.app` (your production URL)
   - **Redirect URI**: 
     - **Local**: `http://YOUR_NETWORK_IP:8080/auth/spotify/callback`
     - **Production**: `https://your-vercel-domain.vercel.app/auth/spotify/callback`
   - **What are you building?**: Select appropriate option

3. Click **"Save"**
4. Check **"I understand and agree..."** checkbox
5. Click **"Add"**

### Step 3: Get Your Credentials

1. On your app dashboard, you'll see:
   - **Client ID** - Copy this (you'll need it)
   - **Client Secret** - Click **"View client secret"** and copy it

2. **Important**: Save these securely - you won't see the secret again!

### Step 4: Configure Redirect URI

1. In your app settings, click **"Edit Settings"**
2. Under **"Redirect URIs"**, add:
   - For **local testing**: `http://YOUR_NETWORK_IP:8080/auth/spotify/callback`
     - To find your network IP: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) and look for your local IP (e.g., `172.20.10.2`)
   - For **production**: `https://your-vercel-domain.vercel.app/auth/spotify/callback`
3. Click **"Add"** after each URI
4. Click **"Save"**

**Note**: Spotify does NOT accept `localhost` - you must use your network IP for local testing.

---

## 2. Apple Music Setup

### Step 1: Create Apple Developer Account

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Sign in with your Apple ID (or create one)
3. Enroll in the Apple Developer Program ($99/year)
4. Wait for approval (can take 24-48 hours)

### Step 2: Create App ID

1. Go to **Certificates, Identifiers & Profiles**
2. Click **"Identifiers"** → **"+"**
3. Select **"App IDs"** → **Continue**
4. Select **"App"** → **Continue**
5. Fill in:
   - **Description**: `Grace Rhythm Sounds`
   - **Bundle ID**: `com.gracerhythmsounds.app` (or your preferred identifier)
6. Enable **"Sign in with Apple"** capability
7. Click **"Continue"** → **"Register"**

### Step 3: Create Services ID

1. Still in **Identifiers**, click **"+"**
2. Select **"Services IDs"** → **Continue**
3. Fill in:
   - **Description**: `Grace Rhythm Sounds OAuth`
   - **Identifier**: `com.gracerhythmsounds.oauth` (must be unique)
4. Enable **"Sign in with Apple"**
5. Click **"Configure"** next to Sign in with Apple:
   - **Primary App ID**: Select the App ID you created
   - **Website URLs**:
     - **Domains**: `your-vercel-domain.vercel.app`
     - **Return URLs**: 
       - `https://your-vercel-domain.vercel.app/auth/apple-music/callback`
6. Click **"Save"** → **"Continue"** → **"Register"**

### Step 4: Create Key

1. Go to **Keys** → **"+"**
2. Fill in:
   - **Key Name**: `Grace Rhythm Sounds Apple Music Key`
3. Enable **"Sign in with Apple"**
4. Click **"Configure"** → Select your Primary App ID → **"Save"**
5. Click **"Continue"** → **"Register"**
6. **Download the `.p8` key file** (you can only download once!)
7. Copy your **Key ID** (shown on the page)

### Step 5: Get Your Credentials

You'll need:
- **Services ID** (Identifier): `com.gracerhythmsounds.oauth`
- **Team ID**: Found in top-right of Apple Developer portal
- **Key ID**: From the key you just created
- **Private Key**: The `.p8` file you downloaded

**Note**: Apple Music uses a different OAuth flow. You'll need to generate a client secret using the `.p8` key and JWT. This is more complex than Spotify.

---

## 3. YouTube Music Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Select a project"** → **"New Project"**
3. Fill in:
   - **Project Name**: `Grace Rhythm Sounds`
   - **Organization**: (optional)
4. Click **"Create"**

### Step 2: Enable YouTube Data API v3

1. In your project, go to **APIs & Services** → **Library**
2. Search for **"YouTube Data API v3"**
3. Click on it → **"Enable"**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure OAuth consent screen:
   - **User Type**: External (or Internal if using Google Workspace)
   - **App Name**: `Grace Rhythm Sounds`
   - **User support email**: Your email
   - **Developer contact**: Your email
   - Click **"Save and Continue"** through the steps
4. Back to creating OAuth client:
   - **Application type**: Web application
   - **Name**: `Grace Rhythm Sounds Web`
   - **Authorized JavaScript origins**: 
     - `http://localhost:8080` (for local)
     - `https://your-vercel-domain.vercel.app` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:8080/auth/youtube/callback` (for local)
     - `https://your-vercel-domain.vercel.app/auth/youtube/callback` (for production)
5. Click **"Create"**
6. Copy your **Client ID** and **Client Secret**

### Step 4: Configure OAuth Scopes

The app will request this scope:
- `https://www.googleapis.com/auth/youtube.readonly`

**Note**: The `youtube.analytics.readonly` scope requires special approval from Google and is not available for basic OAuth apps. We use only the `youtube.readonly` scope which provides access to read YouTube channel data.

---

## 4. Audiomack Setup

### Step 1: Check Audiomack Developer Portal

1. Go to [Audiomack](https://www.audiomack.com)
2. Look for **Developer Portal** or **API Documentation**
3. Contact Audiomack support if no developer portal exists

### Step 2: Create Developer Account (if available)

1. Sign up for developer access
2. Create an application
3. Get **Client ID** and **Client Secret**

### Step 3: Configure Redirect URI

If Audiomack has OAuth:
- **Redirect URI**: `https://your-vercel-domain.vercel.app/auth/audiomack/callback`

**Note**: Audiomack may not have a public API. Check their documentation or contact support.

---

## 5. Boomplay Setup

### Step 1: Check Boomplay Developer Portal

1. Go to [Boomplay](https://www.boomplay.com)
2. Look for **Developer Portal** or **API Documentation**
3. Contact Boomplay support if no developer portal exists

### Step 2: Create Developer Account (if available)

1. Sign up for developer access
2. Create an application
3. Get **Client ID** and **Client Secret**

### Step 3: Configure Redirect URI

If Boomplay has OAuth:
- **Redirect URI**: `https://your-vercel-domain.vercel.app/auth/boomplay/callback`

**Note**: Boomplay may not have a public API. Check their documentation or contact support.

---

## Supabase Configuration

### Step 1: Access Supabase Secrets

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **Edge Functions** → **Secrets**

### Step 2: Add Secrets for Each Platform

Add the following secrets (click **"Add new secret"** for each):

#### Spotify
```
Key: SPOTIFY_CLIENT_ID
Value: your_spotify_client_id

Key: SPOTIFY_CLIENT_SECRET
Value: your_spotify_client_secret

Key: SPOTIFY_REDIRECT_URI (Optional - will use FRONTEND_URL if not set)
Value: https://your-vercel-domain.vercel.app/auth/spotify/callback
```

#### Apple Music
```
Key: APPLE_MUSIC_CLIENT_ID
Value: your_services_id

Key: APPLE_MUSIC_CLIENT_SECRET
Value: generated_jwt_secret (requires special generation)

Key: APPLE_MUSIC_REDIRECT_URI (Optional)
Value: https://your-vercel-domain.vercel.app/auth/apple-music/callback
```

#### YouTube Music
```
Key: YOUTUBE_CLIENT_ID
Value: your_youtube_client_id

Key: YOUTUBE_CLIENT_SECRET
Value: your_youtube_client_secret

Key: YOUTUBE_REDIRECT_URI (Optional)
Value: https://your-vercel-domain.vercel.app/auth/youtube/callback
```

#### Audiomack
```
Key: AUDIOMACK_CLIENT_ID
Value: your_audiomack_client_id

Key: AUDIOMACK_CLIENT_SECRET
Value: your_audiomack_client_secret

Key: AUDIOMACK_REDIRECT_URI (Optional)
Value: https://your-vercel-domain.vercel.app/auth/audiomack/callback
```

#### Boomplay
```
Key: BOOMPLAY_CLIENT_ID
Value: your_boomplay_client_id

Key: BOOMPLAY_CLIENT_SECRET
Value: your_boomplay_client_secret

Key: BOOMPLAY_REDIRECT_URI (Optional)
Value: https://your-vercel-domain.vercel.app/auth/boomplay/callback
```

#### Frontend URL (Required for all)
```
Key: FRONTEND_URL
Value: https://your-vercel-domain.vercel.app
```

**Important**: 
- Replace `your-vercel-domain.vercel.app` with your actual Vercel domain
- For local testing, use `http://YOUR_NETWORK_IP:8080`
- Secrets are case-sensitive

---

## Vercel Configuration

### Step 1: Access Vercel Environment Variables

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Client IDs for Frontend

Add these variables for **Production**, **Preview**, and **Development**:

```
VITE_SPOTIFY_CLIENT_ID = your_spotify_client_id
VITE_APPLE_MUSIC_CLIENT_ID = your_apple_music_client_id
VITE_YOUTUBE_CLIENT_ID = your_youtube_client_id
VITE_AUDIOMACK_CLIENT_ID = your_audiomack_client_id
VITE_BOOMPLAY_CLIENT_ID = your_boomplay_client_id
```

**Note**: 
- Only Client IDs go in Vercel (frontend)
- Client Secrets stay in Supabase Secrets (backend only)
- The `VITE_` prefix is required for Vite to expose them to the frontend

### Step 3: Verify Supabase Variables

Ensure these are also set in Vercel:
```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = your_anon_key
```

---

## Deploy Edge Functions

### Step 1: Install Supabase CLI (if not already)

```bash
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

### Step 3: Link Your Project

```bash
supabase link --project-ref your-project-ref
```

You can find your project ref in Supabase Dashboard → Settings → General → Reference ID

### Step 4: Deploy All OAuth Functions

Deploy each OAuth function:

```bash
# Spotify
supabase functions deploy spotify-oauth

# Apple Music
supabase functions deploy apple-music-oauth

# YouTube Music
supabase functions deploy youtube-oauth

# Audiomack
supabase functions deploy audiomack-oauth

# Boomplay
supabase functions deploy boomplay-oauth
```

### Step 5: Deploy Sync Functions (Optional)

```bash
supabase functions deploy spotify-sync
supabase functions deploy apple-music-sync
supabase functions deploy youtube-sync
supabase functions deploy audiomack-sync
supabase functions deploy boomplay-sync
```

---

## Testing

### Local Testing

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Note your network IP**:
   - Windows: `ipconfig` → Look for IPv4 Address
   - Mac/Linux: `ifconfig` or `ip addr` → Look for inet address

3. **Update redirect URIs** in each platform's dashboard to use your network IP:
   - Example: `http://172.20.10.2:8080/auth/spotify/callback`

4. **Update FRONTEND_URL in Supabase Secrets** (temporarily for testing):
   ```
   FRONTEND_URL = http://YOUR_NETWORK_IP:8080
   ```

5. **Test the connection**:
   - Log in to your app
   - Go to Artist Dashboard
   - Click "Connect" on a streaming platform
   - Complete OAuth flow
   - Verify connection shows as "Connected"

### Production Testing

1. **Ensure all redirect URIs** in platform dashboards point to production URL
2. **Update FRONTEND_URL** in Supabase Secrets to production URL
3. **Redeploy edge functions** (if you made changes)
4. **Test connection** on production site

---

## Troubleshooting

### Common Issues

#### 1. "Invalid redirect URI" Error

**Problem**: Redirect URI mismatch between platform dashboard and edge function

**Solution**:
- Ensure redirect URI in platform dashboard **exactly matches** what's in Supabase Secrets
- Check for trailing slashes (should be no trailing slash)
- Verify protocol (`https://` for production, `http://` for local)
- For Spotify: Cannot use `localhost`, must use network IP for local testing

#### 2. "Missing authorization header" Error

**Problem**: CORS preflight issue

**Solution**:
- This should be fixed by using POST requests in callbacks
- Ensure edge functions are deployed with latest code
- Check that `FRONTEND_URL` is set in Supabase Secrets

#### 3. "Client ID not configured" Error

**Problem**: Frontend can't find Client ID

**Solution**:
- Verify `VITE_*_CLIENT_ID` variables are set in Vercel
- Ensure variables are set for correct environment (Production/Preview/Development)
- Redeploy Vercel after adding environment variables

#### 4. "Failed to exchange authorization code" Error

**Problem**: Token exchange fails

**Solution**:
- Verify Client Secret is correct in Supabase Secrets
- Check that redirect URI in token exchange matches authorization request
- Look at edge function logs in Supabase Dashboard for detailed error

#### 5. CORS Preflight Failed

**Problem**: Browser blocks cross-origin request

**Solution**:
- Ensure edge functions handle OPTIONS requests
- Verify CORS headers are set correctly
- Use POST requests (not GET) from frontend callbacks

### Checking Logs

1. **Supabase Edge Function Logs**:
   - Go to Supabase Dashboard → Edge Functions → Select function → Logs
   - Look for error messages and console.log outputs

2. **Vercel Function Logs**:
   - Go to Vercel Dashboard → Your Project → Functions → View logs

3. **Browser Console**:
   - Open DevTools (F12) → Console tab
   - Look for errors during OAuth flow

### Verification Checklist

Before testing, verify:

- [ ] Developer account created for each platform
- [ ] App/Client created in each platform's dashboard
- [ ] Client ID and Secret obtained
- [ ] Redirect URIs configured in platform dashboards
- [ ] All secrets added to Supabase (including FRONTEND_URL)
- [ ] All Client IDs added to Vercel environment variables
- [ ] Edge functions deployed
- [ ] Redirect URIs match exactly (no trailing slash, correct protocol)

---

## Security Best Practices

1. **Never commit secrets to Git**:
   - `.env.local` is in `.gitignore`
   - Use Supabase Secrets for backend credentials
   - Use Vercel Environment Variables for frontend variables

2. **Rotate secrets periodically**:
   - Update Client Secrets every 90 days
   - Revoke old keys when rotating

3. **Use different credentials for dev/staging/prod**:
   - Create separate apps in platform dashboards
   - Use different Supabase projects if needed

4. **Monitor access**:
   - Check Supabase function logs regularly
   - Set up alerts for failed authentication attempts

---

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review edge function logs in Supabase Dashboard
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly
5. Ensure redirect URIs match exactly

---

## Quick Reference

### Redirect URI Format

**Local**: `http://YOUR_NETWORK_IP:8080/auth/{platform}/callback`

**Production**: `https://your-vercel-domain.vercel.app/auth/{platform}/callback`

### Platform Callback Routes

- Spotify: `/auth/spotify/callback`
- Apple Music: `/auth/apple-music/callback`
- YouTube: `/auth/youtube/callback`
- Audiomack: `/auth/audiomack/callback`
- Boomplay: `/auth/boomplay/callback`

### Required Supabase Secrets

- `FRONTEND_URL` (required for all)
- `{PLATFORM}_CLIENT_ID` (required for each platform)
- `{PLATFORM}_CLIENT_SECRET` (required for each platform)
- `{PLATFORM}_REDIRECT_URI` (optional, uses FRONTEND_URL if not set)

### Required Vercel Environment Variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_{PLATFORM}_CLIENT_ID` (for each platform)

---

**Last Updated**: 2024-01-XX

**Maintained by**: Grace Rhythm Sounds Development Team

