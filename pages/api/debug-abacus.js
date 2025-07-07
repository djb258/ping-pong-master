/**
 * Debug endpoint to explore Abacus.AI API structure
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ABACUS_API_KEY || 's2_aeab62dee4c048108be2221161b51a21';
  console.log('API Key found:', !!apiKey);

  // Test different endpoints to see what's available
  const endpointsToTest = [
    'https://api.abacus.ai/api/v0/listProjects',
    'https://api.abacus.ai/api/v0/evaluatePrompt',
    'https://api.abacus.ai/api/v0/nlpChatResponse',
    'https://api.abacus.ai/api/v0/chatCompletion',
    'https://api.abacus.ai/api/v0/generateText',
    'https://api.abacus.ai/api/v0/predict',
    'https://api.abacus.ai/api/v0/chat',
    'https://api.abacus.ai/api/v0/completion'
  ];

  const results = {};

  for (const endpoint of endpointsToTest) {
    try {
      console.log(`Testing: ${endpoint}`);
      
      const testPayload = endpoint.includes('listProjects') ? {} : {
        prompt: "Hello world",
        system_message: "You are a helpful assistant",
        max_tokens: 50,
        temperature: 0.7
      };

      const method = endpoint.includes('listProjects') ? 'GET' : 'POST';
      const headers = { 'apiKey': apiKey };
      
      if (method === 'POST') {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(endpoint, {
        method: method,
        headers: headers,
        body: method === 'POST' ? JSON.stringify(testPayload) : undefined,
        signal: AbortSignal.timeout(10000)
      });

      const responseText = await response.text();
      
      results[endpoint] = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText.substring(0, 500) // Truncate for readability
      };

      console.log(`${endpoint}: ${response.status} - ${responseText.substring(0, 100)}`);
      
    } catch (error) {
      results[endpoint] = {
        error: error.message,
        type: error.name
      };
      console.log(`${endpoint}: ERROR - ${error.message}`);
    }
  }

  return res.status(200).json({
    success: true,
    apiKeyStatus: { found: !!apiKey, preview: apiKey.substring(0, 10) + '...' },
    endpointResults: results
  });
} 