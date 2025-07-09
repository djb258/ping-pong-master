/**
 * API endpoint for ChatGPT-style conversational altitude-based prompt refinement
 * Uses conversational prompts to guide users through altitude levels naturally
 */

import { refinePromptWithAltitude, pruneTreeBranches, generateStructuredOutput } from '../../utils/altitudePromptRefiner';
import { getTemplate, generateSystemPrompt, generateUserPrompt, generateConversationalQuestions } from '../../utils/altitudeTemplates';
import { callLLM } from '../../utils/llmProviders';
import { getRelevantQuestions, getLevelInfo, getNextAltitude, isReadyForNextLevel } from '../../utils/altitudeJourney';

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
      fallbackToMock: true // Fallback to mock if provider fails
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, ideaTree = [], coreIdea = '', isDirectionChange = false, altitude, template, userResponses } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('LLM altitude refinement request:', {
      prompt,
      ideaTreeLength: ideaTree.length,
      coreIdea,
      isDirectionChange,
      altitude,
      template
    });

    // If user is changing direction, prune the tree first
    let currentTree = ideaTree;
    if (isDirectionChange && ideaTree.length > 0) {
      currentTree = pruneTreeBranches(ideaTree, prompt);
      console.log('Pruned tree:', currentTree);
    }

    // Get current altitude if not provided
    const currentAltitude = altitude || determineAltitude(prompt, currentTree);
    
    // Get conversational context
    const context = currentTree.length > 0 ? 
      `Exploring: ${currentTree.map(branch => branch.value).join(', ')}` : 
      'Starting fresh exploration';

    // Get template from request, environment variable, or use default
    const templateName = template || process.env.DEFAULT_TEMPLATE || 'career';
    
    // Get conversational refinement from LLM API (provider configured via env vars)
    const conversationalResponse = await callLLMForConversationalRefinement(
      prompt, 
      currentAltitude, 
      context, 
      currentTree,
      templateName,
      userResponses
    );

    // Parse the conversational response to extract refined prompt and questions
    let refinedPrompt = prompt;
    let conversationalQuestions = [];
    
    if (conversationalResponse) {
      try {
        // Try to parse as JSON first
        let parsedResponse;
        if (typeof conversationalResponse === 'string') {
          parsedResponse = JSON.parse(conversationalResponse);
        } else {
          parsedResponse = conversationalResponse;
        }
        
        if (parsedResponse.refined_prompt) {
          refinedPrompt = parsedResponse.refined_prompt;
        }
        
        if (parsedResponse.questions && Array.isArray(parsedResponse.questions)) {
          conversationalQuestions = parsedResponse.questions;
        }
      } catch (parseError) {
        console.log('[LLM] Failed to parse JSON response, using as-is:', parseError);
        // If parsing fails, use the response as the refined prompt
        refinedPrompt = conversationalResponse;
        conversationalQuestions = await getConversationalQuestions(currentAltitude, prompt, context, templateName, userResponses);
      }
    } else {
      // Fallback to generated questions
      conversationalQuestions = await getConversationalQuestions(currentAltitude, prompt, context, templateName, userResponses);
    }

    // Perform standard altitude-based refinement for tree growth
    const result = await refinePromptWithAltitude(refinedPrompt, currentTree);
    
    // Generate structured output
    const structuredOutput = generateStructuredOutput(
      result.idea_tree,
      coreIdea || prompt,
      result.readiness_status
    );

    console.log('LLM altitude refinement result:', {
      currentAltitude: result.current_altitude,
      newAltitude: result.new_altitude,
      readinessStatus: result.readiness_status,
      treeSize: result.tree_size,
      newBranches: result.new_branches_count
    });

    return res.status(200).json({
      success: true,
      ...result,
      refined_prompt: refinedPrompt, // Use the LLM-refined prompt
      conversational_response: conversationalResponse,
      conversational_questions: conversationalQuestions,
      structured_output: structuredOutput,
      source: 'Modular LLM Altitude Refiner'
    });

  } catch (error) {
    console.error('LLM altitude refinement error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      fallback: 'Unable to perform conversational refinement. Please try again.'
    });
  }
}

// Helper function to determine altitude (imported from altitudePromptRefiner)
function determineAltitude(prompt, ideaTree) {
  if (ideaTree.length === 0) return '30k';
  if (ideaTree.length <= 2) return '20k';
  if (ideaTree.length <= 5) return '10k';
  return '5k';
} 