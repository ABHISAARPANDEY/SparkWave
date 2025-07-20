# 🚀 Quick Deployment Guide

## 📋 **Pre-Deployment Checklist**

### ✅ **1. Update Twitter Developer Portal**

**Go to:** https://developer.twitter.com/en/portal/dashboard

**Update these URLs:**
- **Callback URL:** `https://your-domain.com/auth/twitter/callback`
- **Website URL:** `https://your-domain.com`

### ✅ **2. Choose Your Deployment Platform**

**Recommended Options:**
- **Vercel** (Easiest) - Free tier available
- **Railway** - Good for full-stack apps
- **Render** - Free tier available
- **Heroku** - Paid but reliable

## 🚀 **Deployment Steps**

### **Option 1: Vercel (Recommended)**

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Run deployment script
chmod +x deploy.sh
./deploy.sh

# 3. Deploy
vercel --prod
```

### **Option 2: Railway**

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Connect to Railway
# - Go to railway.app
# - Connect your GitHub repo
# - Railway will auto-deploy
```

### **Option 3: Render**

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Connect to Render
# - Go to render.com
# - Connect your GitHub repo
# - Set environment variables
```

## ⚙️ **Environment Variables to Set**

**In your deployment platform dashboard, set these:**

```env
NODE_ENV=production
PORT=3002

# Supabase
SUPABASE_URL=https://jaflxjatobiupbrqcrfm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZmx4amF0b2JpdXBicnFjcmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTQ4NzIsImV4cCI6MjA2ODUzMDg3Mn0.V0fpjk8h6h0GaD3VZAzP0fx-JyHBfZe6ihUuGDk4xCU

# Twitter OAuth
TWITTER_CLIENT_ID=dzY1dU9NcW9MWEVFa09FUmxtcGk6MTpjaQ
TWITTER_CLIENT_SECRET=t0ZhzEjOeXVV8s7Z60alx0_6WsmIUUc0yzszNkm2RCQ0Wu4Flx
TWITTER_CALLBACK_URL=https://your-domain.com/auth/twitter/callback

# A4F AI
A4F_API_KEY=ddc-a4f-c4646ced53b34fdfa60084c2a56680ac
A4F_MODEL_ID=provider-6/gpt-4o

# Frontend URL
FRONTEND_URL=https://your-domain.com

# Session Secret (CHANGE THIS!)
SESSION_SECRET=your-super-secure-session-secret-change-this-in-production
```

## 🔧 **Post-Deployment Testing**

### **1. Test OAuth Flow**
- Visit your deployed app
- Try logging in with Twitter
- Verify callback works

### **2. Test AI Integration**
- Create a test campaign
- Verify A4F API works in production

### **3. Test Database**
- Check if data is being saved to Supabase
- Verify user registration works

## 🚨 **Common Issues**

### **CORS Errors**
- Make sure `FRONTEND_URL` is set correctly
- Check that your domain matches exactly

### **OAuth Callback Issues**
- Verify callback URL in Twitter Developer Portal
- Ensure HTTPS is used in production
- Check that redirect URI matches exactly

### **Environment Variables Not Loading**
- Double-check all variables are set in deployment platform
- Ensure `NODE_ENV=production` is set

## 📞 **Need Help?**

1. **Check deployment logs** in your platform dashboard
2. **Verify environment variables** are set correctly
3. **Test OAuth flow** step by step
4. **Check Supabase connection** in production

## 🎯 **Success Checklist**

- [ ] App deployed successfully
- [ ] Twitter OAuth working
- [ ] AI content generation working
- [ ] Database saving data correctly
- [ ] No CORS errors
- [ ] All features functional

**Your SparkWave app should now be live! 🎉** 