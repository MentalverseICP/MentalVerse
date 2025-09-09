# MentalVerse

MentalVerse is a web application designed to provide a supportive digital space for mental health awareness, resources, and community engagement. Built with React, TypeScript, and Vite, it aims to connect users with helpful tools and information to improve mental well-being.

## Features

- Modern React + TypeScript frontend
- Fast development with Vite
- Community and resource sections
- Internet Computer Protocol (ICP) integration with @dfinity packages v0.15.7
- Secure messaging and authentication via ICP canisters
- Rust-based secure messaging canister for end-to-end encrypted communication

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**

   ```sh
   git clone <repository-url>
   cd mentalverse/frontend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```

### Running the Development Server

Start the app in development mode with hot reloading:

```sh
npm start
# or
npm run dev
# or
yarn dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) by default.

## Recent Updates

### Current SDK Versions (January 2025)

The project uses the following Internet Computer Protocol (ICP) SDK versions:

- **@dfinity packages v0.15.7:**
  - `@dfinity/agent` - ICP agent for canister communication
  - `@dfinity/auth-client` - Internet Identity authentication
  - `@dfinity/candid` - Candid interface definition language
  - `@dfinity/identity` - Identity management
  - `@dfinity/principal` - Principal handling

- **Backend Smart Contracts:**
  - **Motoko Canisters**: Main backend logic and MVT token management
  - **Rust Canister**: Secure messaging with end-to-end encryption
  - **IC-CDK v0.13**: Rust Canister Development Kit
  - **Candid v0.10**: Interface definition language

### Rust Smart Contract Integration

The project includes a **secure messaging canister** written in Rust that provides:

- **End-to-End Encryption**: Messages encrypted using Ed25519 cryptography
- **WebRTC Signaling**: Peer-to-peer communication setup
- **Key Exchange**: Secure cryptographic key management
- **Session Management**: Encrypted session tokens and authentication
- **Stable Storage**: Persistent message and conversation storage
- **Inter-Canister Communication**: Seamless integration with Motoko canisters

**What Rust is doing:**
- Handling cryptographic operations for secure messaging
- Managing encrypted message storage and retrieval
- Providing WebRTC signaling for real-time communication
- Implementing secure key exchange protocols
- Ensuring data persistence across canister upgrades

### Building for Production

To create an optimized production build:

```sh
npm run build
# or
yarn build
```

### Preview Production Build

To locally preview the production build:

```sh
npm run preview
# or
yarn preview
```

## Dependencies

The following dependencies are used in this project:

- `react`
- `react-dom`
- `typescript`
- `vite`
- `@vitejs/plugin-react` (or `@vitejs/plugin-react-swc`)
- `eslint`
- `eslint-plugin-react`
- (Add any other dependencies your project uses in `package.json`)

Install all dependencies with:

```sh
npm install
# or
yarn install
```

## Linting and Formatting

To check code quality and formatting:

```sh
npm run lint
# or
yarn lint
```

_(Make sure a lint script exists in your `package.json`)_

## Project Structure

- `src/` - Main source code (React components, pages, etc.)
- `public/` - Static assets
- `index.html` - Entry HTML file

## About MentalVerse

MentalVerse is dedicated to fostering mental health awareness and providing resources for individuals seeking support. The platform encourages community interaction, resource sharing, and personal growth.

---