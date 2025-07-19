import { 
  users, 
  socialAccounts, 
  campaigns, 
  posts, 
  aiModels,
  analytics,
  type User, 
  type InsertUser,
  type SocialAccount,
  type InsertSocialAccount,
  type Campaign,
  type InsertCampaign,
  type Post,
  type InsertPost,
  type AiModel,
  type InsertAiModel,
  type Analytics,
  type InsertAnalytics
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Social Accounts
  getSocialAccounts(userId: number): Promise<SocialAccount[]>;
  getSocialAccount(userId: number, platform: string): Promise<SocialAccount | undefined>;
  createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount>;
  updateSocialAccount(id: number, updates: Partial<SocialAccount>): Promise<SocialAccount | undefined>;
  deleteSocialAccount(id: number): Promise<boolean>;

  // Campaigns
  getCampaigns(userId: number): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, updates: Partial<Campaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;

  // Posts
  getPosts(campaignId: number): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  getScheduledPosts(): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;

  // AI Models
  getAiModels(): Promise<AiModel[]>;
  getActiveAiModel(): Promise<AiModel | undefined>;
  createAiModel(model: InsertAiModel): Promise<AiModel>;

  // Analytics
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getAnalyticsForUser(userId: number): Promise<Analytics[]>;
  getAnalyticsForCampaign(campaignId: number): Promise<Analytics[]>;
  getAnalyticsForPost(postId: number): Promise<Analytics[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private socialAccounts: Map<number, SocialAccount>;
  private campaigns: Map<number, Campaign>;
  private posts: Map<number, Post>;
  private aiModels: Map<number, AiModel>;
  private analytics: Map<number, Analytics>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.socialAccounts = new Map();
    this.campaigns = new Map();
    this.posts = new Map();
    this.aiModels = new Map();
    this.analytics = new Map();
    this.currentId = 1;

    // Initialize with default AI models
    this.initializeAiModels();
  }

  private initializeAiModels() {
    const defaultModels: InsertAiModel[] = [
      {
        name: "GPT-2",
        endpoint: "https://huggingface.co/gpt2",
        isActive: true,
        isFree: true,
      },
      {
        name: "GPT-Neo",
        endpoint: "https://huggingface.co/EleutherAI/gpt-neo-2.7B",
        isActive: false,
        isFree: true,
      }
    ];

    defaultModels.forEach(model => this.createAiModel(model));
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const now = new Date();
    const user: User = { 
      id,
      email: insertUser.email,
      username: insertUser.username,
      password: insertUser.password ?? null,
      fullName: insertUser.fullName ?? null,
      avatar: insertUser.avatar ?? null,
      provider: insertUser.provider ?? null,
      providerId: insertUser.providerId ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Social Accounts
  async getSocialAccounts(userId: number): Promise<SocialAccount[]> {
    return Array.from(this.socialAccounts.values()).filter(
      account => account.userId === userId && account.isActive
    );
  }

  async getSocialAccount(userId: number, platform: string): Promise<SocialAccount | undefined> {
    return Array.from(this.socialAccounts.values()).find(
      account => account.userId === userId && account.platform === platform && account.isActive
    );
  }

  async createSocialAccount(insertAccount: InsertSocialAccount): Promise<SocialAccount> {
    const id = this.currentId++;
    const account: SocialAccount = { 
      id,
      username: insertAccount.username,
      userId: insertAccount.userId,
      platform: insertAccount.platform,
      platformUserId: insertAccount.platformUserId,
      accessToken: insertAccount.accessToken,
      refreshToken: insertAccount.refreshToken ?? null,
      expiresAt: insertAccount.expiresAt ?? null,
      isActive: insertAccount.isActive ?? null,
      createdAt: new Date()
    };
    this.socialAccounts.set(id, account);
    return account;
  }

  async updateSocialAccount(id: number, updates: Partial<SocialAccount>): Promise<SocialAccount | undefined> {
    const account = this.socialAccounts.get(id);
    if (!account) return undefined;
    
    const updatedAccount = { ...account, ...updates };
    this.socialAccounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async deleteSocialAccount(id: number): Promise<boolean> {
    return this.socialAccounts.delete(id);
  }

  // Campaigns
  async getCampaigns(userId: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(
      campaign => campaign.userId === userId && campaign.isActive
    );
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.currentId++;
    const now = new Date();
    const campaign: Campaign = { 
      id,
      title: insertCampaign.title,
      userId: insertCampaign.userId,
      prompt: insertCampaign.prompt,
      description: insertCampaign.description ?? null,
      platforms: insertCampaign.platforms,
      duration: insertCampaign.duration,
      postingTime: insertCampaign.postingTime,
      contentStyle: insertCampaign.contentStyle,
      status: insertCampaign.status ?? null,
      isActive: insertCampaign.isActive ?? null,
      postInstantly: insertCampaign.postInstantly ?? null,
      enhancedAI: insertCampaign.enhancedAI ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: number, updates: Partial<Campaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;
    
    const updatedCampaign = { ...campaign, ...updates, updatedAt: new Date() };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  // Posts
  async getPosts(campaignId: number): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(
      post => post.campaignId === campaignId
    );
  }

  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getScheduledPosts(): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(
      post => post.status === "scheduled" && post.scheduledAt <= new Date()
    );
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.currentId++;
    const post: Post = { 
      id,
      content: insertPost.content,
      platform: insertPost.platform,
      campaignId: insertPost.campaignId,
      scheduledAt: insertPost.scheduledAt,
      status: insertPost.status ?? null,
      publishedAt: insertPost.publishedAt ?? null,
      platformPostId: insertPost.platformPostId ?? null,
      engagement: insertPost.engagement ?? null,
      errorMessage: insertPost.errorMessage ?? null,
      createdAt: new Date()
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...updates };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }

  // AI Models
  async getAiModels(): Promise<AiModel[]> {
    return Array.from(this.aiModels.values()).filter(model => model.isActive);
  }

  async getActiveAiModel(): Promise<AiModel | undefined> {
    return Array.from(this.aiModels.values()).find(model => model.isActive);
  }

  async createAiModel(insertModel: InsertAiModel): Promise<AiModel> {
    const id = this.currentId++;
    const model: AiModel = { 
      id,
      name: insertModel.name,
      endpoint: insertModel.endpoint,
      isActive: insertModel.isActive ?? null,
      apiKey: insertModel.apiKey ?? null,
      isFree: insertModel.isFree ?? null,
      createdAt: new Date()
    };
    this.aiModels.set(id, model);
    return model;
  }

  // Analytics
  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = this.currentId++;
    const analytics: Analytics = {
      id,
      userId: insertAnalytics.userId,
      postId: insertAnalytics.postId ?? null,
      campaignId: insertAnalytics.campaignId ?? null,
      platform: insertAnalytics.platform,
      metric: insertAnalytics.metric,
      value: insertAnalytics.value,
      timestamp: insertAnalytics.timestamp ?? null,
      createdAt: new Date()
    };
    this.analytics.set(id, analytics);
    return analytics;
  }

  async getAnalyticsForUser(userId: number): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(
      analytics => analytics.userId === userId
    );
  }

  async getAnalyticsForCampaign(campaignId: number): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(
      analytics => analytics.campaignId === campaignId
    );
  }

  async getAnalyticsForPost(postId: number): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(
      analytics => analytics.postId === postId
    );
  }
}

export const storage = new MemStorage();
