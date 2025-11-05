# hCaptcha Setup Guide

## Why It Works Without `.env.local`

### The Fallback Test Key

All forms (Login, Signup, Contact, Reset Password) use this code:

```typescript
sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY || "10000000-ffff-ffff-ffff-000000000001"}
```

The value `"10000000-ffff-ffff-ffff-000000000001"` is **hCaptcha's official test/demo site key**. This is why your forms work even without adding `VITE_HCAPTCHA_SITE_KEY` to `.env.local`!

### How It Works

1. **Without `.env.local`**: Uses the test key `10000000-ffff-ffff-ffff-000000000001` ✅
2. **With `.env.local`**: Uses your real site key from the environment variable ✅

Both work, but:
- **Test key**: Only for development/testing, may not work properly in production
- **Real key**: Required for production, provides actual bot protection

---

## Local Development

### Option 1: Use Test Key (Current Setup)
No configuration needed! The test key works automatically.

### Option 2: Use Your Real Key (Recommended)
Add to `.env.local`:
```env
VITE_HCAPTCHA_SITE_KEY=your_real_site_key_here
```

**Note**: The test key works fine for development, but using your real key helps you:
- Test the actual captcha experience
- Ensure it works before deploying
- Catch any configuration issues early

---

## Production (Vercel)

### Why `.env.local` Doesn't Work on Vercel

`.env.local` is a **local file** that stays on your computer. Vercel doesn't have access to it. You must add environment variables in the Vercel Dashboard.

### Step-by-Step: Add hCaptcha to Vercel

1. **Get Your hCaptcha Site Key**
   - Go to https://dashboard.hcaptcha.com/
   - Create a site or use existing one
   - Copy your **Site Key** (starts with something like `10000000-...`)

2. **Add to Vercel Dashboard**
   - Go to your project on Vercel
   - Click **Settings** → **Environment Variables**
   - Click **Add New**
   - Enter:
     - **Key**: `VITE_HCAPTCHA_SITE_KEY`
     - **Value**: Your hCaptcha site key
     - **Environment**: Select **Production, Preview, Development** (all)
   - Click **Save**

3. **Redeploy**
   - After adding the variable, Vercel will automatically redeploy
   - Or manually trigger a redeploy from the Deployments tab

### Verification

After deployment, check:
1. Open your site
2. Go to Login/Signup/Contact form
3. hCaptcha should appear
4. Open browser DevTools → Console
5. You should see: `"hCaptcha loaded"` (if you added the debug logs)

---

## Why Use Real Key in Production?

### Test Key Limitations
- ⚠️ May not work reliably in production
- ⚠️ Won't provide real bot protection
- ⚠️ May show warnings to users
- ⚠️ Not intended for production use

### Real Key Benefits
- ✅ Proper bot protection
- ✅ No warnings
- ✅ Analytics and insights
- ✅ Production-ready

---

## Summary

| Scenario | Setup | Works? |
|----------|-------|--------|
| **Local Development** | No `.env.local` (uses test key) | ✅ Yes |
| **Local Development** | With `.env.local` (uses real key) | ✅ Yes (better) |
| **Vercel Production** | No environment variable (uses test key) | ⚠️ May not work |
| **Vercel Production** | With environment variable (uses real key) | ✅ Yes (required) |

---

## Quick Checklist

### For Local Development
- [ ] Optional: Add `VITE_HCAPTCHA_SITE_KEY` to `.env.local`
- [ ] Forms work with or without it (test key fallback)

### For Vercel Production
- [ ] Get real hCaptcha site key from dashboard
- [ ] Add `VITE_HCAPTCHA_SITE_KEY` to Vercel environment variables
- [ ] Select all environments (Production, Preview, Development)
- [ ] Redeploy project
- [ ] Verify hCaptcha appears on forms

---

## Troubleshooting

### hCaptcha Not Showing on Vercel

1. **Check Environment Variables**
   - Vercel Dashboard → Settings → Environment Variables
   - Ensure `VITE_HCAPTCHA_SITE_KEY` exists
   - Ensure it's set for the correct environment

2. **Check Site Key Format**
   - Should start with `10000000-` or similar
   - No quotes or extra spaces
   - Copy-paste directly from hCaptcha dashboard

3. **Redeploy**
   - After adding/changing variables, redeploy is required
   - Vercel usually auto-redeploys, but you can trigger manually

4. **Check Browser Console**
   - Open DevTools → Console
   - Look for hCaptcha errors
   - Check if site key is being loaded

5. **Verify Supabase Settings**
   - If using Supabase Auth with hCaptcha
   - Ensure hCaptcha is enabled in Supabase Dashboard
   - Add secret key to Supabase Secrets (separate from Vercel)

---

**Last Updated**: January 2025

