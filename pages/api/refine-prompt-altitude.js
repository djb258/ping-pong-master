/**
 * API endpoint for altitude-based prompt refinement
 * Implements altitude logic (30k, 20k, 10k, 5k) with tree growth
 */

import { refinePromptWithAltitude, pruneTreeBranches, generateStructuredOutput } from '../../utils/altitudePromptRefiner';
import { withErrorHandling } from '../../utils/errorHandler.js';
import { validateApiRequest, validatePrompt, validateIdeaTree } from '../../utils/validation.js';
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

  const { prompt, ideaTree = [], coreIdea = '', isDirectionChange = false } = req.body;

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

  // Validate idea tree if provided
  if (ideaTree.length > 0) {
    const treeValidation = validateIdeaTree(ideaTree);
    if (!treeValidation.valid) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: 'Invalid idea tree format',
          code: 'INVALID_IDEA_TREE',
          details: treeValidation.errors,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  console.log('Altitude refinement request:', {
    prompt: promptValidation.sanitized,
    ideaTreeLength: ideaTree.length,
    coreIdea,
    isDirectionChange
  });

  // If user is changing direction, prune the tree first
  let currentTree = ideaTree;
  if (isDirectionChange && ideaTree.length > 0) {
    currentTree = pruneTreeBranches(ideaTree, promptValidation.sanitized);
    console.log('Pruned tree:', currentTree);
  }

  // Perform altitude-based refinement
  const result = await refinePromptWithAltitude(promptValidation.sanitized, currentTree);
  
  // Generate structured output
  const structuredOutput = generateStructuredOutput(
    result.idea_tree,
    coreIdea || promptValidation.sanitized,
    result.readiness_status
  );

  console.log('Altitude refinement result:', {
    currentAltitude: result.current_altitude,
    newAltitude: result.new_altitude,
    readinessStatus: result.readiness_status,
    treeSize: result.tree_size,
    newBranches: result.new_branches_count
  });

  return res.status(200).json({
    success: true,
    ...result,
    structured_output: structuredOutput,
    source: 'Altitude-Based Refiner',
    timestamp: new Date().toISOString()
  });
}); 