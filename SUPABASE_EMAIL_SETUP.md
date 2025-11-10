# 🔧 Fix "Error sending confirmation email" in Supabase

## Problem
When users try to sign up, they get: `AuthApiError: Error sending confirmation email`

This happens because Supabase Auth needs email service configuration.

---

## ✅ Solution: Configure Supabase Auth Email Settings

### Step 1: Go to Supabase Dashboard

1. Log in to https://supabase.com
2. Select your project
3. Go to **Authentication** → **Settings**

### Step 2: Configure Site URL

1. Scroll to **Site URL** section
2. Set your production URL:
   ```
   https://grs-pink.vercel.app
   ```
   Or if using your domain:
   ```
   https://gracerhythmsounds.com
   ```

### Step 3: Configure Redirect URLs

1. Scroll to **Redirect URLs** section
2. Add these URLs (one per line):
   ```
   https://grs-pink.vercel.app/**
   https://gracerhythmsounds.com/**
   http://localhost:8080/**
   ```

### Step 4: Configure Email Provider

You have **two options**:

---

## Option A: Use Supabase Built-in Email (Free Tier - Limited)

**Note:** Free tier has rate limits (3 emails/hour per project)

1. Go to **Authentication** → **Settings** → **SMTP Settings**
2. **Enable email confirmations** should be ON
3. Supabase will use its built-in email service
4. **Limitation:** Only 3 emails per hour on free tier

---

## Option B: Use Custom SMTP (Recommended for Production)

### Using Resend (Recommended)

1. **Get Resend API Key** (if you don't have one):
   - Go to https://resend.com
   - Sign up/login
   - Go to **API Keys** → Create new key
   - Copy the API key (starts with `re_`)

2. **In Supabase Dashboard**:
   - Go to **Authentication** → **Settings** → **SMTP Settings**
   - Enable **Enable Custom SMTP**
   - Fill in:
     - **Host:** `smtp.resend.com`
     - **Port:** `465` (or `587` for TLS)
     - **Username:** `resend`
     - **Password:** Your Resend API key (starts with `re_`)
     - **Sender email:** `onboarding@resend.dev` (for testing) or your verified domain email
     - **Sender name:** `Grace Rhythm Sounds`

3. **For Production** (with verified domain):
   - Verify your domain in Resend
   - Use: `noreply@gracerhythmsounds.com` or `info@gracerhythmsounds.com`

### Using Gmail SMTP (Alternative)

1. **Enable App Password in Gmail**:
   - Go to Google Account → Security
   - Enable 2-Step Verification
   - Generate App Password
   - Copy the 16-character password

2. **In Supabase Dashboard**:
   - Go to **Authentication** → **Settings** → **SMTP Settings**
   - Enable **Enable Custom SMTP**
   - Fill in:
     - **Host:** `smtp.gmail.com`
     - **Port:** `587`
     - **Username:** Your Gmail address
     - **Password:** The 16-character app password
     - **Sender email:** Your Gmail address
     - **Sender name:** `Grace Rhythm Sounds`

---

## Step 5: Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize templates if needed
3. Make sure **Confirm signup** template is enabled

---

## Step 6: Test the Configuration

1. Try signing up again
2. Check your email (including spam folder)
3. If using Resend, check Resend Dashboard → **Logs** for delivery status

---

## Common Issues

### Issue: Still getting error after configuration

**Solutions:**
1. **Wait a few minutes** - Changes can take time to propagate
2. **Check Site URL** - Must match your actual domain
3. **Check Redirect URLs** - Must include your domain with `/**`
4. **Verify SMTP credentials** - Test connection in Supabase
5. **Check email limits** - Free tier has rate limits

### Issue: Emails going to spam

**Solutions:**
1. Use a verified domain (not `@resend.dev` or `@gmail.com`)
2. Set up SPF and DKIM records
3. Use a professional email service

### Issue: Redirect URL mismatch

**Error:** "Invalid redirect URL"

**Solution:**
- Make sure the redirect URL in your code matches what's in Supabase
- Current code uses: `${window.location.origin}/login`
- Add this exact pattern to Supabase Redirect URLs

---

## Quick Checklist

- [ ] Site URL set to production domain
- [ ] Redirect URLs include production domain with `/**`
- [ ] Email confirmations enabled
- [ ] SMTP configured (custom or built-in)
- [ ] Email templates enabled
- [ ] Tested signup flow

---

## Current Code Configuration

Your signup code uses:
```javascript
emailRedirectTo: `${window.location.origin}/login`
```

This means:
- On `https://grs-pink.vercel.app` → redirects to `https://grs-pink.vercel.app/login`
- On `https://gracerhythmsounds.com` → redirects to `https://gracerhythmsounds.com/login`

Make sure these URLs are in your Supabase Redirect URLs list!

---

**Last Updated:** November 2024

