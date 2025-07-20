import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jaflxjatobiupbrqcrfm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZmx4amF0b2JpdXBicnFjcmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTQ4NzIsImV4cCI6MjA2ODUzMDg3Mn0.V0fpjk8h6h0GaD3VZAzP0fx-JyHBfZe6ihUuGDk4xCU';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface User {
  id: string; // UUID
  email: string;
  username: string;
  password_hash?: string;
  full_name?: string;
  avatar?: string;
  provider: string;
  provider_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialAccount {
  id: number;
  user_id: string; // UUID
  platform: string;
  platform_user_id: string;
  username: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface Campaign {
  id: number;
  user_id: string; // UUID
  title: string;
  prompt: string;
  description?: string;
  platforms: string[];
  duration: number;
  posting_time: string;
  content_style: string;
  status: string;
  is_active: boolean;
  post_instantly: boolean;
  enhanced_ai: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: number;
  campaign_id: number;
  content: string;
  platform: string;
  scheduled_at: string;
  published_at?: string;
  status: string;
  platform_post_id?: string;
  engagement?: any;
  error_message?: string;
  created_at: string;
}

export interface Analytics {
  id: number;
  user_id: string; // UUID
  post_id?: number;
  campaign_id?: number;
  platform: string;
  metric: string;
  value: number;
  timestamp: string;
  created_at: string;
} 