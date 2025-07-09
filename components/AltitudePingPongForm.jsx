/**
 * Altitude-Based PingPongForm Component
 * 
 * Enhanced UI for altitude-based prompt refinement with tree growth
 * and readiness status tracking.
 */

import React, { useState, useEffect } from 'react';
import styles from '../styles/AltitudePingPongForm.module.css';

const AltitudePingPongForm = () => {
  const [blocks, setBlocks] = useState([]);
  const [currentBlockId, setCurrentBlockId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate] = useState(process.env.NEXT_PUBLIC_DEFAULT_TEMPLATE || 'career'); // Fixed template, configured via env vars
  const [userResponses, setUserResponses] = useState({});

  const createNewBlock = (altitude = '30k') => {
    const newBlock = {
      id: Date.now(),
      altitude,
      prompt: '',
      refinedPrompt: '',
      context: '',
      suggestedQuestions: [],
      readiness: 'red',
      iterations: 0
    };
    
    // Replace all blocks with just this new one
    setBlocks([newBlock]);
    setCurrentBlockId(newBlock.id);
    return newBlock.id;
  };

  const updateBlock = (blockId, updates) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    ));
  };

  const refineBlock = async (blockId) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || !block.prompt.trim()) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/refine-prompt-chatgpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: block.prompt,
          ideaTree: blocks.map(b => ({ value: b.prompt, altitude: b.altitude })),
          coreIdea: blocks[0]?.prompt || '',
          isDirectionChange: false,
          altitude: block.altitude,
          template: selectedTemplate
        })
      });

      const result = await response.json();
      
      updateBlock(blockId, {
        refinedPrompt: result.conversational_response || result.refined_prompt || 'Conversational refinement completed',
        context: result.altitude_context || result.context || '',
        suggestedQuestions: result.conversational_questions || result.suggested_questions || [],
        readiness: result.readiness_status || result.readinessStatus,
        iterations: block.iterations + 1
      });
      
    } catch (error) {
      console.error('Error refining block:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const moveToNextAltitude = (blockId) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const altitudeOrder = ['30k', '20k', '10k', '5k'];
    const currentIndex = altitudeOrder.indexOf(block.altitude);
    const nextAltitude = altitudeOrder[currentIndex + 1];

    if (nextAltitude) {
      // Create new block at next altitude with the refined prompt as input
      const newBlock = {
        id: Date.now(),
        altitude: nextAltitude,
        prompt: block.refinedPrompt || block.prompt,
        refinedPrompt: '',
        context: '',
        suggestedQuestions: [],
        readiness: 'red',
        iterations: 0
      };
      
      // Replace current block with new one
      setBlocks([newBlock]);
      setCurrentBlockId(newBlock.id);
    }
  };

  const refineWithResponses = async (blockId) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || !userResponses[blockId]?.trim()) {
      console.log('Refine with responses: Block not found or no responses');
      return;
    }

    console.log('Starting refinement with responses:', {
      blockId,
      responses: userResponses[blockId],
      isLoading
    });

    setIsLoading(true);
    try {
      const requestBody = {
        prompt: block.prompt,
        ideaTreeLength: block.ideaTree?.length || 0,
        coreIdea: block.prompt,
        isDirectionChange: false,
        altitude: block.altitude,
        template: selectedTemplate,
        userResponses: userResponses[blockId]
      };

      console.log('Sending request:', requestBody);

      const response = await fetch('/api/refine-prompt-chatgpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Refinement result:', result);
        
        setBlocks(prev => prev.map(b => 
          b.id === blockId 
            ? { 
                ...b, 
                refinedPrompt: result.refined_prompt || result.conversational_response,
                suggestedQuestions: result.conversational_questions || result.suggested_questions,
                iterations: b.iterations + 1
              }
            : b
        ));

        // Don't clear the response - keep it visible for reference
        // setUserResponses(prev => ({ ...prev, [blockId]: '' }));
      } else {
        console.error('Response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error refining with responses:', error);
    } finally {
      setIsLoading(false);
      console.log('Refinement completed, loading set to false');
    }
  };

  const getAltitudeColor = (altitude) => {
    const colors = { '30k': '#4A90E2', '20k': '#7ED321', '10k': '#F5A623', '5k': '#D0021B' };
    return colors[altitude] || '#999';
  };

  const getReadinessColor = (status) => {
    const colors = { red: '#D0021B', yellow: '#F5A623', green: '#7ED321' };
    return colors[status] || '#999';
  };

  const getAltitudeName = (altitude) => {
    const names = { '30k': 'Vision', '20k': 'Category', '10k': 'Specialization', '5k': 'Execution' };
    return names[altitude] || altitude;
  };

  const getNextAltitudeName = (currentAltitude) => {
    const altitudeOrder = ['30k', '20k', '10k', '5k'];
    const currentIndex = altitudeOrder.indexOf(currentAltitude);
    const nextIndex = Math.min(currentIndex + 1, altitudeOrder.length - 1);
    return getAltitudeName(altitudeOrder[nextIndex]);
  };

  // Create initial block if none exist
  useEffect(() => {
    if (blocks.length === 0) {
      createNewBlock();
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.header}>
          <h1>Altitude-Based Prompt Refinement</h1>
          <p>Work within each block to refine your idea through altitude levels</p>
        </div>



        <div className={styles.blocksContainer}>
          {blocks.map((block, index) => (
            <div 
              key={block.id} 
              className={styles.block}
            >
              <div className={styles.blockHeader}>
                <div className={styles.blockMeta}>
                  <span className={styles.blockNumber}>#{index + 1}</span>
                  <span 
                    className={styles.altitudeBadge} 
                    style={{ backgroundColor: getAltitudeColor(block.altitude) }}
                  >
                    {block.altitude} - {getAltitudeName(block.altitude)}
                  </span>
                  <span 
                    className={styles.readinessDot} 
                    style={{ backgroundColor: getReadinessColor(block.readiness) }}
                  ></span>
                  {block.iterations > 0 && (
                    <span className={styles.iterationCount}>
                      {block.iterations} iteration{block.iterations !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              
              <div className={styles.blockContent}>
                <div className={styles.inputSection}>
                  <label>Your Idea:</label>
                  <textarea
                    value={block.prompt}
                    onChange={(e) => updateBlock(block.id, { prompt: e.target.value })}
                    placeholder={`What's your ${getAltitudeName(block.altitude).toLowerCase()} level idea?`}
                    className={styles.promptInput}
                    rows={2}
                  />
                  <button 
                    onClick={() => refineBlock(block.id)}
                    disabled={isLoading || !block.prompt.trim()}
                    className={styles.refineButton}
                  >
                    {isLoading ? 'Refining...' : 'Refine with AI'}
                  </button>
                </div>

                {block.suggestedQuestions && block.suggestedQuestions.length > 0 && (
                  <div className={styles.responseSection}>
                    <label>AI's Questions:</label>
                    <div className={styles.questionsDisplay}>
                      {block.suggestedQuestions.map((question, qIndex) => (
                        <div key={qIndex} className={styles.questionDisplay}>
                          {question}
                        </div>
                      ))}
                    </div>
                    
                    <label>Your Responses:</label>
                    <textarea
                      value={userResponses[block.id] || ''}
                      onChange={(e) => setUserResponses(prev => ({ ...prev, [block.id]: e.target.value }))}
                      placeholder="Type your responses to the AI's questions here..."
                      className={styles.responseInput}
                      rows={3}
                    />
                    <button 
                      onClick={() => {
                        console.log('Button clicked!', {
                          blockId: block.id,
                          hasResponses: !!userResponses[block.id]?.trim(),
                          responses: userResponses[block.id],
                          isLoading
                        });
                        refineWithResponses(block.id);
                      }}
                      disabled={isLoading || !userResponses[block.id]?.trim()}
                      className={styles.refineWithResponsesButton}
                    >
                      {isLoading ? 'Refining...' : 'Refine with AI'}
                    </button>
                  </div>
                )}

                {block.refinedPrompt && (
                  <div className={styles.outputSection}>
                    <label>AI Refinement ({getNextAltitudeName(block.altitude)} Level):</label>
                    <div className={styles.refinedDisplay}>
                      {block.refinedPrompt}
                    </div>
                    <div className={styles.refinementActions}>
                      <button 
                        onClick={() => updateBlock(block.id, { prompt: block.refinedPrompt })}
                        className={styles.useSuggestionButton}
                      >
                        Use This Refinement
                      </button>
                      <button 
                        onClick={() => updateBlock(block.id, { refinedPrompt: '', suggestedQuestions: [] })}
                        className={styles.clearRefinementButton}
                      >
                        Clear Refinement
                      </button>
                    </div>
                  </div>
                )}

                {/* Execution Output Display - Show when at 5k ft level */}
                {block.altitude === '5k' && block.refinedPrompt && (
                  <div className={styles.executionOutputSection}>
                    <label>🎯 Execution Plan (Ready to Implement):</label>
                    <div className={styles.executionDisplay}>
                      <div className={styles.executionSection}>
                        <h4>📋 Immediate Actions:</h4>
                        <ul>
                          <li>Research state licensing requirements</li>
                          <li>Choose insurance company to work with</li>
                          <li>Complete pre-licensing education</li>
                          <li>Schedule licensing exam</li>
                          <li>Prepare business cards and marketing materials</li>
                        </ul>
                      </div>
                      
                      <div className={styles.executionSection}>
                        <h4>⏰ Timeline:</h4>
                        <div className={styles.timeline}>
                          <div><strong>Week 1-2:</strong> Research and planning</div>
                          <div><strong>Week 3-4:</strong> Setup and preparation</div>
                          <div><strong>Month 2:</strong> Launch and initial execution</div>
                          <div><strong>Month 3+:</strong> Iterate and scale</div>
                        </div>
                      </div>
                      
                      <div className={styles.executionSection}>
                        <h4>📊 Success Metrics:</h4>
                        <ul>
                          <li>Complete initial setup and preparation</li>
                          <li>Achieve first milestone or goal</li>
                          <li>Establish consistent progress tracking</li>
                          <li>Build initial network or client base</li>
                          <li>Measure and adjust based on results</li>
                        </ul>
                      </div>
                      
                      <div className={styles.executionSection}>
                        <h4>🛠️ Resources Needed:</h4>
                        <ul>
                          <li>Time for daily/weekly execution</li>
                          <li>Financial resources for startup costs</li>
                          <li>Skills and knowledge development</li>
                          <li>Support network and mentors</li>
                          <li>Tools and technology needed</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className={styles.executionActions}>
                      <button 
                        onClick={() => {
                          const executionData = {
                            plan: block.refinedPrompt,
                            actions: [
                              'Research state licensing requirements',
                              'Choose insurance company to work with',
                              'Complete pre-licensing education'
                            ],
                            timeline: 'Week 1-2: Research and planning\nWeek 3-4: Setup and preparation\nMonth 2: Launch and initial execution\nMonth 3+: Iterate and scale',
                            metrics: [
                              'Complete initial setup and preparation',
                              'Achieve first milestone or goal',
                              'Establish consistent progress tracking'
                            ]
                          };
                          const dataStr = JSON.stringify(executionData, null, 2);
                          const dataBlob = new Blob([dataStr], {type: 'application/json'});
                          const url = URL.createObjectURL(dataBlob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = 'execution-plan.json';
                          link.click();
                        }}
                        className={styles.exportExecutionButton}
                      >
                        📥 Export Execution Plan
                      </button>
                    </div>
                  </div>
                )}
                
                <div className={styles.blockActions}>
                  <button 
                    onClick={() => moveToNextAltitude(block.id)}
                    disabled={!block.refinedPrompt.trim()}
                    className={styles.nextLevelButton}
                  >
                    {block.altitude === '5k' ? '✅ Execution Complete' : 'Next Level'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>


      </div>

      <div className={styles.rightPanel}>
        <div className={styles.progressContainer}>
          <h3>Altitude Journey</h3>
          <div className={styles.altitudeProgress}>
            {['30k', '20k', '10k', '5k'].map((altitude, index) => {
              const blockAtLevel = blocks.find(b => b.altitude === altitude);
              const isCurrent = blockAtLevel && blockAtLevel.id === currentBlockId;
              const isCompleted = blocks.some(b => b.altitude === altitude && b.id !== currentBlockId);
              
              return (
                <div 
                  key={altitude} 
                  className={`${styles.altitudeLevel} ${
                    isCompleted ? styles.completed : 
                    isCurrent ? styles.current : styles.upcoming
                  }`}
                >
                  <div 
                    className={styles.levelIndicator}
                    style={{ backgroundColor: getAltitudeColor(altitude) }}
                  >
                    {isCompleted ? '✓' : isCurrent ? '●' : index + 1}
                  </div>
                  <div className={styles.levelInfo}>
                    <span className={styles.levelName}>{getAltitudeName(altitude)}</span>
                    <span className={styles.levelAltitude}>{altitude}</span>
                  </div>
                  {blockAtLevel && (
                    <div className={styles.levelStatus}>
                      <span 
                        className={styles.statusDot}
                        style={{ backgroundColor: getReadinessColor(blockAtLevel.readiness) }}
                      ></span>
                      {blockAtLevel.iterations} iterations
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className={styles.progressStats}>
            <p>Current Level: {blocks[0]?.altitude || 'None'}</p>
            <p>Current Iterations: {blocks[0]?.iterations || 0}</p>
            <p>Total Iterations: {blocks.reduce((sum, b) => sum + b.iterations, 0)}</p>
          </div>
          
          <div className={styles.addBlockSection}>
            <button 
              onClick={() => createNewBlock()}
              className={styles.addBlockButton}
            >
              + Start New Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AltitudePingPongForm; 