#!/bin/bash

# 🚀 SparkWave Deployment Script

echo "🚀 Starting SparkWave deployment..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install
npm install cors @types/cors

# 2. Build the application
echo "🔨 Building application..."
npm run build

# 3. Create production environment file
echo "⚙️ Creating production environment file..."
cat > .env.production << EOF
# Production Environment Variables for SparkWave

# Server Configuration
PORT=3002
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=https://jaflxjatobiupbrqcrfm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZmx4amF0b2JpdXBicnFjcmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTQ4NzIsImV4cCI6MjA2ODUzMDg3Mn0.V0fpjk8h6h0GaD3VZAzP0fx-JyHBfZe6ihUuGDk4xCU

# Twitter OAuth Configuration
TWITTER_CLIENT_ID=dzY1dU9NcW9MWEVFa09FUmxtcGk6MTpjaQ
TWITTER_CLIENT_SECRET=t0ZhzEjOeXVV8s7Z60alx0_6WsmIUUc0yzszNkm2RCQ0Wu4Flx
TWITTER_CALLBACK_URL=https://your-domain.com/auth/twitter/callback

# A4F AI Configuration
A4F_API_KEY=ddc-a4f-c4646ced53b34fdfa60084c2a56680ac
A4F_MODEL_ID=provider-6/gpt-4o

# Frontend URL (for CORS) - UPDATE THIS WITH YOUR ACTUAL DOMAIN
FRONTEND_URL=https://your-domain.com

# Session Secret - CHANGE THIS IN PRODUCTION
SESSION_SECRET=your-super-secure-session-secret-change-this-in-production
EOF

echo "✅ Production environment file created!"

# 4. Create Procfile for Heroku (if using Heroku)
echo "📄 Creating Procfile..."
echo "web: npm start" > Procfile

# 5. Create vercel.json for Vercel (if using Vercel)
echo "📄 Creating vercel.json..."
cat > vercel.json << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "server/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
EOF

echo "✅ Deployment files created!"

echo ""
echo "🎯 NEXT STEPS:"
echo "1. Update .env.production with your actual domain"
echo "2. Update Twitter Developer Portal callback URL"
echo "3. Deploy to your chosen platform:"
echo "   - Vercel: vercel --prod"
echo "   - Railway: Connect GitHub repo"
echo "   - Render: Connect GitHub repo"
echo "   - Heroku: git push heroku main"
echo ""
echo "🔧 Don't forget to set environment variables in your deployment platform!"
echo "📋 Check deployment-config.md for detailed instructions" 