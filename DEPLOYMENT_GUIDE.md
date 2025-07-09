# Deployment Guide - LLM Provider Configuration

## Overview

This altitude-based prompt refinement system supports multiple LLM providers that can be configured at deployment time. You choose your preferred AI provider once during setup, and the system uses it for all refinement operations.

## Quick Setup

### 1. Choose Your LLM Provider & Template

Edit your `.env.local` file and set both `DEFAULT_LLM_PROVIDER` and `DEFAULT_TEMPLATE`:

```bash
# LLM Provider (choose one)
DEFAULT_LLM_PROVIDER=openai

# Focus Area Template (choose one)
DEFAULT_TEMPLATE=career
NEXT_PUBLIC_DEFAULT_TEMPLATE=career
```

### 2. Choose Your Focus Area Template

Set `DEFAULT_TEMPLATE` and `NEXT_PUBLIC_DEFAULT_TEMPLATE` to one of:

```bash
# Career Development (job changes, skill building, professional growth)
DEFAULT_TEMPLATE=career

# Business Development (startups, entrepreneurship, business strategy)
DEFAULT_TEMPLATE=business

# Technology Development (software, hardware, technical skills)
DEFAULT_TEMPLATE=tech

# Creative Development (art, writing, design, creative projects)
DEFAULT_TEMPLATE=creative

# Learning Development (education, courses, knowledge acquisition)
DEFAULT_TEMPLATE=learning

# Personal Development (goals, habits, life improvement)
DEFAULT_TEMPLATE=personal
```

### 3. Configure Your Chosen Provider

Follow the setup instructions in `env.template` for your selected provider to get the necessary API keys.

### 4. Deploy

The system will automatically use your configured provider and template for all altitude-based refinements.

## Provider Comparison

| Provider | Best For | Cost | Features |
|----------|----------|------|----------|
| **OpenAI/ChatGPT** | General use, most reliable | Medium | GPT-4, wide model selection |
| **Perplexity** | Real-time information | Low | Web search integration |
| **Anthropic/Claude** | Detailed analysis | Medium | Long context, safety-focused |
| **Google Gemini** | Google ecosystem | Low | Fast, good reasoning |
| **Abacus.AI** | Enterprise use | High | Custom models, enterprise features |
| **Mock** | Testing/Development | Free | No API calls, instant responses |

## Provider-Specific Configuration

### OpenAI/ChatGPT
```bash
DEFAULT_LLM_PROVIDER=openai
GPT4_API_KEY=your_openai_api_key_here
GPT4_MODEL=gpt-4
GPT4_MAX_TOKENS=1000
GPT4_TEMPERATURE=0.7
```

### Perplexity
```bash
DEFAULT_LLM_PROVIDER=perplexity
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

### Anthropic/Claude
```bash
DEFAULT_LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Google Gemini
```bash
DEFAULT_LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
```

### Abacus.AI
```bash
DEFAULT_LLM_PROVIDER=abacus
ABACUS_API_KEY=your_abacus_api_key_here
ABACUS_ORG_ID=your_organization_id_here
```

### Mock (Testing)
```bash
DEFAULT_LLM_PROVIDER=mock
# No API key needed
```

## Switching Providers

To switch providers after deployment:

1. Update `DEFAULT_LLM_PROVIDER` in your environment variables
2. Add the new provider's API key
3. Restart your application

The system will automatically use the new provider for all future refinements.

## Testing Your Configuration

1. Start the development server: `npm run dev`
2. Open the application in your browser
3. Try a refinement with a simple prompt like "I want to start a business"
4. Check the console logs to confirm the correct provider is being used

## Troubleshooting

### Provider Not Working
- Verify your API key is correct
- Check that `DEFAULT_LLM_PROVIDER` is set correctly
- Ensure you have sufficient API credits
- Check the console for error messages

### Fallback to Mock Provider
If your configured provider fails, the system will automatically fall back to the mock provider for testing. This ensures the application continues to work even if there are API issues.

### Environment Variables Not Loading
- Make sure your `.env.local` file is in the project root
- Restart the development server after changing environment variables
- Check that variable names match exactly (case-sensitive)

## Production Deployment

For production deployment:

1. Set `DEFAULT_LLM_PROVIDER` in your production environment variables
2. Configure the appropriate API key for your chosen provider
3. Consider using environment-specific configuration files
4. Monitor API usage and costs

## Cost Optimization

- **Mock Provider**: Use for development/testing (free)
- **Perplexity/Gemini**: Lower cost options for production
- **OpenAI/Anthropic**: Higher quality but more expensive
- **Abacus.AI**: Enterprise pricing, best for large-scale use

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive configuration
- Consider using a secrets management service for production
- Rotate API keys regularly

## Support

If you encounter issues with a specific provider:

1. Check the provider's official documentation
2. Verify your API key and account status
3. Test with the mock provider to isolate the issue
4. Check the application logs for detailed error messages

The modular LLM provider system makes it easy to switch between different AI services based on your needs, budget, and use case requirements. 