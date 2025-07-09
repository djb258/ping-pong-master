/**
 * Altitude-Based Prompt Refinement Engine
 * 
 * Implements altitude-based logic (30k, 20k, 10k, 5k) with tree growth
 * and readiness status assessment. Uses local logic that mimics ChatGPT's
 * altitude-based thinking without external API calls.
 */

// Template data - embedded directly to avoid import issues
const pingPongTemplate = {
  "altitude_levels": {
    "30k": {
      "name": "Vision",
      "description": "High-level user vision and goals",
      "questions": [
        "What is your ultimate vision or goal?",
        "What problem are you trying to solve?",
        "What would success look like for you?"
      ],
      "readiness_criteria": {
        "red": "Vague or unclear vision",
        "yellow": "General direction but needs specificity",
        "green": "Clear, actionable vision with measurable outcomes"
      }
    },
    "20k": {
      "name": "Category",
      "description": "Broad category or domain",
      "questions": [
        "What category or industry does this fall into?",
        "What type of business or activity is this?",
        "What domain expertise is required?"
      ],
      "readiness_criteria": {
        "red": "Too broad or undefined category",
        "yellow": "General category but needs focus",
        "green": "Specific category with clear boundaries"
      }
    },
    "10k": {
      "name": "Specialization",
      "description": "Specific specialization within category",
      "questions": [
        "What specific specialization or niche?",
        "What unique angle or approach?",
        "What specific market segment?"
      ],
      "readiness_criteria": {
        "red": "Still too broad or generic",
        "yellow": "Some specialization but could be more specific",
        "green": "Clear specialization with defined scope"
      }
    },
    "5k": {
      "name": "Execution",
      "description": "Specific execution details and implementation",
      "questions": [
        "What specific actions will you take?",
        "What resources or tools do you need?",
        "What is your timeline and milestones?"
      ],
      "readiness_criteria": {
        "red": "Lacks specific execution details",
        "yellow": "Some execution details but incomplete",
        "green": "Clear, actionable execution plan"
      }
    }
  },
  "tree_structure": {
    "max_branches": 10,
    "branch_types": [
      "Market",
      "Focus", 
      "Product Type",
      "Target Audience",
      "Revenue Model",
      "Technology",
      "Partnerships",
      "Timeline",
      "Resources",
      "Success Metrics"
    ]
  },
  "readiness_assessment": {
    "red_threshold": 0.3,
    "yellow_threshold": 0.7,
    "green_threshold": 0.9,
    "factors": [
      "specificity",
      "actionability", 
      "measurability",
      "clarity",
      "completeness"
    ]
  }
};

/**
 * Assess readiness status based on prompt quality and altitude level
 */
function assessReadiness(prompt, altitude) {
  let score = 0;
  const promptLower = prompt.toLowerCase();
  const wordCount = prompt.split(' ').length;
  
  // Base score from word count (longer prompts tend to be more complete)
  score += Math.min(wordCount / 30, 0.3);
  
  // Altitude-specific assessment
  if (altitude === '30k') {
    // At 30k, look for vision and goal clarity
    const visionWords = promptLower.match(/\b(goal|vision|dream|aspire|achieve|become|create|build|start|pursue)\b/gi);
    const vagueWords = promptLower.match(/\b(something|anything|maybe|possibly|kind of|sort of|general|broad)\b/gi);
    score += (visionWords?.length || 0) * 0.2;
    score -= (vagueWords?.length || 0) * 0.3;
    
    // Bonus for having a clear subject
    if (promptLower.includes('i want') || promptLower.includes('i need') || promptLower.includes('i would like')) {
      score += 0.2;
    }
  } else if (altitude === '20k') {
    // At 20k, look for industry/category specificity
    const industryWords = promptLower.match(/\b(industry|sector|field|domain|category|type|business|market)\b/gi);
    const specificIndustries = promptLower.match(/\b(tech|healthcare|finance|insurance|retail|education|manufacturing|services)\b/gi);
    score += (industryWords?.length || 0) * 0.15;
    score += (specificIndustries?.length || 0) * 0.25;
    
    // Bonus for mentioning specific business models or roles
    if (promptLower.includes('agent') || promptLower.includes('consultant') || promptLower.includes('entrepreneur') || 
        promptLower.includes('developer') || promptLower.includes('manager')) {
      score += 0.2;
    }
  } else if (altitude === '10k') {
    // At 10k, look for specialization and niche details
    const specializationWords = promptLower.match(/\b(specialize|niche|focus|specific|particular|target|segment|approach)\b/gi);
    const actionWords = promptLower.match(/\b(develop|create|build|design|implement|launch|start|establish)\b/gi);
    score += (specializationWords?.length || 0) * 0.2;
    score += (actionWords?.length || 0) * 0.15;
    
    // Bonus for mentioning specific specializations
    if (promptLower.includes('life insurance') || promptLower.includes('health insurance') || 
        promptLower.includes('property insurance') || promptLower.includes('auto insurance') ||
        promptLower.includes('web development') || promptLower.includes('mobile app') ||
        promptLower.includes('saas') || promptLower.includes('ecommerce')) {
      score += 0.3;
    }
  } else if (altitude === '5k') {
    // At 5k, look for execution details and concrete plans
    const executionWords = promptLower.match(/\b(plan|timeline|milestone|action|step|resource|tool|budget|schedule)\b/gi);
    const concreteWords = promptLower.match(/\b(first|next|then|finally|specific|concrete|definite|exact|precise)\b/gi);
    score += (executionWords?.length || 0) * 0.25;
    score += (concreteWords?.length || 0) * 0.2;
    
    // Bonus for mentioning specific actions or resources
    if (promptLower.includes('get licensed') || promptLower.includes('join agency') || 
        promptLower.includes('build client') || promptLower.includes('crm software') ||
        promptLower.includes('market research') || promptLower.includes('product development') ||
        promptLower.includes('team building') || promptLower.includes('funding')) {
      score += 0.3;
    }
  }
  
  // Penalty for very short prompts
  if (wordCount < 5) score -= 0.3;
  if (wordCount < 10) score -= 0.1;
  
  // Normalize score to 0-1 range
  score = Math.max(0, Math.min(1, score));
  
  // Determine status based on altitude-appropriate thresholds
  let redThreshold = 0.3;
  let yellowThreshold = 0.6;
  let greenThreshold = 0.8;
  
  // Adjust thresholds based on altitude (higher altitudes can be more lenient)
  if (altitude === '30k') {
    redThreshold = 0.2;
    yellowThreshold = 0.5;
    greenThreshold = 0.7;
  } else if (altitude === '5k') {
    redThreshold = 0.4;
    yellowThreshold = 0.7;
    greenThreshold = 0.9;
  }
  
  if (score < redThreshold) return 'red';
  if (score < yellowThreshold) return 'yellow';
  if (score < greenThreshold) return 'yellow';
  return 'green';
}

/**
 * Determine current altitude based on prompt content and context
 */
function determineAltitude(prompt, ideaTree) {
  const promptLower = prompt.toLowerCase();
  
  // Check for altitude indicators in the prompt
  if (promptLower.includes('vision') || promptLower.includes('goal') || promptLower.includes('dream') || 
      promptLower.includes('ultimate') || promptLower.includes('big picture')) {
    return '30k';
  }
  
  if (promptLower.includes('category') || promptLower.includes('industry') || promptLower.includes('type') ||
      promptLower.includes('domain') || promptLower.includes('field')) {
    return '20k';
  }
  
  if (promptLower.includes('specialization') || promptLower.includes('niche') || promptLower.includes('specific') ||
      promptLower.includes('focus') || promptLower.includes('segment')) {
    return '10k';
  }
  
  if (promptLower.includes('execute') || promptLower.includes('implement') || promptLower.includes('action') ||
      promptLower.includes('plan') || promptLower.includes('timeline') || promptLower.includes('resource')) {
    return '5k';
  }
  
  // If no clear indicators, determine based on tree depth
  if (ideaTree.length === 0) return '30k';
  if (ideaTree.length <= 2) return '20k';
  if (ideaTree.length <= 5) return '10k';
  return '5k';
}

/**
 * Generate appropriate questions for the current altitude
 */
function generateAltitudeQuestions(altitude, currentPrompt) {
  const promptLower = currentPrompt.toLowerCase();
  
  if (altitude === '30k') {
    // Questions to help move from vision to category
    if (promptLower.includes('insurance')) {
      return [
        "What type of insurance do you want to specialize in? (life, health, property, auto, etc.)",
        "What kind of agency structure appeals to you? (independent, captive, direct insurer)"
      ];
    } else if (promptLower.includes('business')) {
      return [
        "What industry or sector interests you most? (tech, healthcare, retail, services, etc.)",
        "What business model do you prefer? (B2B, B2C, SaaS, marketplace, consulting)"
      ];
    } else if (promptLower.includes('career')) {
      return [
        "What industry or field do you want to work in? (tech, healthcare, finance, education, etc.)",
        "What type of role are you targeting? (individual contributor, manager, specialist, generalist)"
      ];
    } else {
      return [
        "What category or domain does this fall into?",
        "What type of activity or pursuit is this?"
      ];
    }
  } else if (altitude === '20k') {
    // Questions to help move from category to specialization
    if (promptLower.includes('insurance')) {
      return [
        "What specific insurance products will you focus on? (term life, whole life, disability, etc.)",
        "What target market segment interests you? (young professionals, families, small businesses, etc.)"
      ];
    } else if (promptLower.includes('business') || promptLower.includes('industry')) {
      return [
        "What specific niche or specialization within this industry?",
        "What unique angle or approach will differentiate you?"
      ];
    } else if (promptLower.includes('career') || promptLower.includes('job')) {
      return [
        "What specific specialization or focus area within this field?",
        "What unique skill set or expertise will you develop?"
      ];
    } else {
      return [
        "What specific specialization within this category?",
        "What unique approach or angle will you take?"
      ];
    }
  } else if (altitude === '10k') {
    // Questions to help move from specialization to execution
    if (promptLower.includes('insurance')) {
      return [
        "What specific actions will you take first? (get licensed, join agency, build network)",
        "What resources and tools do you need? (CRM, marketing materials, office space)"
      ];
    } else if (promptLower.includes('business') || promptLower.includes('specialization')) {
      return [
        "What specific actions will you take first? (market research, product development, team building)",
        "What resources and tools do you need? (funding, technology, partnerships)"
      ];
    } else if (promptLower.includes('career') || promptLower.includes('job')) {
      return [
        "What specific actions will you take first? (skill development, networking, job applications)",
        "What resources and tools do you need? (training, certifications, portfolio)"
      ];
    } else {
      return [
        "What specific actions will you take first?",
        "What resources and tools do you need?"
      ];
    }
  }
  
  return [];
}

/**
 * Extract potential tree branches from the prompt (ChatGPT-style analysis)
 */
function extractTreeBranches(prompt, altitude) {
  const branches = [];
  const promptLower = prompt.toLowerCase();
  
  // Altitude-specific branch extraction
  if (altitude === '30k') {
    // At 30k, extract high-level vision elements
    if (promptLower.includes('insurance')) {
      branches.push({ label: 'Industry', value: 'Insurance', altitude: altitude });
    }
    if (promptLower.includes('business') || promptLower.includes('start')) {
      branches.push({ label: 'Goal Type', value: 'Business Creation', altitude: altitude });
    }
    if (promptLower.includes('career') || promptLower.includes('job')) {
      branches.push({ label: 'Goal Type', value: 'Career Development', altitude: altitude });
    }
    if (promptLower.includes('agent') || promptLower.includes('sales')) {
      branches.push({ label: 'Role Type', value: 'Sales/Service', altitude: altitude });
    }
  } else if (altitude === '20k') {
    // At 20k, extract category and industry details
    if (promptLower.includes('insurance')) {
      branches.push({ label: 'Industry', value: 'Insurance', altitude: altitude });
    }
    if (promptLower.includes('tech') || promptLower.includes('technology')) {
      branches.push({ label: 'Industry', value: 'Technology', altitude: altitude });
    }
    if (promptLower.includes('healthcare') || promptLower.includes('health')) {
      branches.push({ label: 'Industry', value: 'Healthcare', altitude: altitude });
    }
    if (promptLower.includes('finance') || promptLower.includes('financial')) {
      branches.push({ label: 'Industry', value: 'Finance', altitude: altitude });
    }
    if (promptLower.includes('agent')) {
      branches.push({ label: 'Role', value: 'Insurance Agent', altitude: altitude });
    }
    if (promptLower.includes('entrepreneur') || promptLower.includes('business owner')) {
      branches.push({ label: 'Role', value: 'Entrepreneur', altitude: altitude });
    }
    if (promptLower.includes('developer') || promptLower.includes('programmer')) {
      branches.push({ label: 'Role', value: 'Developer', altitude: altitude });
    }
  } else if (altitude === '10k') {
    // At 10k, extract specialization details
    if (promptLower.includes('life insurance')) {
      branches.push({ label: 'Specialization', value: 'Life Insurance', altitude: altitude });
    }
    if (promptLower.includes('health insurance')) {
      branches.push({ label: 'Specialization', value: 'Health Insurance', altitude: altitude });
    }
    if (promptLower.includes('property insurance')) {
      branches.push({ label: 'Specialization', value: 'Property Insurance', altitude: altitude });
    }
    if (promptLower.includes('auto insurance')) {
      branches.push({ label: 'Specialization', value: 'Auto Insurance', altitude: altitude });
    }
    if (promptLower.includes('web development')) {
      branches.push({ label: 'Specialization', value: 'Web Development', altitude: altitude });
    }
    if (promptLower.includes('mobile app')) {
      branches.push({ label: 'Specialization', value: 'Mobile Development', altitude: altitude });
    }
    if (promptLower.includes('saas') || promptLower.includes('software as a service')) {
      branches.push({ label: 'Business Model', value: 'SaaS', altitude: altitude });
    }
    if (promptLower.includes('ecommerce') || promptLower.includes('online store')) {
      branches.push({ label: 'Business Model', value: 'E-commerce', altitude: altitude });
    }
    if (promptLower.includes('individual') || promptLower.includes('family')) {
      branches.push({ label: 'Target Market', value: 'Individual/Family', altitude: altitude });
    }
    if (promptLower.includes('business') || promptLower.includes('corporate')) {
      branches.push({ label: 'Target Market', value: 'Business/Corporate', altitude: altitude });
    }
  } else if (altitude === '5k') {
    // At 5k, extract execution details
    if (promptLower.includes('get licensed') || promptLower.includes('license')) {
      branches.push({ label: 'Action', value: 'Get Licensed', altitude: altitude });
    }
    if (promptLower.includes('join agency') || promptLower.includes('agency')) {
      branches.push({ label: 'Action', value: 'Join Agency', altitude: altitude });
    }
    if (promptLower.includes('build client') || promptLower.includes('client base')) {
      branches.push({ label: 'Action', value: 'Build Client Base', altitude: altitude });
    }
    if (promptLower.includes('crm software') || promptLower.includes('software')) {
      branches.push({ label: 'Resource', value: 'CRM Software', altitude: altitude });
    }
    if (promptLower.includes('market research')) {
      branches.push({ label: 'Action', value: 'Market Research', altitude: altitude });
    }
    if (promptLower.includes('product development')) {
      branches.push({ label: 'Action', value: 'Product Development', altitude: altitude });
    }
    if (promptLower.includes('team building')) {
      branches.push({ label: 'Action', value: 'Team Building', altitude: altitude });
    }
    if (promptLower.includes('funding') || promptLower.includes('investment')) {
      branches.push({ label: 'Resource', value: 'Funding', altitude: altitude });
    }
    if (promptLower.includes('timeline') || promptLower.includes('schedule')) {
      branches.push({ label: 'Timeline', value: 'Implementation Schedule', altitude: altitude });
    }
    if (promptLower.includes('milestone') || promptLower.includes('goal')) {
      branches.push({ label: 'Success Metric', value: 'Milestones', altitude: altitude });
    }
  }
  
  return branches;
}

/**
 * Call LLM API for refinement
 */
export async function callLLMForRefinement(instructionPrompt) {
  try {
    // Import the LLM provider dynamically to avoid circular dependencies
    const { callLLM } = await import('./llmProviders.js');
    
    // Create a simple system prompt for the LLM
    const systemPrompt = `You are an expert altitude-based thinking assistant. Your job is to help users drill down from high-level vision (30k ft) to specific execution (5k ft). Always respond with valid JSON in the exact format requested.`;
    
    console.log('[LLM] Making refinement request');
    
    // Use the unified LLM calling function
    const response = await callLLM(systemPrompt, instructionPrompt, {
      fallbackToMock: true
    });
    
    console.log('[LLM] Refinement response received');
    
    // Try to parse the response as JSON
    if (typeof response === 'string') {
      try {
        return JSON.parse(response);
      } catch (parseError) {
        console.error('[LLM] Failed to parse JSON response:', parseError);
        return null;
      }
    }
    
    return response;
    
  } catch (error) {
    console.error('Error in callLLMForRefinement:', error);
    return null;
  }
}

/**
 * Generate execution-level output when user reaches 5k ft
 * This is the final output layer that produces actionable results
 */
export function generateExecutionOutput(userPrompt, ideaTree, userResponses = {}) {
  const executionContext = {
    core_goal: userPrompt,
    refined_approach: '',
    key_components: [],
    immediate_actions: [],
    timeline: '',
    success_metrics: [],
    resources_needed: []
  };

  // Extract key information from the idea tree
  const specializationBranches = ideaTree.filter(branch => branch.altitude === '10k');
  const categoryBranches = ideaTree.filter(branch => branch.altitude === '20k');
  const visionBranches = ideaTree.filter(branch => branch.altitude === '30k');

  // Build execution context from the journey
  if (specializationBranches.length > 0) {
    executionContext.refined_approach = specializationBranches.map(b => b.value).join(' + ');
  }

  if (categoryBranches.length > 0) {
    executionContext.key_components = categoryBranches.map(b => b.value);
  }

  // Generate immediate actions based on the specialization
  if (specializationBranches.length > 0) {
    const specialization = specializationBranches[0].value.toLowerCase();
    
    if (specialization.includes('insurance')) {
      executionContext.immediate_actions = [
        'Research state licensing requirements',
        'Choose insurance company to work with',
        'Complete pre-licensing education',
        'Schedule licensing exam',
        'Prepare business cards and marketing materials'
      ];
    } else if (specialization.includes('consulting')) {
      executionContext.immediate_actions = [
        'Define your consulting niche and services',
        'Create a professional website and portfolio',
        'Set up business structure and legal requirements',
        'Develop pricing strategy and service packages',
        'Start networking in your target market'
      ];
    } else {
      executionContext.immediate_actions = [
        'Research market and competition',
        'Define your unique value proposition',
        'Create a business plan or action plan',
        'Set up necessary infrastructure',
        'Start building your network'
      ];
    }
  }

  // Generate timeline
  executionContext.timeline = 'Week 1-2: Research and planning\nWeek 3-4: Setup and preparation\nMonth 2: Launch and initial execution\nMonth 3+: Iterate and scale';

  // Generate success metrics
  executionContext.success_metrics = [
    'Complete initial setup and preparation',
    'Achieve first milestone or goal',
    'Establish consistent progress tracking',
    'Build initial network or client base',
    'Measure and adjust based on results'
  ];

  // Generate resources needed
  executionContext.resources_needed = [
    'Time for daily/weekly execution',
    'Financial resources for startup costs',
    'Skills and knowledge development',
    'Support network and mentors',
    'Tools and technology needed'
  ];

  return {
    execution_plan: executionContext,
    is_execution_ready: true,
    next_steps: executionContext.immediate_actions.slice(0, 3),
    success_criteria: executionContext.success_metrics.slice(0, 3)
  };
}

/**
 * Main altitude-based prompt refinement function
 * @param {string} userPrompt
 * @param {Array} ideaTree
 * @param {boolean} yoloMode - If true, always push to the lowest possible altitude
 */
export async function refinePromptWithAltitude(userPrompt, ideaTree = [], yoloMode = false) {
  try {
    // Determine current altitude based on tree progression and prompt content
    let currentAltitude = '30k';
    const altitudeOrder = ['30k', '20k', '10k', '5k'];
    
    // If we have an idea tree, determine altitude based on progression
    if (ideaTree.length > 0) {
      // Find the highest altitude level we've reached
      const uniqueAltitudes = [...new Set(ideaTree.map(branch => branch.altitude))];
      const maxAltitudeIndex = Math.max(...uniqueAltitudes.map(alt => altitudeOrder.indexOf(alt)));
      currentAltitude = altitudeOrder[Math.min(maxAltitudeIndex, altitudeOrder.length - 1)];
    } else {
      // For first prompt, determine based on content
      currentAltitude = determineAltitude(userPrompt, ideaTree);
    }
    
    let nextAltitude = currentAltitude;
    if (yoloMode) {
      nextAltitude = '5k';
    } else {
      const idx = altitudeOrder.indexOf(currentAltitude);
      if (idx < altitudeOrder.length - 1) {
        nextAltitude = altitudeOrder[idx + 1];
      }
    }

    // Check if we're at execution level (5k ft) - this is the output layer
    if (currentAltitude === '5k' || nextAltitude === '5k') {
      const executionOutput = generateExecutionOutput(userPrompt, ideaTree);
      return {
        original_prompt: userPrompt,
        refined_prompt: userPrompt,
        current_altitude: '5k',
        new_altitude: '5k',
        readiness_status: 'green',
        idea_tree: ideaTree,
        new_branches: [],
        execution_output: executionOutput,
        is_execution_level: true,
        tree_size: ideaTree.length,
        new_branches_count: 0
      };
    }

    // Assess readiness
    const readinessStatus = assessReadiness(userPrompt, currentAltitude);

    // Generate altitude-specific questions for the CURRENT altitude (to help move to next)
    let questions = generateAltitudeQuestions(currentAltitude, userPrompt);

    // Extract potential tree branches for the NEXT altitude (where we're moving to)
    const newBranches = extractTreeBranches(userPrompt, nextAltitude);

    // Only add unique branches
    const updatedTree = [
      ...ideaTree,
      ...newBranches.filter(
        newBranch => !ideaTree.some(
          branch => branch.label === newBranch.label && branch.value === newBranch.value
        )
      )
    ];

    // Use the context for the NEXT altitude (where we're moving to)
    const altitudeContext = pingPongTemplate.altitude_levels[nextAltitude];

    // Create comprehensive LLM prompt for altitude-based refinement
    const instructionPrompt = `You are an expert altitude-based thinking assistant. Your job is to help users drill down from high-level vision (30k ft) to specific execution (5k ft).

ALTITUDE LEVELS:
- 30k ft: Vision (high-level goals, dreams, big picture)
- 20k ft: Category (industry, domain, business type)  
- 10k ft: Specialization (niche, focus, specific approach)
- 5k ft: Execution (concrete actions, timeline, resources) - THIS IS THE OUTPUT LAYER

CURRENT ALTITUDE: ${currentAltitude}
USER PROMPT: "${userPrompt}"

YOUR TASK: Provide a refined prompt that moves the user from ${currentAltitude} to the next altitude level, plus 2 specific questions to help them think deeper.

RULES FOR REFINEMENT:
1. Make it SPECIFIC and ACTIONABLE for the next altitude level
2. Include concrete examples, industries, specializations, or actions
3. Keep it concise but detailed enough to be useful
4. Focus on what the user should DO next, not just what they should think about
5. If moving to 5k ft (execution), focus on concrete, immediate actions

RULES FOR QUESTIONS:
1. Make them SPECIFIC to the user's current prompt and next altitude
2. Include examples or options in parentheses
3. Focus on helping them make concrete decisions
4. One question should be about WHAT to focus on, one about HOW to approach it

RESPONSE FORMAT:
{
  "refined_prompt": "Your specific, actionable refinement here",
  "questions": [
    "Specific question 1 with examples?",
    "Specific question 2 with examples?"
  ]
}

EXAMPLE FOR INSURANCE AGENT AT 30k:
{
  "refined_prompt": "I want to become an insurance agent specializing in life insurance for families and small businesses. I'll work with an independent agency that offers multiple insurance products, focusing on helping clients understand their coverage needs and providing personalized service.",
  "questions": [
    "What type of insurance do you want to specialize in? (life, health, property, auto, etc.)",
    "What kind of agency structure appeals to you? (independent, captive, direct insurer)"
  ]
}

Now provide a refinement and questions for: "${userPrompt}" at ${currentAltitude} altitude.`;

    // Call LLM for intelligent refinement and questions
    let refinedPrompt = userPrompt;
    let llmQuestions = [];
    
    try {
      // Try to call LLM API for intelligent refinement
      const llmResponse = await callLLMForRefinement(instructionPrompt);
      
      if (llmResponse && llmResponse.refined_prompt) {
        refinedPrompt = llmResponse.refined_prompt;
        if (llmResponse.questions && llmResponse.questions.length > 0) {
          questions = llmResponse.questions;
        }
      } else {
        // Fallback to our existing logic if LLM fails
        console.log('LLM call failed, using fallback logic');
        const promptLower = userPrompt.toLowerCase();
        
        if (currentAltitude === '30k') {
          if (promptLower.includes('insurance') && promptLower.includes('agent')) {
            refinedPrompt = `I want to become an insurance agent specializing in life insurance for families and small businesses. I'll work with an independent agency that offers multiple insurance products, focusing on helping clients understand their coverage needs and providing personalized service.`;
            questions = [
              "What type of insurance do you want to specialize in? (life, health, property, auto, etc.)",
              "What kind of agency structure appeals to you? (independent, captive, direct insurer)"
            ];
          }
        }
      }
      
    } catch (error) {
      console.error('Error calling LLM for refinement:', error);
      // Fall back to our existing logic if LLM fails
    }

    // Determine new readiness after refinement
    const newReadinessStatus = assessReadiness(refinedPrompt, nextAltitude);

    return {
      original_prompt: userPrompt,
      refined_prompt: refinedPrompt,
      instruction_prompt: instructionPrompt,
      current_altitude: currentAltitude,
      new_altitude: nextAltitude,
      readiness_status: newReadinessStatus,
      idea_tree: updatedTree,
      new_branches: newBranches,
      altitude_context: altitudeContext,
      suggested_questions: questions,
      tree_size: updatedTree.length,
      new_branches_count: newBranches.length
    };
  } catch (error) {
    console.error('Error in altitude-based refinement:', error);
    return {
      original_prompt: userPrompt,
      refined_prompt: userPrompt,
      current_altitude: '30k',
      new_altitude: '30k',
      readiness_status: 'red',
      idea_tree: ideaTree,
      new_branches: [],
      error: error.message
    };
  }
}

/**
 * Prune tree branches when user changes direction
 */
export function pruneTreeBranches(ideaTree, newDirection) {
  // Simple pruning: remove branches that don't align with new direction
  const newDirectionLower = newDirection.toLowerCase();
  
  return ideaTree.filter(branch => {
    const branchValueLower = branch.value.toLowerCase();
    const branchLabelLower = branch.label.toLowerCase();
    
    // Keep branches that are relevant to the new direction
    return newDirectionLower.includes(branchValueLower) || 
           newDirectionLower.includes(branchLabelLower) ||
           branchValueLower.includes(newDirectionLower);
  });
}

/**
 * Generate final structured output
 */
export function generateStructuredOutput(ideaTree, coreIdea, readinessStatus) {
  return {
    core_idea: coreIdea,
    branches: (ideaTree || []).map(branch => ({
      label: branch.label,
      value: branch.value,
      altitude: branch.altitude
    })),
    readiness_status: readinessStatus
  };
} 