/**
 * Simple Altitude Form - Basic version for testing
 */

import { useState } from 'react';

export default function SimpleAltitudeForm() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/refine-prompt-altitude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: input,
          ideaTree: [],
          coreIdea: '',
          isDirectionChange: false
        })
      });
      
      const data = await response.json();
      setOutput(JSON.stringify(data, null, 2));
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Simple Altitude Test</h1>
      
      <form onSubmit={handleSubmit}>
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
          type="submit" 
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Processing...' : 'Test Altitude'}
        </button>
      </form>

      {output && (
        <div style={{ marginTop: '20px' }}>
          <h3>Output:</h3>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '5px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {output}
          </pre>
        </div>
      )}
    </div>
  );
} 