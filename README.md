# MentalVerse - Web3 Mental Health Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](#)
[![Web3](https://img.shields.io/badge/Web3-Enabled-blue.svg)](#)

MentalVerse is the world's first Web3-powered mental health support platform that combines blockchain technology, AI assistance, and community-driven care to revolutionize mental healthcare accessibility and privacy.

## 🌟 Overview

MentalVerse leverages cutting-edge Web3 technologies to create a decentralized, private, and community-driven mental health ecosystem that provides:

- **Peer Support Groups** - Anonymous, secure community connections
- **Professional Therapy** - Licensed therapists with blockchain-verified credentials
- **AI-Powered Support** - 24/7 intelligent mental health assistance
- **Specialized Mentorship** - Identity-based and condition-specific guidance
- **Token Economics** - MVT tokens for incentivizing participation and accessing services

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

1. **Peer Support Participation** - Earn tokens for active participation in support groups
2. **Mentorship Programs** - Receive rewards for providing guidance to community members
3. **Content Creation** - Get compensated for creating helpful mental health resources
4. **Platform Feedback** - Earn tokens for providing valuable feedback and bug reports
5. **Referral Program** - Receive bonus tokens for successful referrals
6. **Staking Rewards** - Earn passive income by staking tokens

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
   git clone https://github.com/mentalverse/mentalverse.git
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
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── services/       # API and blockchain services
│   │   └── types/          # TypeScript type definitions
│   └── package.json
├── backend/                 # Node.js API server
│   ├── server.js           # Express server setup
│   └── package.json
├── mentalverse/            # ICP blockchain canisters
│   ├── src/
│   │   └── mentalverse_backend/  # Motoko smart contracts
│   └── dfx.json
├── docs/                   # Documentation site
│   ├── docs/              # Documentation content
│   └── docusaurus.config.js
└── README.md              # This file
```

## 🔧 Development

### Available Scripts

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
```

#### Blockchain
```bash
dfx start           # Start local ICP replica
dfx deploy          # Deploy all canisters
dfx build           # Build canisters
dfx canister status # Check canister status
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

## 📚 Documentation

Comprehensive documentation is available at [docs.mentalverse.com](https://docs.mentalverse.com), including:

- **User Guides**: How to use the platform
- **API Documentation**: Backend API reference
- **Web3 Integration**: Blockchain development guides
- **Token Economics**: Detailed MVT token information
- **Security**: Privacy and security best practices

## 🗺️ Roadmap

### Phase 1: Foundation (Completed)
- ✅ Core platform development
- ✅ MVT token implementation
- ✅ Basic staking mechanism
- ✅ Internet Identity integration

### Phase 2: Enhanced Features (In Progress)
- 🔄 Advanced AI chatbot
- 🔄 Professional therapist network
- 🔄 Mobile application
- 🔄 Enhanced token utilities

### Phase 3: Ecosystem Expansion (Planned)
- 📋 Cross-chain compatibility
- 📋 Third-party integrations
- 📋 Global partnerships
- 📋 Advanced analytics

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
- **GitHub Issues**: [Report bugs or request features](https://github.com/mentalverse/mentalverse/issues)

## 🙏 Acknowledgments

- Internet Computer Protocol for providing the blockchain infrastructure
- OpenAI for AI capabilities
- The mental health community for guidance and feedback
- All contributors and supporters of the MentalVerse mission

---

**MentalVerse** - *Revolutionizing mental health through Web3 technology* 🧠💙