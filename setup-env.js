#!/usr/bin/env node

/**
 * MentalVerse Environment Setup Script
 * 
 * This script helps configure environment variables for different deployment scenarios:
 * - Local development
 * - IC mainnet production
 * - Custom deployment
 */

const fs = require('fs');
const path = require('path');

// Production canister IDs from canister_ids.json
const PRODUCTION_CANISTER_IDS = {
  frontend: 'cnuty-qiaaa-aaaac-a4anq-cai',
  mentalverse_backend: 'cytcv-raaaa-aaaac-a4aoa-cai',
  mvt_token_canister: 'c7seb-4yaaa-aaaac-a4aoq-cai',
  secure_messaging: 'jzwty-fqaaa-aaaac-a4goq-cai',
  internet_identity: 'rdmx6-jaaaa-aaaaa-aaadq-cai'
};

// Default development canister IDs
const DEV_CANISTER_IDS = {
  mentalverse_backend: 'rdmx6-jaaaa-aaaah-qdrqq-cai',
  mvt_token_canister: 'rrkah-fqaaa-aaaah-qcuqq-cai',
  secure_messaging: 'jzwty-fqaaa-aaaac-a4goq-cai',
  internet_identity: 'rdmx6-jaaaa-aaaah-qdrva-cai'
};

function createFrontendEnv(environment = 'development') {
  const isProduction = environment === 'production';
  const canisterIds = isProduction ? PRODUCTION_CANISTER_IDS : DEV_CANISTER_IDS;
  const network = isProduction ? 'ic' : 'local';
  const host = isProduction ? 'https://ic0.app' : 'http://localhost:4943';
  const backendUrl = isProduction ? 'https://your-backend-domain.com' : 'http://localhost:3001';
  const nodeEnv = isProduction ? 'production' : 'development';
  const dfxNetwork = isProduction ? 'ic' : 'local';
  
  const envContent = `# MentalVerse Frontend Environment Variables
# Generated for ${environment} environment

# Internet Computer Network Configuration
VITE_IC_NETWORK=${network}
VITE_IC_HOST=${host}

# Canister IDs
VITE_CANISTER_MENTALVERSE_BACKEND=${canisterIds.mentalverse_backend}
VITE_CANISTER_MVT_TOKEN=${canisterIds.mvt_token_canister}
VITE_CANISTER_SECURE_MESSAGING=${canisterIds.secure_messaging}
VITE_CANISTER_INTERNET_IDENTITY=${canisterIds.internet_identity}

# Internet Identity Configuration
VITE_INTERNET_IDENTITY_URL=${isProduction ? 'https://identity.ic0.app' : `http://localhost:4943/?canisterId=${canisterIds.internet_identity}`}

# Backend API Configuration
VITE_API_BASE_URL=${backendUrl}
VITE_OPENAI_API_BASE=/api/chat

# Environment
NODE_ENV=${nodeEnv}
DFX_NETWORK=${dfxNetwork}

# Application Configuration
VITE_APP_NAME=MentalVerse
VITE_APP_VERSION=1.0.0

# Legacy Configuration (for backward compatibility)
REACT_APP_BACKEND_CANISTER_ID=${canisterIds.mentalverse_backend}
REACT_APP_INTERNET_IDENTITY_URL=${isProduction ? 'https://identity.ic0.app' : `http://localhost:4943/?canisterId=${canisterIds.internet_identity}`}
REACT_APP_IC_HOST=${host}
VITE_BACKEND_URL=${backendUrl}
`;

  return envContent;
}

function createBackendEnv(environment = 'development') {
  const isProduction = environment === 'production';
  const canisterIds = isProduction ? PRODUCTION_CANISTER_IDS : DEV_CANISTER_IDS;
  const network = isProduction ? 'ic' : 'local';
  const host = isProduction ? 'https://ic0.app' : 'http://localhost:4943';
  const frontendUrl = isProduction ? 'https://your-frontend-domain.com' : 'http://localhost:5173';
  const port = isProduction ? process.env.PORT || 3001 : 3001;
  const nodeEnv = isProduction ? 'production' : 'development';
  
  const envContent = `# MentalVerse Backend Environment Variables
# Generated for ${environment} environment

# Server Configuration
PORT=${port}
NODE_ENV=${nodeEnv}

# OpenAI API Configuration
# Replace with your actual OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here

# CORS Configuration
FRONTEND_URL=${frontendUrl}

# Internet Computer Integration
IC_NETWORK=${network}
IC_HOST=${host}

# Canister IDs
MENTALVERSE_BACKEND_CANISTER=${canisterIds.mentalverse_backend}
MVT_TOKEN_CANISTER=${canisterIds.mvt_token_canister}
SECURE_MESSAGING_CANISTER=${canisterIds.secure_messaging}

# Session Configuration
SESSION_MAX_AGE=86400000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Session Secret (generate a secure random string for production)
SESSION_SECRET=dev_session_secret

# Security Configuration
# TRUST_PROXY=false
# SECURE_COOKIES=false
`;

  return envContent;
}

function setupEnvironment(environment = 'development') {
  const isProduction = environment === 'production';
  console.log(`\n🔧 Setting up ${environment} environment...\n`);
  
  // Create frontend environment file
  const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
  const frontendEnvContent = createFrontendEnv(environment);
  
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log(`✅ Created frontend environment file: ${frontendEnvPath}`);
  
  // Create backend environment file
  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  const backendEnvContent = createBackendEnv(environment);
  
  fs.writeFileSync(backendEnvPath, backendEnvContent);
  console.log(`✅ Created backend environment file: ${backendEnvPath}`);
  
  if (isProduction) {
    console.log(`\n📋 Next steps for production deployment:`);
    console.log('1. Update OpenAI API key in backend/.env');
    console.log('2. Update backend and frontend domain URLs in .env files');
    console.log('3. Ensure canisters are deployed to IC mainnet: dfx deploy --network ic');
    console.log('4. Deploy backend to your hosting service (Render, Railway, etc.)');
    console.log('5. Deploy frontend to your hosting service (Vercel, Netlify, etc.)');
    console.log('6. Update DNS and SSL certificates');
    console.log('\n⚠️  Important: Make sure to update the domain URLs in the .env files!');
  } else {
    console.log(`\n📋 Next steps for development deployment:`);
    console.log('1. Update OpenAI API key in backend/.env');
    console.log('2. Start local replica: dfx start --clean');
    console.log('3. Deploy canisters: dfx deploy');
    console.log('4. Start backend: cd backend && npm start');
    console.log('5. Start frontend: cd frontend && npm run dev');
  }
  
  console.log('\n🎉 Environment setup complete!\n');
}

function validateCanisterIds() {
  const canisterIdsPath = path.join(__dirname, 'mentalverse', 'canister_ids.json');
  
  if (fs.existsSync(canisterIdsPath)) {
    try {
      const canisterIds = JSON.parse(fs.readFileSync(canisterIdsPath, 'utf8'));
      console.log('\n📋 Current canister IDs from canister_ids.json:');
      Object.entries(canisterIds).forEach(([name, config]) => {
        if (config.ic) {
          console.log(`  ${name}: ${config.ic}`);
        }
      });
      console.log('');
      return canisterIds;
    } catch (error) {
      console.warn('⚠️  Could not read canister_ids.json:', error.message);
    }
  } else {
    console.log('ℹ️  No canister_ids.json found. Using default canister IDs.');
  }
  
  return null;
}

// Main execution
function main() {
  console.log('🚀 MentalVerse Environment Setup');
  console.log('================================');
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  // Show help if requested
  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
    return;
  }
  
  const environment = args.includes('--production') || args.includes('-p') ? 'production' : 'development';
  
  console.log(`\n📋 Environment: ${environment.toUpperCase()}`);
  
  if (environment === 'production') {
    console.log('🌐 Using IC mainnet canister IDs');
    console.log('🔗 Configuring for production deployment');
  } else {
    console.log('🏠 Using local development canister IDs');
    console.log('🔧 Configuring for local development');
  }
  
  // Validate canister IDs
  validateCanisterIds();
  
  // Setup environment
  setupEnvironment(environment);
}

if (require.main === module) {
  main();
}

// Add usage help function
function showUsage() {
  console.log('\n📖 Usage:');
  console.log('  node setup-env.js                    # Setup for development (default)');
  console.log('  node setup-env.js --production       # Setup for production (IC mainnet)');
  console.log('  node setup-env.js -p                 # Setup for production (short flag)');
  console.log('\n🔧 Development mode:');
  console.log('  - Uses local canister IDs');
  console.log('  - Configures for localhost:4943 (local replica)');
  console.log('  - Backend URL: http://localhost:3001');
  console.log('  - Frontend URL: http://localhost:5173');
  console.log('\n🌐 Production mode:');
  console.log('  - Uses IC mainnet canister IDs');
  console.log('  - Configures for https://ic0.app');
  console.log('  - Uses production Internet Identity');
  console.log('  - Requires manual domain URL updates in .env files');
  console.log('');
}

module.exports = {
  setupEnvironment,
  createFrontendEnv,
  createBackendEnv,
  showUsage,
  DEV_CANISTER_IDS,
  PRODUCTION_CANISTER_IDS
};