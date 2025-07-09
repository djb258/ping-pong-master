/**
 * Example Templates
 * 
 * Pre-built templates that users can use as starting points
 */

export const EXAMPLE_TEMPLATES = {
  problemSolution: {
    name: "Problem-Solution Template",
    description: "A 4-layer template for defining problems and creating solutions",
    layers: [
      {
        id: "problem",
        name: "Problem Definition",
        description: "Define the core problem or challenge",
        focus: "Identify and articulate the main problem clearly",
        questions: [
          "What is the main problem you're trying to solve?",
          "Who is affected by this problem?",
          "What are the consequences of not solving this problem?",
          "What makes this problem urgent or important?"
        ],
        transition: "Moving from problem definition to solution approach"
      },
      {
        id: "approach",
        name: "Solution Approach",
        description: "Explore different approaches to solve the problem",
        focus: "Identify potential solution methods and strategies",
        questions: [
          "What are the main approaches to solving this problem?",
          "What are the pros and cons of each approach?",
          "Which approach aligns best with your resources and constraints?",
          "What assumptions are you making about the solution?"
        ],
        transition: "Moving from approach selection to technical design"
      },
      {
        id: "design",
        name: "Technical Design",
        description: "Create detailed technical specifications",
        focus: "Define the technical architecture and implementation details",
        questions: [
          "What are the key technical components needed?",
          "What technologies or tools will you use?",
          "How will the components interact with each other?",
          "What are the technical risks and how will you mitigate them?"
        ],
        transition: "Moving from design to implementation plan"
      },
      {
        id: "implementation",
        name: "Implementation Plan",
        description: "Create actionable implementation steps",
        focus: "Define concrete steps to build and deploy the solution",
        questions: [
          "What are the first steps to start implementation?",
          "What resources and timeline do you need?",
          "How will you measure success and track progress?",
          "What are the potential roadblocks and how will you handle them?"
        ],
        transition: "Ready to implement the solution"
      }
    ],
    outputFormat: {
      type: "json",
      structure: {
        problem: { type: "layer_data", layerId: "problem" },
        approach: { type: "layer_data", layerId: "approach" },
        technicalSpecs: { type: "layer_data", layerId: "design" },
        implementationSteps: { type: "layer_data", layerId: "implementation" }
      }
    }
  },

  businessPlan: {
    name: "Business Plan Template",
    description: "A 5-layer template for creating comprehensive business plans",
    layers: [
      {
        id: "vision",
        name: "Vision & Mission",
        description: "Define your business vision and mission",
        focus: "Articulate your long-term vision and core mission",
        questions: [
          "What is your business vision for the next 5-10 years?",
          "What is your core mission and purpose?",
          "What values will guide your business decisions?",
          "What impact do you want to make in the world?"
        ],
        transition: "Moving from vision to market analysis"
      },
      {
        id: "market",
        name: "Market Analysis",
        description: "Analyze your target market and competition",
        focus: "Understand your market opportunity and competitive landscape",
        questions: [
          "Who is your target market and what are their needs?",
          "What is the size and growth potential of your market?",
          "Who are your main competitors and what are their strengths/weaknesses?",
          "What is your unique market position?"
        ],
        transition: "Moving from market analysis to business model"
      },
      {
        id: "model",
        name: "Business Model",
        description: "Define your business model and revenue streams",
        focus: "Design how your business will create and capture value",
        questions: [
          "How will you create value for your customers?",
          "What are your primary revenue streams?",
          "What are your key resources and partnerships?",
          "What are your main costs and cost structure?"
        ],
        transition: "Moving from business model to strategy"
      },
      {
        id: "strategy",
        name: "Strategy & Operations",
        description: "Define your strategy and operational plan",
        focus: "Plan how you will execute your business model",
        questions: [
          "What is your competitive strategy?",
          "How will you acquire and retain customers?",
          "What are your key operational processes?",
          "What team and resources do you need?"
        ],
        transition: "Moving from strategy to financial planning"
      },
      {
        id: "financial",
        name: "Financial Plan",
        description: "Create financial projections and funding plan",
        focus: "Develop realistic financial projections and funding strategy",
        questions: [
          "What are your revenue projections for the next 3 years?",
          "What are your startup costs and ongoing expenses?",
          "How much funding do you need and how will you use it?",
          "What are your key financial milestones and metrics?"
        ],
        transition: "Ready to execute your business plan"
      }
    ],
    outputFormat: {
      type: "markdown",
      structure: {
        vision: { type: "layer_data", layerId: "vision" },
        market: { type: "layer_data", layerId: "market" },
        model: { type: "layer_data", layerId: "model" },
        strategy: { type: "layer_data", layerId: "strategy" },
        financial: { type: "layer_data", layerId: "financial" }
      }
    }
  },

  technicalDesign: {
    name: "Technical Design Template",
    description: "A 4-layer template for designing technical solutions",
    layers: [
      {
        id: "requirements",
        name: "Requirements Analysis",
        description: "Gather and analyze technical requirements",
        focus: "Understand what needs to be built and why",
        questions: [
          "What are the functional requirements?",
          "What are the non-functional requirements (performance, security, etc.)?",
          "Who are the users and what are their use cases?",
          "What are the constraints and limitations?"
        ],
        transition: "Moving from requirements to architecture"
      },
      {
        id: "architecture",
        name: "System Architecture",
        description: "Design the high-level system architecture",
        focus: "Define the overall system structure and components",
        questions: [
          "What are the main system components?",
          "How will the components interact with each other?",
          "What technologies and frameworks will you use?",
          "How will you handle scalability and reliability?"
        ],
        transition: "Moving from architecture to detailed design"
      },
      {
        id: "detailed",
        name: "Detailed Design",
        description: "Create detailed technical specifications",
        focus: "Define the implementation details for each component",
        questions: [
          "What are the APIs and data models?",
          "How will you handle data storage and retrieval?",
          "What are the security and authentication mechanisms?",
          "How will you handle errors and edge cases?"
        ],
        transition: "Moving from detailed design to implementation"
      },
      {
        id: "implementation",
        name: "Implementation Plan",
        description: "Plan the development and deployment",
        focus: "Define how to build and deploy the solution",
        questions: [
          "What is the development timeline and milestones?",
          "What are the testing and quality assurance processes?",
          "How will you deploy and monitor the system?",
          "What are the maintenance and support requirements?"
        ],
        transition: "Ready to start implementation"
      }
    ],
    outputFormat: {
      type: "javascript",
      structure: {
        requirements: { type: "layer_data", layerId: "requirements" },
        architecture: { type: "layer_data", layerId: "architecture" },
        detailedDesign: { type: "layer_data", layerId: "detailed" },
        implementation: { type: "layer_data", layerId: "implementation" }
      }
    }
  }
};

/**
 * Get a template by name
 */
export function getExampleTemplate(templateName) {
  return EXAMPLE_TEMPLATES[templateName] || null;
}

/**
 * List all available example templates
 */
export function listExampleTemplates() {
  return Object.keys(EXAMPLE_TEMPLATES);
} 