import { useState, useEffect, useCallback } from 'react';
import { Principal } from '@dfinity/principal';
import { authService, BackendService } from '../services/backend';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userPrincipal: Principal | null;
  userRole: string | null;
  actor: BackendService | null;
}

export interface AuthActions {
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  registerUser: (userData: { firstName: string; lastName: string; email: string; phoneNumber?: string; userType: 'patient' | 'therapist' }) => Promise<{ success: boolean; message: string; isExistingUser?: boolean; userRole?: string }>;
  refreshAuth: () => Promise<void>;
}

export const useAuth = (): AuthState & AuthActions => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    userPrincipal: null,
    userRole: null,
    actor: null,
  });

  // Initialize auth service
  useEffect(() => {
    const initAuth = async () => {
      try {
        await authService.init();
        updateAuthState();
      } catch (error) {
        console.error('Failed to initialize auth service:', error);
      } finally {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const updateAuthState = useCallback(() => {
    setAuthState({
      isAuthenticated: authService.getIsAuthenticated(),
      isLoading: false,
      userPrincipal: authService.getUserPrincipal(),
      userRole: authService.getUserRole(),
      actor: authService.getActor(),
    });
  }, []);

  const login = useCallback(async (): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const success = await authService.login();
      updateAuthState();
      return success;
    } catch (error) {
      console.error('Login failed:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [updateAuthState]);

  const logout = useCallback(async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await authService.logout();
      updateAuthState();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [updateAuthState]);

  const registerUser = useCallback(async (userData: { firstName: string; lastName: string; email: string; phoneNumber?: string; userType: 'patient' | 'therapist' }): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await authService.registerUser(userData);
      if (result.success) {
        updateAuthState();
      }
      return result;
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, message: 'Registration failed' };
    }
  }, [updateAuthState]);

  const refreshAuth = useCallback(async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await authService.init();
      updateAuthState();
    } catch (error) {
      console.error('Failed to refresh auth:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [updateAuthState]);

  return {
    ...authState,
    login,
    logout,
    registerUser,
    refreshAuth,
  };
};

// Custom hook for backend operations
export const useBackend = () => {
  const { actor, isAuthenticated } = useAuth();

  const withAuth = useCallback(<T extends any[], R>(
    operation: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R> => {
      if (!isAuthenticated || !actor) {
        throw new Error('User not authenticated');
      }
      return operation(...args);
    };
  }, [actor, isAuthenticated]);

  return {
    actor,
    isAuthenticated,
    withAuth,
  };
};

// Hook for patient operations
export const usePatient = () => {
  const { actor, withAuth } = useBackend();

  const createProfile = withAuth(async (patientData: any) => {
    return actor!.createPatientProfile(patientData);
  });

  const getProfile = withAuth(async () => {
    return actor!.getPatientProfile();
  });

  const getAppointments = withAuth(async () => {
    return actor!.getPatientAppointments();
  });

  const getMedicalRecords = withAuth(async () => {
    return actor!.getPatientMedicalRecords();
  });

  const createAppointment = withAuth(async (appointmentData: any) => {
    return actor!.createAppointment(appointmentData);
  });

  return {
    createProfile,
    getProfile,
    getAppointments,
    getMedicalRecords,
    createAppointment,
  };
};

// Hook for doctor operations
export const useDoctor = () => {
  const { actor, withAuth } = useBackend();

  const createProfile = withAuth(async (doctorData: any) => {
    return actor!.createDoctorProfile(doctorData);
  });

  const getAppointments = withAuth(async () => {
    return actor!.getDoctorAppointments();
  });

  const createMedicalRecord = withAuth(async (recordData: any) => {
    return actor!.createMedicalRecord(recordData);
  });

  const updateAppointmentStatus = withAuth(async (appointmentId: string, status: any) => {
    return actor!.updateAppointmentStatus(appointmentId, status);
  });

  return {
    createProfile,
    getAppointments,
    createMedicalRecord,
    updateAppointmentStatus,
  };
};

// Hook for messaging
export const useMessaging = () => {
  const { actor, withAuth } = useBackend();

  const sendMessage = withAuth(async (receiverId: Principal, content: string, messageType: string = 'text') => {
    return actor!.sendMessage(receiverId, content, messageType);
  });

  const getMessages = withAuth(async (otherUserId: Principal) => {
    return actor!.getMessages(otherUserId);
  });

  const markAsRead = withAuth(async (messageId: string) => {
    return actor!.markMessageAsRead(messageId);
  });

  return {
    sendMessage,
    getMessages,
    markAsRead,
  };
};

// Hook for system operations
export const useSystem = () => {
  const { actor } = useBackend();

  const healthCheck = async () => {
    if (!actor) return null;
    return actor.healthCheck();
  };

  const getStats = async () => {
    if (!actor) return null;
    return actor.getSystemStats();
  };

  const getAllDoctors = async () => {
    if (!actor) return [];
    return actor.getAllDoctors();
  };

  return {
    healthCheck,
    getStats,
    getAllDoctors,
  };
};