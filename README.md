# 🚀 APPROACH App - Altitude-Based Ping-Pong Prompt Refinement

A Next.js + React application implementing **altitude-based thinking** with **guardrail-driven checklists**, **mode profiles**, and **drift detection**. Built following **Barton Doctrine** principles for structured AI interactions.

## 🎯 Purpose

The APPROACH App guides users through progressive idea refinement using altitude-based logic:

- **30k ft (Vision)**: High-level goals and aspirations
- **20k ft (Category)**: Industry and domain identification  
- **10k ft (Specialization)**: Specific niche and approach
- **5k ft (Execution)**: Concrete actions and implementation

## 🏗️ Core Architecture

```
User Input → Altitude Loop → Checklist Gating → Promotion → LLM Refinement
     ↓              ↓              ↓              ↓              ↓
  Initial      Mode-Aware      Guardrail      Drift Check    Enhanced
  Prompt       Processing      Validation     & Summary      Output
```

### 🔄 Altitude-Based Ping-Pong Flow

1. **Input**: User enters initial idea/prompt
2. **Altitude Assessment**: System determines current altitude level
3. **Guardrail Loading**: Mode-specific checklists are loaded
4. **LLM Evaluation**: AI pre-checks checklist items with reasoning
5. **User Validation**: User manually overrides LLM suggestions
6. **Promotion Gate**: "Next Level" button only enabled when all items checked
7. **Drift Detection**: System compares summaries across altitude transitions
8. **Dependency Validation**: Content validated against altitude-specific rules
9. **Refinement**: LLM generates altitude-appropriate refinements
10. **Summary Generation**: AI creates altitude-specific summaries

## 🎛️ Mode Profile System

The app supports multiple **mode profiles** that change the entire checklist logic:

### Available Modes
- **🏗️ Blueprint Logic**: Business planning and strategy development
- **🔍 Search Preparation**: Job search and career transition
- **🚀 Startup Foundation**: Entrepreneurial venture building
- **📋 Project Management**: Structured project planning
- **📚 Learning Path**: Educational journey planning

### Mode Switching
- **Dynamic Checklist Loading**: Each mode has unique checklists per altitude
- **Real-time Updates**: Changing modes immediately reloads all active guardrails
- **Context Preservation**: User progress maintained across mode switches

## 🛡️ Guardrail System

### Checklist Structure
Each altitude level has mode-specific checklists with:

```json
{
  "altitude": "30k",
  "name": "Vision",
  "checklist_items": [
    {
      "id": "vision_clarity",
      "label": "Clear Vision Statement",
      "description": "User has articulated a clear, specific vision",
      "llm_checked": false,
      "llm_reason": "",
      "user_checked": false,
      "category": "clarity"
    }
  ],
  "promotion_criteria": {
    "required_checks": 5,
    "minimum_llm_confidence": 0.7,
    "user_override_allowed": true
  }
}
```

### LLM Integration
- **Pre-evaluation**: AI analyzes user content against checklist criteria
- **Reasoning Display**: Shows why AI checked/unchecked each item
- **User Override**: Users can disagree with AI recommendations
- **Accept All**: One-click to accept all AI suggestions

### Promotion Gating
- **Progress Tracking**: Visual progress bar showing completion percentage
- **Button States**: "Next Level" disabled until all required items checked
- **Status Display**: Clear indication of what's needed to proceed

## 🧠 Drift Detection & Validation

### Drift Detection System
Monitors user direction changes across altitude levels:

- **Topic Shift Detection**: Identifies major topic area changes
- **Scope Change Detection**: Monitors for significant scope expansions/contractions  
- **Goal Misalignment**: Detects when current content doesn't align with previous goals
- **Semantic Similarity**: Calculates text similarity between altitude summaries

### Altitude Dependency Validation
Enforces altitude-appropriate content:

```json
{
  "30k": {
    "must_not_include": ["tools", "tech", "implementation", "timeline"],
    "must_include": ["vision", "goal", "dream", "aspire"]
  },
  "5k": {
    "must_not_include": ["vision", "dream", "high-level", "broad"],
    "must_include": ["plan", "timeline", "action", "implementation"]
  }
}
```

### Visual Feedback
- **🚨 Drift Warnings**: Red alerts for detected direction changes
- **⚠️ Dependency Violations**: Orange warnings for rule violations
- **📝 Altitude Summaries**: Blue summaries showing progression

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/your-repo/ping-pong-prompt.git
cd ping-pong-prompt

# Install dependencies
npm install

# Copy environment template
cp env.template .env.local

# Edit .env.local with your API keys
# See Configuration section below

# Start development server
npm run dev
```

### Environment Configuration

```env
# Required for LLM integration
ABACUS_API_KEY=your_abacus_api_key_here
ABACUS_API_URL=https://api.abacus.ai/v1/refine
ABACUS_ORG_ID=your_abacus_org_id_here

# Optional: Other LLM providers
GPT4_API_KEY=your_openai_api_key_here
CLAUDE_API_KEY=your_anthropic_api_key_here
```

## 📁 Project Structure

```
ping-pong-prompt/
├── components/
│   ├── AltitudePingPongForm.jsx    # Main altitude-based UI
│   ├── ChecklistGuardrail.jsx      # Guardrail checklist component
│   ├── ModeSelector.jsx            # Mode profile selector
│   └── PingPongForm.jsx            # Original ping-pong UI
├── pages/
│   ├── api/
│   │   ├── evaluate-checklist.js   # LLM checklist evaluation
│   │   ├── generate-summary.js     # Altitude summary generation
│   │   ├── refine-prompt-altitude.js # Altitude-based refinement
│   │   └── refine-prompt.js        # Original refinement
│   └── index.js                    # Application entry point
├── checklists/
│   ├── mode_profiles.json          # Mode profile definitions
│   ├── altitudeDependencies.json   # Altitude validation rules
│   ├── altitude_30k_blueprint.json # Blueprint mode checklists
│   ├── altitude_20k_blueprint.json
│   ├── altitude_10k_blueprint.json
│   ├── altitude_5k_blueprint.json
│   ├── altitude_30k_search.json    # Search mode checklists
│   └── ...                         # Other mode checklists
├── utils/
│   ├── driftDetector.js            # Drift detection & validation
│   ├── useChecklistState.js        # Checklist state management
│   ├── altitudePromptRefiner.js    # Altitude-based refinement
│   └── llmProviders.js             # LLM provider abstraction
├── styles/
│   ├── AltitudePingPongForm.module.css
│   ├── ChecklistGuardrail.module.css
│   ├── ModeSelector.module.css
│   └── PingPongForm.module.css
└── README.md
```

## 🎨 Key Features

### ✅ Core Functionality
- **Altitude-Based Refinement**: Progressive 30k→20k→10k→5k thinking
- **Mode Profile System**: Dynamic checklist loading per mode
- **Guardrail Validation**: LLM + user checklist validation
- **Drift Detection**: Automatic direction change detection
- **Dependency Validation**: Altitude-appropriate content enforcement
- **LLM Integration**: Multi-provider AI support
- **Real-time Feedback**: Live progress tracking and validation

### ✅ UI/UX Features
- **Mode Selector**: Visual mode profile selection
- **Checklist Interface**: Interactive guardrail management
- **Progress Visualization**: Altitude journey tracking
- **Drift Alerts**: Visual warnings for direction changes
- **Responsive Design**: Mobile-optimized interface
- **Accessibility**: Keyboard navigation and screen reader support

### ✅ Data Management
- **Altitude Summaries**: LLM-generated progression summaries
- **Drift Analysis**: Detailed drift detection results
- **Dependency Tracking**: Rule violation monitoring
- **Export Functionality**: Structured data export
- **Session Persistence**: Progress maintenance across sessions

## 🔧 Configuration

### Adding New Mode Profiles

1. **Create Mode Definition** in `checklists/mode_profiles.json`:
```json
{
  "mode_profiles": {
    "your_mode": {
      "name": "Your Mode Name",
      "description": "Mode description",
      "altitudes": {
        "30k": "altitude_30k_your_mode.json",
        "20k": "altitude_20k_your_mode.json",
        "10k": "altitude_10k_your_mode.json",
        "5k": "altitude_5k_your_mode.json"
      }
    }
  }
}
```

2. **Create Checklist Files** for each altitude level
3. **Add Mode Metadata** with icon, color, and tags

### Customizing Altitude Dependencies

Edit `checklists/altitudeDependencies.json` to modify validation rules:

```json
{
  "30k": {
    "must_not_include": ["your_forbidden_terms"],
    "must_include": ["your_required_terms"]
  }
}
```

## 📊 Data Export Schema

The app exports comprehensive session data:

```json
{
  "session_id": "unique_session_id",
  "mode_profile": "blueprint_logic",
  "altitude_progression": [
    {
      "altitude": "30k",
      "prompt": "User's original prompt",
      "refined_prompt": "LLM refined output",
      "summary": "AI-generated summary",
      "checklist_completion": {
        "checked": 5,
        "required": 5,
        "percentage": 100
      },
      "drift_analysis": {
        "has_drift": false,
        "drift_type": null,
        "confidence": 0
      },
      "dependency_validation": {
        "is_valid": true,
        "violations": []
      },
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "final_output": {
    "execution_plan": {...},
    "is_execution_ready": true,
    "next_steps": [...],
    "success_criteria": [...]
  }
}
```

## 🧪 Testing

### Manual Testing Workflow

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Test Mode Switching**:
   - Select different mode profiles
   - Verify checklist changes
   - Check LLM evaluation updates

3. **Test Altitude Progression**:
   - Enter initial idea
   - Complete checklists at each level
   - Observe drift detection
   - Verify dependency validation

4. **Test Drift Detection**:
   - Change direction mid-progression
   - Check drift warnings appear
   - Verify summary comparisons

### Automated Testing

```bash
# Run tests (when implemented)
npm test

# Run specific test suites
npm run test:altitude
npm run test:drift
npm run test:checklists
```

## 🔄 Usage Examples

### Example 1: Business Planning (Blueprint Logic Mode)

1. **30k Vision**: "I want to build a successful business"
2. **Checklist**: Complete vision clarity, problem identification, success definition
3. **20k Category**: "Insurance business for families and small businesses"
4. **Checklist**: Industry identification, business type, market understanding
5. **10k Specialization**: "Life insurance agent specializing in term policies"
6. **Checklist**: Niche definition, target segment, value proposition
7. **5k Execution**: "Get licensed, join agency, build client base"
8. **Checklist**: Action plan, timeline, resource allocation

### Example 2: Career Transition (Search Preparation Mode)

1. **30k Vision**: "I want to transition to a new career"
2. **20k Category**: "Technology industry, software development role"
3. **10k Specialization**: "Frontend React developer for SaaS companies"
4. **5k Execution**: "Update portfolio, apply to positions, practice coding"

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code structure and patterns
- Add tests for new functionality
- Update documentation for new features
- Ensure accessibility compliance
- Test across different mode profiles

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Barton Doctrine** for architectural principles
- **Altitude-based thinking** methodology
- **Next.js** and **React** communities
- **LLM providers** for AI integration capabilities

---

**Built with ❤️ for structured AI interactions and progressive idea refinement.** 