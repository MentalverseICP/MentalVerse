# MentalVerse - Web3 Mental Health Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](#)
[![Web3](https://img.shields.io/badge/Web3-Enabled-blue.svg)](#)
[![Regional Round](https://img.shields.io/badge/Regional%20Round-Upgrades-gold.svg)](#)

MentalVerse is the world's first Web3-powered mental health support platform that combines blockchain technology, AI assistance, and community-driven care to revolutionize mental healthcare accessibility and privacy.

## 🏆 Regional Round Upgrades (December 2024)

This release includes significant enhancements and new features developed for the regional competition round:

### 🎯 **Enhanced Testnet Faucet System**
- **Daily Token Claims**: Users can claim up to 1,000 MVT tokens daily for platform testing
- **Claim History Tracking**: Complete audit trail of all token claims with timestamps
- **Real-time Statistics**: Live dashboard showing claimed amounts and remaining daily allowance
- **Eligibility Verification**: Automated daily limit checking and countdown timers
- **Mobile-Responsive Design**: Optimized interface for all device types

### 🔧 **Technical Infrastructure Improvements**
- **Production-Ready Backend**: Secure Node.js API server with OpenAI integration
- **Comprehensive Security**: HIPAA and GDPR compliance implementation
- **Advanced Error Handling**: Robust error tracking and user feedback systems
- **Environment Configuration**: Automated setup for development and production environments
- **TypeScript Optimization**: Enhanced type safety and code quality improvements

### 📚 **Enhanced Documentation Suite**
- **Deployment Guides**: Step-by-step production deployment instructions
- **Security Implementation**: Comprehensive security and compliance documentation
- **Testing Framework**: Complete manual and automated testing procedures
- **API Documentation**: Detailed backend API reference and integration guides
- **Progress Tracking**: Systematic development milestone documentation

### 🎨 **User Experience Enhancements**
- **Improved UI Components**: Modern, accessible interface design
- **Real-time Feedback**: Enhanced status indicators and user messaging
- **Performance Optimization**: Faster load times and smoother interactions
- **Cross-platform Compatibility**: Consistent experience across all devices

## 🌟 Platform Overview

MentalVerse leverages cutting-edge Web3 technologies to create a decentralized, private, and community-driven mental health ecosystem that provides:

### Core Features
- **Peer Support Groups** - Anonymous, secure community connections
- **Professional Therapy** - Licensed therapists with blockchain-verified credentials
- **AI-Powered Support** - 24/7 intelligent mental health assistance powered by OpenAI GPT-4
- **Specialized Mentorship** - Identity-based and condition-specific guidance
- **Smart Contract Integration** - All user authentication, data management, and privacy operations handled by decentralized smart contracts
- **Token Economics** - MVT tokens for incentivizing participation and accessing services

### Technical Excellence
- **Comprehensive Security** - HIPAA and GDPR compliant infrastructure
- **Production-Ready Architecture** - Scalable backend with secure API endpoints
- **Advanced Error Handling** - Robust error tracking and user feedback systems
- **Multi-Environment Support** - Automated configuration for development and production
- **Cross-Chain Integration** - Internet Computer Protocol with Bitcoin and Ethereum bridges

## 🪙 MVT Token (MentalVerse Token)

The **MVT (MentalVerse Token)** is the native utility token that powers the MentalVerse ecosystem, enabling a sustainable and incentivized mental health support network.

### Token Utility

- **🎯 Service Access**: Pay for premium therapy sessions, specialized consultations, and advanced AI features
- **🏆 Rewards & Incentives**: Earn tokens for participating in peer support, providing mentorship, and contributing to the community
- **🗳️ Governance**: Vote on platform improvements, feature additions, and community guidelines
- **💰 Staking Rewards**: Stake MVT tokens to earn passive income while supporting platform security
- **🎁 Referral Bonuses**: Receive token rewards for bringing new users to the platform

### Token Economics

- **Total Supply**: 1,000,000,000 MVT
- **Blockchain**: Internet Computer Protocol (ICP)
- **Token Standard**: ICRC-1 compatible
- **Distribution**:
  - 40% - Community Rewards & Incentives
  - 25% - Development & Operations
  - 20% - Strategic Partnerships
  - 10% - Team & Advisors (vested)
  - 5% - Initial Liquidity

### Earning MVT Tokens

Users can earn MVT tokens through various platform activities:

1. **Testnet Faucet** - Claim free MVT tokens daily for testing and platform exploration
2. **Peer Support Participation** - Earn tokens for active participation in support groups
3. **Mentorship Programs** - Receive rewards for providing guidance to community members
4. **Content Creation** - Get compensated for creating helpful mental health resources
5. **Platform Feedback** - Earn tokens for providing valuable feedback and bug reports
6. **Referral Program** - Receive bonus tokens for successful referrals
7. **Staking Rewards** - Earn passive income by staking tokens

### Testnet Faucet

The MentalVerse platform includes a **Testnet Faucet** that allows users to claim free MVT tokens for testing purposes:

- **Daily Claims**: Users can claim up to 1,000 MVT tokens per day
- **Claim History**: Track all previous token claims with timestamps
- **Eligibility Check**: Automatic verification of claim eligibility based on daily limits
- **Real-time Updates**: Live statistics showing remaining daily allowance
- **User-Friendly Interface**: Intuitive design with clear claim status and countdown timers

#### Faucet Features:
- 🎯 **Daily Limit**: 1,000 MVT tokens per user per day
- ⏰ **Reset Timer**: Claims reset every 24 hours
- 📊 **Statistics**: Real-time display of claimed amounts and remaining allowance
- 🔒 **Authentication Required**: Must be logged in with Internet Identity
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

### Token Staking

The platform features a robust staking mechanism that allows users to:

- **Lock MVT tokens** for predetermined periods (30, 90, 180, or 365 days)
- **Earn staking rewards** with APY ranging from 5% to 15% based on lock duration
- **Participate in governance** with enhanced voting power for staked tokens
- **Access premium features** exclusive to staking participants

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Web3 Integration**: Internet Computer Agent

### Backend
- **Blockchain**: Internet Computer Protocol (ICP)
- **Smart Contracts**: Motoko
- **Authentication**: Internet Identity
- **Storage**: Decentralized on-chain storage

### AI Services
- **Chatbot**: OpenAI GPT-4 integration
- **Natural Language Processing**: Advanced sentiment analysis
- **Crisis Detection**: Real-time mental health crisis identification

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- DFX SDK (for blockchain development)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MentalverseICP/MentalVerse.git
   cd mentalverse
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Start local development**
   ```bash
   # Start ICP local replica
   dfx start --background
   
   # Deploy canisters
   dfx deploy
   
   # Start frontend development server
   cd frontend
   npm run dev
   
   # Start backend API server
   cd ../backend
   npm run dev
   ```

## 📁 Project Structure

```
mentalverse/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   └── TestnetFaucet/  # MVT token faucet component
│   │   ├── pages/             # Application pages
│   │   ├── services/          # API and blockchain services
│   │   └── types/             # TypeScript type definitions
│   └── package.json
├── backend/                     # Node.js API server
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   ├── middleware/        # Express middleware
│   │   └── services/          # Business logic services
│   ├── docs/                  # Backend documentation
│   │   ├── SECURITY_IMPLEMENTATION_README.md
│   │   ├── COMPLIANCE_DOCUMENTATION.md
│   │   └── SECURITY_TEST_CHECKLIST.md
│   ├── server.js              # Express server setup
│   └── package.json
├── mentalverse/                 # ICP blockchain canisters
│   ├── src/
│   │   ├── mentalverse_backend/    # Main Motoko smart contracts
│   │   ├── mvt_token_canister/     # MVT token implementation
│   │   └── secure_messaging/       # Encrypted messaging (Rust)
│   └── dfx.json
├── docs/                        # Documentation site (Docusaurus)
│   ├── docs/                   # Documentation content
│   │   ├── api/               # API documentation
│   │   ├── features/          # Feature guides
│   │   ├── mentorship/        # Mentorship program docs
│   │   ├── user-guides/       # User instruction guides
│   │   └── web3-technology/   # Blockchain integration docs
│   ├── blog/                  # Platform blog posts
│   └── docusaurus.config.js
├── DEPLOYMENT_GUIDE.md          # Production deployment instructions
├── BACKEND_DEPLOYMENT_GUIDE.md  # Backend-specific deployment
├── TESTING_GUIDE.md             # Comprehensive testing procedures
├── PROGRESS.md                  # Development milestone tracking
├── setup-env.js                # Environment configuration automation
└── README.md                   # This file
```

## 🔧 Development

### Available Scripts

#### Environment Setup
```bash
node setup-env.js development  # Configure development environment
node setup-env.js production   # Configure production environment
```

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

#### Backend
```bash
npm start           # Start production server
npm run dev         # Start development server with hot reload
npm test            # Run tests
npm run security    # Run security tests
```

#### Blockchain
```bash
dfx start --clean   # Start local ICP replica (clean state)
dfx deploy          # Deploy all canisters
dfx build           # Build canisters
dfx canister status # Check canister status
./test_inter_canister.sh  # Test inter-canister communication
```

#### Testing & Quality Assurance
```bash
# Manual testing procedures
npm run test:manual     # Run manual testing checklist
npm run test:security   # Security compliance testing
npm run test:integration # Integration testing

# Code quality
npm run lint:fix        # Auto-fix linting issues
npm run type-check:watch # Watch mode type checking
```

## 🔒 Security & Privacy

- **End-to-End Encryption**: All sensitive communications are encrypted
- **Internet Identity**: Secure, privacy-preserving authentication
- **Decentralized Storage**: No central point of failure
- **HIPAA Compliance**: Adherence to healthcare privacy standards
- **Anonymous Support**: Option for completely anonymous participation

## 🌐 Deployment

### Frontend
- **Production**: Deployed on Vercel
- **Staging**: Available for testing new features

### Backend
- **API Server**: Deployed on Render
- **Blockchain**: Internet Computer mainnet

### Documentation
- **Docs Site**: Deployed on Vercel at [docs.mentalverse.com](https://docs.mentalverse.com)

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📚 Documentation & Guides

Comprehensive documentation is available at [docs.mentalverse.com](https://docs.mentalverse.com), including:

### User Documentation
- **User Guides**: How to use the platform and its features
- **Token Economics**: Detailed MVT token information and faucet usage
- **Mentorship Programs**: Professional and peer mentorship guides
- **Crisis Support**: Emergency resources and intervention protocols

### Developer Documentation
- **API Documentation**: Complete backend API reference
- **Web3 Integration**: Blockchain development and canister guides
- **Deployment Guides**: Production deployment instructions
- **Security Implementation**: HIPAA/GDPR compliance documentation
- **Testing Procedures**: Manual and automated testing frameworks

### Technical Resources
- **Architecture Overview**: System design and component interaction
- **Smart Contract Documentation**: Motoko and Rust canister guides
- **Environment Setup**: Development and production configuration
- **Progress Tracking**: Development milestone and change documentation

## 🗺️ Development Roadmap

### Phase 1: Foundation (✅ Completed)
- ✅ Core platform development
- ✅ MVT token implementation
- ✅ Basic staking mechanism
- ✅ Internet Identity integration
- ✅ Secure messaging infrastructure

### Phase 2: Regional Round Upgrades (✅ Completed - December 2024)
- ✅ **Enhanced Testnet Faucet** - Daily token claims with history tracking
- ✅ **Production Backend** - Secure Node.js API server with OpenAI integration
- ✅ **Security Compliance** - HIPAA and GDPR implementation
- ✅ **Comprehensive Documentation** - Deployment, security, and testing guides
- ✅ **Advanced Error Handling** - Robust error tracking and user feedback
- ✅ **Environment Automation** - Development and production configuration
- ✅ **TypeScript Optimization** - Enhanced type safety and code quality

### Phase 3: Enhanced Features (🔄 In Progress)
- ✅ **Smart Contract Integration** - Complete migration of authentication and data operations to blockchain
- 🔄 Advanced AI chatbot with crisis detection
- 🔄 Professional therapist network expansion
- 🔄 Mobile application development
- 🔄 Enhanced token utilities and governance
- 🔄 Multi-language support

### Phase 4: Ecosystem Expansion (📋 Planned)
- 📋 Cross-chain compatibility (Bitcoin, Ethereum)
- 📋 Third-party integrations and APIs
- 📋 Global partnerships and licensing
- 📋 Advanced analytics and AI insights
- 📋 Decentralized governance (DAO)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Live Deployment

MentalVerse is deployed on the Internet Computer mainnet:

- **Frontend Application**: [https://cnuty-qiaaa-aaaac-a4anq-cai.icp0.io/](https://cnuty-qiaaa-aaaac-a4anq-cai.icp0.io/)
- **Backend Canister**: [https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=cytcv-raaaa-aaaac-a4aoa-cai](https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=cytcv-raaaa-aaaac-a4aoa-cai)
- **MVT Token Canister**: [https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=c7seb-4yaaa-aaaac-a4aoq-cai](https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=c7seb-4yaaa-aaaac-a4aoq-cai)

### Canister IDs
- **Frontend**: `cnuty-qiaaa-aaaac-a4anq-cai`
- **Backend**: `cytcv-raaaa-aaaac-a4aoa-cai`
- **MVT Token**: `c7seb-4yaaa-aaaac-a4aoq-cai`

## 📞 Support & Community

- **Documentation**: [docs.mentalverse.com](https://docs.mentalverse.com)
- **Discord**: [Join our community](https://discord.gg/mentalverse)
- **Email**: support@mentalverse.com
- **GitHub Issues**: [Report bugs or request features](https://github.com/MentalverseICP/MentalVerse/issues)

## 🙏 Acknowledgments

- Internet Computer Protocol for providing the blockchain infrastructure
- OpenAI for AI capabilities
- The mental health community for guidance and feedback
- All contributors and supporters of the MentalVerse mission

---

**MentalVerse** - *Revolutionizing mental health through Web3 technology* 🧠💙