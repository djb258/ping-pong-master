import { callLLM } from '../../utils/llmProviders.js';
import { withErrorHandling } from '../../utils/errorHandler.js';
import { validateApiRequest, validateAltitude, validateChecklist } from '../../utils/validation.js';
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
  const validation = validateApiRequest(req.body, ['altitude', 'checklist', 'userPrompt']);
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

  const { altitude, checklist, userPrompt, ideaTree = [] } = req.body;

  // Validate individual fields
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

  const checklistValidation = validateChecklist(checklist);
  if (!checklistValidation.valid) {
    return res.status(400).json({ 
      success: false,
      error: {
        message: 'Invalid checklist format',
        code: 'INVALID_CHECKLIST',
        details: checklistValidation.errors,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Create evaluation prompt for LLM
  const evaluationPrompt = createEvaluationPrompt(altitude, checklist, userPrompt, ideaTree);

  // Call LLM for evaluation with timeout
  const llmResponse = await callLLM(
    'You are an expert altitude-based thinking assistant. Evaluate checklist items based on the user\'s prompt and provide JSON responses.',
    evaluationPrompt,
    { 
      fallbackToMock: true,
      timeout: APP_CONFIG.requestTimeout
    }
  );

  // Parse LLM response
  let evaluation = {};
  try {
    if (typeof llmResponse === 'string') {
      evaluation = JSON.parse(llmResponse);
    } else {
      evaluation = llmResponse;
    }
  } catch (parseError) {
    console.error('Failed to parse LLM response:', parseError);
    // Fallback to basic evaluation
    evaluation = createFallbackEvaluation(checklist);
  }

  res.status(200).json({
    success: true,
    evaluation,
    timestamp: new Date().toISOString()
  });
});

function createEvaluationPrompt(altitude, checklist, userPrompt, ideaTree) {
  const altitudeContext = {
    '30k': 'Vision level - high-level goals and aspirations',
    '20k': 'Category level - industry and domain identification',
    '10k': 'Specialization level - niche and specific approach',
    '5k': 'Execution level - concrete actions and implementation'
  };

  return `Evaluate the following checklist items for a user at ${altitude} altitude (${altitudeContext[altitude]}).

USER PROMPT: "${userPrompt}"

IDEA TREE: ${JSON.stringify(ideaTree, null, 2)}

CHECKLIST ITEMS:
${checklist.checklist_items.map(item => 
  `- ${item.id}: ${item.label} - ${item.description}`
).join('\n')}

For each checklist item, determine if the user's prompt demonstrates this quality/criterion. Consider:
1. The specific altitude level context
2. The user's prompt content
3. The idea tree progression
4. Whether the criterion is met, partially met, or not met

RESPONSE FORMAT (JSON):
{
  "item_id": {
    "checked": true/false,
    "reason": "Brief explanation of why this item is checked or not",
    "confidence": 0.0-1.0
  }
}

EXAMPLE:
{
  "vision_clarity": {
    "checked": true,
    "reason": "User clearly states they want to become an insurance agent with specific goals",
    "confidence": 0.8
  }
}

Evaluate each item and respond with valid JSON:`;
}

function createFallbackEvaluation(checklist) {
  const evaluation = {};
  
  checklist.checklist_items.forEach(item => {
    // Basic fallback logic based on item ID patterns
    const itemId = item.id.toLowerCase();
    
    if (itemId.includes('clarity') || itemId.includes('clear')) {
      evaluation[item.id] = {
        checked: true,
        reason: 'Basic clarity detected in user prompt',
        confidence: 0.6
      };
    } else if (itemId.includes('specific') || itemId.includes('defined')) {
      evaluation[item.id] = {
        checked: false,
        reason: 'Specificity may need more detail',
        confidence: 0.4
      };
    } else {
      evaluation[item.id] = {
        checked: false,
        reason: 'Requires more information to evaluate',
        confidence: 0.3
      };
    }
  });
  
  return evaluation;
} 