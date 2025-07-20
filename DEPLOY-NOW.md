# 🚀 Deploy SparkWave to Vercel NOW!

## 🎯 **Quick Deployment Steps**

### **Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

### **Step 2: Login to Vercel**
```bash
vercel login
```
- This will open your browser
- Login with GitHub or create account
- Authorize Vercel

### **Step 3: Deploy Your App**
```bash
vercel --prod
```

### **Step 4: Set Environment Variables**

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

# Session Secret
SESSION_SECRET=sparkwave-super-secure-session-secret-2024
```

### **Step 5: Update Twitter Developer Portal**

**Go to:** https://developer.twitter.com/en/portal/dashboard

**Update Callback URL to:**
```
https://your-app-name.vercel.app/auth/twitter/callback
```

**Replace `your-app-name` with your actual Vercel app name**

## 🎉 **Alternative: Cloudflare Pages**

If Vercel doesn't work, try Cloudflare Pages:

### **Step 1: Go to Cloudflare Pages**
1. Visit https://pages.cloudflare.com
2. Click "Create a project"
3. Connect your GitHub repository

### **Step 2: Configure Build Settings**
- **Framework preset:** None
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/`

### **Step 3: Set Environment Variables**
Add the same environment variables as above

## 🚨 **If You Get Stuck**

### **Common Issues:**
1. **Vercel CLI not found:** Run `npm install -g vercel` again
2. **Login issues:** Try `vercel logout` then `vercel login`
3. **Build errors:** Check the logs in Vercel dashboard

### **Need Help?**
- Check Vercel documentation: https://vercel.com/docs
- Look at deployment logs in dashboard
- Make sure all environment variables are set

## 🎯 **Success Checklist**

- [ ] Vercel CLI installed
- [ ] Logged into Vercel
- [ ] App deployed successfully
- [ ] Environment variables set
- [ ] Twitter callback URL updated
- [ ] App is accessible at your domain

**Your SparkWave app will be live in minutes! 🚀** 