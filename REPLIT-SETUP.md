# 🚀 SparkWave Replit Setup Guide

## ✅ **Your App is Live!**
**URL:** https://spark-wave-1-hakopog916.replit.app

## 🔧 **Twitter OAuth Configuration**

### **Step 1: Update Twitter Developer Portal**

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Select your app
3. Go to **"User authentication settings"**
4. Update these settings:

**App permissions:** Read and Write
**Type of App:** Web App
**Callback URLs:** 
```
https://spark-wave-1-hakopog916.replit.app/auth/twitter/callback
```

**Website URL:**
```
https://spark-wave-1-hakopog916.replit.app
```

### **Step 2: Set Environment Variables in Replit**

In your Replit project:

1. Click on **"Tools"** → **"Secrets"**
2. Add these environment variables:

```
NODE_ENV=production
SESSION_SECRET=your-super-secret-session-key-here
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
```

### **Step 3: Get Your Twitter Credentials**

From your Twitter Developer Portal:
- **Client ID:** Found in "Keys and tokens" → "OAuth 2.0 Client ID"
- **Client Secret:** Found in "Keys and tokens" → "OAuth 2.0 Client Secret"

### **Step 4: Test Twitter Connection**

1. Go to your app: https://spark-wave-1-hakopog916.replit.app
2. Create a campaign
3. Click "Connect Twitter"
4. Complete the OAuth flow

## 🎯 **What's Already Fixed:**

✅ **OAuth URLs** - Updated to use your Replit domain
✅ **API endpoints** - Using relative paths (auto-works)
✅ **Production mode** - Detects Replit environment
✅ **CORS settings** - Configured for your domain

## 🚨 **Important Notes:**

- **Free Replit instances** may sleep after inactivity
- **First request** after sleep might take 30-60 seconds
- **Environment variables** must be set in Replit Secrets
- **Twitter OAuth** requires HTTPS (✅ Replit provides this)

## 🔍 **Troubleshooting:**

If Twitter OAuth doesn't work:
1. Check that callback URL is exactly: `https://spark-wave-1-hakopog916.replit.app/auth/twitter/callback`
2. Verify environment variables are set in Replit Secrets
3. Check Replit logs for any errors
4. Ensure Twitter app has "Read and Write" permissions

## 🎉 **You're Ready!**

Once you've set the environment variables in Replit Secrets, your Twitter OAuth will work perfectly! 