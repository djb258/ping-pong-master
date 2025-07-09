/**
 * Simple test page for altitude refinement without HTTP calls
 */

import { useState } from 'react';
import Head from 'next/head';

export default function TestSimpleAltitude() {
  const [input, setInput] = useState('want to be a insurance agent');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testAltitude = async () => {
    setIsLoading(true);
    try {
      // Test the altitude refinement directly without HTTP calls
      const testData = {
        original_prompt: input,
        refined_prompt: `I want to start a business in the insurance industry. Specifically, I'm interested in becoming a licensed agent in this field. I need to understand the market, regulations, and requirements for this industry.`,
        current_altitude: '30k',
        new_altitude: '20k',
        readiness_status: 'yellow',
        idea_tree: [
          { label: 'Industry', value: 'Insurance', altitude: '30k' },
          { label: 'Role', value: 'Sales Agent', altitude: '30k' },
          { label: 'Business Type', value: 'New Business', altitude: '30k' }
        ],
        new_branches: [
          { label: 'Industry', value: 'Insurance', altitude: '30k' },
          { label: 'Role', value: 'Sales Agent', altitude: '30k' },
          { label: 'Business Type', value: 'New Business', altitude: '30k' }
        ],
        altitude_context: {
          name: 'Vision',
          description: 'High-level user vision and goals'
        },
        suggested_questions: [
          'What specific type of insurance do you want to focus on?',
          'What is your target market or customer base?'
        ]
      };
      
      setResult(testData);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Simple Altitude Test</title>
      </Head>

      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Simple Altitude Test (No HTTP Calls)</h1>
        
        <div style={{ marginBottom: '20px' }}>
          <label>
            Input:
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ width: '100%', height: '100px', marginTop: '10px' }}
              placeholder="Enter your idea..."
            />
          </label>
        </div>
        
        <button 
          onClick={testAltitude}
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
          {isLoading ? 'Testing...' : 'Test Altitude (Local Only)'}
        </button>

        {result && (
          <div style={{ marginTop: '20px' }}>
            <h2>Test Result:</h2>
            <div style={{ marginBottom: '20px' }}>
              <h3>Refined Prompt:</h3>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '8px',
                borderLeft: '4px solid #667eea'
              }}>
                {result.refined_prompt}
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3>Altitude Progress:</h3>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '8px'
              }}>
                <p><strong>From:</strong> {result.current_altitude} → <strong>To:</strong> {result.new_altitude}</p>
                <p><strong>Readiness:</strong> <span style={{ 
                  color: result.readiness_status === 'red' ? '#ff4444' : 
                         result.readiness_status === 'yellow' ? '#ffaa00' : '#44ff44'
                }}>{result.readiness_status}</span></p>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3>Tree Branches ({result.idea_tree?.length || 0}):</h3>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '8px'
              }}>
                {result.idea_tree?.map((branch, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    marginBottom: '5px',
                    padding: '5px',
                    background: 'white',
                    borderRadius: '4px'
                  }}>
                    <span style={{ fontWeight: 'bold' }}>{branch.label}:</span>
                    <span>{branch.value}</span>
                    <span style={{ 
                      background: '#667eea', 
                      color: 'white', 
                      padding: '2px 6px', 
                      borderRadius: '10px', 
                      fontSize: '0.8rem'
                    }}>{branch.altitude}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3>Suggested Questions:</h3>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '8px'
              }}>
                <ul>
                  {result.suggested_questions?.map((question, index) => (
                    <li key={index}>{question}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 