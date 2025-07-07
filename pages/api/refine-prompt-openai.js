/**
 * API endpoint for prompt refinement using OpenAI
 * This is a fallback solution since Abacus.AI requires deployment tokens
 */

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('Refining prompt with OpenAI:', prompt);
    
    // Get OpenAI API key from environment
    const openaiApiKey = process.env.OPENAI_API_KEY || process.env.GPT4_API_KEY;
    
    if (!openaiApiKey) {
      console.error('No OpenAI API key found');
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        fallback: generateFallbackResponse(prompt),
        note: 'Add OPENAI_API_KEY to your .env.local file'
      });
    }

    console.log('Using OpenAI API key:', openaiApiKey.substring(0, 10) + '...');

    // OpenAI API request
    const requestBody = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.7
    };

    console.log('OpenAI request body:', JSON.stringify(requestBody, null, 2));

    // Create timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
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
          error: 'OpenAI API error',
          status: response.status,
          message: errorText,
          fallback: generateFallbackResponse(prompt)
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
          model: 'gpt-3.5-turbo',
          usage: data.usage
        });
      } else {
        console.error('Unexpected OpenAI response format:', data);
        return res.status(200).json({
          success: true,
          refined_prompt: generateFallbackResponse(prompt),
          source: 'Fallback',
          note: 'OpenAI responded but format was unclear'
        });
      }

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.log('OpenAI request timed out');
        return res.status(408).json({
          error: 'Request timeout',
          fallback: generateFallbackResponse(prompt)
        });
      }
      
      console.error('OpenAI fetch error:', fetchError);
      return res.status(500).json({
        error: 'Network error',
        message: fetchError.message,
        fallback: generateFallbackResponse(prompt)
      });
    }

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      fallback: generateFallbackResponse(prompt)
    });
  }
}

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