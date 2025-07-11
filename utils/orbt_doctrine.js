



module.exports = ORBT_DOCTRINE = {
  doctrine_id: "ORBT-0001",
  title: "ORBT System – Operating, Repair, Build, Training",
  summary: "This doctrine defines the required structural layers for any application or system built under our software architecture. All builds must conform to this system with zero exceptions.",
  tiers: {
    30000: {
      label: "Operating System",
      description: "The application shell and behavior. Tracks inputs, outputs, modules, and system flow."
    },
    20000: {
      label: "Repair System",
      description: "Auto-diagnoses via color-coded logic (green/yellow/red). Integrates with Repo Lens and Mantis. Logs all errors, promotes recurring errors to human review, and maps resolution path."
    },
    10000: {
      label: "Build System",
      description: "The blueprint logic that defines app structure. Includes universal numbering, STAMPED/SPVPET/STACKED schema enforcement, and module diagnostics."
    },
    5000: {
      label: "Training System",
      description: "In-app training manual. Contains troubleshooting log, resolution frequency, and corrective steps. Logs all manual interventions."
    }
  },
  universal_rules: [
    "All apps must start with a blueprint ID.",
    "All modules must receive a structured number and color status.",
    "Everything is green unless flagged by the error log.",
    "All errors must be routed to a centralized error_log table.",
    "Any error that appears 2+ times must escalate for deeper review.",
    "Training logs must be appended once app goes live.",
    "All agents (Cursor, Mantis, Mindpal) must conform to this schema."
  ],
  visual_model: "30k/20k/10k/5k altitude map (like an org chart or car schematic)",
  color_model: {
    green: "All systems go",
    yellow: "Warning or partial mismatch",
    red: "Critical error or doctrine violation"
  },
  diagnostic_mode: "Every application must auto-generate a visual map and human-readable wiki, starting at the 30,000-foot view and drilling down into full module maps.",
  version: "1.0.0",
  locked: true
} ; 