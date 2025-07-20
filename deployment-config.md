# 🚀 SparkWave Deployment Configuration

## 📋 Pre-Deployment Checklist

### 1. **Twitter Developer Portal Updates**

**Go to:** https://developer.twitter.com/en/portal/dashboard

**Update these URLs:**
- **Callback URL:** `https://your-domain.com/auth/twitter/callback`
- **Website URL:** `https://your-domain.com`
- **App permissions:** Ensure you have "Read and Write" permissions

### 2. **Environment Variables**

**Create a `.env.production` file:**

```env
# Server Configuration
PORT=3002
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=https://jaflxjatobiupbrqcrfm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZmx4amF0b2JpdXBicnFjcmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTQ4NzIsImV4cCI6MjA2ODUzMDg3Mn0.V0fpjk8h6h0GaD3VZAzP0fx-JyHBfZe6ihUuGDk4xCU

# Twitter OAuth Configuration
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_CALLBACK_URL=https://your-domain.com/auth/twitter/callback

# A4F AI Configuration
A4F_API_KEY=ddc-a4f-c4646ced53b34fdfa60084c2a56680ac
A4F_MODEL_ID=provider-6/gpt-4o

# Frontend URL (for CORS)
FRONTEND_URL=https://your-domain.com
```

### 3. **Server Configuration Updates**

**Update `server/index.ts`:**
```typescript
// Add CORS configuration for production
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

**Update `server/routes.ts`:**
```typescript
// Update OAuth redirect URLs
const TWITTER_REDIRECT_URI = process.env.TWITTER_CALLBACK_URL || 'http://localhost:3002/auth/twitter/callback';
```

### 4. **Frontend Configuration**

**Update `client/src/lib/auth.tsx`:**
```typescript
// Update API base URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com/api' 
  : 'http://localhost:3002/api';
```

### 5. **Vite Configuration**

**Update `vite.config.ts`:**
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production' 
          ? 'https://your-domain.com' 
          : 'http://localhost:3002',
        changeOrigin: true
      }
    }
  }
});
```

## 🌍 **Deployment Platforms**

### **Option 1: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Option 2: Railway**
```bash
# Connect your GitHub repo
# Railway will auto-deploy on push
```

### **Option 3: Render**
```bash
# Connect your GitHub repo
# Set environment variables in dashboard
```

### **Option 4: Heroku**
```bash
# Create Procfile
echo "web: npm start" > Procfile

# Deploy
heroku create your-app-name
git push heroku main
```

## 🔧 **Post-Deployment Steps**

1. **Test OAuth Flow:**
   - Try logging in with Twitter
   - Verify callback works correctly

2. **Test AI Integration:**
   - Create a test campaign
   - Verify A4F API works in production

3. **Test Database:**
   - Verify Supabase connection works
   - Check if data is being saved correctly

4. **Monitor Logs:**
   - Check for any CORS errors
   - Monitor API response times

## 🚨 **Common Issues & Solutions**

### **CORS Errors:**
```typescript
// Add to server
app.use(cors({
  origin: ['https://your-domain.com', 'http://localhost:5173'],
  credentials: true
}));
```

### **Environment Variables Not Loading:**
```bash
# Make sure to set in deployment platform
NODE_ENV=production
```

### **OAuth Callback Issues:**
- Double-check callback URL in Twitter Developer Portal
- Ensure HTTPS is used in production
- Verify redirect URI matches exactly

## 📞 **Support**

If you encounter issues:
1. Check deployment platform logs
2. Verify all environment variables are set
3. Test OAuth flow step by step
4. Check Supabase connection in production 