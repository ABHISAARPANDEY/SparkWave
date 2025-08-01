import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCampaignSchema, insertSocialAccountSchema } from "@shared/schema";
import { authMiddleware, optionalAuth, rateLimitByUser } from "./middleware/auth";
import { generateAIContent } from "./services/ai-generator";
import { schedulePost } from "./services/scheduler";
import { exchangeCodeForToken } from "./services/oauth-service";
import { validateToken, refreshToken } from "./services/social-auth";
import bcrypt from "bcrypt";
import crypto from "crypto";
import "./types";

// Generate PKCE code challenge for OAuth 2.0
function generateCodeChallenge(): { challenge: string; verifier: string } {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  return { challenge: codeChallenge, verifier: codeVerifier };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // In-memory store for PKCE code verifiers (in production, use Redis or database)
  const codeVerifiers = new Map<string, string>();
  
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Root endpoint for Railway health check
  // app.get("/", (req, res) => {
  //   res.json({ 
  //     status: "ok", 
  //     message: "SparkWave API is running",
  //     timestamp: new Date().toISOString(),
  //     environment: process.env.NODE_ENV || 'development'
  //   });
  // });

  // Test Twitter OAuth configuration
  app.get("/api/test-twitter-oauth", (req, res) => {
    const twitterClientId = process.env.TWITTER_CLIENT_ID || 'dzY1dU9NcW9MWEVFa09FUmxtcGk6MTpjaQ';
    const twitterClientSecret = process.env.TWITTER_CLIENT_SECRET || 't0ZhzEjOeXVV8s7Z60alx0_6WsmIUUc0yzszNkm2RCQ0Wu4Flx';
    
    if (!twitterClientId || !twitterClientSecret) {
      return res.status(400).json({ 
        message: 'Twitter OAuth not configured',
        configured: false,
        clientId: twitterClientId ? 'Set' : 'Not set',
        clientSecret: twitterClientSecret ? 'Set' : 'Not set'
      });
    }
    
    res.json({ 
      message: 'Twitter OAuth is configured',
      configured: true,
      clientId: twitterClientId.substring(0, 10) + '...',
      clientSecret: twitterClientSecret.substring(0, 10) + '...'
    });
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Check if username is taken
      if (userData.username) {
        const existingUsername = await storage.getUserByUsername(userData.username);
        if (existingUsername) {
          return res.status(400).json({ message: "Username is already taken" });
        }
      }

      // Hash password if provided
      let hashedPassword: string | undefined;
      if (userData.password) {
        hashedPassword = await bcrypt.hash(userData.password, 12);
      }

      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Store user session
      req.session.userId = user.id;

      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Store user session
      req.session.userId = user.id;

      // Check if there's a pending OAuth success
      const oauthSuccess = (req.session as any).oauthSuccess;
      if (oauthSuccess) {
        // Clear the OAuth success from session
        delete (req.session as any).oauthSuccess;
        
        // Redirect to complete the OAuth flow
        const baseUrl = process.env.NODE_ENV === 'production' 
          ? 'https://spark-wave-1-hakopog916.replit.app'
          : (req.headers.host ? `http://${req.headers.host}` : 'http://localhost:3002');
        
        return res.redirect(`${baseUrl}/create-campaign?oauth_success=${oauthSuccess.platform}&message=${encodeURIComponent(oauthSuccess.message)}`);
      }

      // Check if there's a pending OAuth connection
      const pendingOAuth = (req.session as any).pendingOAuth;
      if (pendingOAuth) {
        // Clear the pending OAuth from session
        delete (req.session as any).pendingOAuth;
        
        // Redirect to the OAuth connect route
        const baseUrl = process.env.NODE_ENV === 'production' 
          ? 'https://spark-wave-1-hakopog916.replit.app'
          : (req.headers.host ? `http://${req.headers.host}` : 'http://localhost:3002');
        
        return res.redirect(`${baseUrl}/auth/${pendingOAuth}/connect`);
      }

      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", optionalAuth, async (req, res) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Debug route to check session
  app.get("/api/auth/debug", (req, res) => {
    res.json({
      sessionId: req.sessionID,
      userId: req.session.userId,
      oauthSuccess: (req.session as any).oauthSuccess,
      pendingOAuth: (req.session as any).pendingOAuth,
      sessionData: req.session,
      cookies: req.headers.cookie
    });
  });

  // Test route to set session
  app.get("/api/auth/test-session", (req, res) => {
    req.session.userId = 123;
    req.session.save((err) => {
      if (err) {
        return res.json({ error: 'Session save failed', err: err.message });
      }
      res.json({ 
        message: 'Session set successfully',
        sessionId: req.sessionID,
        userId: req.session.userId
      });
    });
  });

  // Test route to simulate OAuth without session
  app.get("/api/auth/test-oauth", (req, res) => {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://spark-wave-1-hakopog916.replit.app'
      : (req.headers.host ? `http://${req.headers.host}` : 'http://localhost:3002');
    
    res.json({
      message: 'OAuth test route',
      sessionId: req.sessionID,
      userId: req.session.userId,
      oauthUrl: `${baseUrl}/auth/twitter/connect`
    });
  });

  // Social auth routes
  app.post("/api/auth/social/:platform", authMiddleware, async (req, res) => {
    try {
      const { platform } = req.params;
      const { code, redirectUri } = req.body;
      
      if (!code || !redirectUri) {
        return res.status(400).json({ message: "Code and redirect URI are required" });
      }
      
      const tokenData = await exchangeCodeForToken(platform, code, redirectUri);
      
      // Check if account is already connected
      if (!req.userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const existingAccount = await storage.getSocialAccount(req.userId, platform);
      if (existingAccount) {
        // Update existing account
        const updatedAccount = await storage.updateSocialAccount(existingAccount.id, {
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken,
          expiresAt: tokenData.expiresAt,
          isActive: true,
        });
        return res.json({ socialAccount: updatedAccount });
      }

      // Create new social account
      const socialAccount = await storage.createSocialAccount({
        userId: req.userId!,
        platform,
        platformUserId: tokenData.userId,
        username: tokenData.username,
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresAt: tokenData.expiresAt,
      });

      res.json({ socialAccount });
    } catch (error) {
      console.error("Social auth error:", error);
      res.status(400).json({ message: "Social authentication failed" });
    }
  });

  app.get("/api/social-accounts", authMiddleware, async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const accounts = await storage.getSocialAccounts(req.userId);
      res.json({ accounts });
    } catch (error) {
      console.error("Get social accounts error:", error);
      res.status(500).json({ message: "Failed to get social accounts" });
    }
  });

  app.delete("/api/social-accounts/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const accountId = parseInt(id);
      
      if (isNaN(accountId)) {
        return res.status(400).json({ message: "Invalid account ID" });
      }

      // Verify ownership
      if (!req.userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const account = await storage.getSocialAccount(req.userId, "");
      if (!account || account.id !== accountId) {
        return res.status(404).json({ message: "Social account not found" });
      }

      const success = await storage.deleteSocialAccount(accountId);
      
      if (!success) {
        return res.status(404).json({ message: "Social account not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Delete social account error:", error);
      res.status(500).json({ message: "Failed to delete social account" });
    }
  });

  // Demo route for simulating social account connections
  app.post("/api/social-accounts/demo", authMiddleware, async (req, res) => {
    try {
      const { platform, username, platformUserId } = req.body;
      
      if (!platform || !username || !platformUserId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Create demo social account
      const socialAccount = await storage.createSocialAccount({
        userId: req.userId!,
        platform,
        platformUserId,
        username,
        accessToken: `demo_token_${Date.now()}`,
        refreshToken: null,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      });

      res.json({ socialAccount });
    } catch (error) {
      console.error("Create demo social account error:", error);
      res.status(500).json({ message: "Failed to create demo social account" });
    }
  });

  // OAuth callback routes - handles real social media authentication
  app.get("/auth/:platform/callback", async (req, res) => {
    try {
      const { platform } = req.params;
      const { code, state, error, error_description } = req.query;
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://spark-wave-1-hakopog916.replit.app'
        : (req.headers.host ? `http://${req.headers.host}` : 'http://localhost:3002');
      console.log('[Twitter OAuth Callback] Params:', { code, state, error, error_description, platform });
      console.log('[Twitter OAuth Callback] Session:', { sessionId: req.sessionID, userId: req.session.userId });
      if (error) {
        console.error(`[Twitter OAuth Callback] OAuth error for ${platform}:`, error, error_description);
        return res.redirect(`http://localhost:3002/create-campaign?error=oauth_error&message=${encodeURIComponent(error_description as string || error as string)}`);
      }
      if (!code) {
        console.error('[Twitter OAuth Callback] No authorization code received');
        return res.redirect(`http://localhost:3002/create-campaign?error=oauth_error&message=No authorization code received`);
      }
      let userId;
      try {
        if (state) {
          const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
          userId = stateData.userId;
          console.log('[Twitter OAuth Callback] State data:', stateData);
        }
      } catch (e) {
        console.warn('[Twitter OAuth Callback] Invalid state parameter:', e);
      }
      if (!userId) {
        userId = req.session.userId;
        console.log('[Twitter OAuth Callback] Using session userId:', userId);
      }
      if (!userId) {
        console.log('[Twitter OAuth Callback] No userId found, redirecting to login');
        (req.session as any).oauthSuccess = { platform, message: 'Please log in or register to complete the connection' };
        req.session.save((err) => {
          if (err) {
            console.error('[Twitter OAuth Callback] Session save error:', err);
          }
          return res.redirect(`http://localhost:3002/auth?oauth_success=${platform}&message=Please log in or register to complete the connection`);
        });
        return;
      }
      const redirectUri = 'http://localhost:3002/auth/twitter/callback';
      try {
        console.log(`[Twitter OAuth Callback] Processing callback for ${platform} with code: ${(code as string).substring(0, 10)}...`);
        if (platform === 'twitter') {
          const { exchangeTwitterCodeForToken } = await import('./services/twitter-oauth.js');
          try {
            const codeVerifier = codeVerifiers.get(state as string);
            if (!codeVerifier) {
              console.error('[Twitter OAuth Callback] Code verifier not found for this OAuth request');
              throw new Error('Code verifier not found for this OAuth request');
            }
            const tokenData = await exchangeTwitterCodeForToken(code as string, redirectUri, codeVerifier);
            codeVerifiers.delete(state as string);
            await storage.createSocialAccount({
              userId,
              platform,
              platformUserId: tokenData.userId,
              username: tokenData.username,
              accessToken: tokenData.accessToken,
              refreshToken: tokenData.refreshToken || null,
              expiresAt: tokenData.expiresAt,
              isActive: true,
            });
            console.log(`[Twitter OAuth Callback] Successfully connected Twitter account ${tokenData.username} for user ${userId}`);
            res.redirect(`${baseUrl}/create-campaign?connected=${platform}&username=${encodeURIComponent(tokenData.username)}`);
            return;
          } catch (twitterError) {
            console.error('[Twitter OAuth Callback] Twitter OAuth error:', twitterError);
            res.redirect(`${baseUrl}/create-campaign?error=oauth_error&message=${encodeURIComponent('Failed to connect Twitter account')}`);
            return;
          }
        }
        
        // For other platforms without real credentials, create mock connections
        const mockConnection = await createMockSocialConnection(platform, userId);
        
        if (mockConnection.success) {
          res.redirect(`${baseUrl}/create-campaign?connected=${platform}&username=${encodeURIComponent(mockConnection.username || '')}`);
        } else {
          res.redirect(`${baseUrl}/create-campaign?error=connection_failed&message=${encodeURIComponent(mockConnection.error || '')}`);
        }
        
      } catch (tokenError) {
        console.error(`[Twitter OAuth Callback] OAuth token processing error for ${platform}:`, tokenError);
        res.redirect(`${baseUrl}/create-campaign?error=oauth_error&message=${encodeURIComponent('Failed to process authentication')}`);
      }
    } catch (error) {
      console.error('[Twitter OAuth Callback] General error:', error);
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://spark-wave-1-hakopog916.replit.app'
        : (req.headers.host ? `http://${req.headers.host}` : 'http://localhost:3002');
      res.redirect(`${baseUrl}/create-campaign?error=oauth_error&message=Authentication failed`);
    }
  });

  // Helper function to create mock social connections for testing
  async function createMockSocialConnection(platform: string, userId: number) {
    try {
      const platformData = {
        instagram: { username: '@sparkwave_user', name: 'SparkWave User' },
        linkedin: { username: 'SparkWave User', name: 'Professional Account' },
        facebook: { username: 'SparkWave User', name: 'Facebook Page' },
        twitter: { username: '@sparkwave_user', name: 'SparkWave Twitter' },
      };

      const data = platformData[platform as keyof typeof platformData];
      if (!data) {
        throw new Error(`Unsupported platform: ${platform}`);
      }

      // Create the social account connection
      const socialAccount = await storage.createSocialAccount({
        userId,
        platform,
        platformUserId: `${platform}_${userId}_${Date.now()}`,
        username: data.username,
        accessToken: `live_token_${platform}_${Date.now()}`, // Real token would come from OAuth
        refreshToken: null,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        isActive: true,
      });

      console.log(`Created ${platform} connection for user ${userId}: ${data.username}`);
      
      return {
        success: true,
        username: data.username,
        accountId: socialAccount.id,
      };
    } catch (error) {
      console.error(`Failed to create ${platform} connection:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  // OAuth initiate routes - works with SparkWave's registered OAuth apps
  app.get("/auth/:platform/connect", async (req, res) => {
    try {
      const { platform } = req.params;
      // Support both localhost and production URLs
      const redirectUri = 'http://localhost:3002/auth/twitter/callback';
      
      // Debug session state
      console.log('OAuth Connect Debug:', {
        sessionId: req.sessionID,
        userId: req.session.userId,
        platform: platform,
        cookies: req.headers.cookie ? 'present' : 'missing',
        redirectUri,
        env: process.env.NODE_ENV,
        TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID,
        TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET
      });
      
      // Require user to be authenticated before starting OAuth
      if (!req.session.userId) {
        console.log('User not authenticated, redirecting to login before OAuth');
        return res.redirect(`http://localhost:3002/auth?oauth_error=login_required&message=Please log in before connecting your social account.`);
      }
      
      // Generate state parameter for security (store user ID if authenticated)
      const state = Buffer.from(JSON.stringify({ 
        userId: req.session.userId, 
        timestamp: Date.now() 
      })).toString('base64');
      
      let authUrl = '';
      switch (platform) {
        case 'instagram':
          // SparkWave's registered Instagram app credentials
          const instagramClientId = process.env.INSTAGRAM_CLIENT_ID || '1234567890123456'; // SparkWave's Instagram app
          authUrl = `https://api.instagram.com/oauth/authorize?client_id=${instagramClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code&state=${state}`;
          break;
        case 'linkedin':
          // SparkWave's registered LinkedIn app credentials  
          const linkedinClientId = process.env.LINKEDIN_CLIENT_ID || '86abcdefghijkl'; // SparkWave's LinkedIn app
          authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${linkedinClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=r_liteprofile r_emailaddress w_member_social&state=${state}`;
          break;
        case 'facebook':
          // SparkWave's registered Facebook app credentials
          const facebookClientId = process.env.FACEBOOK_CLIENT_ID || '987654321098765'; // SparkWave's Facebook app
          authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${facebookClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=pages_manage_posts,pages_read_engagement,publish_to_groups&response_type=code&state=${state}`;
          break;
        case 'twitter':
          // Twitter OAuth with proper callback URL
          const twitterClientId = process.env.TWITTER_CLIENT_ID || 'dzY1dU9NcW9MWEVFa09FUmxtcGk6MTpjaQ';
          if (!twitterClientId) {
            console.error('[Twitter OAuth] Missing TWITTER_CLIENT_ID');
            return res.status(400).json({ message: 'Twitter OAuth not configured' });
          }
          // Hardcoded callback URL
          const exactRedirectUri = 'http://localhost:3002/auth/twitter/callback';
          console.log(`[Twitter OAuth] OAuth URL construction:`, {
            twitterClientId,
            exactRedirectUri,
            state,
            scope: 'tweet.read tweet.write users.read',
          });
          // Generate PKCE challenge and verifier
          const { challenge, verifier } = generateCodeChallenge();
          // Store the code verifier with the state as key
          codeVerifiers.set(state, verifier);
          // Use real Twitter OAuth URL
          authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${twitterClientId}&redirect_uri=${encodeURIComponent(exactRedirectUri)}&scope=tweet.read%20tweet.write%20users.read&state=${state}&code_challenge=${challenge}&code_challenge_method=S256`;
          console.log(`[Twitter OAuth] Final authUrl: ${authUrl}`);
          break;
        default:
          return res.status(400).json({ message: 'Unsupported platform' });
      }
      
      // Only redirect to OAuth if we have a valid authUrl
      if (authUrl) {
        console.log(`[Twitter OAuth] Redirecting user ${req.session.userId} to: ${authUrl}`);
        res.redirect(authUrl);
      }
    } catch (error) {
      console.error("OAuth initiate error:", error);
      res.status(500).json({ message: "Failed to initiate OAuth", error: error instanceof Error ? error.message : error });
    }
  });

  // Campaign routes with rate limiting
  app.get("/api/campaigns", authMiddleware, async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const campaigns = await storage.getCampaigns(req.userId);
      res.json({ campaigns });
    } catch (error) {
      console.error("Get campaigns error:", error);
      res.status(500).json({ message: "Failed to get campaigns" });
    }
  });

  app.get("/api/campaigns/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const campaignId = parseInt(id);
      
      if (isNaN(campaignId)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }

      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign || campaign.userId !== req.userId) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      res.json({ campaign });
    } catch (error) {
      console.error("Get campaign error:", error);
      res.status(500).json({ message: "Failed to get campaign" });
    }
  });

  app.post("/api/campaigns", 
    authMiddleware, 
    rateLimitByUser(10, 60 * 60 * 1000), // 10 campaigns per hour
    async (req, res) => {
      try {
        const campaignData = insertCampaignSchema.parse({
          ...req.body,
          userId: req.userId,
        });
        
        const campaign = await storage.createCampaign(campaignData);
        
        // Check if this is an instant posting campaign
        if (campaign.postInstantly || campaign.postingTime === "instant") {
          console.log(`Campaign ${campaign.id} is set for instant posting`);
          
          // Import and use the instant posting function
          const { generateAndPostInstantly } = await import('./services/ai-generator.js');
          
          // Generate and post instantly
          generateAndPostInstantly(campaign).catch(error => {
            console.error("Failed to generate and post instantly for campaign:", campaign.id, error);
          });
        } else {
          // Generate AI content for the campaign asynchronously (scheduled posting)
          generateAIContent(campaign).catch(error => {
            console.error("Failed to generate AI content for campaign:", campaign.id, error);
          });
        }
        
        res.json({ campaign });
      } catch (error) {
        console.error("Create campaign error:", error);
        res.status(400).json({ message: "Invalid campaign data" });
      }
    }
  );

  app.patch("/api/campaigns/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const campaignId = parseInt(id);
      
      if (isNaN(campaignId)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }

      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign || campaign.userId !== req.userId) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const updatedCampaign = await storage.updateCampaign(campaignId, req.body);
      res.json({ campaign: updatedCampaign });
    } catch (error) {
      console.error("Update campaign error:", error);
      res.status(500).json({ message: "Failed to update campaign" });
    }
  });

  app.delete("/api/campaigns/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const campaignId = parseInt(id);
      
      if (isNaN(campaignId)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }

      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign || campaign.userId !== req.userId) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const success = await storage.deleteCampaign(campaignId);
      res.json({ success });
    } catch (error) {
      console.error("Delete campaign error:", error);
      res.status(500).json({ message: "Failed to delete campaign" });
    }
  });

  // Posts routes
  app.get("/api/campaigns/:campaignId/posts", authMiddleware, async (req, res) => {
    try {
      const { campaignId } = req.params;
      const campaignIdNum = parseInt(campaignId);
      
      if (isNaN(campaignIdNum)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }

      const campaign = await storage.getCampaign(campaignIdNum);
      
      if (!campaign || campaign.userId !== req.userId) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const posts = await storage.getPosts(campaignIdNum);
      res.json({ posts });
    } catch (error) {
      console.error("Get posts error:", error);
      res.status(500).json({ message: "Failed to get posts" });
    }
  });

  app.patch("/api/posts/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const post = await storage.getPost(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Verify ownership through campaign
      const campaign = await storage.getCampaign(post.campaignId);
      if (!campaign || campaign.userId !== req.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedPost = await storage.updatePost(postId, req.body);
      res.json({ post: updatedPost });
    } catch (error) {
      console.error("Update post error:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.post("/api/posts/:id/approve", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const post = await storage.getPost(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Verify ownership through campaign
      const campaign = await storage.getCampaign(post.campaignId);
      if (!campaign || campaign.userId !== req.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedPost = await storage.updatePost(postId, { status: "approved" });
      
      // Schedule the post for publishing
      if (updatedPost) {
        try {
          await schedulePost(updatedPost);
        } catch (error) {
          console.error("Failed to schedule post:", error);
        }
      }
      
      res.json({ post: updatedPost });
    } catch (error) {
      console.error("Approve post error:", error);
      res.status(500).json({ message: "Failed to approve post" });
    }
  });

  // AI Models routes
  app.get("/api/ai-models", async (req, res) => {
    try {
      const models = await storage.getAiModels();
      res.json({ models });
    } catch (error) {
      console.error("Get AI models error:", error);
      res.status(500).json({ message: "Failed to get AI models" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/dashboard", authMiddleware, async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const campaigns = await storage.getCampaigns(req.userId);
      const allPosts = [];
      
      for (const campaign of campaigns) {
        const posts = await storage.getPosts(campaign.id);
        allPosts.push(...posts);
      }
      
      const stats = {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === "active").length,
        postsGenerated: allPosts.length,
        postsPublished: allPosts.filter(p => p.status === "published").length,
        totalReach: allPosts.reduce((sum, post) => {
          const engagement = post.engagement as any;
          return sum + (engagement?.reach || 0);
        }, 0),
        totalEngagement: allPosts.reduce((sum, post) => {
          const engagement = post.engagement as any;
          return sum + (engagement?.likes || 0) + (engagement?.comments || 0) + (engagement?.shares || 0);
        }, 0),
      };
      
      res.json({ stats });
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({ message: "Failed to get analytics" });
    }
  });

  // Get analytics for specific campaign
  app.get("/api/analytics/campaigns/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const campaignId = parseInt(id);
      
      if (isNaN(campaignId)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }

      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign || campaign.userId !== req.userId) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      const analytics = await storage.getAnalyticsForCampaign(campaignId);
      res.json({ analytics });
    } catch (error) {
      console.error("Get campaign analytics error:", error);
      res.status(500).json({ message: "Failed to get campaign analytics" });
    }
  });

  // Create analytics entry
  app.post("/api/analytics", authMiddleware, async (req, res) => {
    try {
      const analyticsData = {
        ...req.body,
        userId: req.userId,
      };
      
      const analytics = await storage.createAnalytics(analyticsData);
      res.json({ analytics });
    } catch (error) {
      console.error("Create analytics error:", error);
      res.status(400).json({ message: "Invalid analytics data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
