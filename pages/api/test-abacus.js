/**
 * Simple test endpoint to call Abacus.AI directly
 * This bypasses all our complex logic to see what the raw response should be
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  const apiKey = process.env.ABACUS_API_KEY || 's2_ad901b7e536d47769353c72f146d994b';

  if (!apiKey) {
    return res.status(500).json({ error: 'No API key configured' });
  }

  const systemPrompt = `You are an Expert Prompt Refiner.

Your task is to help the user improve their prompt for a large language model (LLM). You MUST do one of the following:

1️⃣ If the prompt is vague or could be made more specific, REWRITE it with clearer wording, structure, or context.

2️⃣ If the prompt is already clear but could use enhancement, ADD contextual elements like timeframe, examples, or qualifiers.

3️⃣ If you genuinely need more info, ask the user **exactly 3 specific questions** to clarify their intent.

⛔ NEVER repeat the original prompt as-is.  
⛔ NEVER just say "your input may be clear."  
✅ Always return either:
– A rewritten version  
– OR 3 sharp, useful clarifying questions`;

  try {
    console.log('Testing Abacus API with prompt:', prompt);
    
    // Try the correct Abacus endpoint
    const response = await fetch('https://api.abacus.ai/api/v0/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please refine this prompt: "${prompt}"` }
        ],
        llmName: 'gpt-4o',
        maxTokens: 1000,
        temperature: 0.7,
        stream: false
      }),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      return res.status(response.status).json({ 
        error: `Abacus API error: ${response.status}`, 
        details: errorText 
      });
    }

    const data = await response.json();
    console.log('Raw Abacus response:', JSON.stringify(data, null, 2));

    return res.status(200).json({
      success: true,
      rawResponse: data,
      extractedResponse: data.response || data.choices?.[0]?.message?.content || 'No response found'
    });

  } catch (error) {
    console.error('Test failed:', error);
    return res.status(500).json({ 
      error: 'Test failed', 
      details: error.message 
    });
  }
} 