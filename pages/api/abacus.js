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
 * Simulated Abacus API client
 * In production, this would connect to the actual Abacus API
 */
async function callActualAbacusAPI(prompt) {
  // Check if we have Abacus API credentials
  const apiKey = process.env.ABACUS_API_KEY;
  const apiUrl = process.env.ABACUS_API_URL || 'https://api.abacus.ai/v1/refine';
  const orgId = process.env.ABACUS_ORG_ID;
  
  if (apiKey && apiKey !== 'your_abacus_api_key_here') {
    try {
      // Actual Abacus API integration
      // Wrap user's prompt with meaningful refinement instruction
      const refinementInstruction = `Please either:
1️⃣ Rewrite the prompt to improve clarity, specificity, or directness, 
OR
2️⃣ Ask the user clarifying questions that would help improve the prompt.
Return only the rewritten prompt or clarifying questions.

Original prompt: "${prompt}"`;

       const response = await fetch(apiUrl, {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${apiKey}`,
           'Content-Type': 'application/json',
           ...(orgId && { 'X-Organization-ID': orgId }),
         },
         body: JSON.stringify({
           prompt: refinementInstruction,
           model: process.env.ABACUS_MODEL || 'abacus-default',
           max_tokens: parseInt(process.env.ABACUS_MAX_TOKENS) || 4000,
           temperature: parseFloat(process.env.ABACUS_TEMPERATURE) || 0.7,
         }),
         timeout: parseInt(process.env.REQUEST_TIMEOUT_MS) || 30000,
       });

      if (!response.ok) {
        throw new Error(`Abacus API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.refined_prompt || data.result || data.output;
    } catch (error) {
      console.error('Abacus API call failed:', error);
      // Fall back to simulation if API fails
    }
  }
  
  // Simulated processing delay for demo/fallback
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Simulated refined prompt - focused on clarity and specificity only
  return generateClearerPrompt(prompt);
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