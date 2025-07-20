# 🐦 Twitter OAuth URL Configuration

## 📋 **URLs to Add to Twitter Developer Portal**

### **Step 1: Go to Twitter Developer Portal**
1. Visit: https://developer.twitter.com/en/portal/dashboard
2. Select your app
3. Go to **"User authentication settings"**

### **Step 2: Add These Callback URLs**

**Production URLs:**
```
https://spark-wave-1-hakopog916.replit.app/auth/twitter/callback
```

**Localhost URLs (for testing):**
```
http://localhost:3002/auth/twitter/callback
http://localhost:5173/auth/twitter/callback
http://localhost:3000/auth/twitter/callback
```

### **Step 3: Add These Website URLs**

**Production:**
```
https://spark-wave-1-hakopog916.replit.app
```

**Localhost (for testing):**
```
http://localhost:3002
http://localhost:5173
http://localhost:3000
```

### **Step 4: App Settings**

**App permissions:** Read and Write
**Type of App:** Web App
**App info:** Your app description

## 🔧 **Environment Variables**

### **For Production (Replit):**
```
NODE_ENV=production
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
```

### **For Local Development:**
```
NODE_ENV=development
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
```

## 🧪 **Testing URLs**

### **Production Testing:**
- App: https://spark-wave-1-hakopog916.replit.app
- OAuth: https://spark-wave-1-hakopog916.replit.app/auth/twitter/connect
- Callback: https://spark-wave-1-hakopog916.replit.app/auth/twitter/callback

### **Local Testing:**
- App: http://localhost:3002
- OAuth: http://localhost:3002/auth/twitter/connect
- Callback: http://localhost:3002/auth/twitter/callback

## ✅ **What This Enables:**

1. **OAuth works on Replit** (production)
2. **OAuth works locally** (development)
3. **Seamless testing** between environments
4. **No URL changes needed** when switching

## 🚀 **After Adding URLs:**

1. **Test on Replit:** https://spark-wave-1-hakopog916.replit.app
2. **Test locally:** http://localhost:3002
3. **Both should work** with Twitter OAuth

## 🔍 **Troubleshooting:**

If OAuth doesn't work:
1. **Check callback URLs** match exactly
2. **Verify environment variables** are set
3. **Ensure app permissions** are "Read and Write"
4. **Test both localhost and Replit URLs** 