---
sidebar_position: 1
---

# API Introduction

Welcome to the MentalVerse API documentation. Our API provides comprehensive access to the MentalVerse platform's features, enabling developers to build applications that integrate with our Web3-powered mental health support ecosystem.

## Overview

The MentalVerse API is built on modern Web3 principles, leveraging the Internet Computer Protocol (ICP) for decentralized, secure, and scalable operations. Our API provides:

- **Decentralized Authentication** - Secure wallet-based authentication
- **Privacy-First Design** - Anonymous interactions with end-to-end encryption
- **Token Integration** - Native MVT token support for all transactions
- **Smart Contract Integration** - Direct interaction with platform smart contracts
- **Real-time Communication** - WebSocket support for live sessions and messaging

## Base URL

```
https://api.mentalverse.io/v1
```

## Authentication

All API requests require authentication using one of the following methods:

1. **Wallet Signature** - Sign requests with your connected wallet
2. **Session Token** - Use temporary session tokens for extended interactions
3. **API Key** - For server-to-server integrations (professionals only)

## Rate Limiting

- **Public endpoints**: 100 requests per minute
- **Authenticated endpoints**: 1000 requests per minute
- **Professional accounts**: 5000 requests per minute

## Response Format

All API responses follow a consistent JSON format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0"
  }
}
```

## Error Handling

Error responses include detailed information:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "The provided token is invalid or expired",
    "details": {
      "field": "authorization",
      "reason": "token_expired"
    }
  }
}
```

## SDK and Libraries

- **JavaScript/TypeScript**: `@mentalverse/sdk`
- **Python**: `mentalverse-python`
- **Rust**: `mentalverse-rs`
- **Motoko**: Native ICP integration

## Getting Started

1. [Set up authentication](./auth/overview)
2. [Connect your wallet](./auth/wallet-connection)
3. [Make your first API call](./users/profile-management)
4. [Explore advanced features](./therapy/booking)

## Support

For API support:
- **Documentation**: [docs.mentalverse.io](https://docs.mentalverse.io)
- **Discord**: [discord.gg/mentalverse](https://discord.gg/mentalverse)
- **Email**: api-support@mentalverse.io