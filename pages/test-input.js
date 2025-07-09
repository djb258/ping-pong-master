import { useState } from 'react';

export default function TestInput() {
  const [input, setInput] = useState('');

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Input Test Page</h1>
      <p>This is a simple test to check if input functionality is working.</p>
      
      <div style={{ margin: '20px 0' }}>
        <label htmlFor="testInput">Test Input:</label>
        <br />
        <textarea
          id="testInput"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type something here..."
          rows={4}
          style={{
            width: '100%',
            padding: '10px',
            border: '2px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
      </div>
      
      <div style={{ margin: '20px 0' }}>
        <strong>Current input value:</strong>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {input || '(empty)'}
        </pre>
      </div>
      
      <button
        onClick={() => alert('Button clicked! Input: ' + input)}
        style={{
          padding: '10px 20px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Button
      </button>
    </div>
  );
} 