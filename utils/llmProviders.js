/**
 * LLM Provider System - Modular AI provider interface
 * 
 * This module provides a unified interface for different LLM providers,
 * making it easy to swap between ChatGPT, Perplexity, Claude, etc.
 */

/**
 * Base LLM Provider Interface
 */
class BaseLLMProvider {
  constructor(config = {}) {
    this.config = config;
  }

  async call(systemPrompt, userPrompt, options = {}) {
    throw new Error('call method must be implemented by provider');
  }

  validateConfig() {
    throw new Error('validateConfig method must be implemented by provider');
  }

  getProviderName() {
    throw new Error('getProviderName method must be implemented by provider');
  }
}

/**
 * OpenAI/ChatGPT Provider
 */
class OpenAIProvider extends BaseLLMProvider {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey || process.env.GPT4_API_KEY || process.env.OPENAI_API_KEY;
    this.apiUrl = config.apiUrl || process.env.GPT4_API_URL || 'https://api.openai.com/v1/chat/completions';
    this.model = config.model || process.env.GPT4_MODEL || 'gpt-4';
    this.maxTokens = config.maxTokens || parseInt(process.env.GPT4_MAX_TOKENS) || 1000;
    this.temperature = config.temperature || parseFloat(process.env.GPT4_TEMPERATURE) || 0.7;
  }

  validateConfig() {
    if (!this.apiKey || this.apiKey === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not configured');
    }
    return true;
  }

  getProviderName() {
    return 'OpenAI/ChatGPT';
  }

  async call(systemPrompt, userPrompt, options = {}) {
    this.validateConfig();

    const requestBody = {
      model: options.model || this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: options.maxTokens || this.maxTokens,
      temperature: options.temperature || this.temperature,
    };

    console.log(`[${this.getProviderName()}] Making request to: ${this.apiUrl}`);

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${this.getProviderName()} API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error(`No valid response content from ${this.getProviderName()}`);
    }

    return content.trim();
  }
}

/**
 * Perplexity Provider
 */
class PerplexityProvider extends BaseLLMProvider {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey || process.env.PERPLEXITY_API_KEY;
    this.apiUrl = config.apiUrl || 'https://api.perplexity.ai/chat/completions';
    this.model = config.model || 'llama-3.1-sonar-small-128k-online';
    this.maxTokens = config.maxTokens || 1000;
    this.temperature = config.temperature || 0.7;
  }

  validateConfig() {
    if (!this.apiKey || this.apiKey === 'your_perplexity_api_key_here') {
      throw new Error('Perplexity API key not configured');
    }
    return true;
  }

  getProviderName() {
    return 'Perplexity';
  }

  async call(systemPrompt, userPrompt, options = {}) {
    this.validateConfig();

    const requestBody = {
      model: options.model || this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: options.maxTokens || this.maxTokens,
      temperature: options.temperature || this.temperature,
    };

    console.log(`[${this.getProviderName()}] Making request to: ${this.apiUrl}`);

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${this.getProviderName()} API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error(`No valid response content from ${this.getProviderName()}`);
    }

    return content.trim();
  }
}

/**
 * Anthropic/Claude Provider
 */
class AnthropicProvider extends BaseLLMProvider {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    this.apiUrl = config.apiUrl || 'https://api.anthropic.com/v1/messages';
    this.model = config.model || 'claude-3-sonnet-20240229';
    this.maxTokens = config.maxTokens || 1000;
    this.temperature = config.temperature || 0.7;
  }

  validateConfig() {
    if (!this.apiKey || this.apiKey === 'your_anthropic_api_key_here') {
      throw new Error('Anthropic API key not configured');
    }
    return true;
  }

  getProviderName() {
    return 'Anthropic/Claude';
  }

  async call(systemPrompt, userPrompt, options = {}) {
    this.validateConfig();

    const requestBody = {
      model: options.model || this.model,
      max_tokens: options.maxTokens || this.maxTokens,
      temperature: options.temperature || this.temperature,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    };

    console.log(`[${this.getProviderName()}] Making request to: ${this.apiUrl}`);

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${this.getProviderName()} API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;
    
    if (!content) {
      throw new Error(`No valid response content from ${this.getProviderName()}`);
    }

    return content.trim();
  }
}

/**
 * Google Gemini Provider
 */
class GeminiProvider extends BaseLLMProvider {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY;
    this.apiUrl = config.apiUrl || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    this.model = config.model || 'gemini-pro';
    this.maxTokens = config.maxTokens || 1000;
    this.temperature = config.temperature || 0.7;
  }

  validateConfig() {
    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key not configured');
    }
    return true;
  }

  getProviderName() {
    return 'Google Gemini';
  }

  async call(systemPrompt, userPrompt, options = {}) {
    this.validateConfig();

    const requestBody = {
      contents: [
        {
          parts: [
            { text: `${systemPrompt}\n\n${userPrompt}` }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: options.maxTokens || this.maxTokens,
        temperature: options.temperature || this.temperature,
      }
    };

    const url = `${this.apiUrl}?key=${this.apiKey}`;
    console.log(`[${this.getProviderName()}] Making request to: ${this.apiUrl}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${this.getProviderName()} API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error(`No valid response content from ${this.getProviderName()}`);
    }

    return content.trim();
  }
}

/**
 * Abacus.AI Provider (existing integration)
 */
class AbacusProvider extends BaseLLMProvider {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey || process.env.ABACUS_API_KEY;
    this.apiUrl = config.apiUrl || process.env.ABACUS_API_URL || 'https://api.abacus.ai/api/v0/chat';
    this.orgId = config.orgId || process.env.ABACUS_ORG_ID;
    this.llmName = config.llmName || 'gpt-4';
    this.maxTokens = config.maxTokens || 4000;
    this.temperature = config.temperature || 0.7;
  }

  validateConfig() {
    if (!this.apiKey || this.apiKey === 'your_abacus_api_key_here') {
      throw new Error('Abacus API key not configured');
    }
    if (!this.orgId || this.orgId === 'your_abacus_org_id_here') {
      throw new Error('Abacus Organization ID not configured');
    }
    return true;
  }

  getProviderName() {
    return 'Abacus.AI';
  }

  async call(systemPrompt, userPrompt, options = {}) {
    this.validateConfig();

    const requestBody = {
      llmName: options.llmName || this.llmName,
      maxTokens: options.maxTokens || this.maxTokens,
      temperature: options.temperature || this.temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    };

    console.log(`[${this.getProviderName()}] Making request to: ${this.apiUrl}`);

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Abacus-Org-Id': this.orgId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${this.getProviderName()} API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error(`No valid response content from ${this.getProviderName()}`);
    }

    return content.trim();
  }
}

/**
 * Mock/Fallback Provider for testing
 */
class MockProvider extends BaseLLMProvider {
  constructor(config = {}) {
    super(config);
    this.responseDelay = config.responseDelay || 1000;
  }

  validateConfig() {
    return true; // Always valid
  }

  getProviderName() {
    return 'Mock Provider';
  }

  async call(systemPrompt, userPrompt, options = {}) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, this.responseDelay));

    // Generate a mock response based on the altitude level
    const altitudeMatch = systemPrompt.match(/CURRENT ALTITUDE: (\d+k)/);
    const altitude = altitudeMatch ? altitudeMatch[1] : '30k';
    
    const mockResponses = {
      '30k': `That's an exciting vision! I'd love to help you explore this further. 

What aspects of this goal are most important to you? And what kind of impact are you hoping to make?`,
      
      '20k': `Great! We're getting more specific. 

What industry or category does this fall into? And what type of approach or model appeals to you most?`,
      
      '10k': `Perfect! Now let's find your unique angle. 

What specific specialization or niche within this area interests you? And what would make your approach different?`,
      
      '5k': `Excellent! Time to get practical. 

What specific actions would you like to take first? And what resources or tools do you think you'll need?`
    };

    return mockResponses[altitude] || `Let's continue exploring your idea: "${userPrompt}". What would you like to focus on next?`;
  }
}

/**
 * LLM Provider Factory
 */
class LLMProviderFactory {
  constructor() {
    this.providers = new Map();
    this.defaultProvider = 'openai';
    
    // Register default providers
    this.registerProvider('openai', OpenAIProvider);
    this.registerProvider('perplexity', PerplexityProvider);
    this.registerProvider('anthropic', AnthropicProvider);
    this.registerProvider('gemini', GeminiProvider);
    this.registerProvider('abacus', AbacusProvider);
    this.registerProvider('mock', MockProvider);
  }

  registerProvider(name, providerClass) {
    this.providers.set(name, providerClass);
  }

  createProvider(providerName, config = {}) {
    const ProviderClass = this.providers.get(providerName);
    if (!ProviderClass) {
      throw new Error(`Unknown provider: ${providerName}. Available providers: ${Array.from(this.providers.keys()).join(', ')}`);
    }
    return new ProviderClass(config);
  }

  getAvailableProviders() {
    return Array.from(this.providers.keys());
  }

  getDefaultProvider() {
    return this.defaultProvider;
  }

  setDefaultProvider(providerName) {
    if (!this.providers.has(providerName)) {
      throw new Error(`Unknown provider: ${providerName}`);
    }
    this.defaultProvider = providerName;
  }
}

// Create global factory instance
const llmFactory = new LLMProviderFactory();

/**
 * Unified LLM calling function
 */
async function callLLM(systemPrompt, userPrompt, options = {}) {
  const providerName = options.provider || process.env.DEFAULT_LLM_PROVIDER || llmFactory.getDefaultProvider();
  const providerConfig = options.providerConfig || {};
  
  try {
    const provider = llmFactory.createProvider(providerName, providerConfig);
    console.log(`[LLM] Using provider: ${provider.getProviderName()}`);
    
    return await provider.call(systemPrompt, userPrompt, options);
  } catch (error) {
    console.error(`[LLM] Error with provider ${providerName}:`, error.message);
    
    // Fallback to mock provider if configured
    if (options.fallbackToMock !== false) {
      console.log('[LLM] Falling back to mock provider');
      const mockProvider = llmFactory.createProvider('mock');
      return await mockProvider.call(systemPrompt, userPrompt, options);
    }
    
    throw error;
  }
}

// Export everything
export {
  BaseLLMProvider,
  OpenAIProvider,
  PerplexityProvider,
  AnthropicProvider,
  GeminiProvider,
  AbacusProvider,
  MockProvider,
  LLMProviderFactory,
  llmFactory,
  callLLM
};

// Default export for convenience
export default callLLM; 