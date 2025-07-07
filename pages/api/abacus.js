/**
 * Abacus API Endpoint
 * 
 * Next.js API route for handling Abacus LLM calls.
 * This endpoint abstracts the actual Abacus API integration,
 * allowing for easy configuration and swapping of providers.
 * 
 * Barton Doctrine: Clear separation, proper error handling,
 * and environment-based configuration.
 */

/**
 * Call Abacus API for prompt refinement
 */
async function callActualAbacusAPI(prompt) {
  // Check if we have Abacus API credentials
  const apiKey = process.env.ABACUS_API_KEY || 's2_ad901b7e536d47769353c72f146d994b';
  const apiUrl = process.env.ABACUS_API_URL || 'https://api.abacus.ai/api/v0/chat';
  
  console.log(`[Abacus API] API Key present: ${!!apiKey}`);
  console.log(`[Abacus API] API Key length: ${apiKey ? apiKey.length : 0}`);
  console.log(`[Abacus API] API URL: ${apiUrl}`);
  
  if (!apiKey || apiKey === 'your_abacus_api_key_here') {
    console.log('[Abacus API] No valid API key found, using fallback');
    return generateClearerPrompt(prompt);
  }
  
  console.log('[Abacus API] Valid API key found, proceeding with API call');

  try {
    // System prompt for Abacus AI Prompt Refiner
    const systemPrompt = `You are an Expert Prompt Refiner.

Your task is to help the user improve their prompt for a large language model (LLM). You MUST do one of the following:

1️⃣ If the prompt is vague or could be made more specific, REWRITE it with clearer wording, structure, or context.

2️⃣ If the prompt is already clear but could use enhancement, ADD contextual elements like timeframe, examples, or qualifiers.

3️⃣ If you genuinely need more info, ask the user **exactly 3 specific questions** to clarify their intent.

⛔ NEVER repeat the original prompt as-is.  
⛔ NEVER just say "your input may be clear."  
✅ Always return either:
– A rewritten version  
– OR 3 sharp, useful clarifying questions`;

    // User prompt to refine
    const userPrompt = `Please refine this prompt: "${prompt}"`;

    const requestBody = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      llmName: process.env.ABACUS_MODEL || 'gpt-4o',
      maxTokens: parseInt(process.env.ABACUS_MAX_TOKENS) || 1000,
      temperature: parseFloat(process.env.ABACUS_TEMPERATURE) || 0.7,
    };

    console.log('[Abacus API] Making request to:', apiUrl);
    console.log('[Abacus API] Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`[Abacus API] Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Abacus API] Error response: ${errorText}`);
      throw new Error(`Abacus API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[Abacus API] Response data:', JSON.stringify(data, null, 2));
    
    // Extract the refined prompt from the response
    const refinedPrompt = data.response || 
                         data.choices?.[0]?.message?.content || 
                         data.refined_prompt || 
                         data.result || 
                         data.output ||
                         data.text;
    
    if (!refinedPrompt) {
      console.error('[Abacus API] No valid response content found');
      throw new Error('No valid response content from Abacus API');
    }
    
    return refinedPrompt.trim();
    
  } catch (error) {
    console.error('[Abacus API] Call failed:', error);
    console.log('[Abacus API] Falling back to local refinement');
    // Fall back to local refinement if API fails
    return generateClearerPrompt(prompt);
  }
}

/**
 * Generate a clearer, more specific version of the input prompt for fallback
 * Focus only on improving clarity and specificity, not adding generic phrases
 */
function generateClearerPrompt(originalPrompt) {
  // Simple refinements that improve clarity without adding boilerplate
  const clarityImprovements = [
    // Make vague terms more specific
    { from: /\bthing\b/gi, to: 'element' },
    { from: /\bstuff\b/gi, to: 'items' },
    { from: /\bgood\b/gi, to: 'effective' },
    { from: /\bbad\b/gi, to: 'ineffective' },
    
    // Improve question clarity
    { from: /^how do i\s+/i, to: 'How can I ' },
    { from: /^what is\s+/i, to: 'Define ' },
    { from: /^tell me about\s+/i, to: 'Explain ' },
    
    // Add specificity to common requests
    { from: /\bhelp me\b/gi, to: 'guide me in' },
    { from: /\bshow me\b/gi, to: 'demonstrate how to' },
  ];
  
  let refined = originalPrompt.trim();
  
  // Apply clarity improvements
  clarityImprovements.forEach(improvement => {
    refined = refined.replace(improvement.from, improvement.to);
  });
  
  // Ensure proper sentence structure
  if (!refined.endsWith('.') && !refined.endsWith('?') && !refined.endsWith('!')) {
    refined += '.';
  }
  
  // Capitalize first letter
  refined = refined.charAt(0).toUpperCase() + refined.slice(1);
  
  return refined;
}

/**
 * Validate request payload
 */
function validateRequest(body) {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid request body');
  }
  
  if (!body.prompt || typeof body.prompt !== 'string') {
    throw new Error('Missing or invalid prompt field');
  }
  
  if (body.prompt.trim().length === 0) {
    throw new Error('Prompt cannot be empty');
  }
  
  if (body.prompt.length > 10000) {
    throw new Error('Prompt too long (max 10,000 characters)');
  }
  
  return body.prompt.trim();
}

/**
 * Main API handler
 */
export default async function handler(req, res) {
  // CORS headers for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'This endpoint only supports POST requests',
    });
  }
  
  const startTime = Date.now();
  
  try {
    // Validate and extract prompt
    const prompt = validateRequest(req.body);
    
    // Log request for monitoring (remove in production or use proper logging)
    console.log(`[Abacus API] Processing prompt: ${prompt.slice(0, 100)}...`);
    
    // Call Abacus API (simulated)
    const refinedPrompt = await callActualAbacusAPI(prompt);
    
    const processingTime = Date.now() - startTime;
    
    // Log success
    console.log(`[Abacus API] Successfully processed prompt in ${processingTime}ms`);
    
    // Return successful response
    res.status(200).json({
      success: true,
      refinedPrompt,
      metadata: {
        originalLength: prompt.length,
        refinedLength: refinedPrompt.length,
        processingTimeMs: processingTime,
        provider: 'abacus',
        timestamp: new Date().toISOString(),
      },
    });
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    // Log error for monitoring
    console.error(`[Abacus API] Error:`, error.message);
    
    // Determine appropriate error status
    let status = 500;
    if (error.message.includes('Invalid') || error.message.includes('Missing')) {
      status = 400;
    } else if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
      status = 401;
    } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
      status = 429;
    }
    
    // Return error response
    res.status(status).json({
      success: false,
      error: error.message,
      metadata: {
        processingTimeMs: processingTime,
        provider: 'abacus',
        timestamp: new Date().toISOString(),
      },
    });
  }
}

/**
 * API configuration
 */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}; 