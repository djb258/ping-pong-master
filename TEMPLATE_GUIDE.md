# Altitude Template System Guide

## Overview

The altitude-based prompt refinement system is now modular and reusable across different types of projects. This guide explains how to use the existing templates and create custom ones for your specific needs.

## Available Templates

### 1. Career Development (`career`)
- **Best for**: Career paths, job transitions, professional growth
- **Focus**: Professional development and career planning
- **Example use**: "I want to transition from marketing to data science"

### 2. Business Development (`business`)
- **Best for**: Business ideas, startups, entrepreneurial ventures
- **Focus**: Business planning and market positioning
- **Example use**: "I want to start a sustainable fashion brand"

### 3. Technology Development (`tech`)
- **Best for**: Software projects, apps, technology solutions
- **Focus**: Technical architecture and development planning
- **Example use**: "I want to build a mobile app for fitness tracking"

### 4. Creative Development (`creative`)
- **Best for**: Creative projects, content creation, artistic endeavors
- **Focus**: Creative direction and artistic expression
- **Example use**: "I want to create a YouTube channel about cooking"

### 5. Learning Development (`learning`)
- **Best for**: Learning goals, skill development, educational projects
- **Focus**: Educational planning and skill acquisition
- **Example use**: "I want to learn machine learning"

### 6. Personal Development (`personal`)
- **Best for**: Personal goals, life changes, self-improvement projects
- **Focus**: Personal growth and life planning
- **Example use**: "I want to improve my public speaking skills"

## How to Use Templates

### In the UI
1. Select your desired template from the template selector at the top
2. The AI will automatically adapt its questions and guidance to your chosen domain
3. Each altitude level will focus on aspects relevant to your template type

### Programmatically
```javascript
// Make API call with specific template
const response = await fetch('/api/refine-prompt-chatgpt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "Your idea here",
    template: 'business', // Specify template
    // ... other parameters
  })
});
```

## Creating Custom Templates

### 1. Define Your Template Structure
```javascript
export const CUSTOM_TEMPLATE = {
  name: 'Your Template Name',
  description: 'Brief description of what this template is for',
  altitudeFramework: {
    '30k': {
      name: 'Vision Level',
      description: 'What this level focuses on',
      focus: 'Specific focus area for this level',
      questions: 'Key questions to ask at this level?',
      output: 'What should be achieved at this level'
    },
    '20k': { /* ... */ },
    '10k': { /* ... */ },
    '5k': { /* ... */ }
  }
};
```

### 2. Add to Available Templates
```javascript
// In utils/altitudeTemplates.js
export const AVAILABLE_TEMPLATES = {
  career: CAREER_TEMPLATE,
  business: BUSINESS_TEMPLATE,
  // ... existing templates
  custom: CUSTOM_TEMPLATE // Add your template
};
```

### 3. Update the Template Selector
```javascript
// In components/TemplateSelector.jsx
const templates = [
  // ... existing templates
  {
    id: 'custom',
    name: 'Your Template Name',
    description: 'Your template description',
    icon: '🎯' // Choose an appropriate emoji
  }
];
```

## Template Structure Explained

### Base Framework
All templates extend the base altitude framework:
- **30k - Vision Level**: High-level vision and goals
- **20k - Category Level**: Specific categories and industries
- **10k - Specialization Level**: Specific specializations and niches
- **5k - Modular Execution Level**: Breaking down into modular components

### Customizing Each Level
For each altitude level, you can customize:
- **name**: Display name for the level
- **description**: What this level is about
- **focus**: What the AI should focus on during this level
- **questions**: Key questions to guide the conversation
- **output**: What should be achieved at this level

## Best Practices

### 1. Keep Questions Conversational
- Use natural, engaging language
- Avoid interrogative tone
- Make questions feel like part of a conversation

### 2. Maintain Altitude Progression
- Each level should build on the previous
- Questions should get more specific as altitude decreases
- 5k level should focus on modular, actionable components

### 3. Domain-Specific Language
- Use terminology relevant to your domain
- Adapt examples and analogies to your field
- Consider the user's background and expertise level

### 4. Consistent Structure
- Follow the established pattern for all levels
- Maintain similar question counts per level
- Keep descriptions concise but informative

## Example: Creating a "Product Management" Template

```javascript
export const PRODUCT_MANAGEMENT_TEMPLATE = {
  name: 'Product Management',
  description: 'For exploring product ideas, feature planning, and product strategy',
  altitudeFramework: {
    '30k': {
      name: 'Product Vision',
      description: 'High-level product vision and user value proposition',
      focus: 'Explore the user problem and overall product vision',
      questions: 'What problem are you solving? Who are your users? What does success look like?',
      output: 'Help them articulate a clear product vision and value proposition'
    },
    '20k': {
      name: 'Product Category',
      description: 'Specific product category and market positioning',
      focus: 'Identify the product category and target market',
      questions: 'What type of product is this? Who is your target market? What category does this fit into?',
      output: 'Help them identify the specific product category and market'
    },
    '10k': {
      name: 'Product Differentiation',
      description: 'Unique features and competitive advantages',
      focus: 'Discover unique features and competitive positioning',
      questions: 'What makes your product unique? What features are most important? What is your competitive advantage?',
      output: 'Help them define unique product features and positioning'
    },
    '5k': {
      name: 'Feature Modules',
      description: 'Breaking down into core feature modules and development phases',
      focus: 'Identify core feature modules and development roadmap',
      questions: 'What are the core feature modules? How can you break this into development phases? What can you build first?',
      output: 'Help them create a modular feature roadmap with clear development phases'
    }
  }
};
```

## Extending the System

### Adding New Altitude Levels
You can extend beyond the 4-level system by adding more altitude levels:
```javascript
altitudeFramework: {
  '40k': { /* Strategic Level */ },
  '30k': { /* Vision Level */ },
  '20k': { /* Category Level */ },
  '10k': { /* Specialization Level */ },
  '5k': { /* Modular Execution Level */ },
  '1k': { /* Implementation Level */ }
}
```

### Adding Template Metadata
You can extend templates with additional metadata:
```javascript
export const ENHANCED_TEMPLATE = {
  name: 'Enhanced Template',
  description: 'Template with additional features',
  version: '1.0',
  author: 'Your Name',
  tags: ['business', 'startup'],
  difficulty: 'intermediate',
  estimatedTime: '30-60 minutes',
  altitudeFramework: { /* ... */ }
};
```

## Troubleshooting

### Common Issues
1. **Template not showing**: Check that the template is added to `AVAILABLE_TEMPLATES`
2. **Questions not updating**: Verify the template is being passed to the API call
3. **AI responses not domain-specific**: Ensure the template questions are specific to your domain

### Debugging
- Check browser console for API errors
- Verify template name is correctly passed in API calls
- Test with different templates to ensure the system is working

## Contributing

When creating new templates:
1. Follow the established naming conventions
2. Test with real use cases
3. Ensure questions are conversational and engaging
4. Maintain the altitude progression logic
5. Add appropriate documentation

This template system makes the altitude-based refinement approach reusable across different domains and use cases, allowing you to quickly adapt the system for new projects without rebuilding the core logic. 