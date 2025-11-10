# 🎵 DistroKid Integration Guide

Complete guide for integrating and managing DistroKid distribution in Grace Rhythm Sounds platform.

---

## 📋 Overview

DistroKid is a music distribution service that distributes your music to major streaming platforms (Spotify, Apple Music, YouTube Music, etc.). This integration allows you to:

- Track distribution status for each release
- Store DistroKid release IDs and dashboard links
- Monitor which releases are live, pending, or processing
- Manage distribution workflow from your admin panel

**Important Note**: DistroKid does not currently offer a public API, so this integration uses manual tracking. When DistroKid releases an official API, we can enhance this integration for automated distribution.

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

Apply the DistroKid integration migration to your Supabase database:

```bash
supabase db push
```

This will:
- Add DistroKid tracking columns to the `releases` table
- Create a `distrokid_account` table for future API integration
- Set up proper indexes and constraints

### Step 2: Access Admin Releases Panel

1. Log in as an admin user
2. Navigate to **Admin Dashboard** → **Manage Releases**
3. You'll now see DistroKid distribution fields when creating/editing releases

---

## 📝 How to Use DistroKid Integration

### For Each Release

#### 1. Create or Edit a Release

When creating or editing a release in the admin panel, you'll see a new **"DistroKid Distribution"** section at the bottom of the form.

#### 2. Set Distribution Status

Select the appropriate status from the dropdown:

- **Not Distributed** - Release hasn't been submitted to DistroKid yet
- **Pending Submission** - Release is ready to be submitted to DistroKid
- **Processing** - Release has been submitted and is being reviewed by DistroKid
- **Live on Platforms** - Release is live and available on streaming platforms
- **Rejected** - Release was rejected by DistroKid (check dashboard for details)

#### 3. Add DistroKid Release ID

After submitting to DistroKid, copy the release ID or reference number from your DistroKid dashboard and paste it in the **"DistroKid Release ID"** field.

**Where to find it:**
- In DistroKid dashboard, each release has a unique ID
- Usually appears in the URL or release details
- Example: `DK-12345` or similar reference

#### 4. Add Dashboard URL

Copy the direct link to the release in your DistroKid dashboard and paste it in the **"DistroKid Dashboard URL"** field.

**How to get it:**
1. Go to your DistroKid dashboard
2. Navigate to the specific release
3. Copy the URL from your browser
4. Paste it in the field

This allows quick access to the release in DistroKid directly from your admin panel.

---

## 🎯 Workflow Example

### Typical Distribution Workflow

1. **Create Release in Admin Panel**
   - Fill in all release details (title, artist, genre, etc.)
   - Set DistroKid status to **"Not Distributed"**
   - Save the release

2. **Submit to DistroKid**
   - Log in to your DistroKid account
   - Upload the release through DistroKid's interface
   - Wait for confirmation email

3. **Update Status in Admin Panel**
   - Edit the release
   - Change status to **"Pending Submission"** or **"Processing"**
   - Add the DistroKid Release ID (if available)
   - Add the DistroKid Dashboard URL
   - Save

4. **Monitor Distribution**
   - Check DistroKid dashboard regularly
   - When release goes live, update status to **"Live on Platforms"**
   - Update streaming platform URLs (Spotify, Apple Music, etc.) as they become available

5. **Update Streaming Links**
   - Once live, get the actual streaming URLs from each platform
   - Update the release with Spotify URL, Apple Music URL, etc.
   - These will appear on your public releases page

---

## 📊 Viewing Distribution Status

### In Admin Releases List

Each release card now displays:
- **Status Badge** - Color-coded status indicator:
  - 🟢 Green (Live) - Release is live on platforms
  - 🟡 Yellow (Pending) - Awaiting submission or processing
  - 🔵 Blue (Processing) - Being reviewed by DistroKid
  - 🔴 Red (Rejected) - Rejected by DistroKid
- **Dashboard Link** - Quick access icon to open DistroKid dashboard (if URL is set)

### Status Colors

- **Live**: Green checkmark icon
- **Pending**: Yellow clock icon
- **Processing**: Blue clock icon
- **Rejected**: Red X icon

---

## 🔮 Future API Integration

When DistroKid releases an official API, we can enhance this integration to:

- **Automated Submission**: Submit releases directly from the admin panel
- **Status Sync**: Automatically sync distribution status from DistroKid
- **Streaming Links**: Automatically fetch and update streaming platform URLs
- **Analytics**: Pull distribution analytics and statistics
- **Royalty Tracking**: Track royalty splits and payments

The `distrokid_account` table is already set up to store API credentials when available.

---

## 💡 Best Practices

1. **Keep Status Updated**: Regularly update the distribution status as releases progress
2. **Store Release IDs**: Always save the DistroKid Release ID for easy reference
3. **Link Dashboard**: Add dashboard URLs for quick access to release details
4. **Update Streaming Links**: Once live, update all platform-specific URLs
5. **Monitor Regularly**: Check DistroKid dashboard weekly for status updates

---

## 🆘 Troubleshooting

### Status Not Updating

- Ensure you've run the database migration (`supabase db push`)
- Check that you're logged in as an admin user
- Verify the release exists in your database

### Can't See DistroKid Fields

- Make sure you're on the latest version of the code
- Clear browser cache and refresh
- Check that the migration was applied successfully

### Release ID Not Found

- The release ID is optional - you can leave it blank if not available
- Check your DistroKid dashboard for the reference number
- It may appear in emails from DistroKid

---

## 📚 Additional Resources

- [DistroKid Help Center](https://support.distrokid.com/hc/en-us)
- [DistroKid Dashboard](https://distrokid.com/)
- [DistroKid Pricing](https://distrokid.com/pricing)

---

## 🔄 Integration with Existing Streaming Platforms

This DistroKid integration works alongside your existing streaming platform integrations:

- **OAuth Connections** (Spotify, Apple Music, etc.) - For artist analytics
- **DistroKid Distribution** - For managing releases and distribution
- **Streaming URLs** - Links to where music is available

They complement each other:
- Use **DistroKid** to distribute music to platforms
- Use **OAuth connections** to track analytics and streams
- Use **Streaming URLs** to link to actual releases on platforms

---

## ✅ Checklist

- [ ] Run database migration (`supabase db push`)
- [ ] Verify DistroKid fields appear in admin releases form
- [ ] Create a test release with DistroKid information
- [ ] Verify status badges display correctly
- [ ] Test dashboard link functionality
- [ ] Update existing releases with DistroKid information (if applicable)

---

**Need Help?** Contact support at info@gracerhythmsounds.com

