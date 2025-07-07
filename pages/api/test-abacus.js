/**
 * Simple test endpoint to call Abacus.AI directly
 * This bypasses all our complex logic to see what the raw response should be
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== ABACUS API TEST START ===');
    
    // Debug environment variables
    console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('ABACUS')));
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    const apiKey = process.env.ABACUS_API_KEY || 's2_ad901b7e536d47769353c72f146d994b';
    console.log('API Key found:', !!apiKey);
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    console.log('API Key preview:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');

    const testPrompt = req.body.prompt || "Write a professional email";
    console.log('Test prompt:', testPrompt);

    // First, let's test a simple request to see if the API key works at all
    const simpleTestUrl = 'https://api.abacus.ai/api/v0/chat';
    const simplePayload = {
      messages: [
        { role: 'user', content: 'Hello, test message' }
      ],
      model: 'gpt-4o',
      maxTokens: 50
    };

    console.log('\n=== SIMPLE TEST ===');
    console.log('URL:', simpleTestUrl);
    console.log('Payload:', JSON.stringify(simplePayload, null, 2));

    try {
      const simpleResponse = await fetch(simpleTestUrl, {
        method: 'POST',
        headers: {
          'apiKey': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simplePayload)
      });

      console.log('Simple response status:', simpleResponse.status);
      const simpleResponseText = await simpleResponse.text();
      console.log('Simple response text:', simpleResponseText);

      if (simpleResponse.ok) {
        return res.status(200).json({
          success: true,
          message: 'Simple test worked!',
          response: simpleResponseText
        });
      }
    } catch (simpleError) {
      console.log('Simple test error:', simpleError.message);
    }

    // Test different potential endpoints with more debugging
    const possibleUrls = [
      'https://api.abacus.ai/api/v0/nlpChatResponse',
      'https://api.abacus.ai/v1/chat/completions',
      'https://api.abacus.ai/api/v0/chatCompletion',
      'https://api.abacus.ai/api/v0/generateText',
      'https://api.abacus.ai/api/v0/chat'
    ];

    const payload = {
      messages: [
        { role: 'system', content: 'You are a helpful assistant that refines prompts.' },
        { role: 'user', content: testPrompt }
      ],
      model: 'gpt-4o',
      maxTokens: 500,
      temperature: 0.7,
      stream: false
    };

    console.log('\n=== FULL TEST ===');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    let allResults = [];

    for (const url of possibleUrls) {
      try {
        console.log(`\n--- Testing URL: ${url} ---`);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'apiKey': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log('Raw response text:', responseText);

        const result = {
          url,
          status: response.status,
          statusText: response.statusText,
          responseText,
          headers: Object.fromEntries(response.headers.entries())
        };

        allResults.push(result);

        if (response.ok) {
          try {
            const data = JSON.parse(responseText);
            console.log('Parsed response:', data);
            return res.status(200).json({
              success: true,
              workingUrl: url,
              response: data,
              message: 'Found working endpoint!',
              allResults
            });
          } catch (parseError) {
            console.log('JSON parse error:', parseError.message);
            return res.status(200).json({
              success: true,
              workingUrl: url,
              response: responseText,
              message: 'Endpoint responded but not JSON',
              allResults
            });
          }
        }
      } catch (fetchError) {
        console.log('Fetch error:', fetchError.message);
        allResults.push({
          url,
          error: fetchError.message
        });
      }
    }

    // If we get here, all endpoints failed
    return res.status(400).json({
      success: false,
      message: 'All endpoints failed',
      allResults,
      apiKeyStatus: {
        found: !!apiKey,
        length: apiKey ? apiKey.length : 0,
        preview: apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND'
      }
    });

  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
      message: 'Test endpoint crashed'
    });
  }
} 