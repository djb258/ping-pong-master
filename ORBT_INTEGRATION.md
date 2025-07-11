# ORBT Integration - Auto-Start System

## Overview

This project now includes automatic ORBT (Operation, Repair, Part, Training) doctrine loading. The ORBT system provides a structured framework for software development with four key layers:

- **🏗️ Operating System (30k)**: Application shell and behavior
- **🔧 Repair System (20k)**: Auto-diagnosis with color-coded logic
- **⚙️ Build System (10k)**: Blueprint logic and structure
- **📚 Training System (5k)**: In-app training and troubleshooting

## Auto-Start Features

### What Happens When You Start the Project

1. **Automatic Detection**: The system checks if ORBT doctrine is loaded
2. **Repository Cloning**: If needed, automatically clones the weewee-def-update repository
3. **Doctrine Loading**: Loads ORBT doctrine into your project
4. **Neon Database Sync**: If configured, syncs doctrine to Neon database
5. **Status Display**: Shows current ORBT system status

### Commands

```bash
# Start development (includes ORBT auto-load)
npm run dev

# Manually load ORBT doctrine
npm run orbt:load

# Check ORBT status
npm run orbt:status
```

## ORBT System Layers

### 🏗️ Operating System (30,000ft)
- **Purpose**: Application shell and behavior
- **Function**: Tracks inputs, outputs, modules, and system flow
- **Integration**: Works with your existing altitude-based ping-pong system

### 🔧 Repair System (20,000ft)
- **Purpose**: Auto-diagnosis and error handling
- **Features**: 
  - Color-coded logic (🟢 Green, 🟡 Yellow, 🔴 Red)
  - Integrates with Repo Lens and Mantis
  - Logs all errors and promotes recurring errors to human review
- **Integration**: Enhanced error handling in your API endpoints

### ⚙️ Build System (10,000ft)
- **Purpose**: Blueprint logic and app structure
- **Features**:
  - Universal numbering system
  - STAMPED/SPVPET/STACKED schema enforcement
  - Module diagnostics
- **Integration**: Structured validation and configuration management

### 📚 Training System (5,000ft)
- **Purpose**: In-app training and troubleshooting
- **Features**:
  - Troubleshooting logs
  - Resolution frequency tracking
  - Corrective steps documentation
  - Manual intervention logging
- **Integration**: Enhanced documentation and user guidance

## Color Status System

- **🟢 Green**: All systems go - everything working correctly
- **🟡 Yellow**: Warning or partial mismatch - needs attention
- **🔴 Red**: Critical error or doctrine violation - immediate action required

## Universal Rules

1. All apps must start with a blueprint ID
2. All modules must receive a structured number and color status
3. Everything is green unless flagged by the error log
4. All errors must be routed to a centralized error_log table
5. Any error that appears 2+ times must escalate for deeper review
6. Training logs must be appended once app goes live
7. All agents (Cursor, Mantis, Mindpal) must conform to this schema

## Neon Database Integration

### Setup

1. **Set Environment Variable**:
   ```bash
   export NEON_DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@YOUR_NEON_HOST/neondb?sslmode=require&channel_binding=require"
   ```

2. **Windows PowerShell**:
   ```powershell
   $env:NEON_DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@YOUR_NEON_HOST/neondb?sslmode=require&channel_binding=require"
   ```

### What Gets Synced

- ORBT doctrine tiers (30k, 20k, 10k, 5k)
- Universal rules
- Color coding system
- Diagnostic mode
- All doctrine entries go to `dpr_doctrine` table

## Integration with Existing System

### Barton Doctrine Compliance

The ORBT system enhances your existing Barton Doctrine compliance:

- **Separation of Concerns**: ORBT layers provide clear separation
- **Error Handling**: Enhanced with color-coded repair system
- **Validation**: Structured validation through build system
- **Documentation**: Comprehensive training system

### Altitude-Based Ping-Pong

ORBT integrates seamlessly with your altitude-based system:

- **30k Vision** ↔ **Operating System**: High-level application behavior
- **20k Category** ↔ **Repair System**: Error handling and diagnostics
- **10k Specialization** ↔ **Build System**: Blueprint and structure
- **5k Execution** ↔ **Training System**: Implementation and training

## Files Added

- `auto-start-orbt.js`: Main auto-start script
- `startup-hook.js`: Startup hook for automatic loading
- `utils/orbt_doctrine.js`: ORBT doctrine for the project
- `weewee-def-update/`: Cloned repository with full ORBT system

## Troubleshooting

### ORBT Not Loading

1. Check if weewee-def-update repository exists
2. Verify network connection for cloning
3. Check Neon database configuration
4. Review error logs in console

### Neon Database Issues

1. Verify NEON_DATABASE_URL is set correctly
2. Check database connectivity
3. Ensure database schema exists
4. Review database permissions

### Integration Issues

1. Check if utils/orbt_doctrine.js exists
2. Verify file permissions
3. Review console for error messages
4. Run `npm run orbt:load` manually

## Next Steps

1. **Configure Neon Database**: Set up your Neon database URL
2. **Test Auto-Start**: Run `npm run dev` to test automatic loading
3. **Review Integration**: Check how ORBT enhances your existing system
4. **Customize**: Adapt ORBT layers to your specific needs

## Support

For issues with ORBT integration:

1. Check the console output for error messages
2. Verify all required files are present
3. Test manual loading with `npm run orbt:load`
4. Review the weewee-def-update repository documentation

---

**Your project is now ORBT-compliant and will automatically load the foundational doctrine whenever you start development!** 