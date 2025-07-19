export interface SocialPlatform {
  id: string;
  name: string;
  displayName: string;
  color: string;
  icon: string;
  characterLimit?: number;
  supports: {
    text: boolean;
    images: boolean;
    videos: boolean;
    hashtags: boolean;
    mentions: boolean;
  };
}

export interface OAuthConfig {
  authUrl: string;
  clientId: string;
  scope: string[];
  redirectUri: string;
}

export const SOCIAL_PLATFORMS: Record<string, SocialPlatform> = {
  instagram: {
    id: "instagram",
    name: "instagram",
    displayName: "Instagram",
    color: "from-purple-400 via-pink-500 to-red-500",
    icon: "📷",
    supports: {
      text: true,
      images: true,
      videos: true,
      hashtags: true,
      mentions: true,
    },
  },
  linkedin: {
    id: "linkedin",
    name: "linkedin",
    displayName: "LinkedIn",
    color: "from-blue-600 to-blue-700",
    icon: "💼",
    characterLimit: 3000,
    supports: {
      text: true,
      images: true,
      videos: true,
      hashtags: true,
      mentions: true,
    },
  },
  twitter: {
    id: "twitter",
    name: "twitter",
    displayName: "Twitter/X",
    color: "from-slate-700 to-black",
    icon: "🐦",
    characterLimit: 280,
    supports: {
      text: true,
      images: true,
      videos: true,
      hashtags: true,
      mentions: true,
    },
  },
  facebook: {
    id: "facebook",
    name: "facebook",
    displayName: "Facebook",
    color: "from-blue-500 to-blue-600",
    icon: "📘",
    characterLimit: 63206,
    supports: {
      text: true,
      images: true,
      videos: true,
      hashtags: true,
      mentions: true,
    },
  },
};

class SocialPlatformsService {
  getOAuthUrl(platform: string): string {
    const baseUrl = window.location.origin;
    const redirectUri = `${baseUrl}/auth/callback/${platform}`;
    
    switch (platform) {
      case "instagram":
        return `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`;
      
      case "linkedin":
        return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${redirectUri}&scope=r_liteprofile%20r_emailaddress%20w_member_social`;
      
      case "twitter":
        // Twitter OAuth 2.0 with PKCE
        const codeChallenge = this.generateCodeChallenge();
        return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_CLIENT_ID}&redirect_uri=${redirectUri}&scope=tweet.read%20tweet.write%20users.read&state=state&code_challenge=${codeChallenge}&code_challenge_method=S256`;
      
      case "facebook":
        return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${redirectUri}&scope=pages_manage_posts,pages_read_engagement&response_type=code`;
      
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  private generateCodeChallenge(): string {
    // Generate a code challenge for Twitter OAuth 2.0 with PKCE
    const array = new Uint32Array(28);
    crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
  }

  optimizeContentForPlatform(content: string, platform: string): string {
    const platformConfig = SOCIAL_PLATFORMS[platform];
    if (!platformConfig) return content;

    let optimized = content;

    // Apply character limits
    if (platformConfig.characterLimit && optimized.length > platformConfig.characterLimit) {
      optimized = optimized.substring(0, platformConfig.characterLimit - 3) + "...";
    }

    // Platform-specific optimizations
    switch (platform) {
      case "twitter":
        // Ensure hashtags work well on Twitter
        optimized = this.optimizeHashtags(optimized, 3);
        break;
      
      case "linkedin":
        // LinkedIn prefers longer-form content with professional formatting
        if (optimized.length > 100 && !optimized.includes("\n")) {
          optimized = optimized.replace(/\. /g, ".\n\n");
        }
        break;
      
      case "instagram":
        // Instagram loves emojis and hashtags
        if (!/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(optimized)) {
          optimized = `✨ ${optimized}`;
        }
        optimized = this.optimizeHashtags(optimized, 30);
        break;
      
      case "facebook":
        // Facebook works well with community-focused language
        if (!optimized.includes("?") && optimized.length > 50) {
          optimized += " What do you think?";
        }
        break;
    }

    return optimized;
  }

  private optimizeHashtags(content: string, maxHashtags: number): string {
    const hashtagRegex = /#\w+/g;
    const hashtags = content.match(hashtagRegex) || [];
    
    if (hashtags.length > maxHashtags) {
      // Remove excess hashtags
      let optimized = content;
      const excessHashtags = hashtags.slice(maxHashtags);
      excessHashtags.forEach(tag => {
        optimized = optimized.replace(tag, "");
      });
      return optimized.replace(/\s+/g, " ").trim();
    }
    
    return content;
  }

  getPostingGuidelines(platform: string): string[] {
    switch (platform) {
      case "instagram":
        return [
          "Use high-quality visuals",
          "Include relevant hashtags (up to 30)",
          "Engage with your community in comments",
          "Post consistently for best reach",
        ];
      
      case "linkedin":
        return [
          "Share professional insights",
          "Use industry-relevant hashtags",
          "Engage with professional network",
          "Post during business hours",
        ];
      
      case "twitter":
        return [
          "Keep it concise (280 characters)",
          "Use trending hashtags sparingly",
          "Engage in conversations",
          "Tweet regularly for visibility",
        ];
      
      case "facebook":
        return [
          "Create community-focused content",
          "Ask questions to drive engagement",
          "Share valuable resources",
          "Post when your audience is active",
        ];
      
      default:
        return ["Follow platform best practices"];
    }
  }

  getBestPostingTimes(platform: string): string[] {
    // These would ideally come from analytics data
    switch (platform) {
      case "instagram":
        return ["11:00 AM", "2:00 PM", "5:00 PM"];
      case "linkedin":
        return ["8:00 AM", "12:00 PM", "5:00 PM"];
      case "twitter":
        return ["9:00 AM", "3:00 PM", "7:00 PM"];
      case "facebook":
        return ["1:00 PM", "3:00 PM", "8:00 PM"];
      default:
        return ["9:00 AM", "1:00 PM", "5:00 PM"];
    }
  }

  async validateConnection(platform: string): Promise<boolean> {
    try {
      // This would check if the user's token is still valid
      const response = await fetch(`/api/social-accounts/validate/${platform}`);
      return response.ok;
    } catch (error) {
      console.error(`Failed to validate ${platform} connection:`, error);
      return false;
    }
  }
}

export const socialPlatformsService = new SocialPlatformsService();
