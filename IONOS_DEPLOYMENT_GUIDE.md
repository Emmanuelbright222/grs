# 🚀 IONOS Deployment Guide for Grace Rhythm Sounds

This guide will help you deploy your React application to IONOS hosting.

---

## 📋 Prerequisites

- IONOS hosting account with domain `gracerhythmsounds.com`
- FTP/SFTP access credentials (from IONOS)
- Node.js installed locally (for building)
- Supabase project configured
- All environment variables ready

---

## Step 1: Build Your Application

### 1.1 Install Dependencies (if not already done)

```bash
npm install
```

### 1.2 Build for Production

```bash
npm run build
```

This creates a `dist` folder with all production-ready files.

**What gets built:**
- Optimized JavaScript bundles
- Minified CSS
- Static assets (images, fonts, etc.)
- `index.html` as the entry point

---

## Step 2: Prepare Environment Variables

Since IONOS traditional hosting doesn't support server-side environment variables like Vercel, you have two options:

### Option A: Build with Environment Variables (Recommended)

Create a `.env.production` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_HCAPTCHA_SITE_KEY=your_hcaptcha_site_key
VITE_YOUTUBE_CLIENT_ID=your_youtube_client_id
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_APPLE_MUSIC_CLIENT_ID=your_apple_music_client_id
VITE_AUDIOMACK_CLIENT_ID=your_audiomack_client_id
VITE_BOOMPLAY_CLIENT_ID=your_boomplay_client_id
```

Then rebuild:
```bash
npm run build
```

**Note:** These values will be embedded in your JavaScript bundle. This is safe for public keys (like `VITE_*` variables), but never put secret keys here.

### Option B: Use Runtime Configuration (Advanced)

If you need to change variables without rebuilding, you can use a config file that's loaded at runtime. This requires additional setup.

---

## Step 3: Configure .htaccess for React Router

The `.htaccess` file in your `public` folder should handle React Router routing. Verify it contains:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
</IfModule>
```

This ensures:
- All routes redirect to `index.html` (needed for React Router)
- Static assets are compressed
- Browser caching is enabled

---

## Step 4: Upload Files to IONOS

### 4.1 Get FTP/SFTP Credentials

1. Log in to your IONOS account
2. Go to **Hosting** → **Your Domain** → **FTP Access**
3. Note your:
   - FTP Host (usually `ftp.yourdomain.com` or an IP)
   - FTP Username
   - FTP Password
   - Port (usually 21 for FTP, 22 for SFTP)

### 4.2 Upload Files

**Using FTP Client (FileZilla, WinSCP, etc.):**

1. Connect to your IONOS FTP server
2. Navigate to your website's root directory:
   - Usually: `/httpdocs` or `/public_html` or `/www`
   - Check your IONOS control panel for the exact path
3. Upload **ALL contents** from the `dist` folder:
   - Select all files and folders in `dist`
   - Upload to the root directory
   - **Important:** Upload the contents of `dist`, not the `dist` folder itself

**File Structure on Server:**
```
/httpdocs (or /public_html)
  ├── index.html
  ├── assets/
  │   ├── index-xxxxx.js
  │   ├── index-xxxxx.css
  │   └── ...
  ├── logo.png
  ├── favicon.ico
  ├── .htaccess
  └── ... (other static files)
```

**Using IONOS File Manager:**

1. Log in to IONOS control panel
2. Go to **Hosting** → **File Manager**
3. Navigate to your website root directory
4. Upload files using the web interface
5. Make sure `.htaccess` is uploaded (it might be hidden - enable "Show hidden files")

---

## Step 5: Verify Deployment

### 5.1 Check File Upload

- Verify `index.html` exists in root
- Verify `assets` folder exists with JavaScript/CSS files
- Verify `.htaccess` is uploaded

### 5.2 Test Your Website

1. Visit `https://gracerhythmsounds.com`
2. Check browser console (F12) for errors
3. Test navigation (all routes should work)
4. Test authentication (login/signup)
5. Test forms (contact form, etc.)

### 5.3 Common Issues

**Issue: Blank page or 404 errors**
- **Solution:** Check `.htaccess` is uploaded and working
- **Solution:** Verify all files are in root directory, not in a subfolder

**Issue: Environment variables not working**
- **Solution:** Rebuild with `.env.production` file
- **Solution:** Check browser console for missing variables

**Issue: Routes not working (404 on refresh)**
- **Solution:** Verify `.htaccess` rewrite rules are active
- **Solution:** Check IONOS supports `.htaccess` (most plans do)

**Issue: Images not loading**
- **Solution:** Check file paths are correct
- **Solution:** Verify images are in `public` folder and uploaded

---

## Step 6: SSL Certificate (HTTPS)

### 6.1 Enable SSL in IONOS

1. Log in to IONOS control panel
2. Go to **Hosting** → **SSL/TLS**
3. Enable **Let's Encrypt** (free) or use your own certificate
4. Wait for activation (usually a few minutes)

### 6.2 Force HTTPS

Add to your `.htaccess`:

```apache
# Force HTTPS
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

---

## Step 7: Update DNS (if needed)

If your domain isn't already pointing to IONOS:

1. Go to your domain registrar
2. Update DNS records:
   - **A Record:** Point to IONOS IP (provided by IONOS)
   - **CNAME:** `www` → `gracerhythmsounds.com`
3. Wait for DNS propagation (up to 48 hours, usually faster)

---

## Step 8: Ongoing Maintenance

### 8.1 Updating Your Site

1. Make changes locally
2. Update `.env.production` if needed
3. Run `npm run build`
4. Upload new files via FTP (overwrite old files)
5. Clear browser cache if needed

### 8.2 Backup

- Regularly backup your `dist` folder
- Keep a copy of your `.env.production` file (securely)
- IONOS may have automatic backups - check your plan

---

## 📝 Environment Variables Checklist

Make sure these are in your `.env.production` before building:

- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] `VITE_HCAPTCHA_SITE_KEY`
- [ ] `VITE_YOUTUBE_CLIENT_ID` (if using YouTube)
- [ ] `VITE_SPOTIFY_CLIENT_ID` (if using Spotify)
- [ ] `VITE_APPLE_MUSIC_CLIENT_ID` (if using Apple Music)
- [ ] `VITE_AUDIOMACK_CLIENT_ID` (if using Audiomack)
- [ ] `VITE_BOOMPLAY_CLIENT_ID` (if using Boomplay)

---

## 🔧 IONOS-Specific Tips

1. **PHP Version:** Not needed for React, but IONOS may have PHP enabled - that's fine
2. **Node.js:** IONOS traditional hosting doesn't run Node.js - your app is pre-built static files
3. **Database:** You're using Supabase (cloud), not IONOS database
4. **Email:** Configured via Supabase Edge Functions (Resend), not IONOS email
5. **File Permissions:** Usually `644` for files, `755` for folders (FTP client handles this)

---

## 🆘 Troubleshooting

### Can't access FTP
- Check firewall settings
- Verify credentials in IONOS control panel
- Try SFTP instead of FTP

### Website shows "Index of /"
- Files not in correct directory
- `index.html` missing or misnamed

### 500 Internal Server Error
- Check `.htaccess` syntax
- Check IONOS error logs
- Verify file permissions

### Environment variables undefined
- Rebuild with `.env.production`
- Check variable names start with `VITE_`
- Clear browser cache

---

## ✅ Deployment Checklist

- [ ] Built application (`npm run build`)
- [ ] Created `.env.production` with all variables
- [ ] Verified `.htaccess` is correct
- [ ] Uploaded all files from `dist` folder
- [ ] Tested website loads correctly
- [ ] Tested all routes work
- [ ] Tested authentication
- [ ] Tested forms
- [ ] Enabled SSL/HTTPS
- [ ] Updated DNS (if needed)
- [ ] Tested on mobile devices

---

## 📞 Need Help?

- **IONOS Support:** Check IONOS help center or contact support
- **Supabase Issues:** Check Supabase dashboard logs
- **Build Issues:** Check `npm run build` output for errors

---

**Last Updated:** November 2024

