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
    
    const apiKey = process.env.ABACUS_API_KEY || 's2_ad901b7e536d47769353c72f146d994b';
    console.log('API Key found:', !!apiKey);
    console.log('API Key preview:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');

    const testPrompt = req.body.prompt || "Write a professional email";
    console.log('Test prompt:', testPrompt);

    // Based on Abacus.AI documentation, they seem to use a different API structure
    // Let's try their actual documented endpoints and methods
    
    // First, test a simple API call to see if authentication works
    console.log('\n=== TESTING BASIC API ACCESS ===');
    try {
      const listProjectsResponse = await fetch('https://api.abacus.ai/api/v0/listProjects', {
        method: 'GET',
        headers: {
          'apiKey': apiKey,
          'Content-Type': 'application/json'
        }
      });

      console.log('listProjects status:', listProjectsResponse.status);
      const listProjectsText = await listProjectsResponse.text();
      console.log('listProjects response:', listProjectsText);

      if (listProjectsResponse.ok) {
        console.log('✅ API Key authentication works!');
        
        // Now try to find a chat/LLM endpoint
        // Based on the documentation, they might use evaluate_prompt or similar
        const chatEndpoints = [
          {
            url: 'https://api.abacus.ai/api/v0/evaluatePrompt',
            method: 'POST',
            body: {
              prompt: testPrompt,
              system_message: 'You are a helpful assistant.',
              max_tokens: 100
            }
          },
          {
            url: 'https://api.abacus.ai/api/v0/nlpChatResponse',
            method: 'POST',
            body: {
              messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: testPrompt }
              ]
            }
          },
          {
            url: 'https://api.abacus.ai/api/v0/chatCompletion',
            method: 'POST',
            body: {
              prompt: testPrompt,
              max_tokens: 100
            }
          }
        ];

        for (const endpoint of chatEndpoints) {
          try {
            console.log(`\n--- Testing ${endpoint.url} ---`);
            console.log('Request body:', JSON.stringify(endpoint.body, null, 2));
            
            const response = await fetch(endpoint.url, {
              method: endpoint.method,
              headers: {
                'apiKey': apiKey,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(endpoint.body)
            });

            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Response text:', responseText);

            if (response.ok) {
              try {
                const data = JSON.parse(responseText);
                return res.status(200).json({
                  success: true,
                  workingUrl: endpoint.url,
                  response: data,
                  message: 'Found working chat endpoint!',
                  apiKeyStatus: { found: true, preview: `${apiKey.substring(0, 10)}...` }
                });
              } catch (parseError) {
                return res.status(200).json({
                  success: true,
                  workingUrl: endpoint.url,
                  response: responseText,
                  message: 'Endpoint responded but not JSON',
                  apiKeyStatus: { found: true, preview: `${apiKey.substring(0, 10)}...` }
                });
              }
            }
          } catch (endpointError) {
            console.log(`Error with ${endpoint.url}:`, endpointError.message);
          }
        }

        return res.status(400).json({
          success: false,
          message: 'API key works but no chat endpoints found',
          apiKeyStatus: { found: true, preview: `${apiKey.substring(0, 10)}...` },
          note: 'Your API key can access Abacus.AI but chat/LLM endpoints may not be available or may use different format'
        });

      } else {
        console.log('❌ API Key authentication failed');
        return res.status(400).json({
          success: false,
          message: 'API key authentication failed',
          status: listProjectsResponse.status,
          response: listProjectsText,
          apiKeyStatus: { found: true, preview: `${apiKey.substring(0, 10)}...` }
        });
      }
    } catch (authError) {
      console.log('Authentication test error:', authError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to test API authentication',
        error: authError.message,
        apiKeyStatus: { found: true, preview: `${apiKey.substring(0, 10)}...` }
      });
    }

  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Test endpoint crashed'
    });
  }
} 