# 🚀 Deploy SparkWave to Vercel (FREE!)

## 🎯 **Step-by-Step Deployment**

### **Step 1: Push to GitHub**
```bash
# Add all files
git add .

# Commit changes
git commit -m "Ready for Vercel deployment"

# Push to GitHub
git push origin main
```

### **Step 2: Deploy to Vercel**

**Option A: Using Vercel Dashboard (Easiest)**
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Node.js app
5. Click "Deploy"

**Option B: Using Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### **Step 3: Set Environment Variables**

**In Vercel Dashboard:**
1. Go to your project settings
2. Click "Environment Variables"
3. Add these variables:

```env
NODE_ENV=production
PORT=3002

# Supabase
SUPABASE_URL=https://jaflxjatobiupbrqcrfm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZmx4amF0b2JpdXBicnFjcmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTQ4NzIsImV4cCI6MjA2ODUzMDg3Mn0.V0fpjk8h6h0GaD3VZAzP0fx-JyHBfZe6ihUuGDk4xCU

# Twitter OAuth
TWITTER_CLIENT_ID=dzY1dU9NcW9MWEVFa09FUmxtcGk6MTpjaQ
TWITTER_CLIENT_SECRET=t0ZhzEjOeXVV8s7Z60alx0_6WsmIUUc0yzszNkm2RCQ0Wu4Flx
TWITTER_CALLBACK_URL=https://your-app-name.vercel.app/auth/twitter/callback

# A4F AI
A4F_API_KEY=ddc-a4f-c4646ced53b34fdfa60084c2a56680ac
A4F_MODEL_ID=provider-6/gpt-4o

# Frontend URL
FRONTEND_URL=https://your-app-name.vercel.app

# Session Secret (CHANGE THIS!)
SESSION_SECRET=your-super-secure-session-secret-change-this-in-production
```

### **Step 4: Update Twitter Developer Portal**

**Go to:** https://developer.twitter.com/en/portal/dashboard

**Update Callback URL to:**
```
https://your-app-name.vercel.app/auth/twitter/callback
```

**Replace `your-app-name` with your actual Vercel app name**

### **Step 5: Test Your App**

1. **Visit your app:** `https://your-app-name.vercel.app`
2. **Test Twitter OAuth:** Try logging in
3. **Test AI Integration:** Create a campaign
4. **Check database:** Verify data is saving

## 🎉 **You're Done!**

Your SparkWave app is now live on Vercel for FREE!

**Benefits:**
- ✅ **Completely FREE**
- ✅ **Automatic HTTPS**
- ✅ **Global CDN**
- ✅ **Auto-deployments** from GitHub
- ✅ **No server management**

## 🚨 **If Something Goes Wrong**

1. **Check Vercel logs** in dashboard
2. **Verify environment variables** are set
3. **Check Twitter callback URL** matches exactly
4. **Test locally first** if needed

## 📞 **Need Help?**

- Vercel has excellent documentation
- Check the deployment logs
- Verify all environment variables are set correctly

**Your app should be live in minutes! 🚀** 