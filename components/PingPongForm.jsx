/**
 * PingPongForm Component
 * 
 * Main UI component for the Ping-Pong Prompt application.
 * Follows Barton Doctrine principles:
 * - Single responsibility (UI and state management)
 * - Clear separation of concerns
 * - Modular, reusable design
 * - Proper error handling and user feedback
 */

import { useState, useCallback, useMemo } from 'react';
import { refinePrompt, LLMProviders } from '../utils/refinePrompt';
import styles from '../styles/PingPongForm.module.css';

/**
 * Create clean STAMPED/SPVPET/STACKED compliant export entry
 * Focuses on essential data without clutter
 */
const createCleanExportEntry = (ping, pong, metadata) => ({
  ping: ping,
  pong: pong,
  refinement_notes: `Clarity and specificity improvements applied via ${metadata.provider}`,
  source: metadata.provider === 'abacus' ? 'Abacus' : metadata.provider,
  timestamp: new Date().toISOString(),
  processing_time_ms: metadata.processingTimeMs,
});

export default function PingPongForm() {
  // Clean state management: input, processing state, and history
  const [pingInput, setPingInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pingPongHistory, setPingPongHistory] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(LLMProviders.ABACUS);

  /**
   * Handle ping submission and pong generation
   * Implements proper error handling and user feedback
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!pingInput.trim()) {
      alert('Please enter a ping prompt');
      return;
    }

    setIsProcessing(true);
    const pingTimestamp = new Date().toISOString();

    try {
      const result = await refinePrompt(pingInput, selectedProvider);
      
      // Create clean export entry focused on core refinement data
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
  }, [pingInput, selectedProvider]);

  /**
   * Export ping-pong history as clean STAMPED/SPVPET/STACKED compliant JSON
   * Each entry contains: ping, pong, refinement_notes, source, timestamp
   */
  const handleExport = useCallback(() => {
    if (pingPongHistory.length === 0) {
      alert('No ping-pong history to export');
      return;
    }

    // Clean export format - array of refinement entries
    const exportData = pingPongHistory;

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
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
   * Clear all history (with confirmation)
   */
  const handleClearHistory = useCallback(() => {
    if (pingPongHistory.length === 0) return;
    
    if (window.confirm('Are you sure you want to clear all ping-pong history? This action cannot be undone.')) {
      setPingPongHistory([]);
    }
  }, [pingPongHistory.length]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Ping-Pong Prompt App</h1>
        <p className={styles.subtitle}>
          Refine prompts for clarity and specificity
        </p>
      </header>

      {/* Ping input form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="ping-input" className={styles.label}>
            Enter prompt to refine:
          </label>
          <textarea
            id="ping-input"
            value={pingInput}
            onChange={(e) => setPingInput(e.target.value)}
            placeholder="Enter your prompt here..."
            className={styles.textarea}
            rows={3}
            disabled={isProcessing}
            maxLength={2000}
          />
        </div>
        
        <button
          type="submit"
          disabled={isProcessing || !pingInput.trim()}
          className={styles.submitButton}
        >
          {isProcessing ? 'Refining...' : 'Refine Prompt'}
        </button>
      </form>

      {/* Export button */}
      <div className={styles.actionButtons}>
        <button
          onClick={handleExport}
          disabled={pingPongHistory.length === 0}
          className={styles.exportButton}
        >
          Export JSON ({pingPongHistory.length})
        </button>
      </div>

      {/* Refinement history display */}
      <div className={styles.historySection}>
        <h2 className={styles.historyTitle}>
          Refinement History
        </h2>
        
        {pingPongHistory.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No refinements yet. Submit your first prompt above!</p>
          </div>
        ) : (
          <div className={styles.historyList}>
            {pingPongHistory.map((entry, index) => (
              <div key={index} className={styles.exchangeCard}>
                <div className={styles.exchangeHeader}>
                  <span className={styles.exchangeNumber}>
                    #{index + 1}
                  </span>
                  <span className={styles.exchangeTime}>
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                  <span className={styles.exchangeProvider}>
                    {entry.source}
                  </span>
                </div>
                
                <div className={styles.pingSection}>
                  <h4 className={styles.pingTitle}>Original:</h4>
                  <p className={styles.pingContent}>
                    {entry.ping}
                  </p>
                </div>
                
                <div className={styles.pongSection}>
                  <h4 className={styles.pongTitle}>Refined:</h4>
                  <div className={styles.pongContent}>
                    {entry.pong}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 