/**
 * Centralized Configuration Management
 * 
 * Barton Doctrine: Centralized configuration management with clear
 * separation of concerns and environment-based configuration.
 */

/**
 * Application Configuration
 */
export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'APPROACH App',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  debug: process.env.NODE_ENV === 'development',
  
  // Performance settings
  maxPromptLength: parseInt(process.env.MAX_PROMPT_LENGTH) || 10000,
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT_MS) || 30000,
  rateLimitPerMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE) || 60,
  
  // Default settings
  defaultTemplate: process.env.DEFAULT_TEMPLATE || 'career',
  defaultMode: process.env.DEFAULT_MODE || 'blueprint_logic',
  defaultLLMProvider: process.env.DEFAULT_LLM_PROVIDER || 'openai'
};

/**
 * LLM Provider Configuration
 */
export const LLM_CONFIG = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || process.env.GPT4_API_KEY,
    apiUrl: process.env.GPT4_API_URL || 'https://api.openai.com/v1/chat/completions',
    model: process.env.GPT4_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.GPT4_MAX_TOKENS) || 1000,
    temperature: parseFloat(process.env.GPT4_TEMPERATURE) || 0.7
  },
  
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
    apiUrl: process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages',
    model: process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229',
    maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS) || 4000,
    temperature: parseFloat(process.env.CLAUDE_TEMPERATURE) || 0.7
  },
  
  perplexity: {
    apiKey: process.env.PERPLEXITY_API_KEY,
    apiUrl: 'https://api.perplexity.ai/chat/completions',
    model: 'llama-3.1-sonar-small-128k-online',
    maxTokens: 1000,
    temperature: 0.7
  },
  
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    model: 'gemini-pro',
    maxTokens: 1000,
    temperature: 0.7
  },
  
  abacus: {
    apiKey: process.env.ABACUS_API_KEY,
    apiUrl: process.env.ABACUS_API_URL || 'https://api.abacus.ai/api/v0/chat',
    orgId: process.env.ABACUS_ORG_ID,
    model: process.env.ABACUS_MODEL || 'abacus-default',
    maxTokens: parseInt(process.env.ABACUS_MAX_TOKENS) || 4000,
    temperature: parseFloat(process.env.ABACUS_TEMPERATURE) || 0.7
  }
};

/**
 * Altitude Configuration
 */
export const ALTITUDE_CONFIG = {
  levels: ['30k', '20k', '10k', '5k'],
  names: {
    '30k': 'Vision',
    '20k': 'Category', 
    '10k': 'Specialization',
    '5k': 'Execution'
  },
  descriptions: {
    '30k': 'High-level user vision and goals',
    '20k': 'Broad category or domain',
    '10k': 'Specific specialization within category',
    '5k': 'Specific execution details and implementation'
  },
  readinessThresholds: {
    '30k': { red: 0.2, yellow: 0.5, green: 0.7 },
    '20k': { red: 0.3, yellow: 0.6, green: 0.8 },
    '10k': { red: 0.3, yellow: 0.6, green: 0.8 },
    '5k': { red: 0.4, yellow: 0.7, green: 0.9 }
  }
};

/**
 * Checklist Configuration
 */
export const CHECKLIST_CONFIG = {
  defaultMode: 'blueprint_logic',
  evaluationTimeout: 10000,
  maxRetries: 3,
  fallbackEnabled: true
};

/**
 * Drift Detection Configuration
 */
export const DRIFT_CONFIG = {
  similarityThreshold: 0.3,
  scopeChangeThreshold: 0.5,
  topicShiftConfidence: 0.8,
  goalMisalignmentConfidence: 0.6
};

/**
 * Validation Configuration
 */
export const VALIDATION_CONFIG = {
  maxPromptLength: 10000,
  minPromptLength: 5,
  allowedFileTypes: ['json'],
  maxFileSize: 1024 * 1024 // 1MB
};

/**
 * Get configuration for a specific provider
 */
export function getProviderConfig(providerName) {
  const config = LLM_CONFIG[providerName];
  if (!config) {
    throw new Error(`Unknown LLM provider: ${providerName}`);
  }
  return config;
}

/**
 * Validate configuration
 */
export function validateConfig() {
  const errors = [];
  
  // Check required environment variables
  if (!LLM_CONFIG.openai.apiKey && !LLM_CONFIG.anthropic.apiKey) {
    errors.push('At least one LLM provider API key must be configured');
  }
  
  // Check altitude configuration
  if (ALTITUDE_CONFIG.levels.length !== 4) {
    errors.push('Altitude configuration must have exactly 4 levels');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig() {
  const isProduction = APP_CONFIG.environment === 'production';
  const isDevelopment = APP_CONFIG.environment === 'development';
  
  return {
    ...APP_CONFIG,
    isProduction,
    isDevelopment,
    enableDebugLogging: isDevelopment,
    enableErrorReporting: isProduction,
    enablePerformanceMonitoring: isProduction
  };
} 