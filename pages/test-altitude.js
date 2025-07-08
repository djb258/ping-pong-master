/**
 * Test page for altitude-based prompt refinement
 */

import { useState } from 'react';
import Head from 'next/head';

export default function TestAltitude() {
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testAltitudeRefinement = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/refine-prompt-altitude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: 'I want to start a business',
          ideaTree: [],
          coreIdea: '',
          isDirectionChange: false
        })
      });
      
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Test Altitude Refinement</title>
      </Head>

      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Test Altitude-Based Refinement</h1>
        
        <button 
          onClick={testAltitudeRefinement}
          disabled={isLoading}
          style={{
            padding: '12px 24px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? 'Testing...' : 'Test Altitude Refinement'}
        </button>

        {testResult && (
          <div style={{ marginTop: '20px' }}>
            <h2>Test Result:</h2>
            <pre style={{ 
              background: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '0.9rem'
            }}>
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </>
  );
} 