/**
 * Test different API key header formats for Abacus.AI
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ABACUS_API_KEY || 's2_aeab62dee4c048108be2221161b51a21';
  console.log('Testing API key:', apiKey.substring(0, 10) + '...');

  // Test different header formats
  const headerFormats = [
    { name: 'apiKey', headers: { 'apiKey': apiKey } },
    { name: 'Authorization Bearer', headers: { 'Authorization': `Bearer ${apiKey}` } },
    { name: 'Authorization', headers: { 'Authorization': apiKey } },
    { name: 'X-API-Key', headers: { 'X-API-Key': apiKey } },
    { name: 'api-key', headers: { 'api-key': apiKey } },
    { name: 'API-Key', headers: { 'API-Key': apiKey } }
  ];

  const results = {};

  for (const format of headerFormats) {
    try {
      console.log(`Testing header format: ${format.name}`);
      
      const response = await fetch('https://api.abacus.ai/api/v0/listProjects', {
        method: 'GET',
        headers: format.headers,
        signal: AbortSignal.timeout(10000)
      });

      const responseText = await response.text();
      
      results[format.name] = {
        status: response.status,
        statusText: response.statusText,
        body: responseText.substring(0, 300)
      };

      console.log(`${format.name}: ${response.status} - ${responseText.substring(0, 100)}`);
      
    } catch (error) {
      results[format.name] = {
        error: error.message,
        type: error.name
      };
      console.log(`${format.name}: ERROR - ${error.message}`);
    }
  }

  return res.status(200).json({
    success: true,
    apiKeyPreview: apiKey.substring(0, 10) + '...',
    headerFormatResults: results
  });
} 