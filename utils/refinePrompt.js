/**
 * Prompt Refinement Engine
 * 
 * This module provides an abstracted interface for prompt refinement,
 * allowing easy swapping of LLM providers while maintaining consistent behavior.
 * 
 * Barton Doctrine: Clear separation of concerns, single responsibility,
 * and provider abstraction for future flexibility.
 */

/**
 * Abacus API client implementation
 * @param {string} input - The input prompt to refine
 * @returns {Promise<string>} - The refined prompt
 */
async function callAbacusAPI(input) {
  try {
    console.log('[RefinePrompt] Calling Abacus API with input:', input);
    
    const response = await fetch('/api/abacus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: input }),
    });

    console.log('[RefinePrompt] API response status:', response.status);

    if (!response.ok) {
      throw new Error(`Abacus API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[RefinePrompt] API response data:', data);
    
    const refinedPrompt = data.refinedPrompt;
    console.log('[RefinePrompt] Extracted refined prompt:', refinedPrompt);
    
    return refinedPrompt;
      } catch (error) {
      console.error('Abacus API call failed:', error);
      // Simple fallback refinement focusing on clarity only
      const fallbackRefinement = generateSimpleFallbackRefinement(input);
      return cleanPong(fallbackRefinement, input);
    }
}

/**
 * Generic LLM provider interface
 * This abstraction follows Barton Doctrine by providing a clean,
 * swappable interface for different LLM providers
 */
const LLMProviders = {
  ABACUS: 'abacus',
  GPT4: 'gpt4',
  CLAUDE: 'claude',
};

/**
 * Provider-specific implementations
 * Each provider follows the same interface contract
 */
const providerImplementations = {
  [LLMProviders.ABACUS]: callAbacusAPI,
  
  // Future provider implementations can be easily added
  [LLMProviders.GPT4]: async (input) => {
    // GPT-4 implementation would go here
    throw new Error('GPT-4 provider not yet implemented');
  },
  
  [LLMProviders.CLAUDE]: async (input) => {
    // Claude implementation would go here
    throw new Error('Claude provider not yet implemented');
  },
};

/**
 * Main refinement function with provider abstraction
 * 
 * @param {string} input - The input prompt to refine
 * @param {string} provider - The LLM provider to use (defaults to Abacus)
 * @returns {Promise<{refinedPrompt: string, metadata: object}>}
 */
export async function refinePrompt(input, provider = LLMProviders.ABACUS) {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input: prompt must be a non-empty string');
  }

  const providerFunction = providerImplementations[provider];
  if (!providerFunction) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  const startTime = Date.now();
  
  try {
    const rawRefinedPrompt = await providerFunction(input.trim());
    const endTime = Date.now();
    
    // Clean the pong response to remove filler and ensure quality
    const cleanedPrompt = cleanPong(rawRefinedPrompt, input.trim());
    
    return {
      refinedPrompt: cleanedPrompt,
      metadata: {
        provider,
        processingTimeMs: endTime - startTime,
        timestamp: new Date().toISOString(),
        success: true,
      },
    };
  } catch (error) {
    const endTime = Date.now();
    
    return {
      refinedPrompt: `Error refining prompt: ${error.message}`,
      metadata: {
        provider,
        processingTimeMs: endTime - startTime,
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message,
      },
    };
  }
}

/**
 * Export available providers for UI selection
 */
export { LLMProviders };

/**
 * Clean and validate the pong response from LLM providers
 * Removes filler phrases and ensures quality output
 */
function cleanPong(pong, ping) {
  console.log('[CleanPong] Original pong:', pong);
  console.log('[CleanPong] Original ping:', ping);
  
  let cleaned = pong.trim();
  
  // Remove common filler phrases that add no value
  const fillerPhrases = [
    /Please be specific in your response\.?/gi,
    /Please provide more details\.?/gi,
    /Be more specific\.?/gi,
    /Add more context\.?/gi,
    /Include specific examples\.?/gi,
    /Provide concrete details\.?/gi,
  ];
  
  fillerPhrases.forEach(phrase => {
    cleaned = cleaned.replace(phrase, '');
  });
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  console.log('[CleanPong] After cleaning:', cleaned);
  
  // Check if the response contains clarifying questions
  const hasClarifyingQuestions = cleaned.toLowerCase().includes('clarifying') || 
                                cleaned.toLowerCase().includes('question') ||
                                cleaned.includes('?') && (cleaned.includes('what') || cleaned.includes('how') || cleaned.includes('which') || cleaned.includes('when') || cleaned.includes('where') || cleaned.includes('why'));
  
  console.log('[CleanPong] Has clarifying questions:', hasClarifyingQuestions);
  
  // If it's a clarifying question, preserve it as-is
  if (hasClarifyingQuestions) {
    console.log('[CleanPong] Returning clarifying questions');
    return cleaned; // Return clarifying questions without further processing
  }
  
  // Check if refined pong is functionally identical to ping (after normalization)
  const normalizedPing = ping.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const normalizedPong = cleaned.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  
  console.log('[CleanPong] Normalized ping:', normalizedPing);
  console.log('[CleanPong] Normalized pong:', normalizedPong);
  console.log('[CleanPong] Are they identical?', normalizedPong === normalizedPing);
  
  if (normalizedPong === normalizedPing) {
    console.log('[CleanPong] Returning generic message due to identical content');
    // Input may already be clear, suggest adding context
    return "Your input may already be clear. Can you add more context?\nFor example: type of places (restaurants, parks), preferences (family-friendly, budget)?";
  }
  
  // Ensure the cleaned result isn't empty
  if (!cleaned || cleaned.length === 0) {
    console.log('[CleanPong] Cleaned result is empty, using original ping');
    cleaned = ping; // Fallback to original if cleaning resulted in empty string
  }
  
  console.log('[CleanPong] Final result:', cleaned);
  return cleaned;
}

/**
 * Simple fallback refinement for when API calls fail
 * Focuses only on basic clarity improvements
 */
function generateSimpleFallbackRefinement(input) {
  let refined = input.trim();
  
  // Basic clarity improvements
  if (!refined.endsWith('.') && !refined.endsWith('?') && !refined.endsWith('!')) {
    refined += '.';
  }
  
  // Capitalize first letter
  refined = refined.charAt(0).toUpperCase() + refined.slice(1);
  
  // Add minimal specificity if very vague
  if (refined.length < 20) {
    refined = `Please provide specific details about: ${refined.toLowerCase()}`;
  }
  
  return refined;
}

/**
 * Health check function for provider availability
 */
export async function checkProviderHealth(provider = LLMProviders.ABACUS) {
  try {
    const result = await refinePrompt('Health check test', provider);
    return result.metadata.success;
  } catch (error) {
    return false;
  }
} 