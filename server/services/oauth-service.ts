import fetch from 'node-fetch';

interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  userId: string;
  username: string;
}

export async function exchangeCodeForToken(platform: string, code: string, redirectUri: string): Promise<TokenResponse> {
  switch (platform) {
    case 'instagram':
      return await exchangeInstagramCode(code, redirectUri);
    case 'linkedin':
      return await exchangeLinkedInCode(code, redirectUri);
    case 'facebook':
      return await exchangeFacebookCode(code, redirectUri);
    case 'twitter':
      return await exchangeTwitterCode(code, redirectUri);
    default:
      throw new Error('Unsupported platform');
  }
}

async function exchangeInstagramCode(code: string, redirectUri: string): Promise<TokenResponse> {
  const clientId = process.env.INSTAGRAM_CLIENT_ID || 'your-instagram-client-id';
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET || 'your-instagram-client-secret';

  // First, get short-lived token
  const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code: code,
    }),
  });

  const tokenData = await tokenResponse.json() as any;
  
  if (!tokenResponse.ok) {
    throw new Error(`Instagram OAuth error: ${tokenData.error_message}`);
  }

  // Exchange for long-lived token
  const longLivedResponse = await fetch(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${tokenData.access_token}`, {
    method: 'GET',
  });

  const longLivedData = await longLivedResponse.json() as any;

  if (!longLivedResponse.ok) {
    throw new Error(`Instagram long-lived token error: ${longLivedData.error?.message}`);
  }

  // Get user info
  const userResponse = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${longLivedData.access_token}`);
  const userData = await userResponse.json() as any;

  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + longLivedData.expires_in);

  return {
    accessToken: longLivedData.access_token,
    expiresAt,
    userId: userData.id,
    username: userData.username,
  };
}

async function exchangeLinkedInCode(code: string, redirectUri: string): Promise<TokenResponse> {
  const clientId = process.env.LINKEDIN_CLIENT_ID || 'your-linkedin-client-id';
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET || 'your-linkedin-client-secret';

  const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const tokenData = await tokenResponse.json() as any;
  
  if (!tokenResponse.ok) {
    throw new Error(`LinkedIn OAuth error: ${tokenData.error_description}`);
  }

  // Get user info
  const userResponse = await fetch('https://api.linkedin.com/v2/people/~?projection=(id,localizedFirstName,localizedLastName)', {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
    },
  });
  
  const userData = await userResponse.json() as any;

  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

  return {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt,
    userId: userData.id,
    username: `${userData.localizedFirstName} ${userData.localizedLastName}`,
  };
}

async function exchangeFacebookCode(code: string, redirectUri: string): Promise<TokenResponse> {
  const clientId = process.env.FACEBOOK_CLIENT_ID || 'your-facebook-client-id';
  const clientSecret = process.env.FACEBOOK_CLIENT_SECRET || 'your-facebook-client-secret';

  const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${code}`, {
    method: 'GET',
  });

  const tokenData = await tokenResponse.json() as any;
  
  if (!tokenResponse.ok) {
    throw new Error(`Facebook OAuth error: ${tokenData.error?.message}`);
  }

  // Get user info
  const userResponse = await fetch(`https://graph.facebook.com/me?fields=id,name&access_token=${tokenData.access_token}`);
  const userData = await userResponse.json() as any;

  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

  return {
    accessToken: tokenData.access_token,
    expiresAt,
    userId: userData.id,
    username: userData.name,
  };
}

async function exchangeTwitterCode(code: string, redirectUri: string): Promise<TokenResponse> {
  const clientId = process.env.TWITTER_CLIENT_ID || 'dzY1dU9NcW9MWEVFa09FUmxtcGk6MTpjaQ';
  const clientSecret = process.env.TWITTER_CLIENT_SECRET || 't0ZhzEjOeXVV8s7Z60alx0_6WsmIUUc0yzszNkm2RCQ0Wu4Flx';

  const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      code: code,
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code_verifier: 'challenge', // In production, use proper PKCE
    }),
  });

  const tokenData = await tokenResponse.json() as any;
  
  if (!tokenResponse.ok) {
    throw new Error(`Twitter OAuth error: ${tokenData.error_description}`);
  }

  // Get user info
  const userResponse = await fetch('https://api.twitter.com/2/users/me', {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
    },
  });
  
  const userData = await userResponse.json() as any;

  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

  return {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt,
    userId: userData.data.id,
    username: userData.data.username,
  };
}

export async function refreshTokenForPlatform(platform: string, refreshToken: string): Promise<TokenResponse> {
  // Implementation for refreshing tokens when they expire
  switch (platform) {
    case 'linkedin':
      return await refreshLinkedInToken(refreshToken);
    case 'twitter':
      return await refreshTwitterToken(refreshToken);
    default:
      throw new Error('Token refresh not supported for this platform');
  }
}

async function refreshLinkedInToken(refreshToken: string): Promise<TokenResponse> {
  const clientId = process.env.LINKEDIN_CLIENT_ID || 'your-linkedin-client-id';
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET || 'your-linkedin-client-secret';

  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const data = await response.json() as any;
  
  if (!response.ok) {
    throw new Error(`LinkedIn token refresh error: ${data.error_description}`);
  }

  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
    userId: '', // Will be filled from existing account data
    username: '', // Will be filled from existing account data
  };
}

async function refreshTwitterToken(refreshToken: string): Promise<TokenResponse> {
  const clientId = process.env.TWITTER_CLIENT_ID || 'dzY1dU9NcW9MWEVFa09FUmxtcGk6MTpjaQ';
  const clientSecret = process.env.TWITTER_CLIENT_SECRET || 't0ZhzEjOeXVV8s7Z60alx0_6WsmIUUc0yzszNkm2RCQ0Wu4Flx';

  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      client_id: clientId,
    }),
  });

  const data = await response.json() as any;
  
  if (!response.ok) {
    throw new Error(`Twitter token refresh error: ${data.error_description}`);
  }

  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
    userId: '', // Will be filled from existing account data
    username: '', // Will be filled from existing account data
  };
}