// Test GitHub Token Permissions
const testGitHubPermissions = async () => {
  const githubToken = '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';
  
  try {
    console.log('Testing GitHub token permissions...');
    
    // Test basic API access
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    });
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ Basic GitHub API access: OK');
      console.log('User:', userData.login);
      
      // Check token scopes
      const scopes = userResponse.headers.get('x-oauth-scopes');
      console.log('Token scopes:', scopes);
      
      if (scopes && scopes.includes('models:read')) {
        console.log('✅ Models API permission: OK');
      } else {
        console.log('❌ Models API permission: Missing');
        console.log('You need to add "models:read" permission to your token');
      }
    } else {
      console.log('❌ GitHub API access failed:', userResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testGitHubPermissions(); 