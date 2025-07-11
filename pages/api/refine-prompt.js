/**
 * API endpoint for prompt refinement using Abacus.AI
 * This handles the server-side API call where environment variables are available
 */

import { withErrorHandling } from '../../utils/errorHandler.js';
import { validateApiRequest, validatePrompt } from '../../utils/validation.js';
import { APP_CONFIG, LLM_CONFIG } from '../../utils/config.js';

const SYSTEM_PROMPT = `You are an Expert Prompt Refiner. Your job is to take user prompts and make them more effective and actionable for AI systems.

When given a prompt, you should:
- REWRITE unclear or vague prompts to be more specific and effective
- ENHANCE decent prompts by adding useful context, constraints, or formatting
- Add specific requirements, examples, or better structure
- Make prompts more actionable and well-structured

For example:
- "best restaurants" → "What are the top 5 highly-rated restaurants in [location], including their cuisine type, price range, and signature dishes?"
- "write code" → "Write a Python function that [specific task] with error handling, comments, and example usage"
- "explain topic" → "Provide a comprehensive explanation of [topic] including key concepts, real-world applications, and practical examples"

CRITICAL RULES:
- NEVER repeat the original prompt as-is
- Always provide substantial improvement
- Make prompts more specific and actionable
- Add context, constraints, and formatting that will help AI systems provide better responses
- Focus on making prompts more effective for getting useful results`;

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
  const validation = validateApiRequest(req.body, ['prompt']);
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

  const { prompt } = req.body;

  // Validate prompt
  const promptValidation = validatePrompt(prompt);
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

  console.log('Refining prompt:', promptValidation.sanitized);
  
  // Try OpenAI first, then fallback to local logic
  const openaiConfig = LLM_CONFIG.openai;
  
  if (openaiConfig.apiKey) {
    console.log('Using OpenAI API key:', openaiConfig.apiKey.substring(0, 10) + '...');

    // OpenAI API request
    const requestBody = {
      model: openaiConfig.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: promptValidation.sanitized }
      ],
      max_tokens: openaiConfig.maxTokens,
      temperature: openaiConfig.temperature
    };

    console.log('OpenAI request body:', JSON.stringify(requestBody, null, 2));

    // Create timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.requestTimeout);

    try {
      const response = await fetch(openaiConfig.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      console.log('OpenAI response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('OpenAI API Response:', data);

        if (data.choices && data.choices[0] && data.choices[0].message) {
          const content = data.choices[0].message.content;
          return res.status(200).json({
            success: true,
            refined_prompt: content,
            source: 'OpenAI',
            model: openaiConfig.model,
            usage: data.usage,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        const errorText = await response.text();
        console.error('OpenAI API Error:', errorText);
      }

    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('OpenAI fetch error:', fetchError);
    }
  } else {
    console.log('No OpenAI API key found, using fallback');
  }

  // If OpenAI fails or no API key, use fallback
  console.log('Using fallback response generation');
  return res.status(200).json({
    success: true,
    refined_prompt: generateFallbackResponse(promptValidation.sanitized),
    source: 'Fallback',
    note: 'Add OPENAI_API_KEY to .env.local for AI-powered refinement',
    timestamp: new Date().toISOString()
  });
});

/**
 * Generate a fallback response when API calls fail
 */
function generateFallbackResponse(userPrompt) {
  console.log('Generating fallback response for:', userPrompt);
  
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