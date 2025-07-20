const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting Cloudflare Wrangler deployment...');

// Check if wrangler is installed
try {
  execSync('wrangler --version', { stdio: 'pipe' });
  console.log('✅ Wrangler CLI is installed');
} catch (error) {
  console.log('❌ Wrangler CLI not found. Installing...');
  try {
    execSync('npm install -g wrangler', { stdio: 'inherit' });
    console.log('✅ Wrangler CLI installed successfully');
  } catch (installError) {
    console.log('❌ Failed to install Wrangler CLI. Please install manually: npm install -g wrangler');
    process.exit(1);
  }
}

// Create wrangler.toml if it doesn't exist
const wranglerConfig = `name = "sparkwave-app"
main = "server/index.ts"
compatibility_date = "2024-01-01"

[env.production]
name = "sparkwave-app"

[env.production.vars]
NODE_ENV = "production"
PORT = "3002"

# Supabase
SUPABASE_URL = "https://jaflxjatobiupbrqcrfm.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZmx4amF0b2JpdXBicnFjcmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTQ4NzIsImV4cCI6MjA2ODUzMDg3Mn0.V0fpjk8h6h0GaD3VZAzP0fx-JyHBfZe6ihUuGDk4xCU"

# Twitter OAuth
TWITTER_CLIENT_ID = "dzY1dU9NcW9MWEVFa09FUmxtcGk6MTpjaQ"
TWITTER_CLIENT_SECRET = "t0ZhzEjOeXVV8s7Z60alx0_6WsmIUUc0yzszNkm2RCQ0Wu4Flx"
TWITTER_CALLBACK_URL = "https://sparkwave-app.your-subdomain.workers.dev/auth/twitter/callback"

# A4F AI
A4F_API_KEY = "ddc-a4f-c4646ced53b34fdfa60084c2a56680ac"
A4F_MODEL_ID = "provider-6/gpt-4o"

# Frontend URL
FRONTEND_URL = "https://sparkwave-app.your-subdomain.workers.dev"

# Session Secret
SESSION_SECRET = "sparkwave-super-secure-session-secret-2024"

[[env.production.routes]]
pattern = "/*"
script_name = "sparkwave-app"
`;

fs.writeFileSync('wrangler.toml', wranglerConfig);
console.log('✅ Created wrangler.toml configuration');

// Try to login to Cloudflare
console.log('🔐 Logging into Cloudflare...');
try {
  execSync('wrangler login', { stdio: 'inherit' });
  console.log('✅ Logged into Cloudflare successfully');
} catch (loginError) {
  console.log('❌ Login failed. Please login manually: wrangler login');
  process.exit(1);
}

// Try to deploy
console.log('🚀 Deploying to Cloudflare Workers...');
try {
  execSync('wrangler deploy', { stdio: 'inherit' });
  console.log('🎉 Deployment successful!');
  console.log('🌐 Your app should be available at: https://sparkwave-app.your-subdomain.workers.dev');
} catch (deployError) {
  console.log('❌ Deployment failed. Please try manually:');
  console.log('1. Run: wrangler login');
  console.log('2. Run: wrangler deploy');
} 