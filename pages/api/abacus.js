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

import { withErrorHandling } from '../../utils/errorHandler.js';
import { validateApiRequest, validatePrompt } from '../../utils/validation.js';
import { APP_CONFIG, LLM_CONFIG } from '../../utils/config.js';
import { refinePrompt } from '../../utils/refinePrompt';

/**
 * Call Abacus API for prompt refinement
 */
async function callActualAbacusAPI(prompt) {
  // Check if we have Abacus API credentials
  const abacusConfig = LLM_CONFIG.abacus;
  
  console.log(`[Abacus API] API Key present: ${!!abacusConfig.apiKey}`);
  console.log(`[Abacus API] API Key length: ${abacusConfig.apiKey ? abacusConfig.apiKey.length : 0}`);
  console.log(`[Abacus API] API URL: ${abacusConfig.apiUrl}`);
  
  if (!abacusConfig.apiKey || abacusConfig.apiKey === 'your_abacus_api_key_here') {
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
      llmName: abacusConfig.model,
      maxTokens: abacusConfig.maxTokens,
      temperature: abacusConfig.temperature,
    };

    console.log('[Abacus API] Making request to:', abacusConfig.apiUrl);
    console.log('[Abacus API] Request body:', JSON.stringify(requestBody, null, 2));

    // Create timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.requestTimeout);

    try {
      const response = await fetch(abacusConfig.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${abacusConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

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
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
    
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
 * Main API handler
 */
export default withErrorHandling(async (req, res) => {
  // Validate request method
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: {
        message: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED',
        timestamp: new Date().toISOString()
      }
    });
  }

  // Validate required fields
  const validation = validateApiRequest(req.body, ['inputPrompt']);
  if (!validation.valid) {
    return res.status(400).json({ 
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validation.errors,
        timestamp: new Date().toISOString()
      }
    });
  }

  const { inputPrompt } = req.body;

  // Validate prompt
  const promptValidation = validatePrompt(inputPrompt);
  if (!promptValidation.valid) {
    return res.status(400).json({ 
      success: false,
      error: {
        message: 'Invalid prompt',
        code: 'INVALID_PROMPT',
        details: promptValidation.errors,
        timestamp: new Date().toISOString()
      }
    });
  }

  console.log('Received prompt:', promptValidation.sanitized);
  
  const refinedPrompt = await refinePrompt(promptValidation.sanitized);
  
  console.log('Refined prompt:', refinedPrompt);
  
  res.status(200).json({ 
    success: true,
    refinedPrompt: refinedPrompt,
    timestamp: new Date().toISOString()
  });
});

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