#!/usr/bin/env node

/**
 * ORBT Audit - Repository Compliance Check
 * 
 * This script audits the current repository against ORBT doctrine requirements
 * and provides a comprehensive compliance report.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 ORBT Repository Audit');
console.log('========================');

class ORBTAuditor {
  constructor() {
    this.violations = [];
    this.warnings = [];
    this.passes = [];
    this.status = 'red';
    this.compliance = false;
  }

  /**
   * Check Operating System Layer (30k)
   */
  checkOperatingSystem() {
    console.log('\n🏗️  Checking Operating System Layer (30k)...');
    
    // Check for application shell and behavior tracking
    const hasMainEntry = fs.existsSync('pages/index.js') || fs.existsSync('pages/index.tsx');
    if (hasMainEntry) {
      this.passes.push('✅ Main application entry point exists');
    } else {
      this.violations.push('❌ Missing main application entry point');
    }

    // Check for system flow tracking
    const hasApiEndpoints = fs.existsSync('pages/api/');
    if (hasApiEndpoints) {
      this.passes.push('✅ API endpoints for system flow tracking');
    } else {
      this.warnings.push('⚠️  No API endpoints found for system flow');
    }

    // Check for module tracking
    const hasComponents = fs.existsSync('components/');
    if (hasComponents) {
      this.passes.push('✅ Component modules for tracking');
    } else {
      this.warnings.push('⚠️  No component modules found');
    }

    // Check for configuration management
    const hasConfig = fs.existsSync('utils/config.js') || fs.existsSync('next.config.js');
    if (hasConfig) {
      this.passes.push('✅ Configuration management present');
    } else {
      this.warnings.push('⚠️  No configuration management found');
    }
  }

  /**
   * Check Repair System Layer (20k)
   */
  checkRepairSystem() {
    console.log('\n🔧 Checking Repair System Layer (20k)...');
    
    // Check for error handling
    const hasErrorHandler = fs.existsSync('utils/errorHandler.js');
    if (hasErrorHandler) {
      this.passes.push('✅ Centralized error handling system');
    } else {
      this.violations.push('❌ Missing centralized error handling');
    }

    // Check for color-coded logic
    const hasValidation = fs.existsSync('utils/validation.js');
    if (hasValidation) {
      this.passes.push('✅ Input validation system');
    } else {
      this.warnings.push('⚠️  No input validation system found');
    }

    // Check for error logging
    const hasLogging = fs.existsSync('utils/') && 
      fs.readdirSync('utils/').some(file => file.includes('log') || file.includes('error'));
    if (hasLogging) {
      this.passes.push('✅ Error logging infrastructure');
    } else {
      this.warnings.push('⚠️  No error logging infrastructure found');
    }

    // Check for diagnostic tools
    const hasDiagnostics = fs.existsSync('utils/driftDetector.js') || 
                          fs.existsSync('utils/testing.js');
    if (hasDiagnostics) {
      this.passes.push('✅ Diagnostic and testing tools');
    } else {
      this.warnings.push('⚠️  Limited diagnostic tools');
    }
  }

  /**
   * Check Build System Layer (10k)
   */
  checkBuildSystem() {
    console.log('\n⚙️  Checking Build System Layer (10k)...');
    
    // Check for blueprint logic
    const hasTemplates = fs.existsSync('promptTemplates/') || fs.existsSync('utils/altitudeTemplates.js');
    if (hasTemplates) {
      this.passes.push('✅ Blueprint and template system');
    } else {
      this.warnings.push('⚠️  No blueprint/template system found');
    }

    // Check for structured numbering
    const hasStructuredSystem = fs.existsSync('utils/altitudeJourney.js') || 
                               fs.existsSync('checklists/');
    if (hasStructuredSystem) {
      this.passes.push('✅ Structured numbering system (altitude-based)');
    } else {
      this.warnings.push('⚠️  No structured numbering system found');
    }

    // Check for module diagnostics
    const hasModuleDiagnostics = fs.existsSync('utils/dynamicRefinementSystem.js') ||
                                fs.existsSync('utils/dynamicTemplateSystem.js');
    if (hasModuleDiagnostics) {
      this.passes.push('✅ Module diagnostics and refinement');
    } else {
      this.warnings.push('⚠️  Limited module diagnostics');
    }

    // Check for build configuration
    const hasBuildConfig = fs.existsSync('package.json') && fs.existsSync('next.config.js');
    if (hasBuildConfig) {
      this.passes.push('✅ Build configuration present');
    } else {
      this.violations.push('❌ Missing build configuration');
    }
  }

  /**
   * Check Training System Layer (5k)
   */
  checkTrainingSystem() {
    console.log('\n📚 Checking Training System Layer (5k)...');
    
    // Check for documentation
    const hasDocs = fs.existsSync('README.md') || fs.existsSync('docs/');
    if (hasDocs) {
      this.passes.push('✅ Documentation present');
    } else {
      this.violations.push('❌ Missing documentation');
    }

    // Check for troubleshooting guides
    const hasTroubleshooting = fs.existsSync('DEPLOYMENT_GUIDE.md') || 
                              fs.existsSync('TEMPLATE_GUIDE.md');
    if (hasTroubleshooting) {
      this.passes.push('✅ Troubleshooting and deployment guides');
    } else {
      this.warnings.push('⚠️  Limited troubleshooting guides');
    }

    // Check for training logs
    const hasTrainingLogs = fs.existsSync('utils/useChecklistState.js') ||
                           fs.existsSync('checklists/');
    if (hasTrainingLogs) {
      this.passes.push('✅ Training and checklist system');
    } else {
      this.warnings.push('⚠️  No training log system found');
    }

    // Check for manual intervention tracking
    const hasManualTracking = fs.existsSync('utils/altitudePromptRefiner.js');
    if (hasManualTracking) {
      this.passes.push('✅ Manual intervention tracking system');
    } else {
      this.warnings.push('⚠️  No manual intervention tracking');
    }
  }

  /**
   * Check Universal Rules Compliance
   */
  checkUniversalRules() {
    console.log('\n📋 Checking Universal Rules...');
    
    // Rule 1: Blueprint ID
    const hasBlueprintId = fs.existsSync('package.json');
    if (hasBlueprintId) {
      this.passes.push('✅ Blueprint ID (package.json) present');
    } else {
      this.violations.push('❌ Missing blueprint ID');
    }

    // Rule 2: Structured numbering and color status
    const hasStructuredNumbering = fs.existsSync('utils/altitudeJourney.js');
    if (hasStructuredNumbering) {
      this.passes.push('✅ Structured numbering system implemented');
    } else {
      this.warnings.push('⚠️  No structured numbering system');
    }

    // Rule 3: Error routing
    const hasErrorRouting = fs.existsSync('utils/errorHandler.js');
    if (hasErrorRouting) {
      this.passes.push('✅ Centralized error routing system');
    } else {
      this.violations.push('❌ Missing centralized error routing');
    }

    // Rule 4: Training logs
    const hasTrainingLogs = fs.existsSync('checklists/') || fs.existsSync('utils/useChecklistState.js');
    if (hasTrainingLogs) {
      this.passes.push('✅ Training log system present');
    } else {
      this.warnings.push('⚠️  No training log system');
    }
  }

  /**
   * Check ORBT Integration
   */
  checkORBTIntegration() {
    console.log('\n🔗 Checking ORBT Integration...');
    
    // Check if ORBT doctrine is loaded
    const hasOrbtDoctrine = fs.existsSync('utils/orbt_doctrine.js');
    if (hasOrbtDoctrine) {
      this.passes.push('✅ ORBT doctrine integrated');
    } else {
      this.violations.push('❌ ORBT doctrine not integrated');
    }

    // Check if auto-start script exists
    const hasAutoStart = fs.existsSync('auto-start-orbt.js');
    if (hasAutoStart) {
      this.passes.push('✅ ORBT auto-start script present');
    } else {
      this.violations.push('❌ Missing ORBT auto-start script');
    }

    // Check if weewee-def-update is available
    const hasWeeweeDef = fs.existsSync('weewee-def-update/');
    if (hasWeeweeDef) {
      this.passes.push('✅ weewee-def-update repository available');
    } else {
      this.warnings.push('⚠️  weewee-def-update repository not found');
    }

    // Check if startup hook exists
    const hasStartupHook = fs.existsSync('startup-hook.js');
    if (hasStartupHook) {
      this.passes.push('✅ ORBT startup hook present');
    } else {
      this.warnings.push('⚠️  No ORBT startup hook found');
    }
  }

  /**
   * Determine overall compliance
   */
  determineCompliance() {
    if (this.violations.length === 0) {
      this.status = 'green';
      this.compliance = true;
    } else if (this.violations.length <= 2) {
      this.status = 'yellow';
      this.compliance = false;
    } else {
      this.status = 'red';
      this.compliance = false;
    }
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 ORBT REPOSITORY AUDIT REPORT');
    console.log('='.repeat(80));
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Status: ${this.status.toUpperCase()}`);
    console.log(`Compliance: ${this.compliance ? '✅ PASSED' : '❌ NEEDS IMPROVEMENT'}`);
    console.log('='.repeat(80));

    // Summary
    console.log('\n📈 SUMMARY:');
    console.log(`   ✅ Passes: ${this.passes.length}`);
    console.log(`   ⚠️  Warnings: ${this.warnings.length}`);
    console.log(`   ❌ Violations: ${this.violations.length}`);

    // Passes
    if (this.passes.length > 0) {
      console.log('\n✅ COMPLIANCE ACHIEVEMENTS:');
      console.log('-'.repeat(60));
      this.passes.forEach(pass => console.log(pass));
    }

    // Warnings
    if (this.warnings.length > 0) {
      console.log('\n⚠️  RECOMMENDATIONS:');
      console.log('-'.repeat(60));
      this.warnings.forEach(warning => console.log(warning));
    }

    // Violations
    if (this.violations.length > 0) {
      console.log('\n🔴 CRITICAL ISSUES:');
      console.log('-'.repeat(60));
      this.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation}`);
      });
    }

    // Recommendations
    console.log('\n💡 ORBT COMPLIANCE RECOMMENDATIONS:');
    console.log('-'.repeat(60));
    
    if (this.status === 'green') {
      console.log('🎉 EXCELLENT! Your repository is ORBT compliant.');
      console.log('   - Continue maintaining current standards');
      console.log('   - Consider adding more diagnostic tools');
      console.log('   - Enhance training documentation');
    } else if (this.status === 'yellow') {
      console.log('🟡 GOOD PROGRESS! Minor improvements needed.');
      console.log('   - Address the critical violations above');
      console.log('   - Implement missing error handling');
      console.log('   - Add comprehensive documentation');
    } else {
      console.log('🔴 NEEDS WORK! Significant improvements required.');
      console.log('   - Fix all critical violations');
      console.log('   - Implement ORBT doctrine integration');
      console.log('   - Add missing system layers');
      console.log('   - Create comprehensive documentation');
    }

    console.log('\n' + '='.repeat(80));
  }

  /**
   * Run complete audit
   */
  run() {
    this.checkOperatingSystem();
    this.checkRepairSystem();
    this.checkBuildSystem();
    this.checkTrainingSystem();
    this.checkUniversalRules();
    this.checkORBTIntegration();
    this.determineCompliance();
    this.generateReport();
  }
}

// Run the audit
const auditor = new ORBTAuditor();
auditor.run(); 