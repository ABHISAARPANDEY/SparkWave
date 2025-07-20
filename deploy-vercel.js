const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting Vercel deployment...');

// Check if vercel is installed
try {
  execSync('vercel --version', { stdio: 'pipe' });
  console.log('✅ Vercel CLI is installed');
} catch (error) {
  console.log('❌ Vercel CLI not found. Installing...');
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log('✅ Vercel CLI installed successfully');
  } catch (installError) {
    console.log('❌ Failed to install Vercel CLI. Please install manually: npm install -g vercel');
    process.exit(1);
  }
}

// Create .env.production file
const envContent = `# Production Environment Variables for SparkWave

# Server Configuration
PORT=3002
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=https://jaflxjatobiupbrqcrfm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZmx4amF0b2JpdXBicnFjcmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTQ4NzIsImV4cCI6MjA2ODUzMDg3Mn0.V0fpjk8h6h0GaD3VZAzP0fx-JyHBfZe6ihUuGDk4xCU

# Twitter OAuth Configuration
TWITTER_CLIENT_ID=dzY1dU9NcW9MWEVFa09FUmxtcGk6MTpjaQ
TWITTER_CLIENT_SECRET=t0ZhzEjOeXVV8s7Z60alx0_6WsmIUUc0yzszNkm2RCQ0Wu4Flx
TWITTER_CALLBACK_URL=https://sparkwave-app.vercel.app/auth/twitter/callback

# A4F AI Configuration
A4F_API_KEY=ddc-a4f-c4646ced53b34fdfa60084c2a56680ac
A4F_MODEL_ID=provider-6/gpt-4o

# Frontend URL (for CORS)
FRONTEND_URL=https://sparkwave-app.vercel.app

# Session Secret
SESSION_SECRET=sparkwave-super-secure-session-secret-2024
`;

fs.writeFileSync('.env.production', envContent);
console.log('✅ Created .env.production file');

// Try to deploy
console.log('🚀 Deploying to Vercel...');
try {
  execSync('vercel --prod --yes', { stdio: 'inherit' });
  console.log('🎉 Deployment successful!');
} catch (deployError) {
  console.log('❌ Deployment failed. Please try manually:');
  console.log('1. Run: vercel login');
  console.log('2. Run: vercel --prod');
} 