# Ping-Pong Prompt App

A Next.js + React application for AI-powered prompt refinement with ping-pong interactions, built following **Barton Doctrine** principles.

## 🎯 Purpose

The Ping-Pong Prompt App allows users to:
- Enter a "ping" (input prompt)
- Send it to a refinement engine using an abstracted `refinePrompt()` function
- Display the returned "pong" (refined output)
- Maintain a complete history of ping-pong exchanges
- Export session data as STAMPED/SPVPET/STACKED compliant JSON

## 🏗️ Architecture (Barton Doctrine)

This application follows Barton Doctrine principles:

### **Separation of Concerns**
- `/components/PingPongForm.jsx` → UI and state management
- `/utils/refinePrompt.js` → LLM abstraction and provider management
- `/pages/api/abacus.js` → API endpoint for Abacus integration
- `/pages/index.js` → Application entry point

### **Provider Abstraction**
The LLM integration is fully abstracted, allowing easy swapping between providers:
- **Abacus** (current implementation)
- **GPT-4** (ready for implementation)
- **Claude** (ready for implementation)

### **Schema Compliance**
All exports follow **STAMPED/SPVPET/STACKED** schema discipline:
- **STAMPED**: Structured, Timestamped, Actionable, Measurable, Paired, Exportable, Documented
- **SPVPET**: Structured, Paired, Validated, Provenance, Exportable, Traceable
- **STACKED**: Structured, Timestamped, Actionable, Contextual, Keyed, Exportable, Documented

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Development Server
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
ping-pong-prompt-app/
├── components/
│   └── PingPongForm.jsx      # Main UI component
├── pages/
│   ├── api/
│   │   └── abacus.js         # Abacus API endpoint
│   └── index.js              # Application entry point
├── styles/
│   └── PingPongForm.module.css # Component styles
├── utils/
│   └── refinePrompt.js       # LLM provider abstraction
├── package.json
├── next.config.js
└── README.md
```

## 🔧 Configuration

### Environment Variables Setup

**Step 1**: Copy the environment template:
```bash
# Windows (PowerShell)
Copy-Item env.template .env.local

# Linux/Mac
cp env.template .env.local
```

**Step 2**: Edit `.env.local` with your actual API keys:
```env
# Required for Abacus API
ABACUS_API_KEY=your_actual_abacus_api_key_here
ABACUS_API_URL=https://api.abacus.ai/v1/refine
ABACUS_ORG_ID=your_abacus_org_id_here

# Optional: Configure other providers for future use
GPT4_API_KEY=your_openai_api_key_here
CLAUDE_API_KEY=your_anthropic_api_key_here
```

**Step 3**: Get your Abacus API credentials:
1. Visit [https://abacus.ai/](https://abacus.ai/)
2. Create account or log in
3. Navigate to API settings/developers section
4. Generate a new API key
5. Get your organization ID from the dashboard

### Switching LLM Providers

To add a new LLM provider:

1. **Update `utils/refinePrompt.js`**:
```javascript
const LLMProviders = {
  ABACUS: 'abacus',
  GPT4: 'gpt4',
  CLAUDE: 'claude',
  YOUR_PROVIDER: 'your_provider', // Add here
};

const providerImplementations = {
  // ... existing providers
  [LLMProviders.YOUR_PROVIDER]: async (input) => {
    // Your implementation here
    return refinedPrompt;
  },
};
```

2. **Create API endpoint** (if needed):
```javascript
// pages/api/your_provider.js
export default async function handler(req, res) {
  // Your API implementation
}
```

## 🎨 Features

### Core Functionality
- ✅ Prompt input with character counting
- ✅ Real-time refinement processing
- ✅ Ping-pong history display
- ✅ Provider selection (Abacus/GPT-4/Claude)
- ✅ Session statistics tracking
- ✅ JSON export functionality

### UI/UX Features
- ✅ Modern, responsive design
- ✅ Accessibility support (keyboard navigation, focus indicators)
- ✅ Loading states and error handling
- ✅ Mobile-optimized interface
- ✅ High contrast mode support

### Data Management
- ✅ STAMPED/SPVPET/STACKED schema compliance
- ✅ Session tracking with unique IDs
- ✅ Processing time metrics
- ✅ Word/character count analytics
- ✅ Provider provenance tracking

## 📊 Export Schema

The application exports data in STAMPED/SPVPET/STACKED format:

```json
{
  "meta": {
    "exportTimestamp": "2024-01-01T00:00:00.000Z",
    "exportVersion": "1.0.0",
    "schema": "STAMPED/SPVPET/STACKED",
    "sessionId": "session-1234567890-abc123",
    "totalExchanges": 5
  },
  "exchanges": [
    {
      "id": "ping-pong-1234567890-abc123",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "type": "ping-pong-exchange",
      "structured": {
        "ping": {
          "content": "Original prompt",
          "timestamp": "2024-01-01T00:00:00.000Z",
          "characterCount": 100,
          "wordCount": 20
        },
        "pong": {
          "content": "Refined prompt",
          "timestamp": "2024-01-01T00:00:01.000Z",
          "characterCount": 250,
          "wordCount": 50,
          "provider": "abacus",
          "processingTimeMs": 1500
        }
      },
      "provenance": {
        "source": "ping-pong-prompt-app",
        "version": "1.0.0",
        "refinementEngine": "abacus",
        "processingMetadata": { /* ... */ }
      },
      "actionable": {
        "canRefine": true,
        "canExport": true,
        "canShare": true
      },
      "contextual": {
        "sessionId": "session-1234567890-abc123",
        "exchangeIndex": 0
      }
    }
  ],
  "summary": {
    "totalCharactersProcessed": 1750,
    "averageProcessingTime": 1250,
    "providersUsed": ["abacus"]
  }
}
```

## 🧪 Development

### Code Style
The application follows Barton Doctrine principles:
- **Single Responsibility**: Each component has one clear purpose
- **Separation of Concerns**: UI, logic, and data are properly separated
- **Provider Abstraction**: Easy to swap LLM providers
- **Schema Compliance**: All data follows established standards

### Error Handling
- Input validation on all user inputs
- Graceful fallbacks for API failures
- User-friendly error messages
- Proper HTTP status codes

### Performance
- Memoized components and calculations
- Efficient state management
- Optimized bundle size
- Responsive design patterns

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Follow Barton Doctrine principles
2. Maintain STAMPED/SPVPET/STACKED compliance
3. Add tests for new providers
4. Update documentation

## 📞 Support

For questions or issues, please create a GitHub issue with:
- Environment details
- Steps to reproduce
- Expected vs actual behavior
- Console logs (if applicable) 