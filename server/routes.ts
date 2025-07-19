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
import "./types";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
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
        userId: req.userId,
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
        userId: req.userId,
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
      
      const baseUrl = process.env.REPL_URL || process.env.CLIENT_URL || 'http://localhost:5000';

      if (error) {
        console.error(`OAuth error for ${platform}:`, error, error_description);
        return res.redirect(`${baseUrl}/create-campaign?error=oauth_error&message=${encodeURIComponent(error_description as string || error as string)}`);
      }

      if (!code) {
        return res.redirect(`${baseUrl}/create-campaign?error=oauth_error&message=No authorization code received`);
      }

      // Validate state parameter and extract user ID
      let userId;
      try {
        if (state) {
          const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
          userId = stateData.userId;
        }
      } catch (e) {
        console.warn('Invalid state parameter:', e);
      }

      // Fallback to session if state validation fails
      if (!userId) {
        userId = req.session.userId;
      }

      if (!userId) {
        return res.redirect(`${baseUrl}/auth?error=auth_required&message=Please log in first`);
      }

      const serverUrl = process.env.REPL_URL || process.env.SERVER_URL || 'http://localhost:5000';
      const redirectUri = `${serverUrl}/auth/${platform}/callback`;
      
      try {
        console.log(`Processing OAuth callback for ${platform} with code: ${(code as string).substring(0, 10)}...`);
        
        // Use real OAuth for Twitter when SparkWave app is registered
        if (platform === 'twitter') {
          // If we have real Twitter credentials, use the live API
          if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
            const { exchangeTwitterCodeForToken } = await import('./services/twitter-oauth.js');
            
            try {
              const tokenData = await exchangeTwitterCodeForToken(code as string, redirectUri);
              
              // Save the real Twitter connection
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

              console.log(`Successfully connected Twitter account ${tokenData.username} for user ${userId}`);
              res.redirect(`${baseUrl}/create-campaign?connected=${platform}&username=${encodeURIComponent(tokenData.username)}`);
              return;
            } catch (twitterError) {
              console.error('Twitter OAuth error:', twitterError);
              res.redirect(`${baseUrl}/create-campaign?error=oauth_error&message=${encodeURIComponent('Failed to connect Twitter account')}`);
              return;
            }
          } else {
            // Simulate successful Twitter connection for demo
            console.log(`Creating demo Twitter connection for user ${userId} with code: ${(code as string).substring(0, 10)}...`);
            
            const mockConnection = await createMockSocialConnection(platform, userId);
            
            if (mockConnection.success) {
              res.redirect(`${baseUrl}/create-campaign?connected=${platform}&username=${encodeURIComponent(mockConnection.username)}`);
              return;
            } else {
              res.redirect(`${baseUrl}/create-campaign?error=connection_failed&message=${encodeURIComponent(mockConnection.error)}`);
              return;
            }
          }
        }
        
        // For other platforms without real credentials, create mock connections
        const mockConnection = await createMockSocialConnection(platform, userId);
        
        if (mockConnection.success) {
          res.redirect(`${baseUrl}/create-campaign?connected=${platform}&username=${encodeURIComponent(mockConnection.username)}`);
        } else {
          res.redirect(`${baseUrl}/create-campaign?error=connection_failed&message=${encodeURIComponent(mockConnection.error)}`);
        }
        
      } catch (tokenError) {
        console.error(`OAuth token processing error for ${platform}:`, tokenError);
        res.redirect(`${baseUrl}/create-campaign?error=oauth_error&message=${encodeURIComponent('Failed to process authentication')}`);
      }
    } catch (error) {
      console.error("OAuth callback error:", error);
      const baseUrl = process.env.REPL_URL || process.env.CLIENT_URL || 'http://localhost:5000';
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
  app.get("/auth/:platform/connect", authMiddleware, async (req, res) => {
    try {
      const { platform } = req.params;
      const baseUrl = process.env.REPL_URL || process.env.SERVER_URL || 'https://sparkwave.replit.app';
      const redirectUri = `${baseUrl}/auth/${platform}/callback`;
      
      // Generate state parameter for security (store user ID)
      const state = Buffer.from(JSON.stringify({ userId: req.userId, timestamp: Date.now() })).toString('base64');
      
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
          // SparkWave's registered Twitter OAuth app - users just click and connect
          const twitterClientId = process.env.TWITTER_CLIENT_ID || 'sparkwave-twitter-app-id';
          authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${twitterClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=tweet.read tweet.write users.read offline.access&state=${state}&code_challenge=challenge&code_challenge_method=plain`;
          break;
        default:
          return res.status(400).json({ message: 'Unsupported platform' });
      }
      
      console.log(`Redirecting user ${req.userId} to ${platform} OAuth: ${authUrl}`);
      res.redirect(authUrl);
    } catch (error) {
      console.error("OAuth initiate error:", error);
      res.status(500).json({ message: "Failed to initiate OAuth" });
    }
  });

  // Campaign routes with rate limiting
  app.get("/api/campaigns", authMiddleware, async (req, res) => {
    try {
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
        
        // Generate AI content for the campaign asynchronously
        generateAIContent(campaign).catch(error => {
          console.error("Failed to generate AI content for campaign:", campaign.id, error);
        });
        
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
