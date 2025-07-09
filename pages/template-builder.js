import { useState, useEffect } from 'react';
import { createTemplateFromBlueprint } from '../utils/dynamicTemplateSystem.js';
import { refineWithDynamicTemplate } from '../utils/dynamicRefinementSystem.js';

export default function TemplateBuilder() {
  const [blueprint, setBlueprint] = useState({
    name: "My Custom Template",
    description: "A template for...",
    layers: [
      {
        id: "layer1",
        name: "First Layer",
        description: "What this layer focuses on",
        focus: "Specific focus area",
        questions: [
          "Question 1?",
          "Question 2?"
        ],
        transition: "How to move to next layer"
      }
    ],
    outputFormat: {
      type: "json",
      structure: {}
    }
  });

  const [blueprintJson, setBlueprintJson] = useState('');
  const [llmResponse, setLlmResponse] = useState('');
  const [testPrompt, setTestPrompt] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState('builder');

  // Update JSON when blueprint changes
  useEffect(() => {
    setBlueprintJson(JSON.stringify(blueprint, null, 2));
  }, [blueprint]);

  // Update blueprint when JSON changes
  const updateBlueprintFromJson = () => {
    try {
      const parsed = JSON.parse(blueprintJson);
      setBlueprint(parsed);
    } catch (error) {
      alert('Invalid JSON: ' + error.message);
    }
  };

  // Add a new layer
  const addLayer = () => {
    const newLayer = {
      id: `layer${blueprint.layers.length + 1}`,
      name: `Layer ${blueprint.layers.length + 1}`,
      description: "What this layer focuses on",
      focus: "Specific focus area",
      questions: ["Question 1?"],
      transition: "How to move to next layer"
    };
    
    setBlueprint(prev => ({
      ...prev,
      layers: [...prev.layers, newLayer]
    }));
  };

  // Remove a layer
  const removeLayer = (index) => {
    setBlueprint(prev => ({
      ...prev,
      layers: prev.layers.filter((_, i) => i !== index)
    }));
  };

  // Update layer
  const updateLayer = (index, field, value) => {
    setBlueprint(prev => ({
      ...prev,
      layers: prev.layers.map((layer, i) => 
        i === index ? { ...layer, [field]: value } : layer
      )
    }));
  };

  // Add question to layer
  const addQuestion = (layerIndex) => {
    setBlueprint(prev => ({
      ...prev,
      layers: prev.layers.map((layer, i) => 
        i === layerIndex 
          ? { ...layer, questions: [...layer.questions, `Question ${layer.questions.length + 1}?`] }
          : layer
      )
    }));
  };

  // Remove question from layer
  const removeQuestion = (layerIndex, questionIndex) => {
    setBlueprint(prev => ({
      ...prev,
      layers: prev.layers.map((layer, i) => 
        i === layerIndex 
          ? { ...layer, questions: layer.questions.filter((_, q) => q !== questionIndex) }
          : layer
      )
    }));
  };

  // Update question
  const updateQuestion = (layerIndex, questionIndex, value) => {
    setBlueprint(prev => ({
      ...prev,
      layers: prev.layers.map((layer, i) => 
        i === layerIndex 
          ? { 
              ...layer, 
              questions: layer.questions.map((q, qi) => qi === questionIndex ? value : q)
            }
          : layer
      )
    }));
  };

  // Test the template
  const testTemplate = async () => {
    if (!testPrompt.trim()) {
      alert('Please enter a test prompt');
      return;
    }

    setIsTesting(true);
    try {
      const result = await refineWithDynamicTemplate(blueprint, testPrompt, [], null, false);
      setTestResult(result);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult({ error: error.message });
    } finally {
      setIsTesting(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Template Builder</h1>
      <p>Define your custom refinement template, copy to LLM, and test it!</p>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('builder')}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: activeTab === 'builder' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'builder' ? 'white' : 'black',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Visual Builder
        </button>
        <button 
          onClick={() => setActiveTab('json')}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: activeTab === 'json' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'json' ? 'white' : 'black',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          JSON Editor
        </button>
        <button 
          onClick={() => setActiveTab('llm')}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: activeTab === 'llm' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'llm' ? 'white' : 'black',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          LLM Interface
        </button>
        <button 
          onClick={() => setActiveTab('test')}
          style={{ 
            padding: '10px 20px',
            backgroundColor: activeTab === 'test' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'test' ? 'white' : 'black',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Template
        </button>
      </div>

      {/* Visual Builder Tab */}
      {activeTab === 'builder' && (
        <div>
          <h2>Template Configuration</h2>
          
          {/* Basic Info */}
          <div style={{ marginBottom: '20px' }}>
            <h3>Basic Information</h3>
            <div style={{ marginBottom: '10px' }}>
              <label>Template Name:</label>
              <input
                type="text"
                value={blueprint.name}
                onChange={(e) => setBlueprint(prev => ({ ...prev, name: e.target.value }))}
                style={{ width: '100%', padding: '8px', marginLeft: '10px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Description:</label>
              <textarea
                value={blueprint.description}
                onChange={(e) => setBlueprint(prev => ({ ...prev, description: e.target.value }))}
                style={{ width: '100%', padding: '8px', marginLeft: '10px', height: '60px' }}
              />
            </div>
          </div>

          {/* Layers */}
          <div style={{ marginBottom: '20px' }}>
            <h3>Layers ({blueprint.layers.length})</h3>
            {blueprint.layers.map((layer, index) => (
              <div key={index} style={{ 
                border: '1px solid #dee2e6', 
                padding: '15px', 
                marginBottom: '15px', 
                borderRadius: '4px',
                backgroundColor: '#f8f9fa'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4>Layer {index + 1}</h4>
                  <button 
                    onClick={() => removeLayer(index)}
                    style={{ 
                      padding: '5px 10px', 
                      backgroundColor: '#dc3545', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label>ID:</label>
                  <input
                    type="text"
                    value={layer.id}
                    onChange={(e) => updateLayer(index, 'id', e.target.value)}
                    style={{ width: '100%', padding: '8px', marginLeft: '10px' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label>Name:</label>
                  <input
                    type="text"
                    value={layer.name}
                    onChange={(e) => updateLayer(index, 'name', e.target.value)}
                    style={{ width: '100%', padding: '8px', marginLeft: '10px' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label>Description:</label>
                  <textarea
                    value={layer.description}
                    onChange={(e) => updateLayer(index, 'description', e.target.value)}
                    style={{ width: '100%', padding: '8px', marginLeft: '10px', height: '60px' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label>Focus:</label>
                  <textarea
                    value={layer.focus}
                    onChange={(e) => updateLayer(index, 'focus', e.target.value)}
                    style={{ width: '100%', padding: '8px', marginLeft: '10px', height: '40px' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label>Transition:</label>
                  <textarea
                    value={layer.transition}
                    onChange={(e) => updateLayer(index, 'transition', e.target.value)}
                    style={{ width: '100%', padding: '8px', marginLeft: '10px', height: '40px' }}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label>Questions ({layer.questions.length}):</label>
                  <button 
                    onClick={() => addQuestion(index)}
                    style={{ 
                      padding: '5px 10px', 
                      backgroundColor: '#28a745', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginLeft: '10px'
                    }}
                  >
                    Add Question
                  </button>
                  
                  {layer.questions.map((question, qIndex) => (
                    <div key={qIndex} style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => updateQuestion(index, qIndex, e.target.value)}
                        style={{ flex: 1, padding: '8px', marginRight: '10px' }}
                      />
                      <button 
                        onClick={() => removeQuestion(index, qIndex)}
                        style={{ 
                          padding: '5px 10px', 
                          backgroundColor: '#dc3545', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <button 
              onClick={addLayer}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Add Layer
            </button>
          </div>

          {/* Output Format */}
          <div style={{ marginBottom: '20px' }}>
            <h3>Output Format</h3>
            <div style={{ marginBottom: '10px' }}>
              <label>Type:</label>
              <select
                value={blueprint.outputFormat.type}
                onChange={(e) => setBlueprint(prev => ({ 
                  ...prev, 
                  outputFormat: { ...prev.outputFormat, type: e.target.value }
                }))}
                style={{ padding: '8px', marginLeft: '10px' }}
              >
                <option value="json">JSON</option>
                <option value="javascript">JavaScript</option>
                <option value="markdown">Markdown</option>
                <option value="text">Text</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* JSON Editor Tab */}
      {activeTab === 'json' && (
        <div>
          <h2>JSON Editor</h2>
          <p>Edit the JSON directly, then click "Update Blueprint" to apply changes.</p>
          
          <div style={{ marginBottom: '10px' }}>
            <button 
              onClick={() => copyToClipboard(blueprintJson)}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Copy JSON
            </button>
            <button 
              onClick={updateBlueprintFromJson}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Update Blueprint
            </button>
          </div>
          
          <textarea
            value={blueprintJson}
            onChange={(e) => setBlueprintJson(e.target.value)}
            style={{ 
              width: '100%', 
              height: '500px', 
              padding: '10px', 
              fontFamily: 'monospace',
              fontSize: '14px'
            }}
          />
        </div>
      )}

      {/* LLM Interface Tab */}
      {activeTab === 'llm' && (
        <div>
          <h2>LLM Interface</h2>
          <p>Copy the JSON to an LLM, then paste the response back to update your template.</p>
          
          <div style={{ marginBottom: '20px' }}>
            <h3>Current Blueprint (Copy this to LLM):</h3>
            <button 
              onClick={() => copyToClipboard(blueprintJson)}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              Copy Blueprint JSON
            </button>
            <textarea
              value={blueprintJson}
              readOnly
              style={{ 
                width: '100%', 
                height: '300px', 
                padding: '10px', 
                fontFamily: 'monospace',
                fontSize: '14px',
                backgroundColor: '#f8f9fa'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3>LLM Response (Paste here):</h3>
            <textarea
              value={llmResponse}
              onChange={(e) => setLlmResponse(e.target.value)}
              placeholder="Paste the LLM's response here..."
              style={{ 
                width: '100%', 
                height: '300px', 
                padding: '10px', 
                fontFamily: 'monospace',
                fontSize: '14px'
              }}
            />
            <button 
              onClick={() => {
                try {
                  const parsed = JSON.parse(llmResponse);
                  setBlueprint(parsed);
                  setLlmResponse('');
                  alert('Template updated successfully!');
                } catch (error) {
                  alert('Invalid JSON in LLM response: ' + error.message);
                }
              }}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Apply LLM Response
            </button>
          </div>
        </div>
      )}

      {/* Test Template Tab */}
      {activeTab === 'test' && (
        <div>
          <h2>Test Template</h2>
          <p>Test your template with a sample prompt to see how it works.</p>
          
          <div style={{ marginBottom: '20px' }}>
            <h3>Test Prompt:</h3>
            <textarea
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Enter a test prompt..."
              style={{ 
                width: '100%', 
                height: '100px', 
                padding: '10px',
                marginBottom: '10px'
              }}
            />
            <button 
              onClick={testTemplate}
              disabled={isTesting}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: isTesting ? '#6c757d' : '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: isTesting ? 'not-allowed' : 'pointer'
              }}
            >
              {isTesting ? 'Testing...' : 'Test Template'}
            </button>
          </div>
          
          {testResult && (
            <div style={{ marginBottom: '20px' }}>
              <h3>Test Result:</h3>
              <div style={{ 
                border: '1px solid #dee2e6', 
                padding: '15px', 
                borderRadius: '4px',
                backgroundColor: '#f8f9fa'
              }}>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 