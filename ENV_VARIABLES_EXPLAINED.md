# Environment Variables Explained

## Why `.env.local` Instead of `.env`?

### The Short Answer
**`.env.local` is used for security** - it's automatically gitignored, so your sensitive API keys and secrets won't accidentally be committed to Git.

### The Detailed Answer

In Vite (and most modern build tools), there's a hierarchy of environment files:

1. **`.env`** - Can be committed to Git (for non-sensitive defaults)
2. **`.env.local`** - **NEVER committed** (for secrets, personal config)
3. **`.env.development`** - Development-specific variables
4. **`.env.production`** - Production-specific variables
5. **`.env.development.local`** - Local development overrides (gitignored)
6. **`.env.production.local`** - Local production overrides (gitignored)

### Current Setup in This Project

Looking at your `.gitignore` file:
```gitignore
.env
.env.local
.env*.local
```

**Both `.env` and `.env.local` are gitignored**, which is actually fine for security. However, using `.env.local` is the **best practice** because:

1. **Clear Intent**: `.local` files are universally understood as "not for Git"
2. **Vite Convention**: Vite's documentation recommends `.env.local` for secrets
3. **Team Safety**: Even if someone accidentally removes `.env` from `.gitignore`, `.local` files are still safe

### What Goes Where?

#### `.env.local` (Gitignored - Use This!)
```env
# Secrets - NEVER commit these
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_secret_key_here
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_HCAPTCHA_SITE_KEY=your_hcaptcha_site_key
```

#### `.env` (Optional - Can be committed)
```env
# Non-sensitive defaults or documentation
# Example values for team members
VITE_SUPABASE_URL=https://example.supabase.co
VITE_SPOTIFY_CLIENT_ID=example_client_id
```

**Note**: If you create `.env` with example values, it helps other developers know what variables they need.

### How Vite Loads Environment Files

Vite loads files in this order (later files override earlier ones):

1. `.env`
2. `.env.local`
3. `.env.[mode]` (e.g., `.env.development`)
4. `.env.[mode].local` (e.g., `.env.development.local`)

For your project, you can use **either**:
- ✅ `.env.local` (recommended for secrets)
- ✅ `.env` (also works, but less conventional for secrets)

### For Production (Vercel/IONOS)

When deploying, you **don't upload** `.env.local`. Instead:

- **Vercel**: Add environment variables in Dashboard → Settings → Environment Variables
- **IONOS**: Use a config file approach (see `DEPLOYMENT_GUIDE.md`)

### Current Project Setup

Your project uses `.env.local` which is correct because:
- ✅ It's gitignored (safe from accidental commits)
- ✅ Contains sensitive API keys
- ✅ Follows Vite best practices
- ✅ Works for local development

### Can I Use `.env` Instead?

**Yes, you can!** Both work the same way. The difference is:
- `.env.local` = Explicitly for secrets (industry standard)
- `.env` = General purpose (can be committed if you want)

Since both are gitignored in your project, either works. But `.env.local` is more explicit about containing secrets.

### Summary

| File | Use For | Committed to Git? | Best For |
|------|---------|-------------------|----------|
| `.env` | General config | Can be (with examples) | Non-sensitive defaults |
| `.env.local` | Secrets & personal config | **NEVER** | API keys, passwords |
| `.env.production` | Production config | Can be | Production URLs |
| `.env.production.local` | Production secrets | **NEVER** | Production secrets |

**Recommendation**: Keep using `.env.local` for your secrets. It's the standard practice and makes it clear these are sensitive values.

---

## Quick Reference

### Create `.env.local` File
```bash
# In project root
touch .env.local
```

### Add Variables
```env
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_key_here
```

### Access in Code
```typescript
const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

**Important**: All Vite environment variables must start with `VITE_` to be exposed to the client-side code!

---

**Last Updated**: January 2025

