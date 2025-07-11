import { callLLM } from '../../utils/llmProviders.js';
import { withErrorHandling } from '../../utils/errorHandler.js';
import { validateApiRequest, validatePrompt, validateAltitude } from '../../utils/validation.js';
import { APP_CONFIG } from '../../utils/config.js';

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
  const validation = validateApiRequest(req.body, ['content', 'altitude']);
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

  const { content, altitude } = req.body;

  // Validate content
  const contentValidation = validatePrompt(content);
  if (!contentValidation.valid) {
    return res.status(400).json({ 
      success: false,
      error: {
        message: 'Invalid content',
        code: 'INVALID_CONTENT',
        details: contentValidation.errors,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Validate altitude
  const altitudeValidation = validateAltitude(altitude);
  if (!altitudeValidation.valid) {
    return res.status(400).json({ 
      success: false,
      error: {
        message: 'Invalid altitude level',
        code: 'INVALID_ALTITUDE',
        details: altitudeValidation.errors,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Create summary prompt based on altitude
  const summaryPrompt = createSummaryPrompt(contentValidation.sanitized, altitudeValidation.sanitized);

  // Call LLM for summary generation with timeout
  const llmResponse = await callLLM(
    'You are an expert altitude-based thinking assistant. Generate concise summaries that capture the essence of user content at specific altitude levels.',
    summaryPrompt,
    { 
      fallbackToMock: true,
      timeout: APP_CONFIG.requestTimeout
    }
  );

  // Clean and return the summary
  const summary = cleanSummary(llmResponse, altitudeValidation.sanitized);

  res.status(200).json({ 
    success: true,
    summary,
    altitude: altitudeValidation.sanitized,
    content_length: contentValidation.sanitized.length,
    summary_length: summary.length,
    timestamp: new Date().toISOString()
  });
});

function createSummaryPrompt(content, altitude) {
  const altitudeContext = {
    '30k': 'Vision level - capture the high-level goals, dreams, and aspirations',
    '20k': 'Category level - capture the industry, domain, and business type focus',
    '10k': 'Specialization level - capture the specific niche, approach, and target focus',
    '5k': 'Execution level - capture the concrete actions, timeline, and implementation details'
  };

  return `Generate a concise summary (2-3 sentences) of the following content for ${altitude} altitude level.

ALTITUDE CONTEXT: ${altitudeContext[altitude]}

CONTENT TO SUMMARIZE:
"${content}"

INSTRUCTIONS:
1. Focus on the key elements relevant to ${altitude} level thinking
2. Use clear, concise language
3. Capture the essence without being too detailed or too vague
4. Maintain the user's original intent and direction
5. Avoid implementation details for higher altitudes (30k, 20k)
6. Include specific actions and plans for lower altitudes (10k, 5k)

RESPONSE FORMAT:
Provide only the summary text, no additional formatting or explanations.

EXAMPLE FOR 30k:
"User wants to build a successful insurance business helping families protect their financial future through personalized service and comprehensive coverage solutions."

EXAMPLE FOR 5k:
"User will get licensed in life insurance, join an independent agency, build a client base through networking, and implement CRM software for tracking leads and policies."

Generate the summary:`;
}

function cleanSummary(summary, altitude) {
  if (typeof summary !== 'string') {
    return `[${altitude}] Summary unavailable`;
  }

  // Remove any markdown formatting
  let cleaned = summary.replace(/[*_`]/g, '');
  
  // Remove quotes if present
  cleaned = cleaned.replace(/^["']|["']$/g, '');
  
  // Remove extra whitespace
  cleaned = cleaned.trim();
  
  // Ensure it's not too long
  if (cleaned.length > 500) {
    cleaned = cleaned.substring(0, 500) + '...';
  }
  
  // Add altitude prefix if not present
  if (!cleaned.startsWith(`[${altitude}]`)) {
    cleaned = `[${altitude}] ${cleaned}`;
  }
  
  return cleaned;
} 