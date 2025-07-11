import { withErrorHandling } from '../../utils/errorHandler.js';
import { validateApiRequest, validatePrompt } from '../../utils/validation.js';
import { APP_CONFIG, LLM_CONFIG } from '../../utils/config.js';

const SYSTEM_PROMPT = `You are a helpful conversational AI assistant. Your job is to have natural, engaging conversations with users and provide helpful, informative responses.

When users ask about:
- Restaurants: Provide specific recommendations, describe cuisine types, mention atmosphere, price ranges, and notable dishes
- Locations: Share interesting facts, attractions, history, or practical information
- General questions: Give comprehensive, helpful answers

Be conversational and engaging. You can:
- Ask follow-up questions to better help the user
- Provide detailed recommendations and explanations
- Share interesting facts and context
- Engage in back-and-forth dialogue

CRITICAL RULES:
- Be helpful, informative, and conversational
- Provide specific, actionable information when possible
- Feel free to ask clarifying questions to better assist
- Keep responses engaging and natural
- Focus on being genuinely helpful rather than just refining prompts`;

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

  console.log('Refining prompt with OpenAI:', promptValidation.sanitized);

  // Get OpenAI API key from environment
  const openaiConfig = LLM_CONFIG.openai;

  // Debug logging for Vercel
  console.log('Environment check:', {
    hasOpenAIKey: !!openaiConfig.apiKey,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  });

  if (!openaiConfig.apiKey) {
    console.error('No OpenAI API key found');
    return res.status(500).json({ 
      success: false,
      error: {
        message: 'OpenAI API key not configured',
        code: 'NO_OPENAI_API_KEY',
        timestamp: new Date().toISOString()
      },
      fallback: generateFallbackResponse(promptValidation.sanitized),
      note: 'Add OPENAI_API_KEY to your .env.local file',
      debug: {
        hasOpenAIKey: !!openaiConfig.apiKey,
        nodeEnv: process.env.NODE_ENV
      }
    });
  }

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
    console.log('OpenAI response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error Response:', errorText);
      
      return res.status(response.status).json({
        success: false,
        error: {
          message: 'OpenAI API error',
          code: 'OPENAI_API_ERROR',
          status: response.status,
          details: errorText,
          timestamp: new Date().toISOString()
        },
        fallback: generateFallbackResponse(promptValidation.sanitized)
      });
    }

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
    } else {
      console.error('Unexpected OpenAI response format:', data);
      return res.status(200).json({
        success: true,
        refined_prompt: generateFallbackResponse(promptValidation.sanitized),
        source: 'Fallback',
        note: 'OpenAI responded but format was unclear',
        timestamp: new Date().toISOString()
      });
    }

  } catch (fetchError) {
    clearTimeout(timeoutId);
    
    if (fetchError.name === 'AbortError') {
      console.log('OpenAI request timed out');
      return res.status(408).json({
        success: false,
        error: {
          message: 'Request timeout',
          code: 'REQUEST_TIMEOUT',
          timestamp: new Date().toISOString()
        },
        fallback: generateFallbackResponse(promptValidation.sanitized)
      });
    }
    
    console.error('OpenAI fetch error:', fetchError);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Network error',
        code: 'NETWORK_ERROR',
        details: fetchError.message,
        timestamp: new Date().toISOString()
      },
      fallback: generateFallbackResponse(promptValidation.sanitized)
    });
  }
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