#!/usr/bin/env node

/**
 * Auto-Start ORBT Doctrine Loader
 * 
 * This script automatically loads the ORBT (Operation, Repair, Part, Training) doctrine
 * and foundational knowledge whenever you start working on a project.
 * 
 * Usage: node auto-start-orbt.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Auto-Start ORBT Doctrine Loader');
console.log('=====================================');

// Check if weewee-def-update is available
const weeweePath = path.join(__dirname, 'weewee-def-update');
const orbtScriptPath = path.join(weeweePath, 'scripts', 'simple_orbt_insert.ts');

function checkWeeweeDefUpdate() {
  console.log('🔍 Checking for weewee-def-update repository...');
  
  if (!fs.existsSync(weeweePath)) {
    console.log('❌ weewee-def-update not found. Cloning...');
    try {
      execSync('git clone https://github.com/djb258/weewee-def-update.git', { 
        stdio: 'inherit',
        cwd: __dirname 
      });
      console.log('✅ weewee-def-update cloned successfully');
    } catch (error) {
      console.error('❌ Failed to clone weewee-def-update:', error.message);
      return false;
    }
  } else {
    console.log('✅ weewee-def-update found');
  }
  
  if (!fs.existsSync(orbtScriptPath)) {
    console.error('❌ ORBT script not found in weewee-def-update');
    return false;
  }
  
  return true;
}

function checkNeonDatabase() {
  console.log('🔍 Checking Neon database configuration...');
  
  const neonUrl = process.env.NEON_DATABASE_URL;
  if (!neonUrl) {
    console.log('⚠️  NEON_DATABASE_URL not set');
    console.log('📝 To set up Neon database:');
    console.log('   export NEON_DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@YOUR_NEON_HOST/neondb?sslmode=require&channel_binding=require"');
    console.log('   (On Windows PowerShell: $env:NEON_DATABASE_URL="...")');
    return false;
  }
  
  console.log('✅ Neon database URL configured');
  return true;
}

function loadORBTDoctrine() {
  console.log('🔧 Loading ORBT doctrine...');
  
  try {
    // Change to weewee-def-update directory
    process.chdir(weeweePath);
    
    // Install dependencies if needed
    if (!fs.existsSync('node_modules')) {
      console.log('📦 Installing dependencies...');
      execSync('npm install', { stdio: 'inherit' });
    }
    
    // Run the ORBT doctrine insertion script
    console.log('🚀 Running ORBT doctrine insertion...');
    execSync('npx tsx scripts/simple_orbt_insert.ts', { stdio: 'inherit' });
    
    console.log('✅ ORBT doctrine loaded successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to load ORBT doctrine:', error.message);
    return false;
  }
}

function createProjectIntegration() {
  console.log('🔧 Creating project integration...');
  
  // Create a symlink or copy of the ORBT doctrine to the current project
  const orbtDoctrinePath = path.join(weeweePath, 'orbt_doctrine.ts');
  const projectOrbtPath = path.join(__dirname, 'utils', 'orbt_doctrine.js');
  
  try {
    // Copy the ORBT doctrine to the current project's utils directory
    if (!fs.existsSync(path.dirname(projectOrbtPath))) {
      fs.mkdirSync(path.dirname(projectOrbtPath), { recursive: true });
    }
    
    // Convert TypeScript to JavaScript for the current project
    const orbtContent = fs.readFileSync(orbtDoctrinePath, 'utf8');
    const jsContent = orbtContent
      .replace(/export const/g, 'module.exports =')
      .replace(/as const/g, '')
      .replace(/\/\/.*$/gm, ''); // Remove comments
    
    fs.writeFileSync(projectOrbtPath, jsContent);
    console.log('✅ ORBT doctrine integrated into project');
    
  } catch (error) {
    console.error('❌ Failed to integrate ORBT doctrine:', error.message);
  }
}

function displayORBTStatus() {
  console.log('\n📊 ORBT System Status');
  console.log('=====================');
  
  const orbtDoctrine = require('./utils/orbt_doctrine.js');
  
  console.log(`🏗️  Operating System (30k): ${orbtDoctrine.tiers[30000].label}`);
  console.log(`🔧 Repair System (20k): ${orbtDoctrine.tiers[20000].label}`);
  console.log(`⚙️  Build System (10k): ${orbtDoctrine.tiers[10000].label}`);
  console.log(`📚 Training System (5k): ${orbtDoctrine.tiers[5000].label}`);
  
  console.log('\n🎨 Color Status:');
  console.log(`   🟢 Green: ${orbtDoctrine.color_model.green}`);
  console.log(`   🟡 Yellow: ${orbtDoctrine.color_model.yellow}`);
  console.log(`   🔴 Red: ${orbtDoctrine.color_model.red}`);
  
  console.log('\n📋 Universal Rules:');
  orbtDoctrine.universal_rules.forEach((rule, index) => {
    console.log(`   ${index + 1}. ${rule}`);
  });
}

function main() {
  console.log('🎯 Starting ORBT Auto-Load Process...\n');
  
  // Step 1: Check and setup weewee-def-update
  if (!checkWeeweeDefUpdate()) {
    console.log('❌ Cannot proceed without weewee-def-update');
    process.exit(1);
  }
  
  // Step 2: Check Neon database configuration
  const neonReady = checkNeonDatabase();
  
  // Step 3: Load ORBT doctrine if Neon is ready
  if (neonReady) {
    if (loadORBTDoctrine()) {
      console.log('✅ ORBT doctrine loaded into Neon database');
    } else {
      console.log('⚠️  ORBT doctrine loading failed, but continuing...');
    }
  } else {
    console.log('⚠️  Skipping Neon database loading (not configured)');
  }
  
  // Step 4: Create project integration
  createProjectIntegration();
  
  // Step 5: Display ORBT status
  displayORBTStatus();
  
  console.log('\n🎉 ORBT Auto-Start Complete!');
  console.log('=====================================');
  console.log('Your project is now ORBT-compliant and ready for:');
  console.log('   🏗️  Operating System layer');
  console.log('   🔧 Repair System with color-coded diagnostics');
  console.log('   ⚙️  Build System with blueprint logic');
  console.log('   📚 Training System with troubleshooting logs');
  console.log('\n🚀 Ready to start development!');
}

// Run the auto-start process
main(); 