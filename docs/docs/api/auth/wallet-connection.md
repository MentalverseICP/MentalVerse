---
sidebar_position: 2
---

# Wallet Connection

This guide covers how to integrate wallet connections with the MentalVerse platform, supporting multiple Web3 wallets for secure, decentralized authentication.

## Supported Wallets

### Internet Computer Wallets

#### Internet Identity
```javascript
const connectII = async () => {
  const authClient = await AuthClient.create();
  
  await authClient.login({
    identityProvider: 'https://identity.ic0.app',
    onSuccess: async () => {
      const identity = authClient.getIdentity();
      const principal = identity.getPrincipal().toString();
      
      // Register with MentalVerse API
      const session = await registerWithAPI(principal, identity);
      return session;
    },
    onError: (error) => {
      console.error('Internet Identity login failed:', error);
    }
  });
};
```

#### Plug Wallet
```javascript
const connectPlug = async () => {
  if (!window.ic?.plug) {
    throw new Error('Plug wallet not installed');
  }
  
  const connected = await window.ic.plug.requestConnect({
    whitelist: ['rdmx6-jaaaa-aaaah-qcaiq-cai'], // MentalVerse canister ID
    host: 'https://mainnet.dfinity.network'
  });
  
  if (connected) {
    const principal = await window.ic.plug.getPrincipal();
    const session = await registerWithAPI(principal.toString());
    return session;
  }
};
```

#### Stoic Wallet
```javascript
const connectStoic = async () => {
  const stoic = await import('@stoic-wallet/sdk');
  
  const connected = await stoic.connect();
  if (connected) {
    const principal = stoic.getPrincipal();
    const session = await registerWithAPI(principal.toString());
    return session;
  }
};
```

### Ethereum Wallets

#### MetaMask
```javascript
const connectMetaMask = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }
  
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  });
  
  const address = accounts[0];
  const signature = await signChallenge(address);
  
  const session = await registerWithAPI(address, signature);
  return session;
};

const signChallenge = async (address) => {
  const challenge = await fetch('/api/auth/challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address })
  }).then(r => r.json());
  
  const signature = await window.ethereum.request({
    method: 'personal_sign',
    params: [challenge.message, address]
  });
  
  return { challenge: challenge.challenge, signature };
};
```

## Universal Connection Handler

```javascript
class WalletConnector {
  constructor(config) {
    this.config = config;
    this.supportedWallets = [
      'internet-identity',
      'plug',
      'stoic',
      'metamask'
    ];
  }
  
  async detectWallets() {
    const available = [];
    
    // Check Internet Identity
    if (typeof window !== 'undefined') {
      available.push('internet-identity');
    }
    
    // Check Plug
    if (window.ic?.plug) {
      available.push('plug');
    }
    
    // Check Stoic
    try {
      const stoic = await import('@stoic-wallet/sdk');
      if (stoic) available.push('stoic');
    } catch (e) {}
    
    // Check MetaMask
    if (window.ethereum?.isMetaMask) {
      available.push('metamask');
    }
    
    return available;
  }
  
  async connect(walletType) {
    switch (walletType) {
      case 'internet-identity':
        return this.connectII();
      case 'plug':
        return this.connectPlug();
      case 'stoic':
        return this.connectStoic();
      case 'metamask':
        return this.connectMetaMask();
      default:
        throw new Error(`Unsupported wallet: ${walletType}`);
    }
  }
  
  async disconnect() {
    // Clear local session
    localStorage.removeItem('mentalverse_session');
    
    // Notify API
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getStoredToken()}`
      }
    });
  }
}
```

## API Registration

### Registration Endpoint

```http
POST /api/auth/register
Content-Type: application/json

{
  "wallet_type": "internet-identity",
  "principal": "rdmx6-jaaaa-aaaah-qcaiq-cai",
  "signature": "...",
  "public_key": "...",
  "user_type": "standard"
}
```

### Response Format

```json
{
  "success": true,
  "data": {
    "session_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "rt_1234567890abcdef",
    "expires_at": "2024-01-15T12:00:00Z",
    "user": {
      "id": "user_123",
      "principal": "rdmx6-jaaaa-aaaah-qcaiq-cai",
      "wallet_type": "internet-identity",
      "user_type": "standard",
      "created_at": "2024-01-01T00:00:00Z",
      "last_login": "2024-01-15T10:00:00Z"
    },
    "permissions": [
      "read:profile",
      "write:messages",
      "join:groups",
      "book:sessions"
    ]
  }
}
```

## Error Handling

### Common Errors

```javascript
const handleWalletError = (error) => {
  switch (error.code) {
    case 'WALLET_NOT_INSTALLED':
      return {
        message: 'Please install the required wallet extension',
        action: 'install_wallet',
        wallet_url: getWalletInstallUrl(error.wallet)
      };
      
    case 'USER_REJECTED':
      return {
        message: 'Connection was rejected by user',
        action: 'retry_connection'
      };
      
    case 'NETWORK_MISMATCH':
      return {
        message: 'Please switch to the correct network',
        action: 'switch_network',
        required_network: 'Internet Computer Mainnet'
      };
      
    case 'INSUFFICIENT_BALANCE':
      return {
        message: 'Insufficient balance for transaction fees',
        action: 'add_funds'
      };
      
    default:
      return {
        message: 'An unexpected error occurred',
        action: 'contact_support'
      };
  }
};
```

## Security Considerations

### Message Signing

```javascript
const createSecureChallenge = () => {
  const timestamp = Date.now();
  const nonce = crypto.randomUUID();
  const domain = 'mentalverse.io';
  
  return {
    message: `Sign this message to authenticate with MentalVerse\n\nDomain: ${domain}\nTimestamp: ${timestamp}\nNonce: ${nonce}`,
    timestamp,
    nonce,
    domain
  };
};
```

### Signature Verification

```javascript
const verifySignature = async (address, signature, challenge) => {
  const message = challenge.message;
  const recoveredAddress = ethers.utils.verifyMessage(message, signature);
  
  if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
    throw new Error('Invalid signature');
  }
  
  // Check timestamp (5 minute window)
  const now = Date.now();
  const challengeTime = challenge.timestamp;
  if (now - challengeTime > 5 * 60 * 1000) {
    throw new Error('Challenge expired');
  }
  
  return true;
};
```

## React Integration Example

```jsx
import React, { useState, useEffect } from 'react';
import { WalletConnector } from '@mentalverse/sdk';

const WalletConnection = () => {
  const [connector] = useState(new WalletConnector());
  const [availableWallets, setAvailableWallets] = useState([]);
  const [connecting, setConnecting] = useState(false);
  const [session, setSession] = useState(null);
  
  useEffect(() => {
    const detectWallets = async () => {
      const wallets = await connector.detectWallets();
      setAvailableWallets(wallets);
    };
    
    detectWallets();
  }, [connector]);
  
  const handleConnect = async (walletType) => {
    setConnecting(true);
    try {
      const session = await connector.connect(walletType);
      setSession(session);
    } catch (error) {
      console.error('Connection failed:', error);
      // Handle error
    } finally {
      setConnecting(false);
    }
  };
  
  const handleDisconnect = async () => {
    await connector.disconnect();
    setSession(null);
  };
  
  if (session) {
    return (
      <div className="wallet-connected">
        <p>Connected as: {session.user.principal}</p>
        <button onClick={handleDisconnect}>Disconnect</button>
      </div>
    );
  }
  
  return (
    <div className="wallet-selection">
      <h3>Connect Your Wallet</h3>
      {availableWallets.map(wallet => (
        <button
          key={wallet}
          onClick={() => handleConnect(wallet)}
          disabled={connecting}
          className={`wallet-button wallet-${wallet}`}
        >
          {connecting ? 'Connecting...' : `Connect ${wallet}`}
        </button>
      ))}
    </div>
  );
};

export default WalletConnection;
```

## Testing

### Unit Tests

```javascript
describe('Wallet Connection', () => {
  let connector;
  
  beforeEach(() => {
    connector = new WalletConnector({
      apiUrl: 'http://localhost:3000/api'
    });
  });
  
  test('should detect available wallets', async () => {
    const wallets = await connector.detectWallets();
    expect(Array.isArray(wallets)).toBe(true);
  });
  
  test('should handle connection errors gracefully', async () => {
    // Mock wallet not installed
    window.ic = undefined;
    
    await expect(connector.connect('plug'))
      .rejects
      .toThrow('Plug wallet not installed');
  });
});
```

## Next Steps

- [Session Management](./session-management)
- [User Profile Management](../users/profile-management)
- [Profile Management](../users/profile-management)