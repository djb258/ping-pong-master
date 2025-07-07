/**
 * PingPongForm Component
 * 
 * Minimal UI for ping-pong prompt refinement.
 * Core elements: input, submit, display, export.
 */

import { useState, useCallback } from 'react';
import { refinePrompt, LLMProviders } from '../utils/refinePrompt';

/**
 * Create clean STAMPED/SPVPET/STACKED compliant export entry
 */
const createCleanExportEntry = (ping, pong, metadata) => ({
  ping: ping,
  pong: pong,
  refinement_notes: "",
  source: metadata.provider === 'abacus' ? 'Abacus' : metadata.provider.charAt(0).toUpperCase() + metadata.provider.slice(1),
  timestamp: new Date().toISOString(),
});

export default function PingPongForm() {
  const [pingInput, setPingInput] = useState('');
  const [currentPong, setCurrentPong] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pingPongHistory, setPingPongHistory] = useState([]);

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

    try {
      const result = await refinePrompt(pingInput, LLMProviders.ABACUS);
      
      // Update current pong display
      setCurrentPong(result.refinedPrompt);
      
      // Create clean export entry
      const exportEntry = createCleanExportEntry(
        pingInput,
        result.refinedPrompt,
        result.metadata
      );

      setPingPongHistory(prev => [...prev, exportEntry]);
      setPingInput(''); // Clear input after successful submission
      
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
          {isProcessing ? 'Processing...' : 'Submit'}
        </button>
      </form>

      {/* Pong display */}
      {currentPong && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Pong:
          </label>
          <div style={{
            padding: '15px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '4px',
            whiteSpace: 'pre-wrap'
          }}>
            {currentPong}
          </div>
        </div>
      )}

      {/* Export button */}
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
    </div>
  );
} 