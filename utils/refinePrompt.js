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
 * Main function to refine prompts using Abacus.AI
 * @param {string} userPrompt - The original prompt to refine
 * @returns {Promise<string>} - The refined prompt
 */
export async function refinePrompt(userPrompt) {
  try {
    console.log('refinePrompt called with:', userPrompt);
    
    // Call our API endpoint that handles the server-side Abacus.AI integration
    const response = await fetch('/api/refine-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: userPrompt })
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      
      // If there's a fallback provided, use it
      if (errorData.fallback) {
        return errorData.fallback;
      }
      
      // Otherwise generate our own fallback
      return generateFallbackResponse(userPrompt);
    }

    const data = await response.json();
    console.log('API Response:', data);

    if (data.success && data.refined_prompt) {
      return data.refined_prompt;
    } else if (data.fallback) {
      return data.fallback;
    } else {
      console.error('Unexpected response format:', data);
      return generateFallbackResponse(userPrompt);
    }
  } catch (error) {
    console.error('Error in refinePrompt:', error);
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

Refined: Please provide a comprehensive and detailed response to "${prompt}". Include specific examples, practical applications, and actionable insights. Structure your response clearly with headings or bullet points for easy reading.`;
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