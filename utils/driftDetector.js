/**
 * Altitude Drift Detection System
 * 
 * Monitors changes in user direction and thinking patterns across altitude levels
 * to detect when users may be deviating from their established path.
 */

/**
 * Check for drift between previous and current altitude summaries
 * @param {string} previousSummary - Summary from previous altitude level
 * @param {string} currentSummary - Summary from current altitude level
 * @param {string} altitude - Current altitude level (30k, 20k, 10k, 5k)
 * @returns {Object} Drift analysis results
 */
export function checkForDrift(previousSummary, currentSummary, altitude) {
  if (!previousSummary || !currentSummary) {
    return {
      hasDrift: false,
      driftType: null,
      confidence: 0,
      details: 'Insufficient data for drift analysis'
    };
  }

  const analysis = {
    hasDrift: false,
    driftType: null,
    confidence: 0,
    details: '',
    flags: []
  };

  // Convert summaries to lowercase for comparison
  const prevLower = previousSummary.toLowerCase();
  const currLower = currentSummary.toLowerCase();

  // Check for major topic shifts
  const topicDrift = detectTopicDrift(prevLower, currLower);
  if (topicDrift.hasDrift) {
    analysis.hasDrift = true;
    analysis.driftType = 'topic_shift';
    analysis.confidence = topicDrift.confidence;
    analysis.flags.push(topicDrift);
  }

  // Check for scope changes
  const scopeDrift = detectScopeDrift(prevLower, currLower, altitude);
  if (scopeDrift.hasDrift) {
    analysis.hasDrift = true;
    analysis.driftType = analysis.driftType ? 'multiple' : 'scope_change';
    analysis.confidence = Math.max(analysis.confidence, scopeDrift.confidence);
    analysis.flags.push(scopeDrift);
  }

  // Check for goal alignment
  const goalDrift = detectGoalDrift(prevLower, currLower);
  if (goalDrift.hasDrift) {
    analysis.hasDrift = true;
    analysis.driftType = analysis.driftType ? 'multiple' : 'goal_misalignment';
    analysis.confidence = Math.max(analysis.confidence, goalDrift.confidence);
    analysis.flags.push(goalDrift);
  }

  // Generate summary details
  analysis.details = generateDriftDetails(analysis.flags);

  // Log drift detection for monitoring
  if (analysis.hasDrift) {
    console.warn('🚨 Altitude Drift Detected:', {
      altitude,
      driftType: analysis.driftType,
      confidence: analysis.confidence,
      details: analysis.details,
      flags: analysis.flags.length
    });
  }

  return analysis;
}

/**
 * Detect major topic shifts between summaries
 */
function detectTopicDrift(prevSummary, currSummary) {
  const topics = {
    business: ['business', 'company', 'startup', 'entrepreneur', 'venture'],
    career: ['career', 'job', 'employment', 'position', 'role'],
    technology: ['tech', 'software', 'app', 'platform', 'system'],
    education: ['education', 'learning', 'course', 'training', 'skill'],
    health: ['health', 'medical', 'wellness', 'fitness', 'therapy'],
    finance: ['finance', 'money', 'investment', 'banking', 'insurance']
  };

  const prevTopics = Object.entries(topics).filter(([_, keywords]) =>
    keywords.some(keyword => prevSummary.includes(keyword))
  ).map(([topic]) => topic);

  const currTopics = Object.entries(topics).filter(([_, keywords]) =>
    keywords.some(keyword => currSummary.includes(keyword))
  ).map(([topic]) => topic);

  const topicOverlap = prevTopics.filter(topic => currTopics.includes(topic));
  const topicShift = prevTopics.length > 0 && currTopics.length > 0 && topicOverlap.length === 0;

  return {
    hasDrift: topicShift,
    confidence: topicShift ? 0.8 : 0,
    details: topicShift ? `Topic shift from ${prevTopics.join(', ')} to ${currTopics.join(', ')}` : ''
  };
}

/**
 * Detect scope changes (too broad or too narrow)
 */
function detectScopeDrift(prevSummary, currSummary, altitude) {
  const wordCountPrev = prevSummary.split(' ').length;
  const wordCountCurr = currSummary.split(' ').length;
  
  // Check for significant scope changes
  const scopeRatio = wordCountCurr / wordCountPrev;
  const scopeChange = scopeRatio < 0.5 || scopeRatio > 2.0;

  // Altitude-specific scope expectations
  const altitudeScopeChecks = {
    '30k': { minWords: 20, maxWords: 100 },
    '20k': { minWords: 30, maxWords: 150 },
    '10k': { minWords: 40, maxWords: 200 },
    '5k': { minWords: 50, maxWords: 300 }
  };

  const expectedScope = altitudeScopeChecks[altitude];
  const withinExpectedScope = wordCountCurr >= expectedScope.minWords && wordCountCurr <= expectedScope.maxWords;

  return {
    hasDrift: scopeChange || !withinExpectedScope,
    confidence: scopeChange ? 0.7 : (withinExpectedScope ? 0 : 0.6),
    details: scopeChange ? 
      `Scope change detected (${wordCountPrev} → ${wordCountCurr} words)` :
      `Scope outside expected range for ${altitude} level`
  };
}

/**
 * Detect goal misalignment
 */
function detectGoalDrift(prevSummary, currSummary) {
  const goalKeywords = ['goal', 'objective', 'aim', 'target', 'purpose', 'mission'];
  
  const prevGoals = goalKeywords.filter(keyword => prevSummary.includes(keyword));
  const currGoals = goalKeywords.filter(keyword => currSummary.includes(keyword));
  
  // Check if goals are mentioned in both but seem different
  const hasGoalMention = prevGoals.length > 0 && currGoals.length > 0;
  
  // Simple semantic similarity check (can be enhanced with embeddings)
  const similarityScore = calculateSimpleSimilarity(prevSummary, currSummary);
  const lowSimilarity = similarityScore < 0.3;

  return {
    hasDrift: hasGoalMention && lowSimilarity,
    confidence: hasGoalMention && lowSimilarity ? 0.6 : 0,
    details: hasGoalMention && lowSimilarity ? 
      `Goal misalignment detected (similarity: ${similarityScore.toFixed(2)})` : ''
  };
}

/**
 * Calculate simple text similarity
 */
function calculateSimpleSimilarity(text1, text2) {
  const words1 = new Set(text1.split(' ').filter(word => word.length > 3));
  const words2 = new Set(text2.split(' ').filter(word => word.length > 3));
  
  const intersection = new Set([...words1].filter(word => words2.has(word)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * Generate detailed drift analysis
 */
function generateDriftDetails(flags) {
  if (flags.length === 0) return 'No drift detected';
  
  const details = flags
    .filter(flag => flag.hasDrift)
    .map(flag => flag.details)
    .join('; ');
    
  return details || 'Drift detected but details unavailable';
}

/**
 * Validate altitude dependencies
 * @param {string} altitude - Current altitude level
 * @param {string} content - Content to validate
 * @returns {Object} Validation results
 */
export function validateAltitudeDependencies(altitude, content) {
  try {
    const dependencies = require('../checklists/altitudeDependencies.json');
    const altitudeRules = dependencies[altitude];
    
    if (!altitudeRules) {
      return { isValid: true, violations: [] };
    }

    const violations = [];
    const contentLower = content.toLowerCase();

    // Check for forbidden terms
    if (altitudeRules.must_not_include) {
      altitudeRules.must_not_include.forEach(term => {
        if (contentLower.includes(term.toLowerCase())) {
          violations.push({
            type: 'forbidden_term',
            term: term,
            message: `"${term}" should not be mentioned at ${altitude} level`
          });
        }
      });
    }

    // Check for required terms
    if (altitudeRules.must_include) {
      altitudeRules.must_include.forEach(term => {
        if (!contentLower.includes(term.toLowerCase())) {
          violations.push({
            type: 'missing_required_term',
            term: term,
            message: `"${term}" should be mentioned at ${altitude} level`
          });
        }
      });
    }

    return {
      isValid: violations.length === 0,
      violations: violations
    };

  } catch (error) {
    console.error('Error validating altitude dependencies:', error);
    return { isValid: true, violations: [] };
  }
}

/**
 * Generate altitude summary using LLM
 * @param {string} content - Content to summarize
 * @param {string} altitude - Altitude level
 * @returns {Promise<string>} Generated summary
 */
export async function generateAltitudeSummary(content, altitude) {
  try {
    const response = await fetch('/api/generate-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, altitude })
    });

    if (response.ok) {
      const result = await response.json();
      return result.summary;
    } else {
      // Fallback to simple summary
      return generateSimpleSummary(content, altitude);
    }
  } catch (error) {
    console.error('Error generating altitude summary:', error);
    return generateSimpleSummary(content, altitude);
  }
}

/**
 * Generate simple summary as fallback
 */
function generateSimpleSummary(content, altitude) {
  const words = content.split(' ').slice(0, 20).join(' ');
  return `[${altitude}] ${words}...`;
} 