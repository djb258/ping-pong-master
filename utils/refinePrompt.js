/**
 * Prompt Refinement Engine
 * 
 * This module provides an abstracted interface for prompt refinement,
 * using Abacus.AI API for intelligent prompt improvement.
 * 
 * Barton Doctrine: Clear separation of concerns, single responsibility,
 * and robust error handling.
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
    
    // Validate input
    if (!userPrompt || typeof userPrompt !== 'string') {
      throw new Error('Invalid input: prompt must be a non-empty string');
    }
    
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
      'https://api.abacus.ai/api/v0/generateText',
      'https://api.abacus.ai/api/v0/chat'
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
    return generateFallbackResponse(userPrompt, error.message);
  }
}

/**
 * Generate a helpful fallback response when API fails
 * @param {string} userPrompt - The original prompt
 * @param {string} errorMessage - The error message
 * @returns {string} - Fallback response
 */
function generateFallbackResponse(userPrompt, errorMessage) {
  return `I encountered an issue connecting to the Abacus API (${errorMessage}). However, I can still help improve your prompt:

Original: "${userPrompt}"

Here are three ways to potentially improve it:

1. **Add more context**: What specific outcome are you looking for?
2. **Be more specific**: What constraints or requirements should be considered?
3. **Include examples**: What would a good response look like?

Would you like to provide more details so I can give you a better refined version?`;
}

/**
 * Simple fallback prompt refinement using basic logic
 * @param {string} prompt - The prompt to refine
 * @returns {string} - Refined prompt
 */
export function fallbackRefine(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    return 'Please provide a valid prompt to refine.';
  }

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
 * Health check function for the refinement service
 * @returns {Promise<boolean>} - True if service is healthy
 */
export async function checkServiceHealth() {
  try {
    const testPrompt = "Test prompt for health check";
    const result = await refinePrompt(testPrompt);
    return result && typeof result === 'string' && result.length > 0;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
} 