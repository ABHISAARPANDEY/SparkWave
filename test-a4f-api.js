// Test A4F API Key
const testA4FAPI = async () => {
  const a4fApiKey = 'ddc-a4f-c4646ced53b34fdfa60084c2a56680ac';
  
  try {
    console.log('Testing A4F API key...');
    console.log('Using model: provider-6/gpt-4o');
    
    const response = await fetch('https://api.a4f.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${a4fApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'provider-6/gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert social media content creator. Create detailed, engaging posts that provide real value to readers.'
          },
          {
            role: 'user',
            content: 'Create a professional social media post about daily fitness tips for Twitter. Make it engaging and detailed.'
          }
        ],
        temperature: 0.8,
        max_tokens: 300
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ A4F API test successful!');
      console.log('Response status:', response.status);
      console.log('Model used:', data.model);
      console.log('Generated content:', data.choices?.[0]?.message?.content);
      console.log('Token usage:', data.usage);
    } else {
      console.log('❌ A4F API test failed:', response.status);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testA4FAPI(); 