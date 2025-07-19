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

  // OAuth callback routes
  app.get("/auth/:platform/callback", async (req, res) => {
    try {
      const { platform } = req.params;
      const { code, state, error } = req.query;

      if (error) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5000'}?error=oauth_error&message=${encodeURIComponent(error as string)}`);
      }

      if (!code) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5000'}?error=oauth_error&message=No authorization code received`);
      }

      // Use state parameter to get user session (in production, implement proper state validation)
      const userId = req.session.userId;
      if (!userId) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5000'}?error=auth_required&message=Please log in first`);
      }

      const redirectUri = `${process.env.SERVER_URL || 'http://localhost:5000'}/auth/${platform}/callback`;
      
      try {
        const tokenData = await exchangeCodeForToken(platform, code as string, redirectUri);
        
        // Save the social account to database
        await storage.createSocialAccount({
          userId,
          platform,
          platformUserId: tokenData.userId,
          username: tokenData.username,
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken,
          expiresAt: tokenData.expiresAt,
        });

        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5000'}/create-campaign?connected=${platform}`);
      } catch (tokenError) {
        console.error(`OAuth token exchange error for ${platform}:`, tokenError);
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5000'}?error=oauth_error&message=${encodeURIComponent(tokenError.message)}`);
      }
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5000'}?error=oauth_error&message=Authentication failed`);
    }
  });

  // OAuth initiate routes (for server-side redirects if needed)
  app.get("/auth/:platform/connect", authMiddleware, async (req, res) => {
    try {
      const { platform } = req.params;
      const redirectUri = `${process.env.SERVER_URL || 'http://localhost:5000'}/auth/${platform}/callback`;
      
      let authUrl = '';
      switch (platform) {
        case 'instagram':
          const instagramClientId = process.env.INSTAGRAM_CLIENT_ID || 'your-instagram-client-id';
          authUrl = `https://api.instagram.com/oauth/authorize?client_id=${instagramClientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`;
          break;
        case 'linkedin':
          const linkedinClientId = process.env.LINKEDIN_CLIENT_ID || 'your-linkedin-client-id';
          authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${linkedinClientId}&redirect_uri=${redirectUri}&scope=r_liteprofile r_emailaddress w_member_social`;
          break;
        case 'facebook':
          const facebookClientId = process.env.FACEBOOK_CLIENT_ID || 'your-facebook-client-id';
          authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${facebookClientId}&redirect_uri=${redirectUri}&scope=pages_manage_posts,pages_read_engagement&response_type=code`;
          break;
        case 'twitter':
          const twitterClientId = process.env.TWITTER_CLIENT_ID || 'your-twitter-client-id';
          authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${twitterClientId}&redirect_uri=${redirectUri}&scope=tweet.read tweet.write users.read&state=state`;
          break;
        default:
          return res.status(400).json({ message: 'Unsupported platform' });
      }
      
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
