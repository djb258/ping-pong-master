/**
 * PingPongForm Component
 * 
 * Minimal UI for ping-pong prompt refinement.
 * Core elements: input, submit, display, export.
 */

import { useState, useCallback } from 'react';
import { refinePrompt } from '../utils/refinePrompt';

/**
 * Create clean STAMPED/SPVPET/STACKED compliant export entry
 */
const createCleanExportEntry = (ping, pong, source = 'Abacus') => ({
  ping: ping,
  pong: pong,
  refinement_notes: "",
  source: source,
  timestamp: new Date().toISOString(),
});

export default function PingPongForm() {
  const [pingInput, setPingInput] = useState('');
  const [currentPong, setCurrentPong] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pingPongHistory, setPingPongHistory] = useState([]);
  const [isClarifyingQuestion, setIsClarifyingQuestion] = useState(false);

  /**
   * Handle prompt refinement
   */
  const handleRefinePrompt = useCallback(async (e) => {
    e.preventDefault();
    
    if (!pingInput.trim()) {
      alert('Please enter a prompt to refine');
      return;
    }

    setIsProcessing(true);
    setCurrentPong(''); // Clear previous pong
    setIsClarifyingQuestion(false);

    try {
      // Use the refine-prompt endpoint for prompt refinement
      const response = await fetch('/api/refine-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: pingInput })
      });
      
      const data = await response.json();
      const refinedPrompt = data.refined_prompt || 'No refinement available';
      
      // Update current pong display
      setCurrentPong(refinedPrompt);
      
      // Create clean export entry
      const exportEntry = createCleanExportEntry(
        pingInput,
        refinedPrompt,
        data.source || 'Prompt Refiner'
      );

      setPingPongHistory(prev => [...prev, exportEntry]);
      setPingInput(''); // Clear input after successful submission
      
    } catch (error) {
      console.error('Error refining prompt:', error);
      alert(`Error refining prompt: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [pingInput]);

  /**
   * Handle conversational question/answer
   */
  const handleAskQuestion = useCallback(async (e) => {
    e.preventDefault();
    
    if (!pingInput.trim()) {
      alert('Please enter a question');
      return;
    }

    setIsProcessing(true);
    setCurrentPong(''); // Clear previous pong
    setIsClarifyingQuestion(false);

    try {
      // Use the OpenAI endpoint for conversational responses
      const response = await fetch('/api/refine-prompt-openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: pingInput })
      });
      
      const data = await response.json();
      const answer = data.refined_prompt || data.fallback || 'No response available';
      
      // Check if the response is a clarifying question
      const isQuestion = answer.toLowerCase().includes('clarifying') || 
                        answer.toLowerCase().includes('question') ||
                        answer.includes('?') && (answer.includes('what') || answer.includes('how') || answer.includes('which') || answer.includes('when') || answer.includes('where') || answer.includes('why'));
      
      setIsClarifyingQuestion(isQuestion);
      
      // Update current pong display
      setCurrentPong(answer);
      
      // Create clean export entry
      const exportEntry = createCleanExportEntry(
        pingInput,
        answer,
        data.source || 'Conversational AI'
      );

      setPingPongHistory(prev => [...prev, exportEntry]);
      
      // Only clear input if it's not a clarifying question (allow user to respond)
      if (!isQuestion) {
        setPingInput(''); // Clear input after successful submission
      }
      
    } catch (error) {
      console.error('Error asking question:', error);
      alert(`Error asking question: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [pingInput]);

  /**
   * Export ping-pong history as clean STAMPED/SPVPET/STACKED compliant JSON
   */
  const handleExport = useCallback(() => {
    if (pingPongHistory.length === 0) {
      alert('No ping-pong history to export');
      return;
    }

    // Ensure clean export format with proper STAMPED/SPVPET/STACKED structure
    const cleanedExportData = pingPongHistory.map(entry => ({
      ping: entry.ping || "",
      pong: entry.pong || "",
      refinement_notes: entry.refinement_notes || "",
      source: entry.source || "Unknown",
      timestamp: entry.timestamp || new Date().toISOString(),
    }));

    const blob = new Blob([JSON.stringify(cleanedExportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ping-pong-refinements-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [pingPongHistory]);

  /**
   * Test Abacus API directly
   */
  const testAbacusAPI = async () => {
    try {
      const response = await fetch('/api/test-abacus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'best places to eat Bedford, Pennsylvania' })
      });
      
      const data = await response.json();
      console.log('=== ABACUS TEST RESULT ===', data);
      
      if (data.success) {
        const responseText = data.response || data.responseText || 'Success but no response text';
        alert(`✅ ABACUS TEST SUCCESS!\n\nWorking URL: ${data.workingUrl || 'Unknown'}\n\nResponse: ${typeof responseText === 'string' ? responseText.substring(0, 200) : JSON.stringify(responseText).substring(0, 200)}...\n\nCheck console for full details.`);
      } else {
        const errorDetails = data.error || data.message || 'Unknown error';
        const apiKeyStatus = data.apiKeyStatus ? `\nAPI Key Status: ${data.apiKeyStatus.found ? 'Found' : 'Not Found'} (${data.apiKeyStatus.preview})` : '';
        alert(`❌ ABACUS TEST FAILED!\n\nError: ${errorDetails}${apiKeyStatus}\n\nCheck console for full details.`);
      }
    } catch (error) {
      alert(`❌ TEST ERROR!\n\n${error.message}`);
      console.error('Test error:', error);
    }
  };

  /**
   * Debug all Abacus API endpoints
   */
  const debugAbacusAPI = async () => {
    try {
      const response = await fetch('/api/debug-abacus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      console.log('=== ABACUS DEBUG RESULT ===', data);
      
      if (data.success) {
        const results = data.endpointResults;
        const workingEndpoints = Object.keys(results).filter(url => 
          results[url].status && results[url].status < 400
        );
        const failedEndpoints = Object.keys(results).filter(url => 
          !results[url].status || results[url].status >= 400 || results[url].error
        );
        
        alert(`🔍 DEBUG RESULTS:\n\n✅ Working: ${workingEndpoints.length}\n❌ Failed: ${failedEndpoints.length}\n\nWorking endpoints:\n${workingEndpoints.join('\n')}\n\nCheck console for full details.`);
      } else {
        alert(`❌ DEBUG FAILED!\n\n${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`❌ DEBUG ERROR!\n\n${error.message}`);
      console.error('Debug error:', error);
    }
  };

  /**
   * Test different API key header formats
   */
  const testHeaderFormats = async () => {
    try {
      const response = await fetch('/api/test-headers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      console.log('=== HEADER FORMAT TEST ===', data);
      
      if (data.success) {
        const results = data.headerFormatResults;
        const workingFormats = Object.keys(results).filter(format => 
          results[format].status && results[format].status < 400
        );
        const failedFormats = Object.keys(results).filter(format => 
          !results[format].status || results[format].status >= 400 || results[format].error
        );
        
        alert(`🔑 HEADER FORMAT TEST:\n\n✅ Working: ${workingFormats.length}\n❌ Failed: ${failedFormats.length}\n\nWorking formats:\n${workingFormats.join('\n')}\n\nAPI Key: ${data.apiKeyPreview}\n\nCheck console for full details.`);
      } else {
        alert(`❌ HEADER TEST FAILED!\n\n${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`❌ HEADER TEST ERROR!\n\n${error.message}`);
      console.error('Header test error:', error);
    }
  };

  /**
   * Test OpenAI API directly
   */
  const testOpenAI = async () => {
    try {
      const response = await fetch('/api/refine-prompt-openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'best restaurants Bedford, PA' })
      });
      
      const data = await response.json();
      console.log('=== OPENAI TEST RESULT ===', data);
      
      if (data.success) {
        const responseText = data.refined_prompt || 'Success but no response text';
        alert(`✅ OPENAI TEST SUCCESS!\n\nSource: ${data.source}\nModel: ${data.model || 'Unknown'}\n\nResponse: ${responseText.substring(0, 200)}...\n\nCheck console for full details.`);
      } else {
        const errorDetails = data.error || data.message || 'Unknown error';
        const fallback = data.fallback ? `\nFallback: ${data.fallback.substring(0, 100)}...` : '';
        alert(`❌ OPENAI TEST FAILED!\n\nError: ${errorDetails}${fallback}\n\nNote: ${data.note || 'Check console for details'}`);
      }
    } catch (error) {
      alert(`❌ OPENAI TEST ERROR!\n\n${error.message}`);
      console.error('OpenAI test error:', error);
    }
  };

  return (
    <div style={{ maxWidth: '95vw', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Ping input form */}
      <form style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="ping-input" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Enter your prompt or question:
          </label>
          <textarea
            id="ping-input"
            value={pingInput}
            onChange={(e) => setPingInput(e.target.value)}
            placeholder="Enter your prompt or question here..."
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              resize: 'vertical'
            }}
            disabled={isProcessing}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleRefinePrompt}
            disabled={isProcessing || !pingInput.trim()}
            style={{
              padding: '10px 20px',
              backgroundColor: isProcessing || !pingInput.trim() ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isProcessing || !pingInput.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {isProcessing ? 'Processing...' : '🔧 Refine Prompt'}
          </button>
          
          <button
            type="button"
            onClick={handleAskQuestion}
            disabled={isProcessing || !pingInput.trim()}
            style={{
              padding: '10px 20px',
              backgroundColor: isProcessing || !pingInput.trim() ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isProcessing || !pingInput.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {isProcessing ? 'Processing...' : '💬 Ask Question'}
          </button>
        </div>
      </form>

      {/* Main content area with chat history and latest response */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        {/* Chat History - Left side, much larger */}
        {pingPongHistory.length > 0 && (
          <div style={{ flex: '4', minWidth: '0' }}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>Chat History:</h3>
            <div style={{ 
              height: '600px', 
              overflowY: 'auto', 
              border: '1px solid #e9ecef', 
              borderRadius: '4px',
              backgroundColor: '#ffffff'
            }}>
              {pingPongHistory.map((entry, index) => {
                const isQuestion = entry.pong.toLowerCase().includes('clarifying') || 
                                  entry.pong.toLowerCase().includes('question') ||
                                  entry.pong.includes('?') && (entry.pong.includes('what') || entry.pong.includes('how') || entry.pong.includes('which') || entry.pong.includes('when') || entry.pong.includes('where') || entry.pong.includes('why'));
                
                return (
                  <div key={index} style={{ 
                    padding: '15px', 
                    borderBottom: index < pingPongHistory.length - 1 ? '1px solid #e9ecef' : 'none',
                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff'
                  }}>
                    {/* Ping */}
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        color: '#007bff', 
                        fontSize: '14px',
                        marginBottom: '5px'
                      }}>
                        Ping #{index + 1}:
                      </div>
                      <div style={{ 
                        padding: '10px', 
                        backgroundColor: '#e3f2fd', 
                        borderRadius: '4px',
                        borderLeft: '3px solid #007bff'
                      }}>
                        {entry.ping}
                      </div>
                    </div>
                    
                    {/* Pong */}
                    <div>
                      <div style={{ 
                        fontWeight: 'bold', 
                        color: entry.source === 'Conversational AI' ? '#17a2b8' : '#28a745', 
                        fontSize: '14px',
                        marginBottom: '5px'
                      }}>
                        {entry.source === 'Conversational AI' ? 'AI Response:' : 'Refined Prompt:'}
                      </div>
                      <div style={{ 
                        padding: '10px', 
                        backgroundColor: entry.source === 'Conversational AI' ? '#e8f4f8' : '#f1f8e9', 
                        borderRadius: '4px',
                        borderLeft: `3px solid ${entry.source === 'Conversational AI' ? '#17a2b8' : '#28a745'}`,
                        whiteSpace: 'pre-wrap'
                      }}>
                        {entry.pong}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Latest Response - Right side sidebar */}
        {currentPong && (
          <div style={{ flex: '1', minWidth: '350px', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>Latest Response:</h3>
            <div style={{
              height: '600px',
              overflowY: 'auto',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '4px',
              whiteSpace: 'pre-wrap',
              borderLeft: '4px solid #007bff'
            }}>
              {currentPong}
            </div>
            {isClarifyingQuestion && (
              <div style={{ 
                marginTop: '10px', 
                fontSize: '14px', 
                color: '#6c757d',
                fontStyle: 'italic'
              }}>
                Please provide more details in your response above to help refine your prompt.
              </div>
            )}
          </div>
        )}

        {/* Placeholder when no history */}
        {pingPongHistory.length === 0 && !currentPong && (
          <div style={{ 
            flex: '1', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '200px',
            border: '2px dashed #e9ecef',
            borderRadius: '4px',
            color: '#6c757d',
            fontSize: '16px'
          }}>
            Your chat history and responses will appear here
          </div>
        )}
      </div>

      {/* Export and Test buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleExport}
          disabled={pingPongHistory.length === 0}
          style={{
            padding: '10px 20px',
            backgroundColor: pingPongHistory.length === 0 ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: pingPongHistory.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          Export JSON ({pingPongHistory.length})
        </button>
        
        <button
          onClick={testAbacusAPI}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🧪 Test Abacus API
        </button>
        
        <button
          onClick={debugAbacusAPI}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔍 Debug Endpoints
        </button>
        
        <button
          onClick={testHeaderFormats}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔑 Test Headers
        </button>
        
        <button
          onClick={testOpenAI}
          style={{
            padding: '10px 20px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🤖 Test OpenAI
        </button>
      </div>
    </div>
  );
} 