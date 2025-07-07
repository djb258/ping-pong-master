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
 * Schema compliance utilities for STAMPED/SPVPET/STACKED format
 */
const createSTAMPEDEntry = (ping, pong, metadata) => ({
  id: `ping-pong-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  timestamp: new Date().toISOString(),
  type: 'ping-pong-exchange',
  
  // STAMPED: Structured, Timestamped, Actionable, Measurable, Paired, Exportable, Documented
  structured: {
    ping: {
      content: ping,
      timestamp: metadata.pingTimestamp,
      characterCount: ping.length,
      wordCount: ping.split(/\s+/).filter(word => word.length > 0).length,
    },
    pong: {
      content: pong,
      timestamp: metadata.pongTimestamp,
      characterCount: pong.length,
      wordCount: pong.split(/\s+/).filter(word => word.length > 0).length,
      provider: metadata.provider,
      processingTimeMs: metadata.processingTimeMs,
    },
  },
  
  // SPVPET: Structured, Paired, Validated, Provenance, Exportable, Traceable
  provenance: {
    source: 'ping-pong-prompt-app',
    version: '1.0.0',
    refinementEngine: metadata.provider,
    processingMetadata: metadata,
  },
  
  // STACKED: Structured, Timestamped, Actionable, Contextual, Keyed, Exportable, Documented
  actionable: {
    canRefine: true,
    canExport: true,
    canShare: true,
  },
  
  contextual: {
    sessionId: metadata.sessionId,
    exchangeIndex: metadata.exchangeIndex,
  },
});

export default function PingPongForm() {
  // State management following Barton Doctrine: clear, predictable state structure
  const [pingInput, setPingInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pingPongHistory, setPingPongHistory] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(LLMProviders.ABACUS);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

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
      const pongTimestamp = new Date().toISOString();
      
      const exchangeMetadata = {
        ...result.metadata,
        pingTimestamp,
        pongTimestamp,
        sessionId,
        exchangeIndex: pingPongHistory.length,
      };

      // Create STAMPED/SPVPET/STACKED compliant entry
      const stampedEntry = createSTAMPEDEntry(
        pingInput,
        result.refinedPrompt,
        exchangeMetadata
      );

      setPingPongHistory(prev => [...prev, stampedEntry]);
      setPingInput(''); // Clear input after successful submission
      
    } catch (error) {
      console.error('Error processing ping:', error);
      alert(`Error processing ping: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [pingInput, selectedProvider, pingPongHistory.length, sessionId]);

  /**
   * Export ping-pong history as STAMPED/SPVPET/STACKED compliant JSON
   */
  const handleExport = useCallback(() => {
    if (pingPongHistory.length === 0) {
      alert('No ping-pong history to export');
      return;
    }

    const exportData = {
      meta: {
        exportTimestamp: new Date().toISOString(),
        exportVersion: '1.0.0',
        schema: 'STAMPED/SPVPET/STACKED',
        sessionId,
        totalExchanges: pingPongHistory.length,
      },
      exchanges: pingPongHistory,
      summary: {
        totalCharactersProcessed: pingPongHistory.reduce((acc, entry) => 
          acc + entry.structured.ping.characterCount + entry.structured.pong.characterCount, 0
        ),
        averageProcessingTime: pingPongHistory.reduce((acc, entry) => 
          acc + (entry.structured.pong.processingTimeMs || 0), 0
        ) / pingPongHistory.length,
        providersUsed: [...new Set(pingPongHistory.map(entry => entry.structured.pong.provider))],
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ping-pong-session-${sessionId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [pingPongHistory, sessionId]);

  /**
   * Clear all history (with confirmation)
   */
  const handleClearHistory = useCallback(() => {
    if (pingPongHistory.length === 0) return;
    
    if (window.confirm('Are you sure you want to clear all ping-pong history? This action cannot be undone.')) {
      setPingPongHistory([]);
    }
  }, [pingPongHistory.length]);

  // Memoized statistics for performance
  const sessionStats = useMemo(() => ({
    totalExchanges: pingPongHistory.length,
    totalCharacters: pingPongHistory.reduce((acc, entry) => 
      acc + entry.structured.ping.characterCount + entry.structured.pong.characterCount, 0
    ),
  }), [pingPongHistory]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Ping-Pong Prompt App</h1>
        <p className={styles.subtitle}>
          Refine your prompts with AI-powered enhancement
        </p>
        
        {/* Session statistics */}
        <div className={styles.stats}>
          <span>Session: {sessionId.split('-')[1]}</span>
          <span>Exchanges: {sessionStats.totalExchanges}</span>
          <span>Characters: {sessionStats.totalCharacters.toLocaleString()}</span>
        </div>
      </header>

      {/* Provider selection */}
      <div className={styles.providerSection}>
        <label htmlFor="provider-select" className={styles.label}>
          Refinement Engine:
        </label>
        <select
          id="provider-select"
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
          className={styles.select}
          disabled={isProcessing}
        >
          {Object.entries(LLMProviders).map(([key, value]) => (
            <option key={value} value={value}>
              {key.charAt(0) + key.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Ping input form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="ping-input" className={styles.label}>
            Enter your ping (prompt to refine):
          </label>
          <textarea
            id="ping-input"
            value={pingInput}
            onChange={(e) => setPingInput(e.target.value)}
            placeholder="Enter your prompt here for AI refinement..."
            className={styles.textarea}
            rows={4}
            disabled={isProcessing}
            maxLength={5000}
          />
          <div className={styles.charCount}>
            {pingInput.length}/5000 characters
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isProcessing || !pingInput.trim()}
          className={styles.submitButton}
        >
          {isProcessing ? 'Processing...' : 'Send Ping'}
        </button>
      </form>

      {/* Action buttons */}
      <div className={styles.actionButtons}>
        <button
          onClick={handleExport}
          disabled={pingPongHistory.length === 0}
          className={styles.exportButton}
        >
          Export Session JSON
        </button>
        
        <button
          onClick={handleClearHistory}
          disabled={pingPongHistory.length === 0}
          className={styles.clearButton}
        >
          Clear History
        </button>
      </div>

      {/* Ping-Pong history display */}
      <div className={styles.historySection}>
        <h2 className={styles.historyTitle}>
          Ping-Pong History ({pingPongHistory.length} exchanges)
        </h2>
        
        {pingPongHistory.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No ping-pong exchanges yet. Submit your first ping above!</p>
          </div>
        ) : (
          <div className={styles.historyList}>
            {pingPongHistory.map((entry, index) => (
              <div key={entry.id} className={styles.exchangeCard}>
                <div className={styles.exchangeHeader}>
                  <span className={styles.exchangeNumber}>
                    Exchange #{index + 1}
                  </span>
                  <span className={styles.exchangeTime}>
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                  <span className={styles.exchangeProvider}>
                    via {entry.structured.pong.provider}
                  </span>
                </div>
                
                <div className={styles.pingSection}>
                  <h4 className={styles.pingTitle}>📤 Ping:</h4>
                  <p className={styles.pingContent}>
                    {entry.structured.ping.content}
                  </p>
                  <div className={styles.pingMeta}>
                    {entry.structured.ping.wordCount} words, {entry.structured.ping.characterCount} characters
                  </div>
                </div>
                
                <div className={styles.pongSection}>
                  <h4 className={styles.pongTitle}>📥 Pong:</h4>
                  <div className={styles.pongContent}>
                    {entry.structured.pong.content}
                  </div>
                  <div className={styles.pongMeta}>
                    {entry.structured.pong.wordCount} words, {entry.structured.pong.characterCount} characters
                    {entry.structured.pong.processingTimeMs && (
                      <span> • Processed in {entry.structured.pong.processingTimeMs}ms</span>
                    )}
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