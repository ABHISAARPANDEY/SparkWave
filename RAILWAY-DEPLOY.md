# Railway Deployment Guide for SparkWave

This guide will help you deploy SparkWave to Railway successfully.

## Prerequisites

1. A Railway account (free tier available)
2. A Supabase project for the database
3. Social media app credentials (Twitter, Instagram, LinkedIn, Facebook)

## Step 1: Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Connect your GitHub account and select the SparkWave repository

## Step 2: Configure Environment Variables

In your Railway project dashboard, go to the "Variables" tab and add the following environment variables:

### Database Configuration
```
DATABASE_URL=your_supabase_database_url_here
```

### Session Security
```
SESSION_SECRET=your_secure_random_string_here
```

### AI Service (Optional)
```
A4F_API_KEY=your_a4f_api_key_here
```

### Social Media OAuth Credentials

#### Twitter
```
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
```

#### Instagram
```
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
```

#### LinkedIn
```
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

#### Facebook
```
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
```

### Production URLs
```
NODE_ENV=production
FRONTEND_URL=https://your-railway-app-url.railway.app
```

## Step 3: Deploy

1. Railway will automatically detect the Dockerfile and start building
2. The build process will:
   - Install dependencies
   - Build the client-side application
   - Build the server-side application
   - Create a production-ready Docker image

## Step 4: Configure Custom Domain (Optional)

1. In your Railway project, go to "Settings"
2. Click "Custom Domains"
3. Add your custom domain
4. Update the `FRONTEND_URL` environment variable with your custom domain

## Step 5: Update OAuth Redirect URLs

After deployment, update your social media app redirect URLs to point to your Railway domain:

### Twitter
- Redirect URI: `https://your-railway-app-url.railway.app/auth/twitter/callback`

### Instagram
- Redirect URI: `https://your-railway-app-url.railway.app/auth/instagram/callback`

### LinkedIn
- Redirect URI: `https://your-railway-app-url.railway.app/auth/linkedin/callback`

### Facebook
- Redirect URI: `https://your-railway-app-url.railway.app/auth/facebook/callback`

## Troubleshooting

### Build Issues
If you encounter build issues:

1. **Permission Denied Error**: The Dockerfile now uses proper permissions and non-root user
2. **Vite Build Error**: The build script now uses `npx` to ensure proper execution
3. **Missing Dependencies**: All dependencies are properly installed in the Docker build

### Runtime Issues
If the app doesn't start:

1. Check the Railway logs for error messages
2. Verify all environment variables are set correctly
3. Ensure the database URL is accessible from Railway

### Database Connection Issues
1. Make sure your Supabase database allows connections from Railway's IP ranges
2. Verify the DATABASE_URL is correct and includes all necessary parameters

## Monitoring

Railway provides built-in monitoring:
- View logs in real-time
- Monitor resource usage
- Set up alerts for downtime

## Scaling

Railway allows you to scale your application:
- Upgrade to paid plans for more resources
- Add multiple instances for high availability
- Configure auto-scaling based on traffic

## Security Notes

1. Never commit environment variables to your repository
2. Use strong, unique session secrets
3. Regularly rotate API keys
4. Enable HTTPS (Railway provides this automatically)

## Support

If you encounter issues:
1. Check the Railway documentation
2. Review the application logs
3. Verify all environment variables are set correctly
4. Ensure your database is accessible

## Quick Deploy Commands

If you prefer using Railway CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link your project
railway link

# Deploy
railway up
```

## Environment Variables Summary

Here's a complete list of all environment variables needed:

```bash
# Required
DATABASE_URL=your_supabase_database_url
SESSION_SECRET=your_secure_session_secret
NODE_ENV=production

# Optional (for AI features)
A4F_API_KEY=your_a4f_api_key

# Social Media OAuth (set these if you want social media integration)
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# Production URLs
FRONTEND_URL=https://your-railway-app-url.railway.app
```

Your SparkWave application should now be successfully deployed on Railway! 