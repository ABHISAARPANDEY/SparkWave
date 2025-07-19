interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  userId: string;
  username: string;
}

class SocialAuthService {
  async exchangeCodeForToken(platform: string, code: string, redirectUri: string): Promise<TokenResponse> {
    switch (platform.toLowerCase()) {
      case "instagram":
        return this.exchangeInstagramCode(code, redirectUri);
      case "linkedin":
        return this.exchangeLinkedInCode(code, redirectUri);
      case "twitter":
      case "x":
        return this.exchangeTwitterCode(code, redirectUri);
      case "facebook":
        return this.exchangeFacebookCode(code, redirectUri);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  private async exchangeInstagramCode(code: string, redirectUri: string): Promise<TokenResponse> {
    try {
      // Step 1: Exchange code for access token
      const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.INSTAGRAM_CLIENT_ID || "",
          client_secret: process.env.INSTAGRAM_CLIENT_SECRET || "",
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Instagram token exchange failed: ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();

      // Step 2: Get user info
      const userResponse = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${tokenData.access_token}`);
      
      if (!userResponse.ok) {
        throw new Error("Failed to get Instagram user info");
      }

      const userData = await userResponse.json();

      return {
        accessToken: tokenData.access_token,
        userId: userData.id,
        username: userData.username,
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : undefined,
      };
    } catch (error) {
      console.error("Instagram auth error:", error);
      throw new Error("Instagram authentication failed");
    }
  }

  private async exchangeLinkedInCode(code: string, redirectUri: string): Promise<TokenResponse> {
    try {
      // Step 1: Exchange code for access token
      const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: process.env.LINKEDIN_CLIENT_ID || "",
          client_secret: process.env.LINKEDIN_CLIENT_SECRET || "",
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`LinkedIn token exchange failed: ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();

      // Step 2: Get user info
      const userResponse = await fetch("https://api.linkedin.com/v2/people/~:(id,localizedFirstName,localizedLastName)", {
        headers: {
          "Authorization": `Bearer ${tokenData.access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to get LinkedIn user info");
      }

      const userData = await userResponse.json();

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        userId: userData.id,
        username: `${userData.localizedFirstName} ${userData.localizedLastName}`,
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : undefined,
      };
    } catch (error) {
      console.error("LinkedIn auth error:", error);
      throw new Error("LinkedIn authentication failed");
    }
  }

  private async exchangeTwitterCode(code: string, redirectUri: string): Promise<TokenResponse> {
    try {
      // Twitter OAuth 2.0 with PKCE
      const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          code_verifier: "challenge", // In production, this should be stored and retrieved
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Twitter token exchange failed: ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();

      // Step 2: Get user info
      const userResponse = await fetch("https://api.twitter.com/2/users/me", {
        headers: {
          "Authorization": `Bearer ${tokenData.access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to get Twitter user info");
      }

      const userData = await userResponse.json();

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        userId: userData.data.id,
        username: userData.data.username,
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : undefined,
      };
    } catch (error) {
      console.error("Twitter auth error:", error);
      throw new Error("Twitter authentication failed");
    }
  }

  private async exchangeFacebookCode(code: string, redirectUri: string): Promise<TokenResponse> {
    try {
      // Step 1: Exchange code for access token
      const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?` + new URLSearchParams({
        client_id: process.env.FACEBOOK_CLIENT_ID || "",
        client_secret: process.env.FACEBOOK_CLIENT_SECRET || "",
        redirect_uri: redirectUri,
        code,
      }));

      if (!tokenResponse.ok) {
        throw new Error(`Facebook token exchange failed: ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();

      // Step 2: Get user info
      const userResponse = await fetch(`https://graph.facebook.com/me?fields=id,name&access_token=${tokenData.access_token}`);

      if (!userResponse.ok) {
        throw new Error("Failed to get Facebook user info");
      }

      const userData = await userResponse.json();

      return {
        accessToken: tokenData.access_token,
        userId: userData.id,
        username: userData.name,
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : undefined,
      };
    } catch (error) {
      console.error("Facebook auth error:", error);
      throw new Error("Facebook authentication failed");
    }
  }

  async refreshToken(platform: string, refreshToken: string): Promise<TokenResponse> {
    switch (platform.toLowerCase()) {
      case "linkedin":
        return this.refreshLinkedInToken(refreshToken);
      case "twitter":
      case "x":
        return this.refreshTwitterToken(refreshToken);
      default:
        throw new Error(`Token refresh not supported for platform: ${platform}`);
    }
  }

  private async refreshLinkedInToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: process.env.LINKEDIN_CLIENT_ID || "",
          client_secret: process.env.LINKEDIN_CLIENT_SECRET || "",
        }),
      });

      if (!response.ok) {
        throw new Error(`LinkedIn token refresh failed: ${response.statusText}`);
      }

      const tokenData = await response.json();

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        userId: "", // Would need to get from existing record
        username: "", // Would need to get from existing record
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : undefined,
      };
    } catch (error) {
      console.error("LinkedIn token refresh error:", error);
      throw new Error("LinkedIn token refresh failed");
    }
  }

  private async refreshTwitterToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const response = await fetch("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Twitter token refresh failed: ${response.statusText}`);
      }

      const tokenData = await response.json();

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        userId: "", // Would need to get from existing record
        username: "", // Would need to get from existing record
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : undefined,
      };
    } catch (error) {
      console.error("Twitter token refresh error:", error);
      throw new Error("Twitter token refresh failed");
    }
  }

  async validateToken(platform: string, accessToken: string): Promise<boolean> {
    try {
      switch (platform.toLowerCase()) {
        case "instagram":
          const igResponse = await fetch(`https://graph.instagram.com/me?access_token=${accessToken}`);
          return igResponse.ok;
        
        case "linkedin":
          const liResponse = await fetch("https://api.linkedin.com/v2/people/~", {
            headers: { "Authorization": `Bearer ${accessToken}` },
          });
          return liResponse.ok;
        
        case "twitter":
        case "x":
          const twResponse = await fetch("https://api.twitter.com/2/users/me", {
            headers: { "Authorization": `Bearer ${accessToken}` },
          });
          return twResponse.ok;
        
        case "facebook":
          const fbResponse = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}`);
          return fbResponse.ok;
        
        default:
          return false;
      }
    } catch (error) {
      console.error(`Token validation failed for ${platform}:`, error);
      return false;
    }
  }
}

const socialAuthService = new SocialAuthService();

export async function exchangeCodeForToken(platform: string, code: string, redirectUri: string): Promise<TokenResponse> {
  return socialAuthService.exchangeCodeForToken(platform, code, redirectUri);
}

export async function refreshToken(platform: string, refreshToken: string): Promise<TokenResponse> {
  return socialAuthService.refreshToken(platform, refreshToken);
}

export async function validateToken(platform: string, accessToken: string): Promise<boolean> {
  return socialAuthService.validateToken(platform, accessToken);
}
