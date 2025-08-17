---
sidebar_position: 3
---

# Session Management

MentalVerse implements robust session management to ensure secure, persistent user experiences while maintaining privacy and security standards required for mental health platforms.

## Session Types

### Standard Sessions
For regular authenticated users with wallet connections:

```javascript
{
  "session_id": "sess_1234567890abcdef",
  "user_id": "user_123",
  "principal": "rdmx6-jaaaa-aaaah-qcaiq-cai",
  "session_type": "standard",
  "created_at": "2024-01-15T10:00:00Z",
  "expires_at": "2024-01-15T22:00:00Z",
  "last_activity": "2024-01-15T10:30:00Z",
  "permissions": [
    "read:profile",
    "write:messages",
    "join:groups",
    "book:sessions"
  ]
}
```

### Anonymous Sessions
For users requiring complete anonymity:

```javascript
{
  "session_id": "anon_9876543210fedcba",
  "anonymous_id": "anon_abc123",
  "session_type": "anonymous",
  "created_at": "2024-01-15T10:00:00Z",
  "expires_at": "2024-01-15T14:00:00Z",
  "zk_proof": "proof_xyz789",
  "permissions": [
    "read:public_content",
    "join:anonymous_groups",
    "use:ai_bots"
  ]
}
```

### Professional Sessions
For licensed mental health professionals:

```javascript
{
  "session_id": "prof_abcdef1234567890",
  "user_id": "prof_456",
  "professional_id": "lic_789",
  "session_type": "professional",
  "verification_level": "verified",
  "created_at": "2024-01-15T10:00:00Z",
  "expires_at": "2024-01-16T10:00:00Z",
  "permissions": [
    "read:all_profiles",
    "write:therapy_notes",
    "manage:sessions",
    "access:professional_tools"
  ]
}
```

## Session Lifecycle

### Session Creation

```http
POST /api/auth/sessions
Content-Type: application/json
Authorization: Bearer <wallet_signature>

{
  "session_type": "standard",
  "duration": 43200,
  "permissions": ["read:profile", "write:messages"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "rt_1234567890abcdef",
    "expires_at": "2024-01-15T22:00:00Z",
    "session_id": "sess_1234567890abcdef"
  }
}
```

### Session Validation

```http
GET /api/auth/sessions/validate
Authorization: Bearer <session_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "expires_at": "2024-01-15T22:00:00Z",
    "time_remaining": 3600,
    "permissions": ["read:profile", "write:messages"]
  }
}
```

### Session Refresh

```http
POST /api/auth/sessions/refresh
Content-Type: application/json

{
  "refresh_token": "rt_1234567890abcdef"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2024-01-16T10:00:00Z",
    "refresh_token": "rt_0987654321fedcba"
  }
}
```

## Client-Side Implementation

### Session Manager Class

```javascript
class SessionManager {
  constructor(config) {
    this.apiUrl = config.apiUrl;
    this.storage = config.storage || localStorage;
    this.refreshThreshold = config.refreshThreshold || 300; // 5 minutes
    this.refreshTimer = null;
  }
  
  async createSession(authData) {
    const response = await fetch(`${this.apiUrl}/auth/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.signature}`
      },
      body: JSON.stringify({
        session_type: authData.type || 'standard',
        duration: authData.duration || 43200
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      this.storeSession(result.data);
      this.scheduleRefresh(result.data.expires_at);
      return result.data;
    }
    
    throw new Error(result.error.message);
  }
  
  storeSession(sessionData) {
    this.storage.setItem('mv_session_token', sessionData.session_token);
    this.storage.setItem('mv_refresh_token', sessionData.refresh_token);
    this.storage.setItem('mv_expires_at', sessionData.expires_at);
  }
  
  getStoredSession() {
    return {
      token: this.storage.getItem('mv_session_token'),
      refreshToken: this.storage.getItem('mv_refresh_token'),
      expiresAt: this.storage.getItem('mv_expires_at')
    };
  }
  
  async validateSession() {
    const session = this.getStoredSession();
    
    if (!session.token) {
      return { valid: false, reason: 'no_token' };
    }
    
    // Check local expiration first
    const expiresAt = new Date(session.expiresAt);
    const now = new Date();
    
    if (now >= expiresAt) {
      return { valid: false, reason: 'expired' };
    }
    
    // Validate with server
    try {
      const response = await fetch(`${this.apiUrl}/auth/sessions/validate`, {
        headers: {
          'Authorization': `Bearer ${session.token}`
        }
      });
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      return { valid: false, reason: 'network_error' };
    }
  }
  
  async refreshSession() {
    const session = this.getStoredSession();
    
    if (!session.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await fetch(`${this.apiUrl}/auth/sessions/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refresh_token: session.refreshToken
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      this.storeSession(result.data);
      this.scheduleRefresh(result.data.expires_at);
      return result.data;
    }
    
    throw new Error(result.error.message);
  }
  
  scheduleRefresh(expiresAt) {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    
    const expirationTime = new Date(expiresAt).getTime();
    const refreshTime = expirationTime - (this.refreshThreshold * 1000);
    const delay = refreshTime - Date.now();
    
    if (delay > 0) {
      this.refreshTimer = setTimeout(async () => {
        try {
          await this.refreshSession();
        } catch (error) {
          console.error('Auto-refresh failed:', error);
          this.clearSession();
        }
      }, delay);
    }
  }
  
  clearSession() {
    this.storage.removeItem('mv_session_token');
    this.storage.removeItem('mv_refresh_token');
    this.storage.removeItem('mv_expires_at');
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
  
  async logout() {
    const session = this.getStoredSession();
    
    if (session.token) {
      try {
        await fetch(`${this.apiUrl}/auth/sessions/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.token}`
          }
        });
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }
    
    this.clearSession();
  }
}
```

### React Hook Integration

```jsx
import { useState, useEffect, useContext, createContext } from 'react';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionManager] = useState(new SessionManager({
    apiUrl: process.env.REACT_APP_API_URL
  }));
  
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const validation = await sessionManager.validateSession();
        
        if (validation.valid) {
          setSession({
            valid: true,
            ...sessionManager.getStoredSession(),
            permissions: validation.permissions
          });
        } else {
          setSession({ valid: false });
        }
      } catch (error) {
        console.error('Session initialization failed:', error);
        setSession({ valid: false });
      } finally {
        setLoading(false);
      }
    };
    
    initializeSession();
  }, [sessionManager]);
  
  const login = async (authData) => {
    setLoading(true);
    try {
      const sessionData = await sessionManager.createSession(authData);
      setSession({
        valid: true,
        ...sessionData
      });
      return sessionData;
    } catch (error) {
      setSession({ valid: false });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    await sessionManager.logout();
    setSession({ valid: false });
  };
  
  const value = {
    session,
    loading,
    login,
    logout,
    sessionManager
  };
  
  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};
```

## Security Features

### Token Security

```javascript
// Secure token storage for sensitive applications
class SecureStorage {
  constructor() {
    this.encryptionKey = this.generateKey();
  }
  
  generateKey() {
    // Generate encryption key from user's wallet signature
    return crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  async setItem(key, value) {
    const encrypted = await this.encrypt(value);
    sessionStorage.setItem(key, encrypted);
  }
  
  async getItem(key) {
    const encrypted = sessionStorage.getItem(key);
    if (!encrypted) return null;
    
    return await this.decrypt(encrypted);
  }
  
  async encrypt(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      await this.encryptionKey,
      dataBuffer
    );
    
    return JSON.stringify({
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted))
    });
  }
  
  async decrypt(encryptedData) {
    const { iv, data } = JSON.parse(encryptedData);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      await this.encryptionKey,
      new Uint8Array(data)
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }
}
```

### Session Monitoring

```javascript
class SessionMonitor {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
    this.activityThreshold = 30 * 60 * 1000; // 30 minutes
    this.lastActivity = Date.now();
    
    this.setupActivityTracking();
  }
  
  setupActivityTracking() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.updateActivity();
      }, { passive: true });
    });
    
    // Check for inactivity every minute
    setInterval(() => {
      this.checkInactivity();
    }, 60000);
  }
  
  updateActivity() {
    this.lastActivity = Date.now();
  }
  
  checkInactivity() {
    const now = Date.now();
    const timeSinceActivity = now - this.lastActivity;
    
    if (timeSinceActivity > this.activityThreshold) {
      this.handleInactivity();
    }
  }
  
  async handleInactivity() {
    // Warn user about inactivity
    const shouldExtend = confirm(
      'You have been inactive. Would you like to extend your session?'
    );
    
    if (shouldExtend) {
      try {
        await this.sessionManager.refreshSession();
        this.updateActivity();
      } catch (error) {
        console.error('Session extension failed:', error);
        await this.sessionManager.logout();
      }
    } else {
      await this.sessionManager.logout();
    }
  }
}
```

## Error Handling

### Session Error Types

```javascript
const SESSION_ERRORS = {
  EXPIRED: 'session_expired',
  INVALID: 'session_invalid',
  REFRESH_FAILED: 'refresh_failed',
  NETWORK_ERROR: 'network_error',
  PERMISSION_DENIED: 'permission_denied'
};

const handleSessionError = (error) => {
  switch (error.code) {
    case SESSION_ERRORS.EXPIRED:
      // Attempt automatic refresh
      return sessionManager.refreshSession();
      
    case SESSION_ERRORS.INVALID:
      // Clear session and redirect to login
      sessionManager.clearSession();
      window.location.href = '/login';
      break;
      
    case SESSION_ERRORS.REFRESH_FAILED:
      // Show re-authentication dialog
      showReauthDialog();
      break;
      
    case SESSION_ERRORS.NETWORK_ERROR:
      // Retry with exponential backoff
      return retryWithBackoff(() => sessionManager.validateSession());
      
    case SESSION_ERRORS.PERMISSION_DENIED:
      // Show permission upgrade dialog
      showPermissionUpgradeDialog();
      break;
      
    default:
      console.error('Unknown session error:', error);
  }
};
```

## Best Practices

### Security Guidelines

1. **Never store sensitive tokens in localStorage** for production apps
2. **Use secure, httpOnly cookies** when possible
3. **Implement proper CSRF protection**
4. **Validate sessions on every sensitive operation**
5. **Use short-lived tokens with refresh mechanisms**

### Performance Optimization

1. **Cache session validation results** for short periods
2. **Implement background refresh** to avoid user interruption
3. **Use WebSocket connections** for real-time session updates
4. **Minimize token payload size**

### User Experience

1. **Provide clear session status indicators**
2. **Warn users before session expiration**
3. **Offer seamless session extension**
4. **Handle network interruptions gracefully**

## Next Steps

- [User Profile Management](../users/profile-management)
- [Profile Management](../users/profile-management)
- [Therapy Session Booking](../therapy/booking)