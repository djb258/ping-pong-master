/**
 * Structured Altitude Journey System
 * 
 * Pre-defined questions and guidance for each altitude level
 * LLM selects the most relevant questions based on user context
 */

/**
 * Altitude Journey Structure
 * Each level has specific questions designed to move users to the next level
 */
export const ALTITUDE_JOURNEY = {
  '30k': {
    name: 'Vision Level',
    description: 'High-level vision and goals - the big picture',
    focus: 'Explore the user\'s overarching vision, values, and long-term aspirations',
    questions: [
      {
        id: 'vision_impact',
        text: 'What kind of impact do you want to make in the world?',
        followUp: 'Think about the difference you want to create for others.',
        category: 'purpose'
      },
      {
        id: 'vision_values',
        text: 'What values are most important to you in this pursuit?',
        followUp: 'Consider what principles will guide your decisions.',
        category: 'values'
      },
      {
        id: 'vision_success',
        text: 'What does success look like to you in 5-10 years?',
        followUp: 'Imagine your ideal future state.',
        category: 'outcome'
      },
      {
        id: 'vision_motivation',
        text: 'What excites you most about this goal?',
        followUp: 'Focus on the emotional and personal drivers.',
        category: 'motivation'
      },
      {
        id: 'vision_scope',
        text: 'How big or small do you want this to be?',
        followUp: 'Consider scale - local, regional, national, global?',
        category: 'scope'
      }
    ],
    nextLevel: '20k',
    transition: 'Moving from vision to specific categories and industries'
  },
  
  '20k': {
    name: 'Category Level',
    description: 'Specific categories and industries - narrowing down from vision',
    focus: 'Identify the specific industry, sector, or category that aligns with their vision',
    questions: [
      {
        id: 'category_industry',
        text: 'What industry or sector feels most aligned with your vision?',
        followUp: 'Consider traditional industries, emerging sectors, or hybrid approaches.',
        category: 'industry'
      },
      {
        id: 'category_approach',
        text: 'What type of approach or model appeals to you most?',
        followUp: 'For-profit, non-profit, social enterprise, consulting, etc.',
        category: 'model'
      },
      {
        id: 'category_environment',
        text: 'What kind of work environment do you thrive in?',
        followUp: 'Startup, corporate, remote, collaborative, independent, etc.',
        category: 'environment'
      },
      {
        id: 'category_audience',
        text: 'Who do you want to serve or work with?',
        followUp: 'Individuals, businesses, communities, specific demographics.',
        category: 'audience'
      },
      {
        id: 'category_geography',
        text: 'Where do you want to focus geographically?',
        followUp: 'Local, regional, national, international, virtual.',
        category: 'location'
      }
    ],
    nextLevel: '10k',
    transition: 'Moving from category to specific specializations and niches'
  },
  
  '10k': {
    name: 'Specialization Level',
    description: 'Specific specializations and niches - finding their unique angle',
    focus: 'Discover their unique specialization, niche, or approach within the chosen category',
    questions: [
      {
        id: 'specialization_niche',
        text: 'What specific aspect or niche within this area interests you most?',
        followUp: 'Look for underserved segments or unique angles.',
        category: 'niche'
      },
      {
        id: 'specialization_unique',
        text: 'What would make your approach or offering unique?',
        followUp: 'Consider your background, skills, perspective, or methodology.',
        category: 'differentiation'
      },
      {
        id: 'specialization_skills',
        text: 'What skills or strengths do you want to leverage?',
        followUp: 'Technical skills, soft skills, experience, knowledge.',
        category: 'capabilities'
      },
      {
        id: 'specialization_problem',
        text: 'What specific problem or need will you address?',
        followUp: 'Be as specific as possible about the pain point.',
        category: 'problem'
      },
      {
        id: 'specialization_method',
        text: 'What methodology or approach will you use?',
        followUp: 'Your unique process, framework, or way of working.',
        category: 'method'
      }
    ],
    nextLevel: '5k',
    transition: 'Moving from specialization to concrete execution and implementation'
  },
  
  '5k': {
    name: 'Execution Level',
    description: 'Concrete actions, timeline, and resources - getting things done',
    focus: 'Identify the core modules, components, or building blocks that make up the specialization',
    questions: [
      {
        id: 'execution_components',
        text: 'What are the key components or modules of your approach?',
        followUp: 'Break down your specialization into manageable pieces.',
        category: 'structure'
      },
      {
        id: 'execution_first',
        text: 'What can you build, test, or implement first?',
        followUp: 'Identify the smallest viable version to start with.',
        category: 'mvp'
      },
      {
        id: 'execution_resources',
        text: 'What resources, tools, or support will you need?',
        followUp: 'Consider time, money, skills, technology, partnerships.',
        category: 'resources'
      },
      {
        id: 'execution_timeline',
        text: 'What\'s your timeline for getting started and making progress?',
        followUp: 'Set realistic milestones and deadlines.',
        category: 'timeline'
      },
      {
        id: 'execution_metrics',
        text: 'How will you measure success and track progress?',
        followUp: 'Define specific, measurable outcomes.',
        category: 'measurement'
      }
    ],
    nextLevel: null,
    transition: 'Ready to execute and implement your refined plan'
  }
};

/**
 * Get questions for a specific altitude level
 */
export function getAltitudeQuestions(altitude, context = {}) {
  const level = ALTITUDE_JOURNEY[altitude];
  if (!level) {
    return [];
  }
  
  return level.questions;
}

/**
 * Get the most relevant questions based on user context
 * This is where the LLM can be used to select the best questions
 */
export async function getRelevantQuestions(altitude, userPrompt, userResponses = null, template = 'career') {
  const allQuestions = getAltitudeQuestions(altitude);
  
  // If no user responses, return the first 2 questions as a starting point
  if (!userResponses) {
    return allQuestions.slice(0, 2);
  }
  
  // Try to use LLM for intelligent question selection
  try {
    const selectedQuestions = await selectQuestionsWithLLM(allQuestions, userPrompt, userResponses, template, altitude);
    if (selectedQuestions && selectedQuestions.length > 0) {
      return selectedQuestions;
    }
  } catch (error) {
    console.log('[Altitude Journey] LLM question selection failed, using fallback:', error);
  }
  
  // Fallback to smart selection based on the template and responses
  return selectQuestionsByContext(allQuestions, userPrompt, userResponses, template);
}

/**
 * Use LLM to intelligently select the most relevant questions
 */
async function selectQuestionsWithLLM(allQuestions, userPrompt, userResponses, template, altitude) {
  try {
    // Import LLM provider dynamically to avoid circular dependencies
    const { callLLM } = await import('./llmProviders.js');
    
    const levelInfo = getLevelInfo(altitude);
    const nextAltitude = getNextAltitude(altitude);
    const nextLevelInfo = nextAltitude ? getLevelInfo(nextAltitude) : null;
    
    const systemPrompt = `You are an expert at selecting the most relevant questions to help users progress through altitude-based thinking.

CURRENT CONTEXT:
- Altitude: ${altitude} (${levelInfo.name})
- User's Original Idea: "${userPrompt}"
- User's Responses: "${userResponses}"
- Template: ${template}

AVAILABLE QUESTIONS:
${allQuestions.map((q, i) => `${i + 1}. ${q.text} (Category: ${q.category})`).join('\n')}

TASK: Select the 2 most relevant questions that will help the user move from ${altitude} to ${nextAltitude || 'execution'} level.

CRITERIA:
1. Questions should build on the user's responses
2. Questions should help them think deeper about their next steps
3. Questions should be specific to their situation
4. Questions should guide them toward the next altitude level

RESPONSE FORMAT:
{
  "selected_questions": [1, 3],
  "reasoning": "Brief explanation of why these questions are most relevant"
}

Return only the JSON response.`;

    const response = await callLLM(systemPrompt, 'Select the 2 most relevant questions.', {
      fallbackToMock: true
    });
    
    if (typeof response === 'string') {
      const parsed = JSON.parse(response);
      if (parsed.selected_questions && Array.isArray(parsed.selected_questions)) {
        return parsed.selected_questions.map(index => allQuestions[index - 1]).filter(Boolean);
      }
    }
    
    return null;
  } catch (error) {
    console.error('[Altitude Journey] Error in LLM question selection:', error);
    return null;
  }
}

/**
 * Smart question selection based on context
 */
function selectQuestionsByContext(questions, userPrompt, userResponses, template) {
  // Simple heuristic-based selection
  // In a full implementation, this would use LLM to analyze context
  
  const promptLower = userPrompt.toLowerCase();
  const responsesLower = userResponses.toLowerCase();
  
  // Select questions that seem most relevant based on keywords
  const relevantQuestions = questions.filter(q => {
    const questionLower = q.text.toLowerCase();
    
    // Check if the question category is mentioned in prompt or responses
    const categoryMatch = q.category && (
      promptLower.includes(q.category) || 
      responsesLower.includes(q.category)
    );
    
    // Check for keyword matches
    const keywordMatch = ['what', 'how', 'where', 'when', 'why'].some(word => 
      questionLower.includes(word) && (
        promptLower.includes(word) || 
        responsesLower.includes(word)
      )
    );
    
    return categoryMatch || keywordMatch;
  });
  
  // Return 2 most relevant questions, or first 2 if no matches
  return relevantQuestions.length >= 2 ? 
    relevantQuestions.slice(0, 2) : 
    questions.slice(0, 2);
}

/**
 * Get the next altitude level
 */
export function getNextAltitude(currentAltitude) {
  const level = ALTITUDE_JOURNEY[currentAltitude];
  return level ? level.nextLevel : null;
}

/**
 * Get transition guidance between levels
 */
export function getTransitionGuidance(currentAltitude) {
  const level = ALTITUDE_JOURNEY[currentAltitude];
  return level ? level.transition : '';
}

/**
 * Get level information
 */
export function getLevelInfo(altitude) {
  return ALTITUDE_JOURNEY[altitude] || null;
}

/**
 * Check if user is ready to move to next level
 */
export function isReadyForNextLevel(altitude, userResponses) {
  // Simple heuristic: if user has provided substantial responses, they're ready
  if (!userResponses) return false;
  
  const responseLength = userResponses.trim().length;
  const wordCount = userResponses.trim().split(/\s+/).length;
  
  // Ready if they've provided at least 50 characters or 10 words
  return responseLength >= 50 || wordCount >= 10;
} 