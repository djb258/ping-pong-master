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
- NEVER just say "your input may be clear" or similar dismissive responses
- ALWAYS provide substantial improvement or ask specific questions
- Be direct and actionable in your response
- Focus on making prompts more effective for AI systems`;

/**
 * Main function to refine prompts using Abacus.AI
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

    // Based on the Abacus.AI documentation, they use evaluate_prompt
    // Example from their docs: ApiClient().evaluate_prompt(prompt=nlp_query, system_message=f'respond like {character}').content
    const requestBody = {
      prompt: userPrompt,
      system_message: SYSTEM_PROMPT,
      max_tokens: 1000,
      temperature: 0.7
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    // Use the correct evaluate_prompt endpoint
    const response = await fetch('https://api.abacus.ai/api/v0/evaluatePrompt', {
      method: 'POST',
      headers: {
        'apiKey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      
      // If this endpoint doesn't work, try a fallback approach
      return await tryAlternativeApproach(userPrompt, apiKey);
    }

    const data = await response.json();
    console.log('API Response:', data);

    // Check for different possible response formats
    if (data.content) {
      return data.content;
    } else if (data.result && data.result.content) {
      return data.result.content;
    } else if (data.response) {
      return data.response;
    } else if (typeof data === 'string') {
      return data;
    } else {
      console.error('Unexpected response format:', data);
      return await tryAlternativeApproach(userPrompt, apiKey);
    }
  } catch (error) {
    console.error('Error in refinePrompt:', error);
    return await tryAlternativeApproach(userPrompt, apiKey);
  }
}

/**
 * Try alternative API approaches if the main one fails
 */
async function tryAlternativeApproach(userPrompt, apiKey) {
  try {
    // Try different endpoint structures based on the API documentation
    const endpoints = [
      'https://api.abacus.ai/api/v0/nlpChatResponse',
      'https://api.abacus.ai/api/v0/chatCompletion',
      'https://api.abacus.ai/api/v0/generateText'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        
        const requestBody = {
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 1000,
          temperature: 0.7
        };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'apiKey': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        console.log(`${endpoint} response status:`, response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`${endpoint} response:`, data);
          
          if (data.success && data.content) {
            return data.content;
          } else if (data.result && data.result.content) {
            return data.result.content;
          }
        }
      } catch (endpointError) {
        console.error(`Error with ${endpoint}:`, endpointError);
        continue;
      }
    }

    // If all endpoints fail, return a fallback response
    return generateFallbackResponse(userPrompt);
  } catch (error) {
    console.error('Error in alternative approach:', error);
    return generateFallbackResponse(userPrompt);
  }
}

/**
 * Generate a fallback response when API calls fail
 */
function generateFallbackResponse(userPrompt) {
  console.log('Generating fallback response for:', userPrompt);
  
  // Simple heuristic-based refinement
  const prompt = userPrompt.trim();
  
  if (prompt.length < 10) {
    return `Your prompt "${prompt}" is quite brief. Here's a more detailed version:

Please provide a comprehensive response about ${prompt}, including:
- Key concepts and definitions
- Practical examples or applications
- Step-by-step guidance if applicable
- Any relevant context or background information

Make your response clear, actionable, and well-structured.`;
  }
  
  if (!prompt.includes('?') && !prompt.includes('please') && !prompt.includes('how')) {
    return `I've refined your prompt to be more specific and actionable:

"${prompt}"

Enhanced version:
Please provide a detailed explanation of ${prompt}, including:
- Clear definitions and key concepts
- Practical examples and real-world applications
- Step-by-step instructions where relevant
- Any important considerations or best practices

Structure your response in a clear, organized manner that's easy to follow.`;
  }
  
  return `Here's a refined version of your prompt:

Original: "${prompt}"

Refined: "${prompt} Please provide a comprehensive, well-structured response with specific examples and actionable insights. Include relevant context and organize your answer clearly."`;
}

/**
 * Simple fallback refinement for basic use cases
 */
export function fallbackRefine(prompt) {
  return generateFallbackResponse(prompt);
}

/**
 * Check if the Abacus service is available
 */
export async function checkServiceHealth() {
  try {
    const apiKey = process.env.ABACUS_API_KEY || 's2_ad901b7e536d47769353c72f146d994b';
    
    const response = await fetch('https://api.abacus.ai/api/v0/listProjects', {
      method: 'GET',
      headers: {
        'apiKey': apiKey,
        'Content-Type': 'application/json'
      }
    });

    return {
      status: response.ok ? 'healthy' : 'unhealthy',
      statusCode: response.status,
      message: response.ok ? 'Service is available' : 'Service is not responding'
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message
    };
  }
} 