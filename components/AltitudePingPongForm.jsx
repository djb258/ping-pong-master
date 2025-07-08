/**
 * Altitude-Based PingPongForm Component
 * 
 * Enhanced UI for altitude-based prompt refinement with tree growth
 * and readiness status tracking.
 */

import { useState, useCallback } from 'react';
import styles from '../styles/AltitudePingPongForm.module.css';

/**
 * Create clean export entry with altitude data
 */
const createAltitudeExportEntry = (ping, pong, altitudeData, source = 'Altitude Refiner') => ({
  ping: ping,
  pong: pong,
  current_altitude: altitudeData.current_altitude,
  new_altitude: altitudeData.new_altitude,
  readiness_status: altitudeData.readiness_status,
  idea_tree: altitudeData.idea_tree,
  new_branches: altitudeData.new_branches,
  source: source,
  timestamp: new Date().toISOString(),
});

/**
 * Readiness status indicator component
 */
const ReadinessIndicator = ({ status, altitude }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'red': return '#ff4444';
      case 'yellow': return '#ffaa00';
      case 'green': return '#44ff44';
      default: return '#888888';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'red': return 'Too Vague';
      case 'yellow': return 'Improving';
      case 'green': return 'Ready';
      default: return 'Unknown';
    }
  };

  return (
    <div className={styles.readinessIndicator}>
      <div 
        className={styles.statusDot} 
        style={{ backgroundColor: getStatusColor(status) }}
      />
      <span className={styles.statusText}>{getStatusText(status)}</span>
      <span className={styles.altitudeText}>({altitude})</span>
    </div>
  );
};

/**
 * Tree visualization component
 */
const IdeaTree = ({ tree, onBranchClick }) => {
  if (!tree || tree.length === 0) {
    return (
      <div className={styles.emptyTree}>
        <p>No branches yet. Start refining your idea to grow the tree!</p>
      </div>
    );
  }

  return (
    <div className={styles.ideaTree}>
      <h3>Idea Tree ({tree.length} branches)</h3>
      <div className={styles.treeContainer}>
        {tree.map((branch, index) => (
          <div 
            key={index} 
            className={styles.treeBranch}
            onClick={() => onBranchClick && onBranchClick(branch)}
          >
            <div className={styles.branchLabel}>{branch.label}</div>
            <div className={styles.branchValue}>{branch.value}</div>
            <div className={styles.branchAltitude}>{branch.altitude}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Altitude level display component
 */
const AltitudeDisplay = ({ currentAltitude, newAltitude, context }) => {
  const altitudeLevels = {
    '30k': { name: 'Vision', color: '#4a90e2' },
    '20k': { name: 'Category', color: '#7ed321' },
    '10k': { name: 'Specialization', color: '#f5a623' },
    '5k': { name: 'Execution', color: '#d0021b' }
  };

  return (
    <div className={styles.altitudeDisplay}>
      <div className={styles.altitudeInfo}>
        <span className={styles.altitudeLabel}>Current Altitude:</span>
        <span 
          className={styles.altitudeValue}
          style={{ color: altitudeLevels[currentAltitude]?.color }}
        >
          {currentAltitude} ({altitudeLevels[currentAltitude]?.name})
        </span>
      </div>
      {newAltitude !== currentAltitude && (
        <div className={styles.altitudeInfo}>
          <span className={styles.altitudeLabel}>Moving to:</span>
          <span 
            className={styles.altitudeValue}
            style={{ color: altitudeLevels[newAltitude]?.color }}
          >
            {newAltitude} ({altitudeLevels[newAltitude]?.name})
          </span>
        </div>
      )}
      {context && (
        <div className={styles.altitudeContext}>
          <p>{context.description}</p>
        </div>
      )}
    </div>
  );
};

export default function AltitudePingPongForm() {
  const [pingInput, setPingInput] = useState('');
  const [currentPong, setCurrentPong] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pingPongHistory, setPingPongHistory] = useState([]);
  const [ideaTree, setIdeaTree] = useState([]);
  const [coreIdea, setCoreIdea] = useState('');
  const [currentAltitude, setCurrentAltitude] = useState('30k');
  const [readinessStatus, setReadinessStatus] = useState('red');
  const [altitudeContext, setAltitudeContext] = useState(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [isDirectionChange, setIsDirectionChange] = useState(false);

  /**
   * Handle altitude-based prompt refinement
   */
  const handleAltitudeRefinement = useCallback(async (e) => {
    e.preventDefault();
    
    if (!pingInput.trim()) {
      alert('Please enter a prompt to refine');
      return;
    }

    setIsProcessing(true);
    setCurrentPong('');

    try {
      // Use the altitude-based refinement endpoint
      const response = await fetch('/api/refine-prompt-altitude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: pingInput,
          ideaTree: ideaTree,
          coreIdea: coreIdea,
          isDirectionChange: isDirectionChange
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update state with altitude data
        setCurrentPong(data.refined_prompt);
        setIdeaTree(data.idea_tree);
        setCurrentAltitude(data.new_altitude);
        setReadinessStatus(data.readiness_status);
        setAltitudeContext(data.altitude_context);
        setSuggestedQuestions(data.suggested_questions);
        
        // Set core idea if this is the first iteration
        if (!coreIdea) {
          setCoreIdea(pingInput);
        }
        
        // Create enhanced export entry
        const exportEntry = createAltitudeExportEntry(
          pingInput,
          data.refined_prompt,
          data,
          data.source
        );

        setPingPongHistory(prev => [...prev, exportEntry]);
        
        // Clear direction change flag after processing
        setIsDirectionChange(false);
        
        // Only clear input if not a clarifying question
        if (!data.refined_prompt.toLowerCase().includes('?')) {
          setPingInput('');
        }
      } else {
        throw new Error(data.error || 'Refinement failed');
      }
      
    } catch (error) {
      console.error('Error in altitude refinement:', error);
      alert(`Error refining prompt: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [pingInput, ideaTree, coreIdea, isDirectionChange]);

  /**
   * Handle direction change (user wants to go in a different direction)
   */
  const handleDirectionChange = useCallback(() => {
    setIsDirectionChange(true);
    // Don't clear the input - let user modify it
  }, []);

  /**
   * Reset the entire session
   */
  const handleReset = useCallback(() => {
    setIdeaTree([]);
    setCoreIdea('');
    setCurrentAltitude('30k');
    setReadinessStatus('red');
    setAltitudeContext(null);
    setSuggestedQuestions([]);
    setIsDirectionChange(false);
    setPingPongHistory([]);
    setCurrentPong('');
  }, []);

  /**
   * Export altitude-based ping-pong history
   */
  const handleExport = useCallback(() => {
    if (pingPongHistory.length === 0) {
      alert('No ping-pong history to export');
      return;
    }

    // Create final structured output
    const finalOutput = {
      core_idea: coreIdea,
      branches: ideaTree.map(branch => ({
        label: branch.label,
        value: branch.value,
        altitude: branch.altitude
      })),
      readiness_status: readinessStatus,
      refinement_history: pingPongHistory
    };

    const blob = new Blob([JSON.stringify(finalOutput, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `altitude-ping-pong-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [pingPongHistory, coreIdea, ideaTree, readinessStatus]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Altitude-Based Ping-Pong Prompt Refiner</h1>
        <p>Refine your ideas through altitude levels: Vision (30k) → Category (20k) → Specialization (10k) → Execution (5k)</p>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.leftPanel}>
          {/* Altitude and Readiness Display */}
          <div className={styles.statusPanel}>
            <ReadinessIndicator status={readinessStatus} altitude={currentAltitude} />
            <AltitudeDisplay 
              currentAltitude={currentAltitude} 
              newAltitude={currentAltitude}
              context={altitudeContext}
            />
          </div>

          {/* Input Form */}
          <form onSubmit={handleAltitudeRefinement} className={styles.inputForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="pingInput">Your Idea/Prompt:</label>
              <textarea
                id="pingInput"
                value={pingInput}
                onChange={(e) => setPingInput(e.target.value)}
                placeholder="Enter your idea or prompt here..."
                rows={4}
                className={styles.textarea}
                disabled={isProcessing}
              />
            </div>

            <div className={styles.buttonGroup}>
              <button 
                type="submit" 
                className={styles.primaryButton}
                disabled={isProcessing || !pingInput.trim()}
              >
                {isProcessing ? 'Refining...' : 'Refine with Altitude'}
              </button>
              
              <button 
                type="button" 
                onClick={handleDirectionChange}
                className={styles.secondaryButton}
                disabled={isProcessing}
              >
                Change Direction
              </button>
              
              <button 
                type="button" 
                onClick={handleReset}
                className={styles.resetButton}
                disabled={isProcessing}
              >
                Reset Session
              </button>
            </div>
          </form>

          {/* Suggested Questions */}
          {suggestedQuestions.length > 0 && (
            <div className={styles.suggestedQuestions}>
              <h3>Suggested Questions:</h3>
              <ul>
                {suggestedQuestions.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Current Response */}
          {currentPong && (
            <div className={styles.currentResponse}>
              <h3>Refined Response:</h3>
              <div className={styles.responseContent}>
                {currentPong}
              </div>
            </div>
          )}
        </div>

        <div className={styles.rightPanel}>
          {/* Idea Tree */}
          <IdeaTree 
            tree={ideaTree} 
            onBranchClick={(branch) => {
              console.log('Branch clicked:', branch);
              // Could implement branch editing here
            }}
          />

          {/* Export Section */}
          <div className={styles.exportSection}>
            <h3>Export Options</h3>
            <button 
              onClick={handleExport}
              className={styles.exportButton}
              disabled={pingPongHistory.length === 0}
            >
              Export Altitude Data
            </button>
            <p className={styles.exportInfo}>
              Exports structured data with core idea, branches, and refinement history
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 