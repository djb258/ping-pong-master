/**
 * Test endpoint for LLM integration
 */

import { callLLM } from '../../utils/llmProviders';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[TEST] Testing LLM integration...');
    
    const systemPrompt = 'You are a helpful assistant. Respond with a simple JSON object containing a greeting.';
    const userPrompt = 'Say hello and provide a simple test response.';
    
    console.log('[TEST] Making LLM request...');
    const response = await callLLM(systemPrompt, userPrompt, {
      fallbackToMock: true
    });
    
    console.log('[TEST] LLM response received:', response);
    
    return res.status(200).json({
      success: true,
      response: response,
      provider: process.env.DEFAULT_LLM_PROVIDER || 'mock',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[TEST] LLM test failed:', error);
    return res.status(500).json({
      error: 'LLM test failed',
      message: error.message,
      provider: process.env.DEFAULT_LLM_PROVIDER || 'mock'
    });
  }
} 