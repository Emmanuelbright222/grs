# 🎵 Grace Rhythm Sounds - Record Label Platform

A comprehensive record label management platform with streaming platform integrations, artist dashboards, content management, and analytics.

## 🚀 Features

- **Artist Dashboard** - Complete artist profile management and analytics
- **Streaming Platform Integration** - Connect Spotify, Apple Music, YouTube Music, Audiomack, and Boomplay
- **Content Management** - Manage artists, releases, events, and news
- **Demo Submissions** - Artists can submit demos for review
- **Admin Panel** - Full administrative control
- **Responsive Design** - Mobile-friendly interface
- **Real-time Analytics** - Track streams and revenue across platforms

## 📋 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth
- **Email**: Resend API
- **Deployment**: Vercel (recommended)

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd rhythm-grace-sounds-06809-main
npm install
```

### 2. Environment Variables

Create `.env.local` in the project root:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key

# Streaming Platforms (Optional - add as you configure them)
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_APPLE_MUSIC_CLIENT_ID=your_apple_client_id
VITE_YOUTUBE_CLIENT_ID=your_youtube_client_id
VITE_AUDIOMACK_CLIENT_ID=your_audiomack_client_id
VITE_BOOMPLAY_CLIENT_ID=your_boomplay_client_id
```

### 3. Run Database Migrations

Run all migrations in `supabase/migrations/` using Supabase Dashboard or CLI:

```bash
supabase db push
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:8080` (or the port shown in terminal)

## 🎵 Streaming Platform Integration

### Overview

The platform supports integration with 5 streaming services:
- Spotify ✅
- Apple Music ✅
- YouTube Music ✅
- Audiomack ✅
- Boomplay ✅

### Setup Process (Same for All Platforms)

#### Step 1: Create Developer Account

1. **Spotify**: https://developer.spotify.com/dashboard
2. **Apple Music**: https://developer.apple.com
3. **YouTube Music**: https://console.cloud.google.com
4. **Audiomack**: (Developer portal when available)
5. **Boomplay**: (Developer portal when available)

#### Step 2: Create App and Get Credentials

- Create an app in each platform's developer dashboard
- Get **Client ID** and **Client Secret**
- Configure redirect URI:
  - **Local**: `http://YOUR_NETWORK_IP:8080/auth/{platform}/callback`
  - **Production**: `https://yourdomain.com/auth/{platform}/callback`

> **Note**: Spotify doesn't accept `localhost`. Use your network IP (e.g., `172.20.10.2`) for local testing.

#### Step 3: Configure Supabase Secrets

Go to **Supabase Dashboard → Settings → Edge Functions → Secrets** and add:

```
# Spotify
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
FRONTEND_URL=http://YOUR_NETWORK_IP:8080

# Apple Music
APPLE_MUSIC_CLIENT_ID=your_client_id
APPLE_MUSIC_CLIENT_SECRET=your_client_secret
APPLE_MUSIC_REDIRECT_URI=http://YOUR_NETWORK_IP:8080/auth/apple-music/callback

# YouTube Music
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_client_secret
YOUTUBE_REDIRECT_URI=http://YOUR_NETWORK_IP:8080/auth/youtube/callback

# Audiomack
AUDIOMACK_CLIENT_ID=your_client_id
AUDIOMACK_CLIENT_SECRET=your_client_secret
AUDIOMACK_REDIRECT_URI=http://YOUR_NETWORK_IP:8080/auth/audiomack/callback

# Boomplay
BOOMPLAY_CLIENT_ID=your_client_id
BOOMPLAY_CLIENT_SECRET=your_client_secret
BOOMPLAY_REDIRECT_URI=http://YOUR_NETWORK_IP:8080/auth/boomplay/callback
```

#### Step 4: Add Frontend Environment Variables

Add Client IDs to `.env.local`:

```env
VITE_SPOTIFY_CLIENT_ID=your_client_id
VITE_APPLE_MUSIC_CLIENT_ID=your_client_id
VITE_YOUTUBE_CLIENT_ID=your_client_id
VITE_AUDIOMACK_CLIENT_ID=your_client_id
VITE_BOOMPLAY_CLIENT_ID=your_client_id
```

#### Step 5: Deploy Edge Functions

Deploy all OAuth and sync functions:

```bash
# Spotify
supabase functions deploy spotify-oauth
supabase functions deploy spotify-sync

# Apple Music
supabase functions deploy apple-music-oauth
supabase functions deploy apple-music-sync

# YouTube Music
supabase functions deploy youtube-oauth
supabase functions deploy youtube-sync

# Audiomack
supabase functions deploy audiomack-oauth
supabase functions deploy audiomack-sync

# Boomplay
supabase functions deploy boomplay-oauth
supabase functions deploy boomplay-sync
```

### How It Works

1. Artist clicks "Connect [Platform]" on dashboard
2. Redirects to platform's OAuth authorization page
3. Artist authorizes the app
4. Platform redirects back to `/auth/{platform}/callback`
5. Frontend callback page calls edge function with auth headers
6. Edge function exchanges code for access token
7. Tokens saved to `streaming_platform_connections` table
8. Artist redirected back to dashboard (connected!)

## 📧 Email Configuration

### Setup Resend API

1. Sign up at https://resend.com
2. Get your API key
3. Add to Supabase Secrets:

```
RESEND_API_KEY=re_your_api_key_here
```

### Email Functions

- `send-contact-email` - Handles contact form submissions
- `send-demo-status-email` - Sends demo approval/rejection emails
- `notify-new-artist` - Notifies when new artist signs up

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Import to Vercel**:
   - Go to https://vercel.com
   - Click "Import Project"
   - Select your GitHub repository
   - Configure build settings:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_PUBLISHABLE_KEY`
     - `VITE_SPOTIFY_CLIENT_ID`
     - `VITE_APPLE_MUSIC_CLIENT_ID`
     - `VITE_YOUTUBE_CLIENT_ID`
     - `VITE_AUDIOMACK_CLIENT_ID`
     - `VITE_BOOMPLAY_CLIENT_ID`
   - Set environment: **Production, Preview, Development**

4. **Update Supabase Secrets**:
   - Update `FRONTEND_URL` to your Vercel domain
   - Update all redirect URIs to production URLs

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete

### Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Supabase Secrets updated with production URLs
- [ ] All edge functions deployed
- [ ] Redirect URIs updated in platform dashboards
- [ ] Database migrations run
- [ ] Test OAuth flows in production
- [ ] Test email functionality

## 📁 Project Structure

```
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # Supabase client
│   └── lib/              # Utilities
├── supabase/
│   ├── functions/        # Edge functions
│   └── migrations/       # Database migrations
├── public/               # Static assets
└── .env.local           # Environment variables (gitignored)
```

## 🔐 Security Best Practices

### Environment Variables

- ✅ **Local**: Use `.env.local` (automatically gitignored)
- ✅ **Production**: Use hosting platform's environment variables
- ❌ **Never**: Commit `.env` files or secrets to git
- ❌ **Never**: Put Client Secrets in frontend code

### Supabase Secrets

- Store all Client Secrets in Supabase Dashboard → Secrets
- Never expose secrets in edge function code
- Use service role key only in edge functions (server-side)

### Database Security

- All tables have Row Level Security (RLS) enabled
- Policies restrict access based on user roles
- Service role key bypasses RLS (use only in edge functions)

## 🐛 Troubleshooting

### OAuth Connection Issues

**"Invalid redirect URI"**
- Ensure redirect URI in platform dashboard matches exactly
- Check for trailing slashes
- Use full URL format

**"401 Missing authorization header"**
- Verify edge function is deployed
- Check Supabase Secrets are set correctly
- Ensure frontend callback route exists

**"Token exchange failed"**
- Verify Client ID and Secret are correct
- Check edge function logs in Supabase Dashboard
- Ensure redirect URI matches exactly

### Environment Variables

**"Variable not found"**
- Check variable name starts with `VITE_`
- Restart dev server after adding variables
- Verify variables are set in production platform

### Database Issues

**"Permission denied"**
- Check RLS policies are correct
- Verify user has proper role
- Check edge function uses service role key

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For issues or questions:
- Check the troubleshooting section above
- Review Supabase function logs
- Check browser console for errors
- Verify all environment variables are set

---

**Built with ❤️ for Grace Rhythm Sounds**
