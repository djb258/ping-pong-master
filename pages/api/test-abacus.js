/**
 * Simple test endpoint to call Abacus.AI directly
 * This bypasses all our complex logic to see what the raw response should be
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== ABACUS API TEST ===');
    
    const apiKey = process.env.ABACUS_API_KEY || 's2_ad901b7e536d47769353c72f146d994b';
    console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');

    const testPrompt = req.body.prompt || "Write a professional email";
    console.log('Test prompt:', testPrompt);

    // Test different potential endpoints
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

    console.log('Payload:', JSON.stringify(payload, null, 2));

    let lastError = null;

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

        if (response.ok) {
          try {
            const data = JSON.parse(responseText);
            console.log('Parsed response:', data);
            return res.status(200).json({
              success: true,
              workingUrl: url,
              response: data,
              message: 'Found working endpoint!'
            });
          } catch (parseError) {
            console.log('JSON parse error:', parseError.message);
            return res.status(200).json({
              success: true,
              workingUrl: url,
              response: responseText,
              message: 'Endpoint responded but not JSON'
            });
          }
        } else {
          lastError = {
            url,
            status: response.status,
            statusText: response.statusText,
            response: responseText
          };
          console.log('HTTP error:', lastError);
        }
      } catch (fetchError) {
        lastError = {
          url,
          error: fetchError.message
        };
        console.log('Fetch error:', lastError);
      }
    }

    // If we get here, all endpoints failed
    return res.status(400).json({
      success: false,
      message: 'All endpoints failed',
      lastError,
      testedUrls: possibleUrls
    });

  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
} 