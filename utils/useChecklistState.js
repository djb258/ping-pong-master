import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage checklist state for altitude-based guardrails
 */
export function useChecklistState(altitude, userPrompt, ideaTree = [], selectedMode = 'blueprint_logic') {
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [llmEvaluation, setLlmEvaluation] = useState(null);

  // Load checklist data for the specified altitude and mode
  useEffect(() => {
    const loadChecklist = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load mode profiles to get the correct checklist file
        const modeProfiles = await import(`../checklists/mode_profiles.json`);
        const profiles = modeProfiles.default || modeProfiles;
        const modeProfile = profiles.mode_profiles[selectedMode];
        
        if (!modeProfile || !modeProfile.altitudes[altitude]) {
          throw new Error(`No checklist found for mode ${selectedMode} at altitude ${altitude}`);
        }
        
        const checklistFileName = modeProfile.altitudes[altitude];
        
        // Import the mode-specific checklist data dynamically
        const checklistData = await import(`../checklists/${checklistFileName}`);
        setChecklist(checklistData.default || checklistData);
        
        // Evaluate checklist items with LLM
        await evaluateChecklistWithLLM(checklistData.default || checklistData, userPrompt, ideaTree);
        
      } catch (err) {
        console.error('Error loading checklist:', err);
        setError('Failed to load checklist data');
        
        // Fallback to default checklist
        try {
          const fallbackData = await import(`../checklists/altitude_${altitude}.json`);
          setChecklist(fallbackData.default || fallbackData);
        } catch (fallbackErr) {
          console.error('Fallback checklist also failed:', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };

    if (altitude && selectedMode) {
      loadChecklist();
    }
  }, [altitude, userPrompt, ideaTree, selectedMode]);

  // Evaluate checklist items with LLM
  const evaluateChecklistWithLLM = async (checklistData, prompt, tree) => {
    try {
      const response = await fetch('/api/evaluate-checklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          altitude,
          checklist: checklistData,
          userPrompt: prompt,
          ideaTree: tree
        }),
      });

      if (response.ok) {
        const evaluation = await response.json();
        setLlmEvaluation(evaluation);
        
        // Update checklist with LLM evaluations
        setChecklist(prev => ({
          ...prev,
          checklist_items: prev.checklist_items.map(item => ({
            ...item,
            llm_checked: evaluation[item.id]?.checked || false,
            llm_reason: evaluation[item.id]?.reason || ''
          }))
        }));
      } else {
        console.warn('LLM evaluation failed, using default values');
      }
    } catch (err) {
      console.warn('LLM evaluation error:', err);
      // Continue without LLM evaluation
    }
  };

  // Toggle user checkbox
  const toggleUserCheck = useCallback((itemId) => {
    setChecklist(prev => ({
      ...prev,
      checklist_items: prev.checklist_items.map(item =>
        item.id === itemId
          ? { ...item, user_checked: !item.user_checked }
          : item
      )
    }));
  }, []);

  // Check if all required items are user-checked
  const isPromotionReady = useCallback(() => {
    if (!checklist) return false;
    
    const requiredChecks = checklist.promotion_criteria.required_checks;
    const userCheckedCount = checklist.checklist_items.filter(item => item.user_checked).length;
    
    return userCheckedCount >= requiredChecks;
  }, [checklist]);

  // Get promotion readiness status
  const getPromotionStatus = useCallback(() => {
    if (!checklist) return { ready: false, checked: 0, required: 0 };
    
    const userCheckedCount = checklist.checklist_items.filter(item => item.user_checked).length;
    const requiredChecks = checklist.promotion_criteria.required_checks;
    
    return {
      ready: userCheckedCount >= requiredChecks,
      checked: userCheckedCount,
      required: requiredChecks,
      percentage: Math.round((userCheckedCount / requiredChecks) * 100)
    };
  }, [checklist]);

  // Reset all user checks
  const resetUserChecks = useCallback(() => {
    setChecklist(prev => ({
      ...prev,
      checklist_items: prev.checklist_items.map(item => ({
        ...item,
        user_checked: false
      }))
    }));
  }, []);

  // Accept all LLM recommendations
  const acceptAllLLMChecks = useCallback(() => {
    setChecklist(prev => ({
      ...prev,
      checklist_items: prev.checklist_items.map(item => ({
        ...item,
        user_checked: item.llm_checked
      }))
    }));
  }, []);

  // Get checklist summary
  const getChecklistSummary = useCallback(() => {
    if (!checklist) return null;
    
    const totalItems = checklist.checklist_items.length;
    const llmChecked = checklist.checklist_items.filter(item => item.llm_checked).length;
    const userChecked = checklist.checklist_items.filter(item => item.user_checked).length;
    
    return {
      total: totalItems,
      llmChecked,
      userChecked,
      llmAgreement: llmChecked === userChecked,
      llmAgreementPercentage: totalItems > 0 ? Math.round((llmChecked / totalItems) * 100) : 0
    };
  }, [checklist]);

  return {
    checklist,
    loading,
    error,
    llmEvaluation,
    toggleUserCheck,
    isPromotionReady,
    getPromotionStatus,
    resetUserChecks,
    acceptAllLLMChecks,
    getChecklistSummary
  };
} 