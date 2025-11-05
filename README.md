# 🎵 Grace Rhythm Sounds - Record Label Management Platform

## 📖 Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [Prerequisites](#prerequisites)
6. [Installation Guide](#installation-guide)
7. [Environment Variables](#environment-variables)
8. [Supabase Setup](#supabase-setup)
9. [Edge Functions](#edge-functions)
10. [Email Configuration](#email-configuration)
11. [Streaming Platform Integration](#streaming-platform-integration)
12. [Database Migrations](#database-migrations)
13. [Hosting & Deployment](#hosting--deployment)
14. [Security Best Practices](#security-best-practices)
15. [Troubleshooting](#troubleshooting)
16. [Support](#support)

---

## 🎯 Project Overview

**Grace Rhythm Sounds** is a comprehensive, full-stack record label management platform designed to empower artists and streamline label operations. The platform provides a complete solution for managing artists, tracking music performance across multiple streaming platforms, handling demo submissions, and maintaining a professional web presence.

### What This Platform Does

- **Artist Management**: Artists can create profiles, upload music, track their performance, and connect their streaming platform accounts
- **Streaming Analytics**: Real-time data from Spotify, Apple Music, YouTube Music, Audiomack, and Boomplay
- **Content Management**: Publish releases, events, and news articles
- **Demo Submission System**: Artists submit demos for label review with automated email notifications
- **Admin Dashboard**: Complete administrative control over artists, content, and platform settings
- **Public Website**: Showcase artists, latest releases, events, and news to the public

### Target Users

- **Record Labels**: Manage multiple artists, track performance, review submissions
- **Artists**: Monitor streams, manage profiles, submit demos
- **Public**: Discover music, browse artists, stay updated with label news

---

## ✨ Features

### Core Features

1. **Artist Dashboard**
   - Profile management with image upload
   - Streaming platform connections (5 platforms)
   - Real-time analytics and statistics
   - Demo submission tracking
   - Collapsible data views for better UX

2. **Admin Panel**
   - Artist management (create, edit, delete)
   - Content management (releases, events, news)
   - Demo review and approval system
   - Role-based access control
   - View artist dashboards as admin

3. **Streaming Platform Integration**
   - **Spotify**: Connect, sync, and view top tracks, playlists, followers
   - **Apple Music**: Full integration with analytics
   - **YouTube Music**: Music and video separation, playlist analytics
   - **Audiomack**: Connection and data sync
   - **Boomplay**: Full integration support
   - OAuth 2.0 authentication for all platforms
   - Automatic token refresh
   - Collapsible analytics sections

4. **Authentication & Security**
   - Email/password authentication
   - Spotify OAuth login/signup
   - hCaptcha bot protection
   - Email verification
   - Password reset functionality
   - Row Level Security (RLS) on all database tables

5. **Content Management**
   - Latest releases with cover images
   - Event management with dates and details
   - News articles with rich content
   - Featured artists section
   - Genre-based filtering

6. **Email System**
   - Contact form submissions
   - Demo status notifications
   - New artist registration alerts
   - Password reset emails
   - Email verification

7. **User Interface**
   - Fully responsive design (mobile, tablet, desktop)
   - Modern UI with Tailwind CSS
   - Smooth animations and transitions
   - Dark/light theme support
   - Accessible components

---

## 🛠 Technology Stack

### Frontend

- **React 18.3** - Modern UI library for building interactive interfaces
- **TypeScript** - Type-safe JavaScript for better code quality
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing and navigation
- **Tailwind CSS** - Utility-first CSS framework for styling
- **shadcn/ui** - High-quality React component library
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library

### Backend & Database

- **Supabase** - Backend-as-a-Service platform
  - **PostgreSQL** - Relational database
  - **Supabase Auth** - Authentication and user management
  - **Supabase Storage** - File storage for images and demos
  - **Edge Functions** - Serverless functions for API integrations
  - **Row Level Security (RLS)** - Database-level security

### External Services

- **Resend** - Email delivery service
- **Spotify API** - Music streaming platform integration
- **Apple Music API** - Apple's music platform integration
- **YouTube Data API v3** - YouTube/YouTube Music integration
- **hCaptcha** - Bot protection and spam prevention

### Development Tools

- **Node.js 18+** - JavaScript runtime
- **npm** - Package manager
- **Git** - Version control
- **ESLint** - Code linting

---

## 🏗 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Public     │  │   Artist     │  │    Admin     │ │
│  │   Website    │  │  Dashboard   │  │  Dashboard   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         │
┌─────────────────────────────────────────────────────────┐
│                    Supabase Backend                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  PostgreSQL  │  │  Edge        │  │   Storage    │ │
│  │   Database   │  │  Functions   │  │   (Images)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │  Supabase    │  │   Row Level  │                   │
│  │    Auth      │  │   Security    │                   │
│  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────────┐    ┌──────────┐   ┌──────────┐
    │Spotify │    │  Apple   │   │ YouTube  │
    │  API   │    │  Music   │   │   API    │
    └────────┘    └──────────┘   └──────────┘
```

### Data Flow

1. **User Authentication**
   - User signs up/logs in → Supabase Auth
   - Profile automatically created via database trigger
   - RLS policies ensure data isolation

2. **Streaming Platform Connection**
   - User clicks "Connect" → Frontend initiates OAuth
   - Redirects to platform authorization
   - Platform redirects back → Edge function handles token exchange
   - Tokens stored securely in database

3. **Data Synchronization**
   - User clicks "Sync" → Edge function called
   - Edge function fetches data from platform API
   - Data stored in `streaming_analytics` table
   - Frontend displays updated analytics

4. **Content Management**
   - Admin creates content → Stored in database
   - Images uploaded to Supabase Storage
   - Public website displays content via API

---

## 📋 Prerequisites

Before you begin, ensure you have the following:

### Required Accounts

1. **Supabase Account** (Free tier available)
   - Sign up at https://supabase.com
   - Create a new project

2. **Git Account** (For version control)
   - Sign up at https://github.com or https://gitlab.com

3. **Hosting Provider Account** (For deployment)
   - Recommended: Vercel (free tier available)
   - Alternative: Netlify, IONOS, or any hosting with environment variable support

### Required Software

1. **Node.js 18 or higher**
   - Download from https://nodejs.org
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Git** (for cloning repository)
   - Download from https://git-scm.com
   - Verify installation: `git --version`

### Optional Accounts (For Full Features)

- **Resend Account** - For email functionality
- **Spotify Developer Account** - For Spotify integration
- **Apple Developer Account** - For Apple Music integration
- **Google Cloud Account** - For YouTube integration
- **hCaptcha Account** - For bot protection

---

## 🚀 Installation Guide

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <your-repository-url>
cd rhythm-grace-sounds-06809-main
```

### Step 2: Install Dependencies

```bash
# Install all required packages
npm install
```

This will install all dependencies listed in `package.json`. This may take a few minutes.

### Step 3: Set Up Environment Variables

Create a file named `.env.local` in the project root directory:

```bash
# Create the file
touch .env.local
```

**Important**: The `.env.local` file is automatically ignored by Git, so your secrets won't be committed.

### Step 4: Configure Supabase

1. Go to https://supabase.com and sign in
2. Create a new project (or use existing)
3. Wait for project to be fully provisioned (2-3 minutes)
4. Go to **Settings** → **API**
5. Copy your **Project URL** and **anon/public key**

### Step 5: Add Basic Environment Variables

Open `.env.local` and add:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

### Step 6: Run Database Migrations

See [Database Migrations](#database-migrations) section for detailed instructions.

### Step 7: Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:8080` (or another port if 8080 is busy).

### Step 8: Create Your First Admin User

1. Navigate to the signup page
2. Create an account with your email
3. Go to Supabase Dashboard → **Authentication** → **Users**
4. Find your user and edit the `user_metadata`
5. Add: `{"role": "admin"}`
6. Or manually insert into `user_roles` table (see Admin Setup section)

---

## 🔐 Environment Variables

### Frontend Environment Variables (`.env.local`)

These variables are used by the React application and must start with `VITE_`:

```env
# ============================================
# REQUIRED - Supabase Configuration
# ============================================
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key

# ============================================
# OPTIONAL - Streaming Platform Client IDs
# Add these as you configure each platform
# ============================================
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_APPLE_MUSIC_CLIENT_ID=your_apple_music_client_id
VITE_YOUTUBE_CLIENT_ID=your_youtube_client_id
VITE_AUDIOMACK_CLIENT_ID=your_audiomack_client_id
VITE_BOOMPLAY_CLIENT_ID=your_boomplay_client_id

# ============================================
# OPTIONAL - hCaptcha (Bot Protection)
# ============================================
VITE_HCAPTCHA_SITE_KEY=your_hcaptcha_site_key
```

### Important Notes

1. **Variable Naming**: All frontend variables must start with `VITE_` to be accessible in the browser
2. **Security**: Never commit `.env.local` to Git (it's already in `.gitignore`)
3. **Restart Required**: After adding new variables, restart the development server
4. **Production**: These same variables must be added to your hosting platform's environment settings

### How to Get These Values

- **Supabase URL & Key**: Supabase Dashboard → Settings → API
- **Spotify Client ID**: Spotify Developer Dashboard → Your App
- **Apple Music Client ID**: Apple Developer Portal → Certificates, Identifiers & Profiles
- **YouTube Client ID**: Google Cloud Console → APIs & Services → Credentials
- **hCaptcha Site Key**: hCaptcha Dashboard → Sites

---

## 🗄 Supabase Setup

### 1. Create a Supabase Project

1. Go to https://supabase.com
2. Click **New Project**
3. Fill in:
   - **Name**: Your project name
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient for development
4. Click **Create new project**
5. Wait 2-3 minutes for provisioning

### 2. Get Your Project Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **service_role key** → Save for edge functions (see Secrets section)

### 3. Configure Authentication

1. Go to **Authentication** → **Settings**
2. Under **Site URL**, add your domain:
   - **Local**: `http://localhost:8080`
   - **Production**: `https://yourdomain.com`
3. Under **Redirect URLs**, add:
   - `http://localhost:8080/**`
   - `https://yourdomain.com/**`
4. Enable **Email Auth** (should be enabled by default)

### 4. Enable Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize templates if desired
3. The default templates work fine

### 5. Set Up Storage Buckets

The migrations will automatically create storage buckets, but you can verify:

1. Go to **Storage**
2. You should see these buckets:
   - `avatars` - User profile images
   - `artist-images` - Artist photos
   - `releases` - Album/single covers
   - `events` - Event images
   - `news` - News article images
   - `audio-demos` - Demo submissions

3. For each bucket, ensure:
   - **Public bucket**: Toggle ON (except `audio-demos`)
   - **File size limit**: 10MB (or adjust as needed)
   - **Allowed MIME types**: Set appropriate types

### 6. Configure Row Level Security (RLS)

RLS is automatically enabled by migrations, but verify:

1. Go to **Table Editor**
2. For each table, check:
   - RLS is **Enabled**
   - Policies are created (see migrations)

---

## ⚡ Edge Functions

Edge Functions are serverless functions that run on Supabase's infrastructure. They handle OAuth flows, data synchronization, and email sending.

### Available Edge Functions

#### Authentication & OAuth Functions

1. **`spotify-oauth`**
   - Handles Spotify OAuth callback
   - Exchanges authorization code for access token
   - Creates/updates user accounts (for login/signup)
   - Saves connection to database
   - **Location**: `supabase/functions/spotify-oauth/`

2. **`apple-music-oauth`**
   - Handles Apple Music OAuth callback
   - Same flow as Spotify
   - **Location**: `supabase/functions/apple-music-oauth/`

3. **`youtube-oauth`**
   - Handles YouTube OAuth callback
   - **Location**: `supabase/functions/youtube-oauth/`

4. **`audiomack-oauth`**
   - Handles Audiomack OAuth callback
   - **Location**: `supabase/functions/audiomack-oauth/`

5. **`boomplay-oauth`**
   - Handles Boomplay OAuth callback
   - **Location**: `supabase/functions/boomplay-oauth/`

#### Data Synchronization Functions

6. **`spotify-sync`**
   - Fetches user's Spotify data
   - Gets playlists, top tracks, followers
   - Saves to `streaming_analytics` table
   - **Location**: `supabase/functions/spotify-sync/`

7. **`apple-music-sync`**
   - Syncs Apple Music data
   - **Location**: `supabase/functions/apple-music-sync/`

8. **`youtube-sync`**
   - Syncs YouTube Music data
   - Separates music from videos
   - Gets playlists and video statistics
   - **Location**: `supabase/functions/youtube-sync/`

9. **`audiomack-sync`**
   - Syncs Audiomack data
   - **Location**: `supabase/functions/audiomack-sync/`

10. **`boomplay-sync`**
    - Syncs Boomplay data
    - **Location**: `supabase/functions/boomplay-sync/`

#### Email Functions

11. **`send-contact-email`**
    - Sends contact form submissions
    - Sends confirmation to user
    - Sends notification to admin
    - **Location**: `supabase/functions/send-contact-email/`

12. **`send-demo-status-email`**
    - Sends demo approval/rejection emails
    - **Location**: `supabase/functions/send-demo-status-email/`

13. **`notify-new-artist`**
    - Notifies admins when new artist signs up
    - **Location**: `supabase/functions/notify-new-artist/`

#### Utility Functions

14. **`delete-user`**
    - Deletes user from auth.users
    - Used when admin deletes an artist
    - **Location**: `supabase/functions/delete-user/`

15. **`sync-streaming-data`** (Legacy)
    - Legacy sync function
    - **Location**: `supabase/functions/sync-streaming-data/`

### Deploying Edge Functions

#### Prerequisites

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   (Find project ref in Supabase Dashboard → Settings → General)

#### Deploy Individual Functions

```bash
# Spotify
supabase functions deploy spotify-oauth
supabase functions deploy spotify-sync

# Apple Music
supabase functions deploy apple-music-oauth
supabase functions deploy apple-music-sync

# YouTube
supabase functions deploy youtube-oauth
supabase functions deploy youtube-sync

# Audiomack
supabase functions deploy audiomack-oauth
supabase functions deploy audiomack-sync

# Boomplay
supabase functions deploy boomplay-oauth
supabase functions deploy boomplay-sync

# Email functions
supabase functions deploy send-contact-email
supabase functions deploy send-demo-status-email
supabase functions deploy notify-new-artist

# Utility functions
supabase functions deploy delete-user
```

#### Deploy All Functions

```bash
# Deploy all functions at once
supabase functions deploy
```

### Testing Edge Functions

1. Go to Supabase Dashboard → **Edge Functions**
2. Click on a function name
3. Use the **Invoke** tab to test
4. Check **Logs** tab for errors

---

## 🔑 Supabase Secrets

Secrets are environment variables stored securely in Supabase. They're used by Edge Functions and are never exposed to the frontend.

### How to Add Secrets

1. Go to Supabase Dashboard
2. Navigate to **Settings** → **Edge Functions** → **Secrets**
3. Click **Add new secret**
4. Enter **Name** and **Value**
5. Click **Save**

### Required Secrets

#### Core Configuration

```env
# Supabase Service Role Key (REQUIRED)
# Get from: Settings → API → service_role key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Supabase URL (REQUIRED)
# Get from: Settings → API → Project URL
SUPABASE_URL=https://your-project-id.supabase.co

# Frontend URL (REQUIRED)
# Local: http://YOUR_NETWORK_IP:8080
# Production: https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

#### Email Configuration (Resend)

```env
# Resend API Key (REQUIRED for email)
# Get from: https://resend.com/api-keys
RESEND_API_KEY=re_your_api_key_here

# Email Configuration (OPTIONAL)
# Defaults to noreply email if not set
RESEND_FROM_EMAIL=Grace Rhythm Sounds <noreply@yourdomain.com>
RESEND_TO_EMAIL=admin@yourdomain.com
```

#### Spotify Secrets

```env
# Spotify Client ID and Secret
# Get from: Spotify Developer Dashboard
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Spotify Redirect URI (OPTIONAL)
# If not set, uses FRONTEND_URL + /auth/spotify/callback
SPOTIFY_REDIRECT_URI=https://yourdomain.com/auth/spotify/callback
```

#### Apple Music Secrets

```env
# Apple Music Client ID and Secret
APPLE_MUSIC_CLIENT_ID=your_apple_client_id
APPLE_MUSIC_CLIENT_SECRET=your_apple_client_secret
APPLE_MUSIC_REDIRECT_URI=https://yourdomain.com/auth/apple-music/callback
```

#### YouTube Secrets

```env
# YouTube Client ID and Secret
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REDIRECT_URI=https://yourdomain.com/auth/youtube/callback
```

#### Audiomack Secrets

```env
# Audiomack Client ID and Secret
AUDIOMACK_CLIENT_ID=your_audiomack_client_id
AUDIOMACK_CLIENT_SECRET=your_audiomack_client_secret
AUDIOMACK_REDIRECT_URI=https://yourdomain.com/auth/audiomack/callback
```

#### Boomplay Secrets

```env
# Boomplay Client ID and Secret
BOOMPLAY_CLIENT_ID=your_boomplay_client_id
BOOMPLAY_CLIENT_SECRET=your_boomplay_client_secret
BOOMPLAY_REDIRECT_URI=https://yourdomain.com/auth/boomplay/callback
```

### Secret Naming Convention

- Use **UPPERCASE** with **UNDERSCORES**
- Use descriptive names
- Match the pattern: `PLATFORM_SERVICE_NAME`

### Security Best Practices

1. ✅ **Never commit secrets to Git**
2. ✅ **Use different secrets for development and production**
3. ✅ **Rotate secrets regularly**
4. ✅ **Limit access to Supabase Dashboard**
5. ❌ **Never expose secrets in frontend code**
6. ❌ **Never log secrets in edge functions**

---

## 📧 Email Configuration

The platform uses **Resend** for sending emails. Resend is a modern email API service with excellent deliverability.

### Step 1: Create Resend Account

1. Go to https://resend.com
2. Sign up for a free account
3. Verify your email address

### Step 2: Get API Key

1. Go to **API Keys** section
2. Click **Create API Key**
3. Name it (e.g., "Grace Rhythm Sounds Production")
4. Copy the API key (starts with `re_`)
5. Add to Supabase Secrets as `RESEND_API_KEY`

### Step 3: Verify Domain (Production Only)

For production, you should verify your domain:

1. Go to **Domains** section
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add DNS records as instructed
5. Wait for verification (usually instant)
6. Use verified domain in `RESEND_FROM_EMAIL`

### Step 4: Configure Email Addresses

Add to Supabase Secrets:

```env
# Sender email (must be verified domain or use Resend's test domain)
RESEND_FROM_EMAIL=Grace Rhythm Sounds <noreply@yourdomain.com>

# Admin email (receives notifications)
RESEND_TO_EMAIL=admin@yourdomain.com
```

### Email Functions

#### 1. Contact Form Email (`send-contact-email`)

- **Trigger**: User submits contact form
- **Sends**: 
  - Confirmation to user
  - Notification to admin
- **Requires**: `RESEND_API_KEY`

#### 2. Demo Status Email (`send-demo-status-email`)

- **Trigger**: Admin updates demo status
- **Sends**: Approval/rejection notification to artist
- **Requires**: `RESEND_API_KEY`

#### 3. New Artist Notification (`notify-new-artist`)

- **Trigger**: New artist signs up
- **Sends**: Notification to admin
- **Requires**: `RESEND_API_KEY`

### Testing Emails

1. Use Resend's test domain for development:
   - `delivered@resend.dev`
2. Check Resend Dashboard → **Logs** for delivery status
3. Check Supabase Edge Function logs for errors

---

## 🎵 Streaming Platform Integration

The platform integrates with 5 major streaming platforms to provide comprehensive analytics.

### Supported Platforms

1. ✅ **Spotify** - Full integration with OAuth and data sync
2. ✅ **Apple Music** - Full integration
3. ✅ **YouTube Music** - Full integration (music/video separation)
4. ✅ **Audiomack** - Full integration
5. ✅ **Boomplay** - Full integration

### Setup Process Overview

Each platform follows the same general setup process:

1. **Create Developer Account**
2. **Create App/Project**
3. **Get Credentials** (Client ID & Secret)
4. **Configure Redirect URI**
5. **Add to Supabase Secrets**
6. **Add Client ID to Frontend**
7. **Deploy Edge Functions**
8. **Test Connection**

### Detailed Setup Instructions

For step-by-step instructions for each platform, see `STREAMING_PLATFORMS_SETUP.md` in the project root.

### Quick Setup Checklist

- [ ] Create developer account on platform
- [ ] Create app/project
- [ ] Get Client ID and Client Secret
- [ ] Add redirect URI in platform dashboard
- [ ] Add secrets to Supabase
- [ ] Add Client ID to `.env.local`
- [ ] Deploy OAuth edge function
- [ ] Deploy sync edge function
- [ ] Test connection on dashboard

### How OAuth Flow Works

```
1. User clicks "Connect Spotify"
   ↓
2. Frontend redirects to Spotify authorization
   ↓
3. User authorizes the app
   ↓
4. Spotify redirects to /auth/spotify/callback
   ↓
5. Frontend calls spotify-oauth edge function
   ↓
6. Edge function exchanges code for tokens
   ↓
7. Tokens saved to database
   ↓
8. User redirected to dashboard (connected!)
```

### Data Synchronization

After connecting, users can sync their data:

1. User clicks "Sync [Platform]"
2. Frontend calls `[platform]-sync` edge function
3. Edge function fetches data from platform API
4. Data saved to `streaming_analytics` table
5. Frontend displays updated analytics in collapsible sections

### Platform-Specific Notes

#### Spotify
- Requires `user-read-email` scope for login/signup
- Doesn't accept `localhost` - use network IP for local testing
- Free tier API limits apply

#### Apple Music
- Requires Apple Developer account ($99/year)
- Uses OAuth 2.0 with form_post response mode
- Requires specific scopes: `email name`

#### YouTube Music
- Uses Google Cloud Console
- Requires YouTube Data API v3 enabled
- Scope: `https://www.googleapis.com/auth/youtube.readonly`
- Separates music from regular videos

#### Audiomack & Boomplay
- Follow standard OAuth 2.0 flow
- Check platform-specific documentation for scopes

---

## 🗃 Database Migrations

Migrations are SQL scripts that create and modify database structure. They ensure your database schema matches the application requirements.

### Migration Files Location

All migrations are in: `supabase/migrations/`

### Running Migrations

#### Option 1: Supabase Dashboard (Recommended for Beginners)

1. Go to Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open each migration file in order
4. Copy and paste SQL into editor
5. Click **Run**

**Important**: Run migrations in chronological order (by filename).

#### Option 2: Supabase CLI (Advanced)

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

4. Push migrations:
   ```bash
   supabase db push
   ```

### Migration Order

Migrations are numbered chronologically. Run them in this order:

1. `20251101100726_remix_batch_1_migrations.sql` - Initial schema
2. `20251101102356_*.sql` - Profile and user setup
3. `20251101103430_*.sql` - Additional tables
4. `20251101103629_*.sql` - More updates
5. `20251101103711_*.sql` - Final batch 1 updates
6. `20251102000000_*.sql` - Storage fixes
7. `20251102000001_*.sql` - Demo policies
8. `20251103000000_*.sql` - Avatars storage
9. `20251103000001_*.sql` - Profile RLS
10. ... (continue with all numbered files)

### Key Migrations Explained

#### Profile Creation
- `20251103000005_auto_create_profile_trigger.sql`
- Automatically creates profile when user signs up
- Uses database trigger (no code needed)

#### Streaming Platforms
- `20251103000016_create_streaming_platform_connections.sql`
- Creates table for storing OAuth tokens
- Includes RLS policies

#### Storage Buckets
- Multiple migrations create storage buckets
- Configures public/private access
- Sets up file upload policies

#### Admin Functions
- `20251103000012_add_admin_create_profile.sql`
- Allows admins to create artist profiles
- Includes admin-only policies

### Verifying Migrations

After running migrations, verify:

1. **Tables Created**:
   - Go to **Table Editor**
   - Check these tables exist:
     - `profiles`
     - `streaming_platform_connections`
     - `streaming_analytics`
     - `releases`
     - `events`
     - `news`
     - `demo_submissions`
     - `user_roles`

2. **RLS Enabled**:
   - For each table, check RLS is enabled
   - Policies should be visible in **Policies** tab

3. **Storage Buckets**:
   - Go to **Storage**
   - Verify all buckets exist and are configured

### Troubleshooting Migrations

**Error: "relation already exists"**
- Table already created, safe to skip
- Or drop and recreate if needed

**Error: "permission denied"**
- Ensure you're using service role key
- Or run as database owner

**Error: "syntax error"**
- Check SQL syntax
- Ensure all quotes are matched
- Check for typos

---

## 🌐 Hosting & Deployment

### Understanding Hosting Requirements

Before choosing a hosting provider, it's **critical** to understand what this application needs to function properly.

#### Why Environment Variables Are Essential

This application uses **environment variables** to store configuration settings like:
- Database connection details (Supabase URL and keys)
- API keys for streaming platforms (Spotify, Apple Music, YouTube)
- Security keys (hCaptcha)
- Other sensitive configuration

**Why not hardcode them?**
- 🔒 **Security**: Secrets stay out of your code
- 🔄 **Flexibility**: Different settings for development vs. production
- 📦 **Portability**: Easy to move between environments
- ✅ **Best Practice**: Industry standard for modern applications

**What happens without environment variable support?**
- ❌ The application will not connect to your database
- ❌ OAuth integrations (Spotify, Apple Music, etc.) will fail
- ❌ Security features (hCaptcha) will not work
- ❌ The application will not function properly

### Hosting Requirements Checklist

Your hosting provider **MUST** support:

1. ✅ **Environment Variables** - **CRITICAL** - Without this, the app won't work
2. ✅ **Static File Hosting** - To serve the built React application
3. ✅ **HTTPS/SSL** - Required for OAuth integrations and security
4. ✅ **Custom Domain** - For professional production use
5. ✅ **Node.js Build Process** - To compile the React app before deployment

### Recommended Hosting Providers

#### 🥇 Vercel (Highly Recommended - Best Choice)

**Why Vercel is the Best Option:**
- ✅ **Built for React/Vite** - Optimized specifically for modern React applications
- ✅ **Automatic Deployments** - Deploys automatically when you push to Git
- ✅ **Free SSL Certificates** - Automatic HTTPS with no configuration
- ✅ **Excellent Environment Variable Management** - Easy-to-use interface for secrets
- ✅ **Preview Deployments** - Test changes before going live
- ✅ **Global Edge Network** - Fast loading times worldwide
- ✅ **Free Tier** - Very generous free plan (perfect for most projects)
- ✅ **Zero Configuration** - Works out of the box with minimal setup
- ✅ **Excellent Documentation** - Comprehensive guides and support
- ✅ **Integrated with GitHub** - Seamless workflow

**Perfect For:**
- Most users (90% of cases)
- Non-technical users (easiest setup)
- Production applications
- Professional deployments

**Pricing:**
- **Free Tier**: Perfect for small to medium projects
  - Unlimited personal projects
  - 100GB bandwidth/month
  - Automatic SSL
- **Pro Plan**: $20/month (for larger projects or teams)
  - More bandwidth
  - Team collaboration features

**Setup Time:** 5-10 minutes

#### 🥈 Netlify (Great Alternative)

**Why Netlify:**
- ✅ **Similar to Vercel** - Easy-to-use platform
- ✅ **Good for Static Sites** - Excellent for React apps
- ✅ **Free Tier Available** - Good free plan
- ✅ **Easy Deployment** - Simple setup process
- ✅ **Environment Variables** - Full support for configuration
- ✅ **Automatic SSL** - Free certificates included

**Considerations:**
- ⚠️ Slightly slower than Vercel (but still excellent)
- ⚠️ Less optimized specifically for React/Vite
- ⚠️ Fewer advanced features than Vercel

**Perfect For:**
- Users who prefer Netlify's interface
- Projects that need Netlify-specific features
- Users already using Netlify for other projects

**Pricing:**
- **Free Tier**: Good for small projects
- **Pro Plan**: $19/month

**Setup Time:** 10-15 minutes

#### 🥉 IONOS / Traditional Hosting (Advanced Users Only)

**When to Consider Traditional Hosting:**
- If you have specific server requirements
- If you need full server control
- If you're already using a specific hosting provider
- If you have compliance requirements

**Critical Requirements:**
- ✅ **Must support Node.js** - For building the application
- ✅ **Must support environment variables** - **CRITICAL** - Check with provider before purchasing
- ✅ **Must support SSL certificates** - For HTTPS (Let's Encrypt is free)
- ✅ **Must support custom domains** - For production use

**Setup Complexity:**
- ⚠️ **More complex** - Requires technical knowledge
- ⚠️ **Manual configuration** - Web server setup needed
- ⚠️ **Manual SSL setup** - Certificate installation required
- ⚠️ **Manual deployments** - Upload files manually or use FTP

**Important Notes:**
- Many traditional hosting providers do **NOT** support environment variables
- **Always verify** environment variable support before purchasing
- May require additional setup (Apache/Nginx configuration)
- Consider managed hosting if available

**Perfect For:**
- Advanced users with technical knowledge
- Users with existing hosting contracts
- Specific compliance or geographic requirements

**Setup Time:** 30-60 minutes (or more)

### Hosting Provider Comparison

| Feature | Vercel | Netlify | IONOS/Traditional |
|---------|--------|---------|-------------------|
| Environment Variables | ✅ Excellent | ✅ Excellent | ⚠️ Varies |
| Ease of Setup | ✅ Very Easy | ✅ Easy | ❌ Complex |
| Automatic SSL | ✅ Yes | ✅ Yes | ⚠️ Manual |
| Build Process | ✅ Automatic | ✅ Automatic | ⚠️ Manual |
| Free Tier | ✅ Yes | ✅ Yes | ⚠️ Varies |
| Performance | ✅ Excellent | ✅ Good | ⚠️ Varies |
| Support | ✅ Excellent | ✅ Good | ⚠️ Varies |
| Recommended For | 🥇 Most Users | 🥈 Alternative | 🥉 Advanced Only |

### Deployment to Vercel (Step-by-Step)

#### Step 1: Prepare Your Code

```bash
# Ensure all changes are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### Step 2: Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub (recommended)
3. Authorize Vercel to access your repositories

#### Step 3: Import Project

1. Click **Add New Project**
2. Select your repository
3. Click **Import**

#### Step 4: Configure Build Settings

Vercel should auto-detect, but verify:

- **Framework Preset**: Vite
- **Root Directory**: `./` (or leave blank)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Step 5: Add Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Add each variable from `.env.local`:
   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_PUBLISHABLE_KEY
   VITE_SPOTIFY_CLIENT_ID
   VITE_APPLE_MUSIC_CLIENT_ID
   VITE_YOUTUBE_CLIENT_ID
   VITE_AUDIOMACK_CLIENT_ID
   VITE_BOOMPLAY_CLIENT_ID
   VITE_HCAPTCHA_SITE_KEY
   ```
3. Select environment: **Production**, **Preview**, **Development**
4. Click **Save**

#### Step 6: Deploy

1. Click **Deploy**
2. Wait for build to complete (2-5 minutes)
3. Your site will be live at `your-project.vercel.app`

#### Step 7: Update Supabase Configuration

1. Go to Supabase Dashboard
2. Update `FRONTEND_URL` secret to your Vercel URL
3. Update all redirect URIs in platform dashboards

#### Step 8: Configure Custom Domain (Optional)

1. Go to Vercel project settings
2. Navigate to **Domains**
3. Add your domain
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic)

### Deployment to IONOS / Traditional Hosting

#### Step 1: Build the Application

```bash
npm run build
```

This creates a `dist` folder with production-ready files.

#### Step 2: Upload Files

1. Connect to your hosting via FTP/SFTP
2. Upload **contents** of `dist` folder to:
   - `public_html/` (for main domain)
   - Or subdirectory if using subdomain

#### Step 3: Configure Environment Variables

Since traditional hosting doesn't support environment variables directly:

1. **Option A**: Create a config file (not recommended for secrets)
2. **Option B**: Use hosting panel's environment variable feature (if available)
3. **Option C**: Hardcode non-sensitive values (not recommended)

**Important**: Client Secrets should NEVER be in frontend code. Use Supabase Edge Functions for sensitive operations.

#### Step 4: Configure Web Server

**Apache (.htaccess)**:
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

**Nginx**:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

#### Step 5: Configure SSL

1. Get SSL certificate (Let's Encrypt is free)
2. Install via hosting panel or manually
3. Force HTTPS redirect

### Post-Deployment Checklist

- [ ] All environment variables set in hosting
- [ ] Supabase `FRONTEND_URL` updated
- [ ] All redirect URIs updated in platform dashboards
- [ ] SSL certificate installed and working
- [ ] Test OAuth flows in production
- [ ] Test email functionality
- [ ] Test form submissions
- [ ] Check browser console for errors
- [ ] Test on mobile devices
- [ ] Verify all images load correctly

### Environment Variables in Production

#### Critical Requirement

**Your hosting provider MUST support environment variables.** This is not optional - without it, your application will not function properly.

#### What If Your Hosting Provider Doesn't Support Environment Variables?

If your hosting provider does **NOT** support environment variables, you have these options:

**Option 1: Switch to a Supported Provider (Recommended)**
- ✅ **Vercel** - Best choice, free tier available
- ✅ **Netlify** - Great alternative, free tier available
- ✅ **Other modern platforms** - Railway, Render, Fly.io

**Why switch?**
- Environment variables are essential for security
- Modern platforms are designed for this
- Easier setup and maintenance
- Better performance and features

**Option 2: Use a Workaround (Not Recommended)**
- ⚠️ **Create a config file** - Less secure, not recommended
- ⚠️ **Hardcode values** - **NEVER do this for secrets** - Security risk
- ⚠️ **Use build-time injection** - Complex, error-prone

**Important Notes:**
- ❌ **Never hardcode secrets** in your frontend code
- ❌ **Never commit secrets** to Git
- ❌ **Never expose secrets** in public files
- ✅ **Always use environment variables** for secrets
- ✅ **Always verify** hosting supports environment variables before purchasing

#### How to Verify Environment Variable Support

Before choosing a hosting provider, ask these questions:

1. **"Do you support environment variables for Node.js/React applications?"**
   - ✅ Yes = Good option
   - ❌ No = Not suitable for this application

2. **"How do I set environment variables in your platform?"**
   - ✅ Web interface or dashboard = Easy
   - ✅ Configuration file = Acceptable
   - ❌ Not supported = Not suitable

3. **"Can I set different variables for different environments (dev/prod)?"**
   - ✅ Yes = Excellent
   - ⚠️ No = Acceptable if you only need production

#### Best Practices for Environment Variables

1. ✅ **Use different values for development and production**
2. ✅ **Never commit environment variables to Git**
3. ✅ **Rotate secrets regularly** (change passwords/keys periodically)
4. ✅ **Use hosting platform's secure storage** (not files)
5. ✅ **Limit access** to who can view/edit environment variables
6. ✅ **Document which variables are needed** (see Environment Variables section)

#### Why Environment Variables Matter

- 🔒 **Security**: Secrets stay out of your code and Git history
- 🔄 **Flexibility**: Easy to change settings without code changes
- 📦 **Portability**: Same code works in different environments
- ✅ **Best Practice**: Industry standard for modern applications
- 🛡️ **Compliance**: Required for many security standards

---

## 🔒 Security Best Practices

### Environment Variables

1. ✅ **Use `.env.local` for local development**
2. ✅ **Never commit `.env` files to Git**
3. ✅ **Use hosting platform's environment variables for production**
4. ✅ **Rotate secrets regularly**
5. ❌ **Never expose secrets in frontend code**
6. ❌ **Never log secrets in console**

### Supabase Secrets

1. ✅ **Store all Client Secrets in Supabase Secrets**
2. ✅ **Use service role key only in edge functions**
3. ✅ **Never expose service role key to frontend**
4. ✅ **Limit access to Supabase Dashboard**

### Database Security

1. ✅ **RLS is enabled on all tables**
2. ✅ **Policies restrict access based on user roles**
3. ✅ **Service role bypasses RLS (server-side only)**
4. ✅ **Regular backups enabled (Supabase automatic)**

### Authentication

1. ✅ **hCaptcha enabled on all forms**
2. ✅ **Email verification required**
3. ✅ **Strong password requirements**
4. ✅ **Password reset via secure email link**

### OAuth Security

1. ✅ **State parameter used for CSRF protection**
2. ✅ **Redirect URIs validated**
3. ✅ **Tokens stored securely in database**
4. ✅ **Tokens refreshed automatically**

### API Security

1. ✅ **CORS headers configured correctly**
2. ✅ **Rate limiting (via platform APIs)**
3. ✅ **Input validation in edge functions**
4. ✅ **Error messages don't expose sensitive data**

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. "Cannot find module" Error

**Problem**: Dependencies not installed

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 2. Environment Variables Not Working

**Problem**: Variables not accessible in browser

**Solutions**:
- Ensure variables start with `VITE_`
- Restart development server after adding variables
- Check for typos in variable names
- Verify variables are in `.env.local` (not `.env`)

#### 3. Supabase Connection Error

**Problem**: Cannot connect to Supabase

**Solutions**:
- Verify `VITE_SUPABASE_URL` is correct
- Verify `VITE_SUPABASE_PUBLISHABLE_KEY` is correct
- Check Supabase project is active
- Check internet connection
- Check browser console for specific error

#### 4. OAuth "Invalid Redirect URI"

**Problem**: Platform rejects redirect URI

**Solutions**:
- Ensure redirect URI in platform dashboard matches exactly
- Check for trailing slashes
- Use full URL (including https://)
- For local: Use network IP, not localhost
- Verify redirect URI in Supabase Secrets matches

#### 5. "401 Missing authorization header"

**Problem**: Edge function requires authentication

**Solutions**:
- Ensure user is logged in
- Check edge function is deployed
- Verify Supabase Secrets are set
- Check edge function logs for details

#### 6. Email Not Sending

**Problem**: Emails not received

**Solutions**:
- Verify `RESEND_API_KEY` in Supabase Secrets
- Check Resend Dashboard → Logs
- Verify email addresses are correct
- Check spam folder
- For production: Verify domain in Resend

#### 7. Database "Permission Denied"

**Problem**: Cannot access database

**Solutions**:
- Check RLS policies are correct
- Verify user has proper role
- Check if using service role key (edge functions only)
- Review migration files for policy setup

#### 8. Build Fails on Vercel

**Problem**: Deployment fails

**Solutions**:
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure `package.json` has correct build script
- Check for TypeScript errors: `npm run build` locally first

#### 9. Images Not Loading

**Problem**: Images return 404 or don't display

**Solutions**:
- Verify storage buckets exist in Supabase
- Check bucket is set to public
- Verify RLS policies allow public read
- Check image URLs in browser network tab

#### 10. "User already exists" During Signup

**Problem**: User creation fails

**Solutions**:
- User may already exist with that email
- Check Supabase Auth → Users
- Try password reset instead
- Check database trigger for profile creation

### Getting Help

1. **Check Logs**:
   - Browser Console (F12)
   - Supabase Edge Function Logs
   - Vercel Build Logs
   - Resend Email Logs

2. **Verify Configuration**:
   - Environment variables
   - Supabase Secrets
   - Redirect URIs
   - Database migrations

3. **Test Locally First**:
   - Fix issues locally before deploying
   - Use `npm run build` to catch build errors

4. **Check Documentation**:
   - Supabase Docs: https://supabase.com/docs
   - React Docs: https://react.dev
   - Platform API Docs (Spotify, Apple, etc.)

---

## 📞 Support

### Getting Help

If you encounter issues:

1. **Check this README** - Most common issues are covered
2. **Review Error Messages** - They often point to the solution
3. **Check Logs** - Browser console, Supabase logs, hosting logs
4. **Verify Configuration** - Environment variables, secrets, URIs

### Useful Resources

- **Supabase Documentation**: https://supabase.com/docs
- **React Documentation**: https://react.dev
- **Vite Documentation**: https://vitejs.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Resend Documentation**: https://resend.com/docs

### Contact

For project-specific support, refer to your project documentation or contact the development team.

---

## 📝 License

This project is private and proprietary. All rights reserved.

---

## 🎉 Conclusion

Congratulations! You now have a comprehensive record label management platform. This README covers everything you need to set up, configure, and deploy the application.

**Key Takeaways**:

1. ✅ **Environment variables are critical** - Your hosting provider MUST support them
2. ✅ **Vercel is highly recommended** - Easiest setup, best compatibility
3. ✅ **Supabase is your backend** - Configure it properly with all secrets
4. ✅ **Edge Functions handle OAuth** - Deploy them after setting secrets
5. ✅ **Security is important** - Never hardcode secrets, always use environment variables

**Hosting Recommendations**:

- 🥇 **Vercel** - Best choice for 90% of users (free tier available)
- 🥈 **Netlify** - Great alternative (free tier available)
- 🥉 **Traditional Hosting** - Only if you verify environment variable support

**Next Steps**:

1. ✅ Complete the installation guide
2. ✅ Set up Supabase and run migrations
3. ✅ Configure at least one streaming platform
4. ✅ **Deploy to Vercel** (recommended - easiest option)
5. ✅ Test all functionality
6. ✅ Customize for your needs

**Important Reminder**: Before deploying to any hosting provider, **verify they support environment variables**. Without this, your application will not work properly.

**Good luck with your deployment! 🚀**

---

*Built with ❤️ for Grace Rhythm Sounds*

*Last Updated: November 2024*
