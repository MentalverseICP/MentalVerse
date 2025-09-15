// frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';
import { icAgent } from '../services/icAgent';

// Define User type
interface User {
  principal: string;
  email?: string;
  walletAddress?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  principal?: string;
  identity?: Identity;
  authClient?: AuthClient;
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [principal, setPrincipal] = useState<string | undefined>();
  const [identity, setIdentity] = useState<Identity | undefined>();
  const [authClient, setAuthClient] = useState<AuthClient | undefined>();
  const [user, setUser] = useState<User | null>(null);

  const INTERNET_IDENTITY_URL = import.meta.env.VITE_INTERNET_IDENTITY_URL || 'https://identity.ic0.app/#authorize';
  const MAX_TIME_TO_LIVE = BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000); // 7 days in nanoseconds

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const client = await AuthClient.create({
        idleOptions: {
          disableIdle: true,
          disableDefaultIdleCallback: true,
        },
      });
      
      setAuthClient(client);
      
      const authenticated = await client.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const userIdentity = client.getIdentity();
        const userPrincipal = userIdentity.getPrincipal().toString();
        
        setIdentity(userIdentity);
        setPrincipal(userPrincipal);
        setUser({ principal: userPrincipal });
        
        // Initialize IC agents with the authenticated identity
        await icAgent.initializeAgent(userIdentity);
        
        console.log('User authenticated with principal:', userPrincipal);
      } else {
        // Initialize IC agents without identity for anonymous calls
        await icAgent.initializeAgent();
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (): Promise<void> => {
    if (!authClient) {
      throw new Error('AuthClient not initialized');
    }

    try {
      setIsLoading(true);
      
      await new Promise<void>((resolve, reject) => {
        authClient.login({
          identityProvider: INTERNET_IDENTITY_URL,
          maxTimeToLive: MAX_TIME_TO_LIVE,
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      });

      const userIdentity = authClient.getIdentity();
      const userPrincipal = userIdentity.getPrincipal().toString();
      
      setIsAuthenticated(true);
      setIdentity(userIdentity);
      setPrincipal(userPrincipal);
      setUser({ principal: userPrincipal });
      
      // Update IC agents with the new identity
      await icAgent.updateIdentity(userIdentity);
      
      console.log('Login successful, principal:', userPrincipal);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    if (!authClient) {
      throw new Error('AuthClient not initialized');
    }

    try {
      setIsLoading(true);
      
      await authClient.logout();
      
      setIsAuthenticated(false);
      setIdentity(undefined);
      setPrincipal(undefined);
      setUser(null);
      
      // Reset IC agents
      icAgent.reset();
      
      // Reinitialize IC agents for anonymous calls
      await icAgent.initializeAgent();
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async (): Promise<void> => {
    if (!authClient) {
      return;
    }

    try {
      const authenticated = await authClient.isAuthenticated();
      
      if (authenticated !== isAuthenticated) {
        if (authenticated) {
          const userIdentity = authClient.getIdentity();
          const userPrincipal = userIdentity.getPrincipal().toString();
          
          setIsAuthenticated(true);
          setIdentity(userIdentity);
          setPrincipal(userPrincipal);
          setUser({ principal: userPrincipal });
          
          await icAgent.updateIdentity(userIdentity);
        } else {
          setIsAuthenticated(false);
          setIdentity(undefined);
          setPrincipal(undefined);
          setUser(null);
          
          icAgent.reset();
          await icAgent.initializeAgent();
        }
      }
    } catch (error) {
      console.error('Failed to refresh auth:', error);
    }
  };

  const value: AuthState = {
    isAuthenticated,
    isLoading,
    principal,
    identity,
    authClient,
    user,
    login,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protected routes
export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to access this page.</p>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
};

export default AuthContext;