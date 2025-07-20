import fetch from 'node-fetch';

export interface TwitterTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
}

export interface TwitterUserInfo {
  id: string;
  name: string;
  username: string;
}

export async function exchangeTwitterCodeForToken(code: string, redirectUri: string, codeVerifier: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  userId: string;
  username: string;
}> {
  const clientId = process.env.TWITTER_CLIENT_ID || 'dzY1dU9NcW9MWEVFa09FUmxtcGk6MTpjaQ';
  const clientSecret = process.env.TWITTER_CLIENT_SECRET || 't0ZhzEjOeXVV8s7Z60alx0_6WsmIUUc0yzszNkm2RCQ0Wu4Flx';
  
  if (!clientId || !clientSecret) {
    throw new Error('Twitter OAuth credentials not configured');
  }

  console.log(`Exchanging Twitter code for token with redirect_uri: ${redirectUri}`);

  // Exchange authorization code for access token
  const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('Twitter token exchange failed:', errorText);
    throw new Error(`Twitter token exchange failed: ${tokenResponse.status}`);
  }

  const tokenData: TwitterTokenResponse = await tokenResponse.json() as TwitterTokenResponse;
  
  // Get user information
  const userResponse = await fetch('https://api.twitter.com/2/users/me', {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
    },
  });

  if (!userResponse.ok) {
    console.error('Failed to get Twitter user info:', await userResponse.text());
    throw new Error('Failed to get Twitter user information');
  }

  const userData = await userResponse.json() as { data: TwitterUserInfo };
  const user = userData.data;

  return {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
    userId: user.id,
    username: `@${user.username}`,
  };
}

export async function postToTwitterAPI(content: string, accessToken: string): Promise<{ success: boolean; tweetId?: string; error?: string }> {
  try {
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: content,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twitter posting failed:', errorText);
      return { success: false, error: `Twitter API error: ${response.status}` };
    }

    const result = await response.json() as { data: { id: string } };
    return { success: true, tweetId: result.data.id };
  } catch (error) {
    console.error('Twitter posting error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}