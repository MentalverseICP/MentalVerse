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
      
      // Create AuthClient with improved configuration for reconnects
      const client = await AuthClient.create({
        idleOptions: {
          disableIdle: true,
          disableDefaultIdleCallback: true,
        },
        // Add storage options for better session persistence
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      });
      
      setAuthClient(client);
      
      // Check if user is already authenticated with retry logic
      let authenticated = false;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (!authenticated && retryCount < maxRetries) {
        try {
          authenticated = await client.isAuthenticated();
          if (authenticated) break;
          
          // Wait before retry to handle network issues
          if (retryCount < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          }
        } catch (error) {
          console.warn(`Auth check attempt ${retryCount + 1} failed:`, error);
        }
        retryCount++;
      }
      
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const userIdentity = client.getIdentity();
        
        // Validate identity before proceeding
        if (userIdentity && userIdentity.getPrincipal && !userIdentity.getPrincipal().isAnonymous()) {
          const userPrincipal = userIdentity.getPrincipal().toString();
          
          setIdentity(userIdentity);
          setPrincipal(userPrincipal);
          setUser({ principal: userPrincipal });
          
          // Initialize IC agents with the authenticated identity
          try {
            await icAgent.initializeAgent(userIdentity);
            console.log('User authenticated and IC agent initialized:', userPrincipal);
          } catch (agentError) {
            console.error('Failed to initialize IC agent:', agentError);
            // Don't fail auth if agent init fails, but log the error
          }
        } else {
          console.warn('Invalid or anonymous identity detected, treating as unauthenticated');
          setIsAuthenticated(false);
          setIdentity(undefined);
          setPrincipal(undefined);
          setUser(null);
        }
      } else {
        console.log('User is not authenticated after retries');
        // Initialize IC agents without identity for anonymous calls
        await icAgent.initializeAgent();
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setIsAuthenticated(false);
      setIdentity(undefined);
      setPrincipal(undefined);
      setUser(null);
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
      
      // Check if already authenticated to prevent duplicate login attempts
      const isAlreadyAuth = await authClient.isAuthenticated();
      if (isAlreadyAuth) {
        const existingIdentity = authClient.getIdentity();
        if (existingIdentity && !existingIdentity.getPrincipal().isAnonymous()) {
          console.log('User already authenticated, skipping login');
          const userPrincipal = existingIdentity.getPrincipal().toString();
          
          setIsAuthenticated(true);
          setIdentity(existingIdentity);
          setPrincipal(userPrincipal);
          setUser({ principal: userPrincipal });
          
          // Ensure IC agent is initialized
          try {
            await icAgent.updateIdentity(existingIdentity);
          } catch (agentError) {
            console.error('Failed to initialize IC agent on existing auth:', agentError);
          }
          
          return;
        }
      }
      
      await new Promise<void>((resolve, reject) => {
        authClient.login({
          identityProvider: INTERNET_IDENTITY_URL,
          maxTimeToLive: MAX_TIME_TO_LIVE,
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      });

      const userIdentity = authClient.getIdentity();
      
      // Validate identity before setting state
      if (userIdentity && userIdentity.getPrincipal && !userIdentity.getPrincipal().isAnonymous()) {
        const userPrincipal = userIdentity.getPrincipal().toString();
        
        setIsAuthenticated(true);
        setIdentity(userIdentity);
        setPrincipal(userPrincipal);
        setUser({ principal: userPrincipal });
        
        // Update IC agents with the new identity
        try {
          await icAgent.updateIdentity(userIdentity);
          console.log('Login successful and IC agent initialized:', userPrincipal);
        } catch (agentError) {
          console.error('Failed to initialize IC agent after login:', agentError);
          // Don't fail login if agent init fails
        }
      } else {
        console.error('Invalid identity received after login');
        setIsAuthenticated(false);
        setIdentity(undefined);
        setPrincipal(undefined);
        setUser(null);
        throw new Error('Invalid identity received after login');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setIsAuthenticated(false);
      setIdentity(undefined);
      setPrincipal(undefined);
      setUser(null);
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
      
      // Clear authentication state immediately to prevent UI issues
      setIsAuthenticated(false);
      setIdentity(undefined);
      setPrincipal(undefined);
      setUser(null);
      
      // Clear any stored user data and session information
      localStorage.removeItem('userRole');
      localStorage.removeItem('userOnboardingComplete');
      
      // Logout from AuthClient
      await authClient.logout();
      
      // Reset IC agents
      try {
        icAgent.reset();
        // Reinitialize IC agents for anonymous calls
        await icAgent.initializeAgent();
      } catch (agentError) {
        console.warn('Failed to reset IC agent during logout:', agentError);
      }
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
      // Ensure state is cleared even if logout fails
      setIsAuthenticated(false);
      setIdentity(undefined);
      setPrincipal(undefined);
      setUser(null);
      localStorage.removeItem('userRole');
      localStorage.removeItem('userOnboardingComplete');
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
          
          // Validate identity before updating state
          if (userIdentity && userIdentity.getPrincipal && !userIdentity.getPrincipal().isAnonymous()) {
            const userPrincipal = userIdentity.getPrincipal().toString();
            
            setIsAuthenticated(true);
            setIdentity(userIdentity);
            setPrincipal(userPrincipal);
            setUser({ principal: userPrincipal });
            
            // Update IC agent with refreshed identity
            try {
              await icAgent.updateIdentity(userIdentity);
              console.log('Auth refreshed successfully:', userPrincipal);
            } catch (agentError) {
              console.error('Failed to update IC agent during refresh:', agentError);
              // Don't fail refresh if agent update fails
            }
          } else {
            console.warn('Invalid identity during refresh, logging out');
            setIsAuthenticated(false);
            setIdentity(undefined);
            setPrincipal(undefined);
            setUser(null);
            // Clear potentially corrupted session data
            localStorage.removeItem('userRole');
            localStorage.removeItem('userOnboardingComplete');
          }
        } else {
          console.log('User no longer authenticated during refresh');
          setIsAuthenticated(false);
          setIdentity(undefined);
          setPrincipal(undefined);
          setUser(null);
          
          // Clear session data when auth is lost
          localStorage.removeItem('userRole');
          localStorage.removeItem('userOnboardingComplete');
          
          icAgent.reset();
          await icAgent.initializeAgent();
        }
      }
    } catch (error) {
      console.error('Failed to refresh auth:', error);
      setIsAuthenticated(false);
      setIdentity(undefined);
      setPrincipal(undefined);
      setUser(null);
      // Clear potentially corrupted session data
      localStorage.removeItem('userRole');
      localStorage.removeItem('userOnboardingComplete');
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