# Ping-Pong Prompt App

A Next.js + React application for AI-powered prompt refinement with ping-pong interactions and **altitude-based logic**, built following **Barton Doctrine** principles.

## 🎯 Purpose

The Ping-Pong Prompt App allows users to:
- Enter a "ping" (input prompt)
- Send it to a refinement engine using an abstracted `refinePrompt()` function
- Display the returned "pong" (refined output)
- Maintain a complete history of ping-pong exchanges
- Export session data as STAMPED/SPVPET/STACKED compliant JSON
- **NEW**: Use altitude-based refinement (30k→20k→10k→5k) with tree growth
- **NEW**: Track readiness status (red/yellow/green) for prompt quality
- **NEW**: Build idea trees with automatic branch extraction
- **NEW**: Support direction changes with tree pruning

## 🚀 Altitude-Based Refinement

The app now features **altitude-based prompt logic** that guides users through progressive refinement:

### Altitude Levels
- **30k ft (Vision)**: High-level user vision and goals
- **20k ft (Category)**: Broad category or domain  
- **10k ft (Specialization)**: Specific specialization within category
- **5k ft (Execution)**: Specific execution details and implementation

### Key Features
- **Readiness Status**: Real-time assessment of prompt quality
  - 🔴 Red: Too vague, needs more specificity
  - 🟡 Yellow: Improving but could be more specific  
  - 🟢 Green: Specific and actionable
- **Idea Tree Growth**: Automatic extraction of tree branches on each refinement
- **Direction Changes**: Prune branches when user changes direction
- **Structured Output**: Final export includes core idea, branches, and readiness status

### Example Output
```json
{
  "core_idea": "Become a Life & Health advisor",
  "branches": [
    { "label": "Market", "value": "Individual", "altitude": "10k" },
    { "label": "Focus", "value": "Stop-loss", "altitude": "7k" },
    { "label": "Product Type", "value": "Level-funded", "altitude": "5k" }
  ],
  "readiness_status": "green"
}
```

## 🏗️ Architecture (Barton Doctrine)

This application follows Barton Doctrine principles:

### **Separation of Concerns**
- `/components/PingPongForm.jsx` → Original UI and state management
- `/components/AltitudePingPongForm.jsx` → Enhanced altitude-based UI
- `/utils/refinePrompt.js` → Original LLM abstraction
- `/utils/altitudePromptRefiner.js` → Altitude-based refinement logic
- `/pages/api/refine-prompt.js` → Original refinement endpoint
- `/pages/api/refine-prompt-altitude.js` → Altitude-based endpoint
- `/pages/index.js` → Application entry point with tab interface

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
│   ├── PingPongForm.jsx           # Original UI component
│   └── AltitudePingPongForm.jsx   # Enhanced altitude-based UI
├── pages/
│   ├── api/
│   │   ├── abacus.js              # Abacus API endpoint
│   │   ├── refine-prompt.js       # Original refinement endpoint
│   │   └── refine-prompt-altitude.js # Altitude-based endpoint
│   ├── index.js                   # Application entry point
│   └── test-altitude.js           # Test page for altitude functionality
├── styles/
│   ├── PingPongForm.module.css    # Original component styles
│   └── AltitudePingPongForm.module.css # Enhanced component styles
├── utils/
│   ├── refinePrompt.js            # Original LLM provider abstraction
│   └── altitudePromptRefiner.js   # Altitude-based refinement logic
├── promptTemplates/
│   └── pingPongTemplate.json      # Altitude configuration template
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
- ✅ **Altitude-based refinement logic**
- ✅ **Readiness status tracking**
- ✅ **Idea tree growth and visualization**
- ✅ **Direction change support with tree pruning**

### UI/UX Features
- ✅ Modern, responsive design
- ✅ Accessibility support (keyboard navigation, focus indicators)
- ✅ Loading states and error handling
- ✅ Mobile-optimized interface
- ✅ High contrast mode support
- ✅ **Tab interface for switching between modes**
- ✅ **Visual readiness indicators**
- ✅ **Interactive idea tree display**
- ✅ **Altitude level visualization**

### Data Management
- ✅ STAMPED/SPVPET/STACKED schema compliance
- ✅ Session tracking with unique IDs
- ✅ Processing time metrics
- ✅ Word/character count analytics
- ✅ Provider provenance tracking
- ✅ **Altitude progression tracking**
- ✅ **Tree branch extraction and management**
- ✅ **Readiness assessment algorithms**

## 📊 Export Schema

The application exports data in STAMPED/SPVPET/STACKED format with enhanced altitude data:

```json
{
  "core_idea": "Become a Life & Health advisor",
  "branches": [
    { "label": "Market", "value": "Individual", "altitude": "10k" },
    { "label": "Focus", "value": "Stop-loss", "altitude": "7k" },
    { "label": "Product Type", "value": "Level-funded", "altitude": "5k" }
  ],
  "readiness_status": "green",
  "refinement_history": [
    {
      "ping": "I want to start a business",
      "pong": "Refined prompt with specific details...",
      "current_altitude": "30k",
      "new_altitude": "20k", 
      "readiness_status": "yellow",
      "idea_tree": [...],
      "new_branches": [...],
      "source": "Altitude-Based Refiner",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## 🧪 Testing

### Test Altitude Functionality
Visit `/test-altitude` to test the altitude-based refinement system:

```bash
# Start the development server
npm run dev

# Navigate to test page
open http://localhost:3000/test-altitude
```

### Manual Testing
1. Start with a vague idea: "I want to start a business"
2. Watch the altitude progress from 30k → 20k → 10k → 5k
3. Observe readiness status changes from red → yellow → green
4. See the idea tree grow with each refinement
5. Try the "Change Direction" button to test tree pruning

## 🔄 Usage Modes

The app now supports two modes accessible via tabs:

### 🚀 Altitude-Based Refinement (Default)
- Progressive refinement through altitude levels
- Real-time readiness assessment
- Interactive idea tree visualization
- Direction change support
- Enhanced export with structured data

### 🔄 Original Ping-Pong
- Classic ping-pong refinement
- Simple prompt improvement
- Basic export functionality
- Compatible with existing workflows

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 