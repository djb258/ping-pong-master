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
 * Refined system prompt for better prompt engineering
 */
const SYSTEM_PROMPT = `You are an Expert Prompt Refiner. Given a user's input prompt, you must choose exactly ONE of these three actions:

1. REWRITE: If the prompt is unclear, vague, or could be improved, rewrite it to be more clear, specific, and effective. Make it actionable and well-structured.

2. ENHANCE: If the prompt is decent but could benefit from additional context, constraints, or formatting, enhance it by adding useful elements like examples, specific requirements, or better structure.

3. CLARIFY: If the prompt is ambiguous or you need more information to provide the best refinement, ask exactly 3 specific, targeted questions that would help you understand what the user really wants.

CRITICAL RULES:
- NEVER repeat the original prompt as-is
- NEVER just say "your input may already be clear" 
- ALWAYS choose one of the three actions above
- Be decisive and helpful
- If rewriting or enhancing, make meaningful improvements
- If clarifying, ask specific, actionable questions

Respond with either the improved prompt OR your 3 clarifying questions.`;

/**
 * Main function to refine prompts using Abacus.AI API
 * @param {string} userPrompt - The original prompt to refine
 * @returns {Promise<string>} - The refined prompt
 */
export async function refinePrompt(userPrompt) {
  try {
    console.log('refinePrompt called with:', userPrompt);
    
    // Check for API key
    const apiKey = process.env.ABACUS_API_KEY || 's2_ad901b7e536d47769353c72f146d994b';
    if (!apiKey) {
      console.error('No Abacus API key found');
      throw new Error('No API key configured');
    }

    console.log('Using API key:', apiKey.substring(0, 10) + '...');

    // Try different possible endpoint URLs
    const possibleUrls = [
      'https://api.abacus.ai/api/v0/nlpChatResponse',
      'https://api.abacus.ai/v1/chat/completions',
      'https://api.abacus.ai/api/v0/chatCompletion',
      'https://api.abacus.ai/api/v0/generateText'
    ];

    // Prepare the request payload
    const payload = {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      model: 'gpt-4o',
      maxTokens: 1000,
      temperature: 0.7,
      stream: false
    };

    console.log('Request payload:', JSON.stringify(payload, null, 2));

    // Try each URL until one works
    for (const url of possibleUrls) {
      try {
        console.log(`Trying URL: ${url}`);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'apiKey': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        console.log(`Response status for ${url}:`, response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log(`Error response for ${url}:`, errorText);
          continue; // Try next URL
        }

        const data = await response.json();
        console.log(`Success response for ${url}:`, data);

        // Extract response based on different possible formats
        if (data.choices && data.choices[0] && data.choices[0].message) {
          return data.choices[0].message.content;
        } else if (data.response) {
          return data.response;
        } else if (data.text) {
          return data.text;
        } else if (data.result) {
          return data.result;
        } else {
          console.log('Unexpected response format:', data);
          continue;
        }
      } catch (urlError) {
        console.log(`Error with URL ${url}:`, urlError.message);
        continue;
      }
    }

    // If all URLs failed, throw an error
    throw new Error('All Abacus API endpoints failed');

  } catch (error) {
    console.error('Abacus API error:', error);
    
    // Return a helpful fallback response
    return `I encountered an issue connecting to the Abacus API (${error.message}). However, I can still help improve your prompt:

Original: "${userPrompt}"

Here are three ways to potentially improve it:

1. **Add more context**: What specific outcome are you looking for?
2. **Be more specific**: What constraints or requirements should be considered?
3. **Include examples**: What would a good response look like?

Would you like to provide more details so I can give you a better refined version?`;
  }
}

/**
 * Fallback prompt refinement using simple logic
 * @param {string} prompt 
 * @returns {string}
 */
function fallbackRefine(prompt) {
  // Simple fallback logic
  if (prompt.length < 20) {
    return `${prompt}\n\nPlease provide more specific details about what you want to achieve, including context, constraints, and desired outcome format.`;
  }
  
  if (!prompt.includes('?') && !prompt.toLowerCase().includes('help')) {
    return `${prompt}\n\nTo get the best results, please specify:\n- What format you want the response in\n- Any specific requirements or constraints\n- Examples of what you're looking for`;
  }
  
  return `Here's a refined version of your prompt:\n\n${prompt}\n\nAdditional considerations:\n- Please provide relevant context\n- Specify your target audience\n- Include any constraints or requirements`;
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
  [LLMProviders.ABACUS]: refinePrompt,
  
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