import React from 'react';
import styles from '../styles/LLMProviderSelector.module.css';

const LLMProviderSelector = ({ selectedProvider, onProviderChange }) => {
  const providers = [
    {
      id: 'openai',
      name: 'OpenAI/ChatGPT',
      description: 'GPT-4 and other OpenAI models',
      icon: '🤖',
      color: '#10a37f'
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      description: 'Real-time search and AI responses',
      icon: '🔍',
      color: '#6366f1'
    },
    {
      id: 'anthropic',
      name: 'Anthropic/Claude',
      description: 'Claude models for detailed analysis',
      icon: '🧠',
      color: '#8b5cf6'
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Google\'s advanced AI models',
      icon: '🌟',
      color: '#f59e0b'
    },
    {
      id: 'abacus',
      name: 'Abacus.AI',
      description: 'Enterprise AI platform',
      icon: '🏢',
      color: '#3b82f6'
    },
    {
      id: 'mock',
      name: 'Mock Provider',
      description: 'For testing without API calls',
      icon: '🧪',
      color: '#6b7280'
    }
  ];

  return (
    <div className={styles.providerSelector}>
      <h3>Choose Your AI Provider</h3>
      <p>Select which AI service to use for refinement:</p>
      
      <div className={styles.providerGrid}>
        {providers.map((provider) => (
          <div
            key={provider.id}
            className={`${styles.providerCard} ${selectedProvider === provider.id ? styles.selected : ''}`}
            onClick={() => onProviderChange(provider.id)}
            style={{ '--provider-color': provider.color }}
          >
            <div className={styles.providerIcon}>{provider.icon}</div>
            <div className={styles.providerContent}>
              <h4>{provider.name}</h4>
              <p>{provider.description}</p>
            </div>
            {selectedProvider === provider.id && (
              <div className={styles.selectedIndicator}>✓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LLMProviderSelector; 