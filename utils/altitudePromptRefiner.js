/**
 * Altitude-Based Prompt Refinement Engine
 * 
 * Implements altitude-based logic (30k, 20k, 10k, 5k) with tree growth
 * and readiness status assessment.
 */

// Template data - in a real app, this would be loaded from a JSON file
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
 * Assess readiness status based on prompt quality
 */
function assessReadiness(prompt, altitude) {
  const factors = pingPongTemplate.readiness_assessment.factors;
  let score = 0;
  
  // Specificity check
  const specificWords = prompt.match(/\b(specific|exact|precise|particular|definite|concrete|detailed|particular)\b/gi);
  const vagueWords = prompt.match(/\b(general|broad|vague|unsure|maybe|possibly|kind of|sort of)\b/gi);
  score += (specificWords?.length || 0) * 0.2;
  score -= (vagueWords?.length || 0) * 0.3;
  
  // Actionability check
  const actionWords = prompt.match(/\b(do|create|build|implement|execute|launch|start|develop|design|plan)\b/gi);
  score += (actionWords?.length || 0) * 0.15;
  
  // Measurability check
  const measureWords = prompt.match(/\b(measure|track|metric|kpi|goal|target|number|percentage|amount|quantity)\b/gi);
  score += (measureWords?.length || 0) * 0.15;
  
  // Clarity check
  const clarityWords = prompt.match(/\b(clear|understand|define|explain|clarify|specify|detail)\b/gi);
  score += (clarityWords?.length || 0) * 0.1;
  
  // Completeness check
  const wordCount = prompt.split(' ').length;
  score += Math.min(wordCount / 20, 0.4); // Bonus for longer, more complete prompts
  
  // Normalize score to 0-1 range
  score = Math.max(0, Math.min(1, score));
  
  // Determine status based on thresholds
  const { red_threshold, yellow_threshold, green_threshold } = pingPongTemplate.readiness_assessment;
  
  if (score < red_threshold) return 'red';
  if (score < yellow_threshold) return 'yellow';
  if (score < green_threshold) return 'yellow';
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
  const level = pingPongTemplate.altitude_levels[altitude];
  if (!level) return [];
  
  // Select relevant questions based on current prompt content
  const promptLower = currentPrompt.toLowerCase();
  const relevantQuestions = level.questions.filter(question => {
    const questionLower = question.toLowerCase();
    // Avoid questions that seem already answered
    if (questionLower.includes('vision') && promptLower.includes('vision')) return false;
    if (questionLower.includes('category') && promptLower.includes('category')) return false;
    if (questionLower.includes('specialization') && promptLower.includes('specialization')) return false;
    if (questionLower.includes('execute') && promptLower.includes('execute')) return false;
    return true;
  });
  
  return relevantQuestions.slice(0, 2); // Return up to 2 relevant questions
}

/**
 * Extract potential tree branches from the prompt
 */
function extractTreeBranches(prompt, altitude) {
  const branches = [];
  const branchTypes = pingPongTemplate.tree_structure.branch_types;
  
  // Simple keyword extraction for now
  branchTypes.forEach(branchType => {
    const branchTypeLower = branchType.toLowerCase();
    const promptLower = prompt.toLowerCase();
    
    // Look for branch type mentions
    if (promptLower.includes(branchTypeLower)) {
      // Extract the value after the branch type
      const regex = new RegExp(`${branchTypeLower}[\\s:]+([^\\s,]+)`, 'i');
      const match = prompt.match(regex);
      if (match) {
        branches.push({
          label: branchType,
          value: match[1],
          altitude: altitude
        });
      }
    }
  });
  
  return branches;
}

/**
 * Main altitude-based prompt refinement function
 */
export async function refinePromptWithAltitude(userPrompt, ideaTree = []) {
  try {
    // Determine current altitude
    const currentAltitude = determineAltitude(userPrompt, ideaTree);
    
    // Assess readiness
    const readinessStatus = assessReadiness(userPrompt, currentAltitude);
    
    // Generate altitude-specific questions
    const questions = generateAltitudeQuestions(currentAltitude, userPrompt);
    
    // Extract potential tree branches
    const newBranches = extractTreeBranches(userPrompt, currentAltitude);
    
    // Create enhanced prompt for AI refinement
    const altitudeContext = pingPongTemplate.altitude_levels[currentAltitude];
    const enhancedPrompt = `
Current Altitude: ${currentAltitude} (${altitudeContext.name})
Context: ${altitudeContext.description}

User's current prompt: "${userPrompt}"

Current readiness status: ${readinessStatus}
${readinessStatus === 'red' ? 'The prompt is too vague and needs more specificity.' : ''}
${readinessStatus === 'yellow' ? 'The prompt is improving but could be more specific.' : ''}
${readinessStatus === 'green' ? 'The prompt is specific and actionable.' : ''}

Please refine this prompt to:
1. Move toward the next lower altitude level (more specific and actionable)
2. Improve the readiness status toward green
3. Add specific details that could become tree branches
4. Make it more actionable and measurable

${questions.length > 0 ? `Consider these questions: ${questions.join(' ')}` : ''}

Refined prompt:`;

    // Call the existing refinement API
    const response = await fetch('/api/refine-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: enhancedPrompt })
    });
    
    const data = await response.json();
    const refinedPrompt = data.refined_prompt || userPrompt;
    
    // Update tree with new branches
    const updatedTree = [...ideaTree, ...newBranches];
    
    // Determine new altitude after refinement
    const newAltitude = determineAltitude(refinedPrompt, updatedTree);
    const newReadinessStatus = assessReadiness(refinedPrompt, newAltitude);
    
    return {
      original_prompt: userPrompt,
      refined_prompt: refinedPrompt,
      current_altitude: currentAltitude,
      new_altitude: newAltitude,
      readiness_status: newReadinessStatus,
      idea_tree: updatedTree,
      new_branches: newBranches,
      altitude_context: altitudeContext,
      suggested_questions: questions
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
    branches: ideaTree.map(branch => ({
      label: branch.label,
      value: branch.value,
      altitude: branch.altitude
    })),
    readiness_status: readinessStatus
  };
} 