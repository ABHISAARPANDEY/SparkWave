import { supabase, User, SocialAccount, Campaign, Post, Analytics } from './supabase';
import bcrypt from 'bcryptjs';

export class SupabaseStorage {
  // User management
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return data;
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) return null;
    return data;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update user: ${error.message}`);
    return data;
  }

  // Authentication helpers
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Social accounts
  async createSocialAccount(accountData: Omit<SocialAccount, 'id' | 'created_at'>): Promise<SocialAccount> {
    const { data, error } = await supabase
      .from('social_accounts')
      .insert([accountData])
      .select()
      .single();

    if (error) throw new Error(`Failed to create social account: ${error.message}`);
    return data;
  }

  async getSocialAccounts(userId: string): Promise<SocialAccount[]> {
    const { data, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw new Error(`Failed to get social accounts: ${error.message}`);
    return data || [];
  }

  async getSocialAccount(userId: string, platform: string): Promise<SocialAccount | null> {
    const { data, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .eq('is_active', true)
      .single();

    if (error) return null;
    return data;
  }

  async updateSocialAccount(id: number, updates: Partial<SocialAccount>): Promise<SocialAccount> {
    const { data, error } = await supabase
      .from('social_accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update social account: ${error.message}`);
    return data;
  }

  async deleteSocialAccount(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('social_accounts')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Campaigns
  async createCampaign(campaignData: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .insert([campaignData])
      .select()
      .single();

    if (error) throw new Error(`Failed to create campaign: ${error.message}`);
    return data;
  }

  async getCampaigns(userId: string): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get campaigns: ${error.message}`);
    return data || [];
  }

  async getCampaign(id: number): Promise<Campaign | null> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async updateCampaign(id: number, updates: Partial<Campaign>): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update campaign: ${error.message}`);
    return data;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Posts
  async createPost(postData: Omit<Post, 'id' | 'created_at'>): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()
      .single();

    if (error) throw new Error(`Failed to create post: ${error.message}`);
    return data;
  }

  async getPosts(campaignId: number): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('scheduled_at', { ascending: true });

    if (error) throw new Error(`Failed to get posts: ${error.message}`);
    return data || [];
  }

  async getPost(id: number): Promise<Post | null> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async updatePost(id: number, updates: Partial<Post>): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update post: ${error.message}`);
    return data;
  }

  // Analytics
  async createAnalytics(analyticsData: Omit<Analytics, 'id' | 'created_at'>): Promise<Analytics> {
    const { data, error } = await supabase
      .from('analytics')
      .insert([analyticsData])
      .select()
      .single();

    if (error) throw new Error(`Failed to create analytics: ${error.message}`);
    return data;
  }

  async getAnalytics(userId: string): Promise<Analytics[]> {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw new Error(`Failed to get analytics: ${error.message}`);
    return data || [];
  }

  // Dashboard stats
  async getDashboardStats(userId: string): Promise<{
    totalCampaigns: number;
    activeCampaigns: number;
    totalPosts: number;
    publishedPosts: number;
  }> {
    // Get campaign stats
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, status')
      .eq('user_id', userId);

    if (campaignsError) throw new Error(`Failed to get campaign stats: ${campaignsError.message}`);

    const campaignIds = campaigns?.map((c: any) => c.id) || [];
    
    // Get post stats
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('status')
      .in('campaign_id', campaignIds);

    if (postsError) throw new Error(`Failed to get post stats: ${postsError.message}`);

    return {
      totalCampaigns: campaigns?.length || 0,
      activeCampaigns: campaigns?.filter((c: any) => c.status === 'active').length || 0,
      totalPosts: posts?.length || 0,
      publishedPosts: posts?.filter((p: any) => p.status === 'published').length || 0,
    };
  }
}

export const supabaseStorage = new SupabaseStorage(); 