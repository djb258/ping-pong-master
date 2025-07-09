/**
 * Dynamic Refinement System
 * 
 * Works with dynamic templates to provide layer-by-layer refinement
 * Handles any layer structure, questions, and output formats
 */

import { createTemplateFromBlueprint } from './dynamicTemplateSystem.js';

/**
 * Main dynamic refinement function
 * @param {Object} blueprint - Template blueprint with layers, questions, transitions
 * @param {string} userPrompt - User's current input
 * @param {Array} layerHistory - History of user's progression through layers
 * @param {Object} userResponses - User's responses to AI questions
 * @param {boolean} yoloMode - Skip to final layer
 */
export async function refineWithDynamicTemplate(blueprint, userPrompt, layerHistory = [], userResponses = null, yoloMode = false) {
  try {
    // Create template from blueprint
    const template = createTemplateFromBlueprint(blueprint);
    
    // Determine current layer
    let currentLayerId = template.layerOrder[0]; // Start with first layer
    
    if (layerHistory.length > 0) {
      // Find the highest layer we've reached
      const completedLayers = layerHistory.map(entry => entry.layerId);
      const maxLayerIndex = Math.max(...completedLayers.map(layerId => template.layerOrder.indexOf(layerId)));
      currentLayerId = template.layerOrder[Math.min(maxLayerIndex, template.layerOrder.length - 1)];
    }
    
    // Determine next layer
    let nextLayerId = currentLayerId;
    if (yoloMode) {
      nextLayerId = template.layerOrder[template.layerOrder.length - 1]; // Final layer
    } else {
      nextLayerId = template.getNextLayer(currentLayerId);
    }
    
    // Check if we're at the output layer
    if (template.isOutputLayer(currentLayerId) || template.isOutputLayer(nextLayerId)) {
      const output = template.generateOutput(userPrompt, layerHistory, userResponses);
      return {
        original_prompt: userPrompt,
        refined_prompt: userPrompt,
        current_layer: currentLayerId,
        next_layer: currentLayerId,
        layer_info: template.getLayerInfo(currentLayerId),
        readiness_status: 'green',
        layer_history: layerHistory,
        output: output,
        is_output_layer: true,
        template_name: template.name
      };
    }
    
    // Generate LLM prompt for refinement
    const instructionPrompt = template.generateRefinementPrompt(currentLayerId, userPrompt, userResponses);
    
    // Call LLM for intelligent refinement
    let refinedPrompt = userPrompt;
    let questions = template.getLayerQuestions(currentLayerId).slice(0, 2); // Default questions
    
    try {
      const llmResponse = await callLLMForRefinement(instructionPrompt);
      
      if (llmResponse && llmResponse.refined_prompt) {
        refinedPrompt = llmResponse.refined_prompt;
        if (llmResponse.questions && llmResponse.questions.length > 0) {
          questions = llmResponse.questions;
        }
      }
    } catch (error) {
      console.error('Error calling LLM for refinement:', error);
      // Fall back to template questions
    }
    
    // Assess readiness (simplified for dynamic templates)
    const readinessStatus = assessDynamicReadiness(userPrompt, currentLayerId, template);
    
    // Create new layer history entry
    const newHistoryEntry = {
      layerId: currentLayerId,
      prompt: userPrompt,
      refinedPrompt: refinedPrompt,
      responses: userResponses ? [userResponses] : [],
      timestamp: new Date().toISOString()
    };
    
    const updatedHistory = [...layerHistory, newHistoryEntry];
    
    return {
      original_prompt: userPrompt,
      refined_prompt: refinedPrompt,
      instruction_prompt: instructionPrompt,
      current_layer: currentLayerId,
      next_layer: nextLayerId,
      layer_info: template.getLayerInfo(currentLayerId),
      next_layer_info: nextLayerId ? template.getLayerInfo(nextLayerId) : null,
      readiness_status: readinessStatus,
      layer_history: updatedHistory,
      suggested_questions: questions,
      transition_guidance: template.getTransitionGuidance(currentLayerId, nextLayerId),
      template_name: template.name,
      template_description: template.description
    };
    
  } catch (error) {
    console.error('Error in dynamic refinement:', error);
    return {
      original_prompt: userPrompt,
      refined_prompt: userPrompt,
      current_layer: 'error',
      next_layer: 'error',
      readiness_status: 'red',
      layer_history: layerHistory,
      error: error.message
    };
  }
}

/**
 * Assess readiness for dynamic templates
 */
function assessDynamicReadiness(userPrompt, layerId, template) {
  const layer = template.getLayerInfo(layerId);
  if (!layer) return 'red';
  
  const promptLength = userPrompt.trim().length;
  const hasKeywords = layer.focus.toLowerCase().split(' ').some(keyword => 
    userPrompt.toLowerCase().includes(keyword)
  );
  
  if (promptLength > 100 && hasKeywords) return 'green';
  if (promptLength > 50) return 'yellow';
  return 'red';
}

/**
 * Call LLM for refinement (placeholder - would use your existing LLM system)
 */
async function callLLMForRefinement(instructionPrompt) {
  // This would integrate with your existing LLM provider system
  // For now, return null to use fallback logic
  return null;
}

/**
 * Move to next layer in dynamic template
 */
export function moveToNextLayer(layerHistory, template) {
  if (layerHistory.length === 0) return null;
  
  const currentLayerId = layerHistory[layerHistory.length - 1].layerId;
  const nextLayerId = template.getNextLayer(currentLayerId);
  
  if (!nextLayerId) {
    // We're at the final layer, generate output
    return {
      action: 'generate_output',
      layerId: currentLayerId,
      output: template.generateOutput('', layerHistory, {})
    };
  }
  
  return {
    action: 'next_layer',
    currentLayerId,
    nextLayerId,
    layerInfo: template.getLayerInfo(nextLayerId)
  };
}

/**
 * Get layer progression status
 */
export function getLayerProgression(layerHistory, template) {
  const progression = {};
  
  template.layerOrder.forEach((layerId, index) => {
    const layerEntries = layerHistory.filter(entry => entry.layerId === layerId);
    const isCompleted = layerEntries.length > 0;
    const isCurrent = layerEntries.length > 0 && index === template.layerOrder.length - 1;
    const isUpcoming = !isCompleted && !isCurrent;
    
    progression[layerId] = {
      layerId,
      name: template.getLayerInfo(layerId).name,
      description: template.getLayerInfo(layerId).description,
      status: isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming',
      iterations: layerEntries.length,
      lastPrompt: layerEntries.length > 0 ? layerEntries[layerEntries.length - 1].prompt : null
    };
  });
  
  return progression;
}

/**
 * Example usage function
 */
export function createExampleTemplate() {
  const blueprint = {
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
  
  return blueprint;
} 