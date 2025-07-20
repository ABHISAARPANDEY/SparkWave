// Test GitHub API Key
const testGitHubKey = async () => {
  const githubToken = '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';
  
  try {
    // Test basic GitHub API access
    console.log('Testing GitHub API key...');
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    });
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ GitHub API key is valid!');
      console.log('User:', userData.login);
      console.log('Name:', userData.name);
    } else {
      console.log('❌ GitHub API key test failed:', userResponse.status);
      const errorText = await userResponse.text();
      console.log('Error:', errorText);
    }
    
    // Test GitHub Models API
    console.log('\nTesting GitHub Models API...');
    const modelsResponse = await fetch('https://api.github.com/models/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4.1',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: 'Say hello!'
          }
        ],
        temperature: 0.8,
        top_p: 1.0
      })
    });
    
    if (modelsResponse.ok) {
      const modelsData = await modelsResponse.json();
      console.log('✅ GitHub Models API is working!');
      console.log('Response:', modelsData.choices?.[0]?.message?.content);
    } else {
      console.log('❌ GitHub Models API test failed:', modelsResponse.status);
      const errorText = await modelsResponse.text();
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testGitHubKey(); 