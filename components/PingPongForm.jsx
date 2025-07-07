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
   * Handle ping submission and pong generation
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!pingInput.trim()) {
      alert('Please enter a ping prompt');
      return;
    }

    setIsProcessing(true);
    setCurrentPong(''); // Clear previous pong
    setIsClarifyingQuestion(false);

    try {
      const refinedPrompt = await refinePrompt(pingInput);
      
      // Check if the response is a clarifying question
      const isQuestion = refinedPrompt.toLowerCase().includes('clarifying') || 
                        refinedPrompt.toLowerCase().includes('question') ||
                        refinedPrompt.includes('?') && (refinedPrompt.includes('what') || refinedPrompt.includes('how') || refinedPrompt.includes('which') || refinedPrompt.includes('when') || refinedPrompt.includes('where') || refinedPrompt.includes('why'));
      
      setIsClarifyingQuestion(isQuestion);
      
      // Update current pong display
      setCurrentPong(refinedPrompt);
      
      // Create clean export entry
      const exportEntry = createCleanExportEntry(
        pingInput,
        refinedPrompt,
        'Abacus'
      );

      setPingPongHistory(prev => [...prev, exportEntry]);
      
      // Only clear input if it's not a clarifying question (allow user to respond)
      if (!isQuestion) {
        setPingInput(''); // Clear input after successful submission
      }
      
    } catch (error) {
      console.error('Error processing ping:', error);
      alert(`Error processing ping: ${error.message}`);
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

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Ping input form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="ping-input" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Ping:
          </label>
          <textarea
            id="ping-input"
            value={pingInput}
            onChange={(e) => setPingInput(e.target.value)}
            placeholder="Enter your prompt here..."
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
        
        <button
          type="submit"
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
          {isProcessing ? 'Processing...' : (isClarifyingQuestion ? 'Respond to Question' : 'Submit')}
        </button>
      </form>

      {/* Conversation thread display */}
      {pingPongHistory.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>Conversation Thread:</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e9ecef', borderRadius: '4px' }}>
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
                      color: isQuestion ? '#ff9800' : '#28a745', 
                      fontSize: '14px',
                      marginBottom: '5px'
                    }}>
                      {isQuestion ? 'Clarifying Questions:' : 'Refined Prompt:'}
                    </div>
                    <div style={{ 
                      padding: '10px', 
                      backgroundColor: isQuestion ? '#fff3cd' : '#f1f8e9', 
                      borderRadius: '4px',
                      borderLeft: `3px solid ${isQuestion ? '#ff9800' : '#28a745'}`,
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

      {/* Current pong display (for immediate feedback) */}
      {currentPong && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            {isClarifyingQuestion ? 'Latest Clarifying Questions:' : 'Latest Response:'}
          </label>
          <div style={{
            padding: '15px',
            backgroundColor: isClarifyingQuestion ? '#fff3cd' : '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '4px',
            whiteSpace: 'pre-wrap',
            borderLeft: isClarifyingQuestion ? '4px solid #ffc107' : '1px solid #e9ecef'
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
      </div>
    </div>
  );
} 