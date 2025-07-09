/**
 * Dynamic Template System
 * 
 * Allows creation of custom multi-layer refinement templates
 * Handles dynamic layer structures, transitions, questions, and outputs
 */

/**
 * Template Structure
 * Each template defines layers, transitions, questions, and output format
 */
export class DynamicTemplate {
  constructor(templateConfig) {
    this.name = templateConfig.name;
    this.description = templateConfig.description;
    this.layers = templateConfig.layers;
    this.outputFormat = templateConfig.outputFormat;
    this.layerOrder = Object.keys(templateConfig.layers);
  }

  /**
   * Get layer information
   */
  getLayerInfo(layerId) {
    return this.layers[layerId] || null;
  }

  /**
   * Get next layer in sequence
   */
  getNextLayer(currentLayerId) {
    const currentIndex = this.layerOrder.indexOf(currentLayerId);
    if (currentIndex === -1 || currentIndex === this.layerOrder.length - 1) {
      return null; // No next layer
    }
    return this.layerOrder[currentIndex + 1];
  }

  /**
   * Get previous layer in sequence
   */
  getPreviousLayer(currentLayerId) {
    const currentIndex = this.layerOrder.indexOf(currentLayerId);
    if (currentIndex <= 0) {
      return null; // No previous layer
    }
    return this.layerOrder[currentIndex - 1];
  }

  /**
   * Get all questions for a layer
   */
  getLayerQuestions(layerId) {
    const layer = this.getLayerInfo(layerId);
    return layer ? layer.questions : [];
  }

  /**
   * Get transition guidance between layers
   */
  getTransitionGuidance(fromLayerId, toLayerId) {
    const fromLayer = this.getLayerInfo(fromLayerId);
    return fromLayer ? fromLayer.transition : '';
  }

  /**
   * Check if layer is the final output layer
   */
  isOutputLayer(layerId) {
    return this.getNextLayer(layerId) === null;
  }

  /**
   * Generate LLM prompt for layer refinement
   */
  generateRefinementPrompt(currentLayerId, userPrompt, userResponses = null) {
    const currentLayer = this.getLayerInfo(currentLayerId);
    const nextLayerId = this.getNextLayer(currentLayerId);
    const nextLayer = nextLayerId ? this.getLayerInfo(nextLayerId) : null;

    let prompt = `You are an expert ${this.name} assistant. Your job is to help users progress through a structured refinement process.

TEMPLATE: ${this.name}
DESCRIPTION: ${this.description}

LAYER STRUCTURE:`;

    // Add all layers to the prompt
    this.layerOrder.forEach((layerId, index) => {
      const layer = this.getLayerInfo(layerId);
      const isOutput = this.isOutputLayer(layerId);
      prompt += `\n- ${layerId}: ${layer.name} - ${layer.description}${isOutput ? ' (OUTPUT LAYER)' : ''}`;
    });

    prompt += `\n\nCURRENT LAYER: ${currentLayerId} - ${currentLayer.name}
CURRENT LAYER FOCUS: ${currentLayer.focus}
USER PROMPT: "${userPrompt}"`;

    if (nextLayerId) {
      prompt += `\n\nNEXT LAYER: ${nextLayerId} - ${nextLayer.name}
NEXT LAYER FOCUS: ${nextLayer.focus}
TRANSITION: ${currentLayer.transition}`;
    } else {
      prompt += `\n\nFINAL OUTPUT LAYER: Generate the final output according to the specified format.`;
    }

    // Add user responses if available
    if (userResponses) {
      prompt += `\n\nUSER RESPONSES TO PREVIOUS QUESTIONS: ${userResponses}`;
    }

    // Add refinement rules
    prompt += `\n\nYOUR TASK: Provide a refined prompt that moves the user from the current layer to the next layer, plus 2 specific questions to help them think deeper.

RULES FOR REFINEMENT:
1. Make it SPECIFIC and ACTIONABLE for the next layer
2. Include concrete examples, details, or actions relevant to the next layer
3. Keep it concise but detailed enough to be useful
4. Focus on what the user should DO next, not just what they should think about
5. If moving to the final output layer, focus on concrete, immediate actions

RULES FOR QUESTIONS:
1. Make them SPECIFIC to the user's current prompt and next layer
2. Include examples or options in parentheses where helpful
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

Now provide a refinement and questions for: "${userPrompt}" at ${currentLayerId} layer.`;

    return prompt;
  }

  /**
   * Generate output for the final layer
   */
  generateOutput(userPrompt, layerHistory, userResponses = {}) {
    if (!this.outputFormat) {
      return {
        error: 'No output format specified for this template'
      };
    }

    // Extract information from layer history
    const layerData = {};
    this.layerOrder.forEach(layerId => {
      const layerEntries = layerHistory.filter(entry => entry.layerId === layerId);
      if (layerEntries.length > 0) {
        layerData[layerId] = {
          prompt: layerEntries[layerEntries.length - 1].prompt,
          responses: layerEntries.map(entry => entry.responses).flat()
        };
      }
    });

    // Generate output based on format
    switch (this.outputFormat.type) {
      case 'json':
        return this.generateJSONOutput(layerData, userResponses);
      case 'javascript':
        return this.generateJavaScriptOutput(layerData, userResponses);
      case 'markdown':
        return this.generateMarkdownOutput(layerData, userResponses);
      case 'text':
        return this.generateTextOutput(layerData, userResponses);
      default:
        return this.generateCustomOutput(layerData, userResponses);
    }
  }

  /**
   * Generate JSON output
   */
  generateJSONOutput(layerData, userResponses) {
    const output = {
      template: this.name,
      summary: this.description,
      layers: {},
      final_output: null
    };

    // Add layer data
    this.layerOrder.forEach(layerId => {
      if (layerData[layerId]) {
        output.layers[layerId] = {
          name: this.getLayerInfo(layerId).name,
          prompt: layerData[layerId].prompt,
          responses: layerData[layerId].responses
        };
      }
    });

    // Add final output based on template configuration
    if (this.outputFormat.structure) {
      output.final_output = this.buildStructuredOutput(layerData, this.outputFormat.structure);
    }

    return output;
  }

  /**
   * Generate JavaScript output
   */
  generateJavaScriptOutput(layerData, userResponses) {
    // This would generate actual JavaScript code based on the template
    // Implementation depends on the specific template requirements
    return {
      type: 'javascript',
      code: `// Generated from ${this.name} template\n// Implementation would be template-specific`,
      metadata: {
        template: this.name,
        layers: Object.keys(layerData)
      }
    };
  }

  /**
   * Generate Markdown output
   */
  generateMarkdownOutput(layerData, userResponses) {
    let markdown = `# ${this.name}\n\n`;
    markdown += `${this.description}\n\n`;

    this.layerOrder.forEach(layerId => {
      if (layerData[layerId]) {
        const layer = this.getLayerInfo(layerId);
        markdown += `## ${layer.name}\n\n`;
        markdown += `**Prompt:** ${layerData[layerId].prompt}\n\n`;
        
        if (layerData[layerId].responses.length > 0) {
          markdown += `**Responses:**\n`;
          layerData[layerId].responses.forEach(response => {
            markdown += `- ${response}\n`;
          });
          markdown += `\n`;
        }
      }
    });

    return {
      type: 'markdown',
      content: markdown
    };
  }

  /**
   * Generate text output
   */
  generateTextOutput(layerData, userResponses) {
    let text = `${this.name}\n\n`;
    text += `${this.description}\n\n`;

    this.layerOrder.forEach(layerId => {
      if (layerData[layerId]) {
        const layer = this.getLayerInfo(layerId);
        text += `${layer.name}:\n`;
        text += `Prompt: ${layerData[layerId].prompt}\n`;
        
        if (layerData[layerId].responses.length > 0) {
          text += `Responses: ${layerData[layerId].responses.join(', ')}\n`;
        }
        text += `\n`;
      }
    });

    return {
      type: 'text',
      content: text
    };
  }

  /**
   * Generate custom output based on template configuration
   */
  generateCustomOutput(layerData, userResponses) {
    return this.buildStructuredOutput(layerData, this.outputFormat.structure || {});
  }

  /**
   * Build structured output based on configuration
   */
  buildStructuredOutput(layerData, structure) {
    const output = {};
    
    Object.keys(structure).forEach(key => {
      const config = structure[key];
      
      if (config.type === 'layer_data') {
        output[key] = layerData[config.layerId]?.prompt || '';
      } else if (config.type === 'layer_responses') {
        output[key] = layerData[config.layerId]?.responses || [];
      } else if (config.type === 'computed') {
        output[key] = this.computeValue(config, layerData, userResponses);
      } else if (config.type === 'static') {
        output[key] = config.value;
      }
    });

    return output;
  }

  /**
   * Compute dynamic values based on layer data
   */
  computeValue(config, layerData, userResponses) {
    // Implementation for computed values based on template needs
    return config.default || '';
  }
}

/**
 * Template Registry
 * Stores and manages multiple templates
 */
export class TemplateRegistry {
  constructor() {
    this.templates = new Map();
  }

  /**
   * Register a new template
   */
  registerTemplate(templateConfig) {
    const template = new DynamicTemplate(templateConfig);
    this.templates.set(template.name, template);
    return template;
  }

  /**
   * Get a template by name
   */
  getTemplate(templateName) {
    return this.templates.get(templateName);
  }

  /**
   * List all available templates
   */
  listTemplates() {
    return Array.from(this.templates.keys());
  }

  /**
   * Remove a template
   */
  removeTemplate(templateName) {
    return this.templates.delete(templateName);
  }
}

/**
 * Create a template from blueprint
 * This is the main function you'll use to create templates
 */
export function createTemplateFromBlueprint(blueprint) {
  const templateConfig = {
    name: blueprint.name,
    description: blueprint.description,
    layers: {},
    outputFormat: blueprint.outputFormat
  };

  // Process layers
  blueprint.layers.forEach((layer, index) => {
    const layerId = layer.id || `layer_${index + 1}`;
    templateConfig.layers[layerId] = {
      name: layer.name,
      description: layer.description,
      focus: layer.focus,
      questions: layer.questions || [],
      transition: layer.transition || '',
      nextLevel: blueprint.layers[index + 1]?.id || null
    };
  });

  return new DynamicTemplate(templateConfig);
}

/**
 * Example blueprint structure for reference:
 */
export const EXAMPLE_BLUEPRINT = {
  name: "Problem-Solution Template",
  description: "A 4-layer template for defining problems and creating solutions",
  layers: [
    {
      id: "problem",
      name: "Problem Definition",
      description: "Define the core problem or challenge",
      focus: "Identify and articulate the main problem clearly",
      questions: [
        "What is the main problem you're trying to solve?",
        "Who is affected by this problem?",
        "What are the consequences of not solving this problem?"
      ],
      transition: "Moving from problem definition to solution approach"
    },
    {
      id: "approach",
      name: "Solution Approach",
      description: "Explore different approaches to solve the problem",
      focus: "Identify potential solution methods and strategies",
      questions: [
        "What are the main approaches to solving this problem?",
        "What are the pros and cons of each approach?",
        "Which approach aligns best with your resources and constraints?"
      ],
      transition: "Moving from approach selection to technical design"
    },
    {
      id: "design",
      name: "Technical Design",
      description: "Create detailed technical specifications",
      focus: "Define the technical architecture and implementation details",
      questions: [
        "What are the key technical components needed?",
        "What technologies or tools will you use?",
        "How will the components interact with each other?"
      ],
      transition: "Moving from design to implementation plan"
    },
    {
      id: "implementation",
      name: "Implementation Plan",
      description: "Create actionable implementation steps",
      focus: "Define concrete steps to build and deploy the solution",
      questions: [
        "What are the first steps to start implementation?",
        "What resources and timeline do you need?",
        "How will you measure success and track progress?"
      ],
      transition: "Ready to implement the solution"
    }
  ],
  outputFormat: {
    type: "javascript",
    structure: {
      componentName: { type: "computed", default: "SolutionComponent" },
      problem: { type: "layer_data", layerId: "problem" },
      approach: { type: "layer_data", layerId: "approach" },
      technicalSpecs: { type: "layer_data", layerId: "design" },
      implementationSteps: { type: "layer_data", layerId: "implementation" }
    }
  }
}; 