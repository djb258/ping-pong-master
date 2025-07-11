#!/usr/bin/env node

/**
 * Startup Hook - ORBT Auto-Loader
 * 
 * This script automatically runs when the project starts to ensure
 * ORBT doctrine is loaded and the project is compliant.
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 ORBT Startup Hook - Initializing...');

// Check if ORBT doctrine is already loaded
const orbtPath = path.join(__dirname, 'utils', 'orbt_doctrine.js');

if (!fs.existsSync(orbtPath)) {
  console.log('🔧 ORBT doctrine not found. Running auto-start...');
  
  // Run the auto-start script
  try {
    require('./auto-start-orbt.js');
  } catch (error) {
    console.error('❌ Failed to run auto-start:', error.message);
  }
} else {
  console.log('✅ ORBT doctrine already loaded');
  
  // Display quick status
  try {
    const orbt = require('./utils/orbt_doctrine.js');
    console.log('📊 ORBT Status:');
    console.log(`   🏗️  ${orbt.tiers[30000].label} (30k)`);
    console.log(`   🔧 ${orbt.tiers[20000].label} (20k)`);
    console.log(`   ⚙️  ${orbt.tiers[10000].label} (10k)`);
    console.log(`   📚 ${orbt.tiers[5000].label} (5k)`);
  } catch (error) {
    console.error('❌ Failed to load ORBT status:', error.message);
  }
}

console.log('🚀 ORBT Startup Hook Complete'); 