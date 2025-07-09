/**
 * API endpoint for altitude-based prompt refinement
 * Implements altitude logic (30k, 20k, 10k, 5k) with tree growth
 */

import { refinePromptWithAltitude, pruneTreeBranches, generateStructuredOutput } from '../../utils/altitudePromptRefiner';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, ideaTree = [], coreIdea = '', isDirectionChange = false } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('Altitude refinement request:', {
      prompt,
      ideaTreeLength: ideaTree.length,
      coreIdea,
      isDirectionChange
    });

    // If user is changing direction, prune the tree first
    let currentTree = ideaTree;
    if (isDirectionChange && ideaTree.length > 0) {
      currentTree = pruneTreeBranches(ideaTree, prompt);
      console.log('Pruned tree:', currentTree);
    }

    // Perform altitude-based refinement
    const result = await refinePromptWithAltitude(prompt, currentTree);
    
    // Generate structured output
    const structuredOutput = generateStructuredOutput(
      result.idea_tree,
      coreIdea || prompt,
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
      source: 'Altitude-Based Refiner'
    });

  } catch (error) {
    console.error('Altitude refinement error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      fallback: 'Unable to perform altitude-based refinement. Please try again.'
    });
  }
} 