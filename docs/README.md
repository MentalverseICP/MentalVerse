# MentalVerse Documentation

[![Build Status](https://github.com/MentalverseICP/MentalVerse/workflows/Deploy/badge.svg)](https://github.com/MentalverseICP/MentalVerse/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docusaurus](https://img.shields.io/badge/Built%20with-Docusaurus-blue)](https://docusaurus.io/)

Comprehensive documentation for **MentalVerse** - the world's first Web3-powered mental health support platform that combines blockchain technology, AI assistance, and community-driven care.

## 🌟 About MentalVerse

MentalVerse is revolutionizing mental health support by leveraging Web3 technologies to create a decentralized, private, and community-driven platform that provides:

- **Peer Support Groups** - Anonymous, secure community connections
- **Professional Therapy** - Licensed therapists with blockchain-verified credentials
- **AI-Powered Support** - 24/7 intelligent mental health assistance
- **Specialized Mentorship** - Identity-based and condition-specific guidance
- **Token Economics** - MVT tokens for incentivizing participation and accessing services

## 📚 Documentation Structure

This documentation covers:

### Core Features
- Peer Support Systems
- Professional Therapy Integration
- AI Support and Chatbots
- Crisis Intervention
- Community Building

### Web3 Technology
- Blockchain Integration (Internet Computer)
- Smart Contracts
- Token Economics (MVT)
- Privacy and Security
- Decentralized Identity

### User Guides
- Getting Started
- Account Management
- Platform Navigation
- Safety and Privacy

### API Documentation
- Authentication
- User Management
- Therapy Booking
- Token Operations
- Community Features

### Mentorship Programs
- Specialized Mentorship
- Mentor Training
- Quality Assurance

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/MentalverseICP/MentalVerse.git
cd mentalverse-docs

# Install dependencies
npm install
# or
yarn install
```

### Local Development

```bash
npm start
# or
yarn start
```

This command starts a local development server and opens up a browser window at `http://localhost:3000`. Most changes are reflected live without having to restart the server.

### Build

```bash
npm run build
# or
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## 🛠️ Development

### Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build the static site for production
- `npm run serve` - Serve the built site locally
- `npm run clear` - Clear Docusaurus cache
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run typecheck` - Run TypeScript type checking

### Project Structure

```
mentalverse-docs/
├── docs/                    # Documentation content
│   ├── features/           # Core platform features
│   ├── web3-technology/    # Blockchain and Web3 docs
│   ├── user-guides/        # User guides and tutorials
│   ├── api/                # API documentation
│   └── mentorship/         # Mentorship program docs
├── blog/                   # Blog posts
├── src/                    # Custom React components
│   ├── components/         # Reusable components
│   ├── css/               # Custom styles
│   └── pages/             # Custom pages
├── static/                 # Static assets
│   ├── img/               # Images
│   └── files/             # Downloadable files
├── docusaurus.config.js    # Docusaurus configuration
├── sidebars.js            # Sidebar configuration
└── package.json           # Dependencies and scripts
```

## 🌐 Deployment

### GitHub Pages

The documentation is automatically deployed to GitHub Pages when changes are pushed to the main branch.

### Manual Deployment

Using SSH:

```bash
USE_SSH=true npm run deploy
# or
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> npm run deploy
# or
GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

## 🤝 Contributing

We welcome contributions to improve the documentation!

### How to Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/improve-docs`
3. Make your changes
4. Test locally: `npm start`
5. Commit your changes: `git commit -m "Improve documentation"`
6. Push to your fork: `git push origin feature/improve-docs`
7. Create a Pull Request

### Documentation Standards

- Use clear, descriptive headings
- Include working code examples
- Add visual aids where helpful
- Link to related documentation
- Include relevant keywords and descriptions

## 📞 Support

- **Documentation Issues**: [GitHub Issues](https://github.com/MentalverseICP/MentalVerse/issues)
- **General Support**: [Discord Community](https://discord.gg/mentalverse)
- **Email**: docs@mentalverse.com

## 📄 License

This documentation is licensed under the [MIT License](LICENSE).

## 🔗 Links

- **Live Documentation**: https://docs.mentalverse.com
- **MentalVerse Platform**: https://mentalverse.com
- **GitHub Repository**: https://github.com/MentalverseICP/MentalVerse
- **Community Discord**: https://discord.gg/mentalverse
- **Twitter**: https://twitter.com/mentalverse

---

**Built with ❤️ by the MentalVerse Team**

*Empowering mental health through Web3 technology*
