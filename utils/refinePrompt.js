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
    // Simulated Abacus API call - replace with actual API endpoint
    // This abstraction allows easy swapping to other LLM providers
    const response = await fetch('/api/abacus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: input }),
    });

    if (!response.ok) {
      throw new Error(`Abacus API error: ${response.status}`);
    }

    const data = await response.json();
    return data.refinedPrompt;
  } catch (error) {
    console.error('Abacus API call failed:', error);
    // Simple fallback refinement focusing on clarity only
    return generateSimpleFallbackRefinement(input);
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
    const refinedPrompt = await providerFunction(input.trim());
    const endTime = Date.now();
    
    return {
      refinedPrompt,
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