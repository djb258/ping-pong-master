/**
 * Altitude Templates - Reusable altitude-based refinement templates
 * 
 * This module provides template configurations for different types of projects
 * and use cases, making the altitude-based refinement system reusable.
 */

/**
 * Base altitude framework that all templates extend
 */
const BASE_ALTITUDE_FRAMEWORK = {
  '30k': {
    name: 'Vision Level',
    description: 'High-level vision and goals - the big picture of what they want to achieve',
    focus: 'Explore the user\'s overarching vision, values, and long-term aspirations',
    questions: 'What excites you most? What kind of impact do you want to make? What does success look like to you?',
    output: 'Help them articulate a clear, inspiring vision statement'
  },
  '20k': {
    name: 'Category Level', 
    description: 'Specific categories and industries - narrowing down from vision to concrete domains',
    focus: 'Identify the specific industry, sector, or category that aligns with their vision',
    questions: 'What industry or category feels right? What type of approach appeals to you? What environment do you thrive in?',
    output: 'Help them identify the specific category or industry they want to pursue'
  },
  '10k': {
    name: 'Specialization Level',
    description: 'Specific specializations and niches - finding their unique angle within the category',
    focus: 'Discover their unique specialization, niche, or approach within the chosen category',
    questions: 'What specific aspect interests you most? What would make your approach unique? What skills or strengths do you want to leverage?',
    output: 'Help them define their unique specialization or niche'
  },
  '5k': {
    name: 'Modular Execution Level',
    description: 'Breaking down the specialization into modular components that can be built and executed independently',
    focus: 'Identify the core modules, components, or building blocks that make up the specialization',
    questions: 'What are the key modules or components? How can this be broken down into independent pieces? What can be built first?',
    output: 'Help them identify the modular components and create a buildable structure'
  }
};

/**
 * Template for Career/Professional Development
 */
export const CAREER_TEMPLATE = {
  name: 'Career Development',
  description: 'For exploring career paths, job transitions, and professional growth',
  altitudeFramework: {
    ...BASE_ALTITUDE_FRAMEWORK,
    '30k': {
      ...BASE_ALTITUDE_FRAMEWORK['30k'],
      focus: 'Explore the user\'s career vision, values, and long-term professional aspirations',
      questions: 'What kind of work excites you most? What impact do you want to make in your career? What does professional success look like to you?',
      output: 'Help them articulate a clear career vision and professional goals'
    },
    '20k': {
      ...BASE_ALTITUDE_FRAMEWORK['20k'],
      focus: 'Identify the specific industry, sector, or career field that aligns with their vision',
      questions: 'What industry or field feels right for you? What type of role appeals to you most? What kind of work environment do you thrive in?',
      output: 'Help them identify the specific career field or industry they want to pursue'
    },
    '10k': {
      ...BASE_ALTITUDE_FRAMEWORK['10k'],
      focus: 'Discover their unique specialization, role, or niche within the chosen career field',
      questions: 'What specific role or specialization interests you most? What would make you unique in this field? What skills or strengths do you want to leverage?',
      output: 'Help them define their unique career specialization or role'
    },
    '5k': {
      ...BASE_ALTITUDE_FRAMEWORK['5k'],
      focus: 'Identify the core skills, experiences, and steps needed to achieve their career goals',
      questions: 'What skills or certifications do you need? What experiences should you gain? What steps can you take first?',
      output: 'Help them create a modular career development plan with specific actionable steps'
    }
  }
};

/**
 * Template for Business/Startup Ideas
 */
export const BUSINESS_TEMPLATE = {
  name: 'Business Development',
  description: 'For exploring business ideas, startups, and entrepreneurial ventures',
  altitudeFramework: {
    ...BASE_ALTITUDE_FRAMEWORK,
    '30k': {
      ...BASE_ALTITUDE_FRAMEWORK['30k'],
      focus: 'Explore the user\'s business vision, values, and long-term entrepreneurial aspirations',
      questions: 'What business idea excites you most? What problem do you want to solve? What does business success look like to you?',
      output: 'Help them articulate a clear business vision and value proposition'
    },
    '20k': {
      ...BASE_ALTITUDE_FRAMEWORK['20k'],
      focus: 'Identify the specific market, industry, or business model that aligns with their vision',
      questions: 'What market or industry should you target? What business model appeals to you? What type of business structure do you prefer?',
      output: 'Help them identify the specific market and business model they want to pursue'
    },
    '10k': {
      ...BASE_ALTITUDE_FRAMEWORK['10k'],
      focus: 'Discover their unique product/service offering and competitive advantage',
      questions: 'What specific product or service will you offer? What makes your solution unique? What competitive advantages do you have?',
      output: 'Help them define their unique product/service offering and market positioning'
    },
    '5k': {
      ...BASE_ALTITUDE_FRAMEWORK['5k'],
      focus: 'Identify the core business modules, MVP features, and development phases',
      questions: 'What are the core features of your MVP? How can you break this into development phases? What can you build and test first?',
      output: 'Help them create a modular business development plan with clear phases and milestones'
    }
  }
};

/**
 * Template for Technology/Software Projects
 */
export const TECH_TEMPLATE = {
  name: 'Technology Development',
  description: 'For exploring software projects, apps, and technology solutions',
  altitudeFramework: {
    ...BASE_ALTITUDE_FRAMEWORK,
    '30k': {
      ...BASE_ALTITUDE_FRAMEWORK['30k'],
      focus: 'Explore the user\'s technology vision and the problems they want to solve',
      questions: 'What technology problem excites you most? What impact do you want to make? What does success look like for this project?',
      output: 'Help them articulate a clear technology vision and problem statement'
    },
    '20k': {
      ...BASE_ALTITUDE_FRAMEWORK['20k'],
      focus: 'Identify the specific technology domain, platform, or approach to pursue',
      questions: 'What technology domain should you focus on? What platform or approach appeals to you? What type of solution do you want to build?',
      output: 'Help them identify the specific technology domain and approach they want to pursue'
    },
    '10k': {
      ...BASE_ALTITUDE_FRAMEWORK['10k'],
      focus: 'Discover their unique technical solution and architecture approach',
      questions: 'What specific technical solution will you build? What makes your approach unique? What technologies or frameworks will you use?',
      output: 'Help them define their unique technical solution and architecture'
    },
    '5k': {
      ...BASE_ALTITUDE_FRAMEWORK['5k'],
      focus: 'Identify the core system modules, components, and development phases',
      questions: 'What are the core modules of your system? How can you break this into development phases? What can you build and test first?',
      output: 'Help them create a modular technical architecture with clear development phases'
    }
  }
};

/**
 * Template for Creative/Content Projects
 */
export const CREATIVE_TEMPLATE = {
  name: 'Creative Development',
  description: 'For exploring creative projects, content creation, and artistic endeavors',
  altitudeFramework: {
    ...BASE_ALTITUDE_FRAMEWORK,
    '30k': {
      ...BASE_ALTITUDE_FRAMEWORK['30k'],
      focus: 'Explore the user\'s creative vision and the stories they want to tell',
      questions: 'What creative project excites you most? What message do you want to share? What does creative success look like to you?',
      output: 'Help them articulate a clear creative vision and artistic direction'
    },
    '20k': {
      ...BASE_ALTITUDE_FRAMEWORK['20k'],
      focus: 'Identify the specific creative medium, genre, or format to pursue',
      questions: 'What creative medium feels right for you? What genre or style appeals to you? What type of content do you want to create?',
      output: 'Help them identify the specific creative medium and genre they want to pursue'
    },
    '10k': {
      ...BASE_ALTITUDE_FRAMEWORK['10k'],
      focus: 'Discover their unique creative voice and artistic approach',
      questions: 'What specific creative angle will you take? What makes your style unique? What techniques or approaches will you use?',
      output: 'Help them define their unique creative voice and artistic approach'
    },
    '5k': {
      ...BASE_ALTITUDE_FRAMEWORK['5k'],
      focus: 'Identify the core creative modules, content pieces, and production phases',
      questions: 'What are the core pieces of your creative project? How can you break this into production phases? What can you create and share first?',
      output: 'Help them create a modular creative production plan with clear phases and deliverables'
    }
  }
};

/**
 * Template for Learning/Education Projects
 */
export const LEARNING_TEMPLATE = {
  name: 'Learning Development',
  description: 'For exploring learning goals, skill development, and educational projects',
  altitudeFramework: {
    ...BASE_ALTITUDE_FRAMEWORK,
    '30k': {
      ...BASE_ALTITUDE_FRAMEWORK['30k'],
      focus: 'Explore the user\'s learning vision and the knowledge they want to acquire',
      questions: 'What learning goal excites you most? What knowledge do you want to gain? What does learning success look like to you?',
      output: 'Help them articulate a clear learning vision and educational goals'
    },
    '20k': {
      ...BASE_ALTITUDE_FRAMEWORK['20k'],
      focus: 'Identify the specific subject area, field, or domain to focus on',
      questions: 'What subject area should you focus on? What type of learning appeals to you? What field do you want to explore?',
      output: 'Help them identify the specific subject area and learning domain they want to pursue'
    },
    '10k': {
      ...BASE_ALTITUDE_FRAMEWORK['10k'],
      focus: 'Discover their unique learning approach and specialization within the field',
      questions: 'What specific aspect of this field interests you most? What makes your learning approach unique? What skills do you want to develop?',
      output: 'Help them define their unique learning specialization and approach'
    },
    '5k': {
      ...BASE_ALTITUDE_FRAMEWORK['5k'],
      focus: 'Identify the core learning modules, resources, and study phases',
      questions: 'What are the core topics you need to learn? How can you break this into study phases? What can you learn and practice first?',
      output: 'Help them create a modular learning plan with clear study phases and resources'
    }
  }
};

/**
 * Template for Personal Development/Goals
 */
export const PERSONAL_TEMPLATE = {
  name: 'Personal Development',
  description: 'For exploring personal goals, life changes, and self-improvement projects',
  altitudeFramework: {
    ...BASE_ALTITUDE_FRAMEWORK,
    '30k': {
      ...BASE_ALTITUDE_FRAMEWORK['30k'],
      focus: 'Explore the user\'s personal vision and the life they want to create',
      questions: 'What personal goal excites you most? What kind of life do you want to build? What does personal success look like to you?',
      output: 'Help them articulate a clear personal vision and life goals'
    },
    '20k': {
      ...BASE_ALTITUDE_FRAMEWORK['20k'],
      focus: 'Identify the specific life area, habit, or change to focus on',
      questions: 'What life area should you focus on? What type of change appeals to you? What aspect of your life do you want to improve?',
      output: 'Help them identify the specific life area and change they want to pursue'
    },
    '10k': {
      ...BASE_ALTITUDE_FRAMEWORK['10k'],
      focus: 'Discover their unique approach and method for achieving their personal goal',
      questions: 'What specific approach interests you most? What makes your method unique? What strengths can you leverage?',
      output: 'Help them define their unique approach to achieving their personal goal'
    },
    '5k': {
      ...BASE_ALTITUDE_FRAMEWORK['5k'],
      focus: 'Identify the core action modules, habits, and implementation phases',
      questions: 'What are the core actions you need to take? How can you break this into phases? What can you start doing first?',
      output: 'Help them create a modular personal development plan with clear action phases'
    }
  }
};

/**
 * Available templates
 */
export const AVAILABLE_TEMPLATES = {
  career: CAREER_TEMPLATE,
  business: BUSINESS_TEMPLATE,
  tech: TECH_TEMPLATE,
  creative: CREATIVE_TEMPLATE,
  learning: LEARNING_TEMPLATE,
  personal: PERSONAL_TEMPLATE
};

/**
 * Get a template by name
 */
export function getTemplate(templateName) {
  return AVAILABLE_TEMPLATES[templateName] || CAREER_TEMPLATE;
}

/**
 * Get all available template names
 */
export function getAvailableTemplateNames() {
  return Object.keys(AVAILABLE_TEMPLATES);
}

/**
 * Create a custom template by extending a base template
 */
export function createCustomTemplate(baseTemplateName, customizations) {
  const baseTemplate = getTemplate(baseTemplateName);
  return {
    ...baseTemplate,
    ...customizations,
    altitudeFramework: {
      ...baseTemplate.altitudeFramework,
      ...customizations.altitudeFramework
    }
  };
}

/**
 * Generate system prompt for a specific template and altitude
 */
export function generateSystemPrompt(templateName, altitude, context, ideaTree) {
  const template = getTemplate(templateName);
  const currentLevel = template.altitudeFramework[altitude];
  
  const treeContext = ideaTree.length > 0 ? 
    `\n\nPrevious exploration has identified these areas: ${ideaTree.map(branch => branch.value).join(', ')}` : '';

  return `You are a friendly, conversational AI assistant guiding users through a structured altitude-based ${template.name.toLowerCase()} refinement process.

## ALTITUDE FRAMEWORK
We use a 4-level altitude system to help users refine their ${template.name.toLowerCase()} ideas:

**30k - Vision Level**: High-level vision and goals
**20k - Category Level**: Specific categories and industries  
**10k - Specialization Level**: Specific specializations and niches
**5k - Modular Execution Level**: Breaking down into modular components for independent building

## CURRENT ALTITUDE: ${altitude} - ${currentLevel.name}
**Focus**: ${currentLevel.focus}
**Description**: ${currentLevel.description}

## YOUR ROLE
1. Have a natural, engaging conversation about their ${template.name.toLowerCase()} idea at this altitude level
2. Ask thoughtful questions that help them think deeper about ${currentLevel.focus.toLowerCase()}
3. Provide gentle guidance to help them move toward the next altitude level
4. Be encouraging and supportive throughout the process

## CONVERSATION STYLE
- Be warm, friendly, and genuinely interested in their goals
- Ask follow-up questions that feel natural, not like an interrogation
- Share relevant insights or examples when helpful
- Acknowledge their progress and build on previous insights
- Use "we" and "us" to create a collaborative feeling

## EXPECTED OUTPUT
Your response should help them: ${currentLevel.output}

## CONTEXT
${context || 'Starting fresh exploration'}${treeContext}

Remember: You're having a conversation, not conducting an interview. Make it feel natural and engaging while guiding them toward the next altitude level!`;
}

/**
 * Generate user prompt for a specific template and altitude
 */
export function generateUserPrompt(templateName, altitude, prompt, context) {
  const template = getTemplate(templateName);
  const currentLevel = template.altitudeFramework[altitude];
  
  return `I'm helping someone explore their ${template.name.toLowerCase()} at the ${altitude} (${currentLevel.name}) level. They said: "${prompt}"

Please have a natural conversation that helps them:
${currentLevel.questions.split('?').map(q => q.trim()).filter(q => q).map(q => `- ${q}?`).join('\n')}

Ask thoughtful questions and provide insights that help them think deeper about ${currentLevel.focus.toLowerCase()}.`;
}

/**
 * Generate conversational questions for a specific template and altitude
 */
export function generateConversationalQuestions(templateName, altitude, prompt, context) {
  const template = getTemplate(templateName);
  const currentLevel = template.altitudeFramework[altitude];
  
  return currentLevel.questions.split('?').map(q => q.trim()).filter(q => q).map(q => `${q}?`);
} 