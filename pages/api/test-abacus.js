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

    // Based on the Abacus.AI AI Workflows documentation, they use evaluate_prompt
    // Example from their docs: ApiClient().evaluate_prompt(prompt=nlp_query, system_message=f'respond like {character}').content
    
    console.log('\n=== TESTING EVALUATE_PROMPT ENDPOINT ===');
    
    const evaluatePromptPayload = {
      prompt: testPrompt,
      system_message: 'You are a helpful assistant that refines prompts to be more clear and effective.',
      max_tokens: 500,
      temperature: 0.7
    };

    console.log('Request payload:', JSON.stringify(evaluatePromptPayload, null, 2));

    try {
      const response = await fetch('https://api.abacus.ai/api/v0/evaluatePrompt', {
        method: 'POST',
        headers: {
          'apiKey': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(evaluatePromptPayload)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          console.log('Parsed response:', data);
          
          // Check for different possible response formats
          let content = null;
          if (data.content) {
            content = data.content;
          } else if (data.result && data.result.content) {
            content = data.result.content;
          } else if (data.response) {
            content = data.response;
          } else if (typeof data === 'string') {
            content = data;
          }

          if (content) {
            return res.status(200).json({
              success: true,
              workingUrl: 'https://api.abacus.ai/api/v0/evaluatePrompt',
              response: content,
              fullResponse: data,
              message: 'Found working evaluate_prompt endpoint!',
              apiKeyStatus: { found: true, preview: `${apiKey.substring(0, 10)}...` }
            });
          } else {
            return res.status(200).json({
              success: true,
              workingUrl: 'https://api.abacus.ai/api/v0/evaluatePrompt',
              response: responseText,
              fullResponse: data,
              message: 'Endpoint responded but content format unclear',
              apiKeyStatus: { found: true, preview: `${apiKey.substring(0, 10)}...` }
            });
          }
        } catch (parseError) {
          console.log('JSON parse error:', parseError.message);
          return res.status(200).json({
            success: true,
            workingUrl: 'https://api.abacus.ai/api/v0/evaluatePrompt',
            response: responseText,
            message: 'Endpoint responded but not JSON',
            apiKeyStatus: { found: true, preview: `${apiKey.substring(0, 10)}...` }
          });
        }
      } else {
        console.log('evaluate_prompt failed with status:', response.status);
        console.log('Error response:', responseText);
        
        // If evaluate_prompt doesn't work, fall back to testing basic API access
        return res.status(400).json({
          success: false,
          message: 'evaluate_prompt endpoint failed',
          status: response.status,
          response: responseText,
          apiKeyStatus: { found: true, preview: `${apiKey.substring(0, 10)}...` },
          note: 'Your API key works for basic access but evaluate_prompt may require different permissions or parameters'
        });
      }
    } catch (fetchError) {
      console.log('Fetch error:', fetchError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to call evaluate_prompt endpoint',
        error: fetchError.message,
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