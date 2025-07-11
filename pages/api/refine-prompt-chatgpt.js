/**
 * API endpoint for ChatGPT-style conversational altitude-based prompt refinement
 * Uses conversational prompts to guide users through altitude levels naturally
 */

import { refinePromptWithAltitude, pruneTreeBranches, generateStructuredOutput } from '../../utils/altitudePromptRefiner';
import { getTemplate, generateSystemPrompt, generateUserPrompt, generateConversationalQuestions } from '../../utils/altitudeTemplates';
import { callLLM } from '../../utils/llmProviders';
import { getRelevantQuestions, getLevelInfo, getNextAltitude, isReadyForNextLevel } from '../../utils/altitudeJourney';
import { withErrorHandling } from '../../utils/errorHandler.js';
import { validateApiRequest, validatePrompt } from '../../utils/validation.js';
import { APP_CONFIG } from '../../utils/config.js';

/**
 * Call LLM API for conversational refinement
 */
async function callLLMForConversationalRefinement(prompt, altitude, context, ideaTree, templateName = 'career', userResponses = null) {
  try {
    // Create conversational system prompt based on altitude and template
    const systemPrompt = createConversationalSystemPrompt(altitude, context, ideaTree, templateName);
    const userPrompt = createConversationalUserPrompt(prompt, altitude, context, templateName, userResponses);

    console.log(`[LLM] Making request with configured provider`);
    console.log(`[LLM] Altitude: ${altitude}, Template: ${templateName}`);

    // Use the unified LLM calling function (provider configured via env vars)
    const conversationalResponse = await callLLM(systemPrompt, userPrompt, {
      fallbackToMock: true, // Fallback to mock if provider fails
      timeout: APP_CONFIG.requestTimeout
    });

    console.log('[LLM] Response received successfully');
    return conversationalResponse;
    
  } catch (error) {
    console.error('[LLM] API call failed:', error);
    console.log('[LLM] Falling back to local refinement');
    return generateConversationalFallback(prompt, altitude, context);
  }
}

/**
 * Create conversational system prompt based on altitude and template
 */
function createConversationalSystemPrompt(altitude, context, ideaTree, templateName = 'career') {
  const levelInfo = getLevelInfo(altitude);
  const nextAltitude = getNextAltitude(altitude);
  const nextLevelInfo = nextAltitude ? getLevelInfo(nextAltitude) : null;
  
  return `You are an expert altitude-based thinking assistant specializing in ${templateName} development.

Your role is to help users refine their ideas by moving them through structured altitude levels:

CURRENT LEVEL: ${altitude} - ${levelInfo.name}
${levelInfo.description}
Focus: ${levelInfo.focus}

${nextLevelInfo ? `NEXT LEVEL: ${nextAltitude} - ${nextLevelInfo.name}
${nextLevelInfo.description}
Focus: ${nextLevelInfo.focus}` : 'FINAL LEVEL: Ready for execution'}

CONTEXT: ${context}

CRITICAL RULES:
1. Always respond with valid JSON in the exact format requested
2. Make refinements SPECIFIC and ACTIONABLE for the next level
3. Include concrete examples and details from user responses
4. Focus on what the user should DO next, not just think about
5. Ask questions that help them make concrete decisions
6. Use the user's specific responses to inform your suggestions
7. Guide them toward the next altitude level systematically

Remember: You're helping them move from thinking to doing, from vague to specific, from vision to execution.`;
}

/**
 * Create conversational user prompt based on altitude and template
 */
function createConversationalUserPrompt(prompt, altitude, context, templateName = 'career', userResponses = null) {
  if (userResponses) {
    // If user provided responses, create a detailed follow-up prompt
    const template = getTemplate(templateName);
    const currentLevel = template.altitudeFramework[altitude];
    const altitudeOrder = ['30k', '20k', '10k', '5k'];
    const currentIndex = altitudeOrder.indexOf(altitude);
    const nextAltitude = altitudeOrder[Math.min(currentIndex + 1, altitudeOrder.length - 1)];
    const nextLevel = template.altitudeFramework[nextAltitude];
    
    return `You are helping someone refine their idea through altitude-based thinking.

CURRENT CONTEXT:
- Current Altitude: ${altitude} (${currentLevel.name})
- Current Focus: ${currentLevel.focus}
- User's Original Idea: "${prompt}"
- User's Responses to Previous Questions: "${userResponses}"

NEXT LEVEL TARGET:
- Target Altitude: ${nextAltitude} (${nextLevel.name})
- Target Focus: ${nextLevel.focus}

YOUR TASK:
Based on the user's responses, create:
1. A refined prompt that moves them from ${altitude} to ${nextAltitude} level
2. 2 specific questions to help them think even deeper at the ${nextAltitude} level

RULES:
- Make the refined prompt SPECIFIC and ACTIONABLE
- Include concrete details from their responses
- Focus on what they should DO next, not just think about
- Make questions specific to their situation and the next level
- Include examples or options in the questions

RESPONSE FORMAT:
{
  "refined_prompt": "Your specific, actionable refinement here",
  "questions": [
    "Specific question 1 with examples?",
    "Specific question 2 with examples?"
  ]
}`;
  }
  return generateUserPrompt(templateName, altitude, prompt, context);
}

/**
 * Generate conversational fallback when API is unavailable
 */
function generateConversationalFallback(prompt, altitude, context) {
  const fallbackResponses = {
    '30k': `That's an exciting vision! I'd love to help you explore this further. 

What aspects of this goal are most important to you? And what kind of impact are you hoping to make?`,
    
    '20k': `Great! We're getting more specific. 

What industry or category does this fall into? And what type of approach or model appeals to you most?`,
    
    '10k': `Perfect! Now let's find your unique angle. 

What specific specialization or niche within this area interests you? And what would make your approach different?`,
    
    '5k': `Excellent! Time to get practical. 

What specific actions would you like to take first? And what resources or tools do you think you'll need?`
  };

  return fallbackResponses[altitude] || `Let's continue exploring your idea: "${prompt}". What would you like to focus on next?`;
}

/**
 * Generate conversational questions based on altitude, context, and template
 */
async function getConversationalQuestions(altitude, prompt, context, templateName = 'career', userResponses = null) {
  // Use the structured altitude journey to get relevant questions
  const relevantQuestions = await getRelevantQuestions(altitude, prompt, userResponses, templateName);
  
  // Convert to the format expected by the frontend
  return relevantQuestions.map(q => q.text);
}

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

  const { prompt, ideaTree = [], coreIdea = '', isDirectionChange = false, altitude, template, userResponses } = req.body;

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

  console.log('LLM altitude refinement request:', {
    prompt: promptValidation.sanitized,
    ideaTreeLength: ideaTree.length,
    coreIdea,
    isDirectionChange,
    altitude,
    template
  });

  // If user is changing direction, prune the tree first
  let currentTree = ideaTree;
  if (isDirectionChange && ideaTree.length > 0) {
    currentTree = pruneTreeBranches(ideaTree, promptValidation.sanitized);
    console.log('Pruned tree:', currentTree);
  }

  // Get current altitude if not provided
  const currentAltitude = altitude || determineAltitude(promptValidation.sanitized, currentTree);
  
  // Get conversational context
  const context = currentTree.length > 0 ? 
    `Exploring: ${currentTree.map(branch => branch.value).join(', ')}` : 
    'Starting fresh exploration';

  // Get template from request, environment variable, or use default
  const templateName = template || process.env.DEFAULT_TEMPLATE || 'career';
  
  // Get conversational refinement from LLM API (provider configured via env vars)
  const conversationalResponse = await callLLMForConversationalRefinement(
    promptValidation.sanitized, 
    currentAltitude, 
    context, 
    currentTree, 
    templateName, 
    userResponses
  );

  // Parse the response
  let parsedResponse = {};
  try {
    if (typeof conversationalResponse === 'string') {
      parsedResponse = JSON.parse(conversationalResponse);
    } else {
      parsedResponse = conversationalResponse;
    }
  } catch (parseError) {
    console.error('Failed to parse LLM response:', parseError);
    parsedResponse = {
      refined_prompt: conversationalResponse,
      questions: []
    };
  }

  // Get conversational questions
  const questions = await getConversationalQuestions(
    currentAltitude, 
    promptValidation.sanitized, 
    context, 
    templateName, 
    userResponses
  );

  // Determine readiness status
  const readinessStatus = isReadyForNextLevel(currentAltitude, promptValidation.sanitized, currentTree);

  console.log('LLM altitude refinement result:', {
    currentAltitude,
    readinessStatus,
    hasRefinedPrompt: !!parsedResponse.refined_prompt,
    questionsCount: questions.length
  });

  return res.status(200).json({
    success: true,
    conversational_response: parsedResponse.refined_prompt || conversationalResponse,
    conversational_questions: parsedResponse.questions || questions,
    altitude_context: context,
    readiness_status: readinessStatus,
    current_altitude: currentAltitude,
    template: templateName,
    timestamp: new Date().toISOString()
  });
});

/**
 * Determine altitude level based on prompt content and idea tree
 */
function determineAltitude(prompt, ideaTree) {
  // Simple altitude determination logic
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('vision') || promptLower.includes('dream') || promptLower.includes('goal')) {
    return '30k';
  } else if (promptLower.includes('industry') || promptLower.includes('category') || promptLower.includes('business')) {
    return '20k';
  } else if (promptLower.includes('specialization') || promptLower.includes('niche') || promptLower.includes('specific')) {
    return '10k';
  } else if (promptLower.includes('action') || promptLower.includes('plan') || promptLower.includes('implement')) {
    return '5k';
  }
  
  // Default based on idea tree depth
  return ideaTree.length === 0 ? '30k' : '20k';
} 