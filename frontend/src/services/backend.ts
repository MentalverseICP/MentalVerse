/// <reference types="vite/client" />
import { HttpAgent, Actor } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { secureMessagingService, SecureMessagingService } from './secureMessaging';
import { idlFactory, _SERVICE as MentalverseService } from '../declarations/mentalverse_backend';

// Import the generated declarations (these will be created after deployment)
// import { mentalverse_backend } from '../../../declarations/mentalverse_backend';

// Backend service interface
export interface BackendService {
  // Authentication
  registerUser: (userData: { firstName: string; lastName: string; email: string; userType: { patient?: null; therapist?: null; admin?: null } }) => Promise<{ ok?: string; err?: string }>;
  completeOnboarding: (userType: { patient?: null; therapist?: null; admin?: null }, additionalData: { bio?: string; profilePicture?: string }) => Promise<{ ok?: string; err?: string }>;
  getCurrentUser: () => Promise<{ ok?: { id: Principal; role: string }; err?: string }>;
  get_user_profile: (principal: Principal) => Promise<{ ok?: any; err?: string }>;
  create_user_profile: (userData: { firstName: string; lastName: string; email: string; userType: { patient?: null; therapist?: null; admin?: null } }) => Promise<{ ok?: string; err?: string }>;
  
  // Token operations
  getTokenBalance: () => Promise<{ Ok?: number; Err?: string }>;
  transferTokens: (to: Principal, amount: number) => Promise<{ Ok?: string; Err?: string }>;
  stakeTokens: (amount: number, lockPeriod: number) => Promise<{ Ok?: string; Err?: string }>;
  unstakeTokens: (amount: number) => Promise<{ Ok?: string; Err?: string }>;
  claimStakingRewards: () => Promise<{ Ok?: number; Err?: string }>;
  getUserStake: () => Promise<{ Ok?: StakeInfo; Err?: string }>;
  getTransactionHistory: (limit?: bigint[], offset?: bigint[]) => Promise<{ Ok?: any[]; Err?: string }>;
  getUserEarningHistory: () => Promise<{ Ok?: EarningRecord[]; Err?: string }>;
  getUserSpendingHistory: () => Promise<{ Ok?: SpendingRecord[]; Err?: string }>;
  earnTokens: (amount: number, reason: string) => Promise<{ Ok?: string; Err?: string }>;
  spendTokens: (amount: number, reason: string) => Promise<{ Ok?: string; Err?: string }>;
  
  // Faucet operations
  getFaucetStats: () => Promise<{ Ok?: FaucetStats; Err?: string }>;
  getFaucetClaimHistory: () => Promise<{ Ok?: FaucetClaim[]; Err?: string }>;
  claimFaucetTokens: () => Promise<{ Ok?: string; Err?: string }>;
  
  // Patient management
  createPatientProfile: (patientData: PatientData) => Promise<{ Ok?: Patient; Err?: string }>;
  getPatientProfile: () => Promise<{ Ok?: Patient; Err?: string }>;
  
  // Doctor management
  createDoctorProfile: (doctorData: DoctorData) => Promise<{ Ok?: Doctor; Err?: string }>;
  getAllDoctors: () => Promise<{ Ok?: Doctor[]; Err?: string }>;
  getDoctorById: (doctorId: string) => Promise<{ Ok?: Doctor; Err?: string }>;
  
  // Appointment management
  createAppointment: (appointmentData: AppointmentData) => Promise<{ Ok?: Appointment; Err?: string }>;
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => Promise<{ Ok?: Appointment; Err?: string }>;
  getPatientAppointments: () => Promise<{ Ok?: Appointment[]; Err?: string }>;
  getDoctorAppointments: () => Promise<{ Ok?: Appointment[]; Err?: string }>;
  
  // Medical records
  createMedicalRecord: (recordData: MedicalRecordData) => Promise<{ Ok?: MedicalRecord; Err?: string }>;
  getPatientMedicalRecords: (patientId?: Principal) => Promise<{ Ok?: MedicalRecord[]; Err?: string }>;
  getMedicalRecordById: (recordId: string) => Promise<{ Ok?: MedicalRecord; Err?: string }>;
  createSessionNote: (patientId: Principal, content: string, sessionId?: string) => Promise<{ Ok?: string; Err?: string }>;
  getSessionNotes: (patientId?: Principal) => Promise<{ Ok?: SessionNote[]; Err?: string }>;
  createPrescription: (patientId: Principal, medication: string, dosage: string, instructions: string, duration: string) => Promise<{ Ok?: string; Err?: string }>;
  getPrescriptions: (patientId?: Principal) => Promise<{ Ok?: Prescription[]; Err?: string }>;
  createTreatmentSummary: (patientId: Principal, summary: string, recommendations: string[], nextAppointment?: string) => Promise<{ Ok?: string; Err?: string }>;
  getTreatmentSummaries: (patientId?: Principal) => Promise<{ Ok?: TreatmentSummary[]; Err?: string }>;
  grantMedicalRecordAccess: (recordId: string, userId: Principal, accessLevel: string) => Promise<{ Ok?: string; Err?: string }>;
  revokeMedicalRecordAccess: (recordId: string, userId: Principal) => Promise<{ Ok?: string; Err?: string }>;
  getAuditLogs: (recordTypeOpt?: { [key: string]: null }[], recordIdOpt?: string[], limitOpt?: bigint[]) => Promise<{ ok?: AuditLog[]; err?: string }>;
  
  // Messaging
  sendMessage: (receiverId: Principal, content: string, messageType: string) => Promise<{ Ok?: Message; Err?: string }>;
  getMessages: (otherUserId: Principal) => Promise<{ Ok?: Message[]; Err?: string }>;
  markMessageAsRead: (messageId: string) => Promise<{ Ok?: string; Err?: string }>;
  
  // Secure messaging
  createTherapyConversation: (therapistId: Principal, sessionId: string) => Promise<{ ok?: string; err?: string }>;
  sendSecureMessage: (conversationId: string, recipientId: Principal, content: string, messageType: { [key: string]: null }) => Promise<{ ok?: string; err?: string }>;
  getUserSecureConversations: () => Promise<{ ok?: SecureConversation[]; err?: string }>;
  getSecureConversationMessages: (conversationId: string, limit?: bigint[], offset?: bigint[]) => Promise<{ ok?: SecureMessage[]; err?: string }>;
  registerUserEncryptionKey: (publicKey: string, keyType: { RSA2048?: null; ECDSA?: null; Ed25519?: null }) => Promise<{ ok?: string; err?: string }>;
  getSecureMessagingHealth: () => Promise<{ status: string; timestamp: bigint }>;
  
  // System
  healthCheck: () => Promise<{ Ok?: { status: string; timestamp: bigint }; Err?: string }>;
  getSystemStats: () => Promise<{ Ok?: SystemStats; Err?: string }>;
}

// Token-related type definitions
export interface TokenBalance {
  total: number;
  available: number;
  staked: number;
  pending: number;
  balance: number; // Add balance property
}

export interface StakeInfo {
  amount: number;
  lockPeriod: number;
  startTime: number;
  endTime: number;
  unlockTime: number; // Add unlockTime property
  stakeTime: number; // Add stakeTime property
  rewardRate: number;
  accumulatedRewards: number;
  rewards: number; // Add rewards property
}

export interface Transaction {
  id: string;
  type: 'transfer' | 'earn' | 'spend' | 'stake' | 'unstake';
  amount: number;
  timestamp: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  from?: string;
  to?: string;
}

export interface EarningRecord {
  id: string;
  type: 'appointment_completion' | 'platform_usage' | 'patient_feedback' | 'doctor_consultation';
  amount: number;
  timestamp: number;
  description: string;
}

export interface SpendingRecord {
  id: string;
  type: 'premium_consultation' | 'priority_booking' | 'advanced_features';
  amount: number;
  timestamp: number;
  description: string;
}

// Type definitions matching the Motoko backend
export interface PatientData {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  emergencyContact: string;
}

export interface Patient {
  id: Principal;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  emergencyContact: string;
  medicalHistory: string[];
  allergies: string[];
  currentMedications: string[];
  createdAt: bigint;
  updatedAt: bigint;
}

export interface DoctorData {
  firstName: string;
  lastName: string;
  email: string;
  specialty: string;
  licenseNumber: string;
  yearsOfExperience: number;
  education: string[];
  certifications: string[];
  consultationFee: number;
}

export interface Doctor {
  id: string;
  userId: Principal;
  firstName: string;
  lastName: string;
  email: string;
  specialty: string;
  licenseNumber: string;
  yearsOfExperience: number;
  education: string[];
  certifications: string[];
  availableHours: string;
  consultationFee: number;
  rating: number;
  totalAppointments: number;
  isVerified: boolean;
  isOnline: boolean;
  createdAt: bigint;
  updatedAt: bigint;
}

export type AppointmentStatus = 
  | { scheduled: null }
  | { confirmed: null }
  | { inProgress: null }
  | { completed: null }
  | { cancelled: null }
  | { rescheduled: null };

export type AppointmentType = 
  | { consultation: null }
  | { followUp: null }
  | { emergency: null }
  | { routine: null }
  | { therapy: null }
  | { examination: null };

export interface AppointmentData {
  doctorId: string;
  appointmentType: AppointmentType;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  notes: string;
  symptoms: string[];
}

export interface Appointment {
  id: string;
  patientId: Principal;
  doctorId: string;
  appointmentType: AppointmentType;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string;
  symptoms: string[];
  diagnosis: string;
  prescription: string;
  followUpRequired: boolean;
  followUpDate?: string;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface MedicalRecordData {
  patientId: Principal;
  appointmentId?: string;
  recordType: string;
  title: string;
  description: string;
  attachments: string[];
  isConfidential: boolean;
}

export interface MedicalRecord {
  id: string;
  patientId: Principal;
  doctorId: string;
  appointmentId?: string;
  recordType: string;
  title: string;
  description: string;
  attachments: string[];
  isConfidential: boolean;
  accessPermissions: Principal[];
  createdAt: bigint;
  updatedAt: bigint;
}

export interface Message {
  id: string;
  senderId: Principal;
  receiverId: Principal;
  content: string;
  messageType: string;
  attachments: string[];
  isRead: boolean;
  isEncrypted: boolean;
  timestamp: bigint;
}

export interface SystemStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  totalMedicalRecords: number;
  totalMessages: number;
}

export interface SessionNote {
  id: string;
  patientId: Principal;
  doctorId: Principal;
  content: string;
  sessionId?: string;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface Prescription {
  id: string;
  patientId: Principal;
  doctorId: Principal;
  medication: string;
  dosage: string;
  instructions: string;
  duration: string;
  isActive: boolean;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface TreatmentSummary {
  id: string;
  patientId: Principal;
  doctorId: Principal;
  summary: string;
  recommendations: string[];
  nextAppointment?: string;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface AuditLog {
  id: string;
  userId: Principal;
  action: string;
  resourceId: string;
  resourceType: string;
  details: string;
  timestamp: bigint;
}

export interface SecureConversation {
  id: string;
  participants: Principal[];
  sessionId?: string;
  isActive: boolean;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface SecureMessage {
  id: string;
  conversationId: string;
  senderId: Principal;
  content: string;
  messageType: string;
  isEncrypted: boolean;
  timestamp: bigint;
}

export interface FaucetStats {
  dailyLimit: number;
  claimedToday: number;
  totalClaimed: number;
  nextClaimTime: number;
}

export interface FaucetClaim {
  id: string;
  amount: number;
  timestamp: number;
  status: 'completed' | 'pending' | 'failed';
}

// Authentication service using Internet Identity
export class AuthService {
  private authClient: AuthClient | null = null;
  private actor: BackendService | null = null;
  private secureMessaging: SecureMessagingService | null = null;
  private isAuthenticated = false;
  private userPrincipal: Principal | null = null;
  private userRole: string | null = null;

  async init(): Promise<void> {
    this.authClient = await AuthClient.create();
    
    if (await this.authClient.isAuthenticated()) {
      await this.handleAuthenticated();
    }
  }

  async login(): Promise<boolean> {
    if (!this.authClient) {
      throw new Error('AuthClient not initialized');
    }

    return new Promise((resolve) => {
      this.authClient!.login({
        identityProvider: (globalThis as any).VITE_INTERNET_IDENTITY_URL || 'https://identity.ic0.app/#authorize',
        onSuccess: async () => {
          await this.handleAuthenticated();
          resolve(true);
        },
        onError: (error) => {
          console.error('Login failed:', error);
          resolve(false);
        },
      });
    });
  }

  async logout(): Promise<void> {
    if (this.authClient) {
      await this.authClient.logout();
      this.isAuthenticated = false;
      this.userPrincipal = null;
      this.userRole = null;
      this.actor = null;
      this.secureMessaging = null;
    }
  }

  private async handleAuthenticated(): Promise<void> {
    if (!this.authClient) return;

    const identity = this.authClient.getIdentity();
    this.userPrincipal = identity.getPrincipal();
    this.isAuthenticated = true;

    // Create actor with authenticated identity
    const agent = new HttpAgent({
      identity,
      host: (globalThis as any).VITE_IC_HOST || 'https://ic0.app',
    });

    // In development, fetch root key
    if ((globalThis as any).DEV || process.env.NODE_ENV === 'development') {
      await agent.fetchRootKey();
    }

    // Use the statically imported idlFactory and type the actor with MentalverseService
    const canisterId = (globalThis as any).VITE_CANISTER_MENTALVERSE_BACKEND || 'cytcv-raaaa-aaaac-a4aoa-cai';
    this.actor = Actor.createActor(idlFactory, { agent, canisterId }) as MentalverseService & BackendService;
    
    // Mock actor is no longer needed as we're using the real implementation
    // this.actor = this.createMockActor();

    // Initialize secure messaging service
    try {
      await secureMessagingService.init(this.authClient!);
      this.secureMessaging = secureMessagingService;
    } catch (error) {
      console.error('Failed to initialize secure messaging:', error);
    }

    // Get user role and check if user is already registered
    try {
      const result = await this.actor.getCurrentUser();
      if ('ok' in result && result.ok) {
        this.userRole = result.ok.role;
        // Store user role in localStorage for immediate access
        localStorage.setItem('userRole', result.ok.role === 'doctor' ? 'therapist' : result.ok.role);
        console.log('✅ User already registered with role:', result.ok.role);
      }
    } catch (error) {
      console.error('Failed to get user role (user may not be registered yet):', error);
      // Clear any existing role from localStorage if user is not registered
      localStorage.removeItem('userRole');
    }
  }



  getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  getUserPrincipal(): Principal | null {
    return this.userPrincipal;
  }

  getUserRole(): string | null {
    return this.userRole;
  }

  getActor(): BackendService | null {
    return this.actor;
  }

  getSecureMessaging(): SecureMessagingService | null {
    return this.secureMessaging;
  }

  async checkUserExists(): Promise<{ exists: boolean; userRole?: string }> {
    if (!this.actor || !this.isAuthenticated) {
      return { exists: false };
    }

    try {
      const result = await this.actor.getCurrentUser();
      if ('ok' in result && result.ok) {
        // User exists and has a role
        const userRole = result.ok.role === 'doctor' ? 'therapist' : result.ok.role;
        this.userRole = userRole;
        // Store user role in localStorage for immediate access
        localStorage.setItem('userRole', userRole);
        return { exists: true, userRole };
      }
      return { exists: false };
    } catch (error) {
      console.error('Failed to check if user exists:', error);
      return { exists: false };
    }
  }

  async checkUserProfile(): Promise<{ hasProfile: boolean; profile?: any }> {
    if (!this.actor || !this.isAuthenticated || !this.userPrincipal) {
      return { hasProfile: false };
    }

    try {
      const result = await this.actor.get_user_profile(this.userPrincipal);
      if ('ok' in result && result.ok) {
        return { hasProfile: true, profile: result.ok };
      }
      return { hasProfile: false };
    } catch (error) {
      console.error('Failed to check user profile:', error);
      return { hasProfile: false };
    }
  }

  async createUserProfile(userData: any): Promise<{ success: boolean; message: string }> {
    if (!this.actor || !this.isAuthenticated || !this.userPrincipal) {
      return { success: false, message: 'Not authenticated' };
    }

    try {
      // Get userType from userData.role or stored userRole
      const userType = userData.role || userData.userType || this.userRole;
      if (!userType) {
        return { success: false, message: 'User type is required' };
      }

      // Convert userType string to Motoko variant format
      const userTypeVariant = userType === 'therapist' ? { therapist: null } : 
                             userType === 'admin' ? { admin: null } : 
                             { patient: null };

      // Transform the data to match backend expectations - include userType
      const backendUserData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        userType: userTypeVariant
      };
      
      console.log('🔍 Creating user profile with data:', backendUserData);
      
      // Fix: Call with only userData parameter, not principal + userData
      const result = await this.actor.create_user_profile(backendUserData);
      if ('ok' in result && result.ok) {
        return { success: true, message: 'Profile created successfully' };
      }
      return { success: false, message: result.err || 'Failed to create profile' };
    } catch (error) {
      console.error('Failed to create user profile:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      return { success: false, message: `Failed to create profile: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  async registerUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    userType: 'patient' | 'therapist';
  }): Promise<{ success: boolean; message: string; isExistingUser?: boolean; userRole?: string }> {
    console.log('🔍 RegisterUser called with data:', userData);
    console.log('🔍 Actor available:', !!this.actor);
    console.log('🔍 Is authenticated:', this.isAuthenticated);
    
    if (!this.actor) {
      console.error('❌ No actor available - not authenticated');
      return { success: false, message: 'Not authenticated' };
    }

    try {
      // Convert userType string to Motoko variant format
      const userTypeVariant = userData.userType === 'therapist' ? { therapist: null } : { patient: null };
      
      const backendData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        userType: userTypeVariant
      };
      
      console.log('🔍 Sending to backend:', backendData);
      
      const result = await this.actor.registerUser(backendData);
      
      console.log('🔍 Backend response:', result);
      
      if ('ok' in result && result.ok) {
        this.userRole = userData.userType;
        // Store user role in localStorage for immediate access
        localStorage.setItem('userRole', this.userRole === 'therapist' ? 'therapist' : 'patient');
        console.log('✅ Registration successful');
        return { success: true, message: 'User registered successfully' };
      } else if ('err' in result && result.err) {
        const errorMessage = result.err;
        console.error('❌ Backend returned error:', errorMessage);
        
        // Handle "User already registered" case
        if (errorMessage === 'User already registered') {
          console.log('🔍 User already registered, checking existing user role...');
          
          try {
            // Get the existing user's role
            const userResult = await this.actor.getCurrentUser();
            console.log('🔍 Existing user result:', userResult);
            
            if ('ok' in userResult && userResult.ok) {
              const userData = userResult.ok;
              const existingRole = userData.role;
              this.userRole = existingRole === 'doctor' ? 'therapist' : existingRole;
              
              // Store the existing user's role in localStorage
              localStorage.setItem('userRole', this.userRole!);
              console.log('✅ Existing user found with role:', this.userRole);
              
              return { 
                success: true, 
                message: 'User already registered', 
                isExistingUser: true, 
                userRole: this.userRole || undefined 
              };
            } else {
              console.error('❌ Failed to get existing user role');
              return { success: false, message: 'User already registered but could not retrieve user information' };
            }
          } catch (getUserError) {
            console.error('❌ Error getting existing user:', getUserError);
            return { success: false, message: 'User already registered but could not retrieve user information' };
          }
        }
        
        return { success: false, message: errorMessage };
      } else {
        console.error('❌ Unexpected backend response format:', result);
        return { success: false, message: 'Unexpected response format from backend' };
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      return { success: false, message: `Registration failed: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  async getTokenBalance(): Promise<TokenBalance> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }

    try {
      const result = await this.actor.getTokenBalance();
      if ('Ok' in result && typeof result.Ok === 'number') {
        return {
          total: result.Ok,
          available: result.Ok,
          staked: 0,
          pending: 0,
          balance: result.Ok
        };
      } else {
        throw new Error('Failed to get token balance');
      }
    } catch (error) {
      console.error('Get token balance error:', error);
      throw error;
    }
  }

  async getTransactionHistory(): Promise<Transaction[]> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }

    try {
      const result = await this.actor.getTransactionHistory([BigInt(50)], [BigInt(0)]);
      if (result.Ok) {
        return result.Ok.map((tx: any) => ({
          id: tx.id || '',
          type: tx.type || 'transfer',
          amount: Number(tx.amount) || 0,
          timestamp: Number(tx.timestamp) || Date.now(),
          description: tx.description || '',
          status: tx.status || 'completed',
          from: tx.from,
          to: tx.to
        }));
      } else if (result.Err) {
        throw new Error(`Failed to get transaction history: ${result.Err}`);
      } else {
        throw new Error('Failed to get transaction history');
      }
    } catch (error) {
      console.error('Get transaction history error:', error);
      throw error;
    }
  }

  async getUserStake(): Promise<StakeInfo> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }

    try {
      const result = await this.actor.getUserStake();
      if ('Ok' in result && result.Ok) {
        return result.Ok;
      } else {
        throw new Error('Failed to get user stake');
      }
    } catch (error) {
      console.error('Get user stake error:', error);
      throw error;
    }
  }

  async stakeTokens(amount: number, lockPeriod: number): Promise<void> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }

    try {
      const result = await this.actor.stakeTokens(amount, lockPeriod);
      if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      }
    } catch (error) {
      console.error('Stake tokens error:', error);
      throw error;
    }
  }

  async unstakeTokens(amount: number): Promise<void> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }

    try {
      const result = await this.actor.unstakeTokens(amount);
      if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      }
    } catch (error) {
      console.error('Unstake tokens error:', error);
      throw error;
    }
  }

  async transferTokens(to: string, amount: number): Promise<void> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }

    try {
      const toPrincipal = Principal.fromText(to);
      const result = await this.actor.transferTokens(toPrincipal, amount);
      if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      }
    } catch (error) {
      console.error('Transfer tokens error:', error);
      throw error;
    }
  }

  async claimStakingRewards(): Promise<number> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }

    try {
      const result = await this.actor.claimStakingRewards();
      if ('Ok' in result && result.Ok !== undefined) {
        return result.Ok;
      } else if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      } else {
        throw new Error('Failed to claim staking rewards');
      }
    } catch (error) {
      console.error('Claim staking rewards error:', error);
      throw error;
    }
  }

  async getUserEarningHistory(): Promise<EarningRecord[]> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }

    try {
      const result = await this.actor.getUserEarningHistory();
      if (result.Ok) {
        return result.Ok;
      } else if (result.Err) {
        throw new Error(`Failed to get user earning history: ${result.Err}`);
      } else {
        throw new Error('Failed to get user earning history');
      }
    } catch (error) {
      console.error('Get user earning history error:', error);
      throw error;
    }
  }

  async getUserSpendingHistory(): Promise<SpendingRecord[]> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }

    try {
      const result = await this.actor.getUserSpendingHistory();
      if (result.Ok) {
        return result.Ok;
      } else if (result.Err) {
        throw new Error(`Failed to get user spending history: ${result.Err}`);
      } else {
        throw new Error('Failed to get user spending history');
      }
    } catch (error) {
      console.error('Get user spending history error:', error);
      throw error;
    }
  }

  async earnTokens(amount: number, reason: string): Promise<void> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }

    try {
      const result = await this.actor.earnTokens(amount, reason);
      if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      }
    } catch (error) {
      console.error('Earn tokens error:', error);
      throw error;
    }
  }

  async spendTokens(amount: number, reason: string): Promise<void> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }

    try {
      const result = await this.actor.spendTokens(amount, reason);
      if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      }
    } catch (error) {
      console.error('Spend tokens error:', error);
      throw error;
    }
  }

  async getFaucetStats(): Promise<FaucetStats> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }

    try {
      const result = await this.actor.getFaucetStats();
      if ('Ok' in result && result.Ok) {
        return result.Ok;
      } else if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      } else {
        throw new Error('Failed to get faucet stats');
      }
    } catch (error) {
      console.error('Get faucet stats error:', error);
      throw error;
    }
  }

  async getFaucetClaimHistory(): Promise<FaucetClaim[]> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }

    try {
      const result = await this.actor.getFaucetClaimHistory();
      if (result.Ok) {
        return result.Ok;
      } else if (result.Err) {
        throw new Error(`Failed to get faucet claim history: ${result.Err}`);
      } else {
        throw new Error('Failed to get faucet claim history');
      }
    } catch (error) {
      console.error('Get faucet claim history error:', error);
      throw error;
    }
  }

  async claimFaucetTokens(): Promise<void> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }

    try {
      const result = await this.actor.claimFaucetTokens();
      if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      }
    } catch (error) {
      console.error('Claim faucet tokens error:', error);
      throw error;
    }
  }

  // === INTER-CANISTER SECURE MESSAGING ===
  
  // Create a therapy conversation through the backend
  async createTherapyConversation(therapistId: string, sessionId: string): Promise<unknown> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const therapistPrincipal = Principal.fromText(therapistId);
      const result = await this.actor.createTherapyConversation(therapistPrincipal, sessionId);
      
      if ('ok' in result) {
        return result.ok;
      } else {
        throw new Error(typeof result.err === 'string' ? result.err : JSON.stringify(result.err) || 'Unknown error');
      }
    } catch (error) {
      console.error('Error creating therapy conversation:', error);
      throw error;
    }
  }
  
  // Send secure message through backend
  async sendSecureMessage(
    conversationId: string,
    recipientId: Principal,
    content: string,
    messageType: { [key: string]: null } = { Text: null }
  ): Promise<unknown> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.sendSecureMessage(conversationId, recipientId, content, messageType);
      
      if ('ok' in result) {
        return result.ok;
      } else {
        throw new Error(typeof result.err === 'string' ? result.err : JSON.stringify(result.err) || 'Unknown error');
      }
    } catch (error) {
      console.error('Error sending secure message:', error);
      throw error;
    }
  }
  
  // Get user's secure conversations
  async getUserSecureConversations(): Promise<{ ok?: SecureConversation[]; err?: string }> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.getUserSecureConversations();
      
      if ('Ok' in result) {
        return { ok: result.Ok as SecureConversation[] };
      } else if ('Err' in result) {
        return { err: typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Error getting secure conversations:', error);
      return { err: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  // Get messages from a secure conversation
  async getSecureConversationMessages(
    conversationId: string,
    limit?: number,
    offset?: number
  ): Promise<{ ok?: SecureMessage[]; err?: string }> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const limitOpt = limit ? [BigInt(limit)] : [];
      const offsetOpt = offset ? [BigInt(offset)] : [];
      const result = await this.actor.getSecureConversationMessages(conversationId, limitOpt, offsetOpt);
      
      if ('Ok' in result) {
        return { ok: result.Ok as SecureMessage[] };
      } else if ('Err' in result) {
        return { err: typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Error getting secure conversation messages:', error);
      return { err: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  // Register user encryption key
  async registerUserEncryptionKey(
    publicKey: string,
    keyType: 'RSA2048' | 'ECDSA' | 'Ed25519' = 'Ed25519'
  ): Promise<unknown> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const keyTypeVariant = { [keyType]: null };
      const result = await this.actor.registerUserEncryptionKey(publicKey, keyTypeVariant);
      
      if ('ok' in result) {
        return result.ok;
      } else {
        throw new Error(typeof result.err === 'string' ? result.err : JSON.stringify(result.err) || 'Unknown error');
      }
    } catch (error) {
      console.error('Error registering encryption key:', error);
      throw error;
    }
  }
  
  // Get secure messaging health status
  async getSecureMessagingHealth(): Promise<{ status: string; timestamp: bigint }> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.getSecureMessagingHealth();
      return result;
    } catch (error) {
      console.error('Error getting secure messaging health:', error);
      throw error;
    }
  }

  // === PATIENT PROFILE MANAGEMENT ===
  
  async createPatientProfile(patientData: PatientData): Promise<Patient> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.createPatientProfile(patientData);
      if ('Ok' in result && result.Ok) {
        return result.Ok;
      } else if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      } else {
        throw new Error('Failed to create patient profile');
      }
    } catch (error) {
      console.error('Error creating patient profile:', error);
      throw error;
    }
  }
  
  async getPatientProfile(): Promise<Patient> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.getPatientProfile();
      if ('Ok' in result && result.Ok) {
        return result.Ok;
      } else if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      } else {
        throw new Error('Failed to get patient profile');
      }
    } catch (error) {
      console.error('Error getting patient profile:', error);
      throw error;
    }
  }

  // === DOCTOR/THERAPIST PROFILE MANAGEMENT ===
  
  async createDoctorProfile(doctorData: DoctorData): Promise<Doctor> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.createDoctorProfile(doctorData);
      if ('Ok' in result && result.Ok) {
        return result.Ok;
      } else if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      } else {
        throw new Error('Failed to create doctor profile');
      }
    } catch (error) {
      console.error('Error creating doctor profile:', error);
      throw error;
    }
  }
  
  async getAllDoctors(): Promise<Doctor[]> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.getAllDoctors();
      if ('Ok' in result && result.Ok) {
        return result.Ok;
      } else if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      } else {
        throw new Error('Failed to get all doctors');
      }
    } catch (error) {
      console.error('Error getting all doctors:', error);
      throw error;
    }
  }
  
  async getDoctorById(doctorId: string): Promise<Doctor> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.getDoctorById(doctorId);
      if ('Ok' in result && result.Ok) {
        return result.Ok;
      } else if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      } else {
        throw new Error('Failed to get doctor by ID');
      }
    } catch (error) {
      console.error('Error getting doctor by ID:', error);
      throw error;
    }
  }

  // === APPOINTMENT MANAGEMENT ===
  
  async createAppointment(appointmentData: AppointmentData): Promise<Appointment> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.createAppointment(appointmentData);
      if ('Ok' in result && result.Ok) {
        return result.Ok;
      } else if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      } else {
        throw new Error('Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }
  
  async updateAppointmentStatus(appointmentId: string, status: AppointmentStatus): Promise<Appointment> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.updateAppointmentStatus(appointmentId, status);
      if ('Ok' in result && result.Ok) {
        return result.Ok;
      } else if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      } else {
        throw new Error('Failed to update appointment status');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }
  
  async getPatientAppointments(): Promise<Appointment[]> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.getPatientAppointments();
      if ('Ok' in result && result.Ok) {
        return result.Ok;
      } else if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      } else {
        throw new Error('Failed to get patient appointments');
      }
    } catch (error) {
      console.error('Error getting patient appointments:', error);
      throw error;
    }
  }
  
  async getDoctorAppointments(): Promise<Appointment[]> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.getDoctorAppointments();
      if ('Ok' in result && result.Ok) {
        return result.Ok;
      } else if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      } else {
        throw new Error('Failed to get doctor appointments');
      }
    } catch (error) {
      console.error('Error getting doctor appointments:', error);
      throw error;
    }
  }

  // === MEDICAL RECORDS MANAGEMENT ===
  
  async createMedicalRecord(recordData: MedicalRecordData): Promise<MedicalRecord> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.createMedicalRecord(recordData);
      if ('Ok' in result && result.Ok) {
        return result.Ok;
      } else if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      } else {
        throw new Error('Failed to create medical record');
      }
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw error;
    }
  }
  
  async getPatientMedicalRecords(patientId?: string): Promise<MedicalRecord[]> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = patientId 
        ? await this.actor.getPatientMedicalRecords(Principal.fromText(patientId))
        : await this.actor.getPatientMedicalRecords();
      if ('Ok' in result && result.Ok) {
        return result.Ok;
      } else if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      } else {
        throw new Error('Failed to get patient medical records');
      }
    } catch (error) {
      console.error('Error getting patient medical records:', error);
      throw error;
    }
  }
  
  async getMedicalRecordById(recordId: string): Promise<MedicalRecord> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.getMedicalRecordById(recordId);
      if ('Ok' in result && result.Ok) {
        return result.Ok;
      } else if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      } else {
        throw new Error('Failed to get medical record by ID');
      }
    } catch (error) {
      console.error('Error getting medical record by ID:', error);
      throw error;
    }
  }

  // === MESSAGING SYSTEM ===
  
  async sendMessage(messageData: { receiverId: Principal; content: string; messageType: string }): Promise<Message> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.sendMessage(messageData.receiverId, messageData.content, messageData.messageType);
      if ('Ok' in result && result.Ok) {
        return result.Ok;
      } else if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
  
  async getMessages(conversationId?: string): Promise<Message[]> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = conversationId 
        ? await this.actor.getMessages(Principal.fromText(conversationId))
        : await this.actor.getMessages(Principal.anonymous());
      if ('Ok' in result && result.Ok) {
        return result.Ok;
      } else if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      } else {
        throw new Error('Failed to get messages');
      }
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }
  
  async markMessageAsRead(messageId: string): Promise<boolean> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.markMessageAsRead(messageId);
      if ('Ok' in result && result.Ok) {
        return true;
      } else if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      } else {
        throw new Error('Failed to mark message as read');
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  // === SYSTEM METHODS ===
  
  async healthCheck(): Promise<{ status: string; timestamp: bigint }> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.healthCheck();
      if ('Ok' in result && result.Ok) {
        return result.Ok;
      } else if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      } else {
        throw new Error('Failed to perform health check');
      }
    } catch (error) {
      console.error('Error performing health check:', error);
      throw error;
    }
  }
  
  async getSystemStats(): Promise<SystemStats> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.getSystemStats();
      if ('Ok' in result && result.Ok) {
        return result.Ok;
      } else if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      } else {
        throw new Error('Failed to get system stats');
      }
    } catch (error) {
      console.error('Error getting system stats:', error);
      throw error;
    }
  }

  // Medical Records Functions
  
  // Create session note
  async createSessionNote(
    patientId: string,
    sessionId: string,
    content: string
  ): Promise<unknown> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const patientPrincipal = Principal.fromText(patientId);
      const result = await this.actor.createSessionNote(patientPrincipal, content, sessionId);
      
      if ('Ok' in result) {
        return result.Ok;
      } else {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      }
    } catch (error) {
      console.error('Error creating session note:', error);
      throw error;
    }
  }
  
  // Get session notes
  async getSessionNotes(patientId?: Principal): Promise<SessionNote[]> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.getSessionNotes(patientId);
      if ('Ok' in result && result.Ok) {
        return result.Ok;
      } else if ('Err' in result && result.Err) {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      } else {
        throw new Error('Failed to get session notes');
      }
    } catch (error) {
      console.error('Error getting session notes:', error);
      throw error;
    }
  }
  
  // Create prescription
  async createPrescription(
    patientId: Principal,
    medication: string,
    dosage: string,
    instructions: string,
    duration: string
  ): Promise<{ Ok?: string; Err?: string }> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.createPrescription(
        patientId,
        medication,
        dosage,
        instructions,
        duration
      );
      
      if ('Ok' in result) {
        return result;
      } else {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      }
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    }
  }
  
  // Get prescriptions
  async getPrescriptions(patientId?: Principal): Promise<Prescription[]> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.getPrescriptions(patientId);
      if ('Ok' in result) {
        return result.Ok!;
      } else {
        throw new Error(result.Err || 'Failed to get prescriptions');
      }
    } catch (error) {
      console.error('Error getting prescriptions:', error);
      throw error;
    }
  }
  
  // Create treatment summary
  async createTreatmentSummary(
    patientId: Principal,
    summary: string,
    recommendations: string[],
    nextAppointment?: string
  ): Promise<{ Ok?: string; Err?: string }> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.createTreatmentSummary(
        patientId,
        summary,
        recommendations,
        nextAppointment
      );
      
      if ('Ok' in result) {
        return result;
      } else {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      }
    } catch (error) {
      console.error('Error creating treatment summary:', error);
      throw error;
    }
  }
  
  // Get treatment summaries
  async getTreatmentSummaries(patientId?: Principal): Promise<TreatmentSummary[]> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.getTreatmentSummaries(patientId);
      if ('Ok' in result) {
        return result.Ok!;
      } else {
        throw new Error(result.Err || 'Failed to get treatment summaries');
      }
    } catch (error) {
      console.error('Error getting treatment summaries:', error);
      throw error;
    }
  }
  
  // Grant access to medical record
  async grantMedicalRecordAccess(
    recordId: string,
    userId: Principal,
    accessLevel: string
  ): Promise<{ Ok?: string; Err?: string }> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.grantMedicalRecordAccess(
        recordId,
        userId,
        accessLevel
      );
      
      if ('Ok' in result) {
        return result;
      } else {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      }
    } catch (error) {
      console.error('Error granting medical record access:', error);
      throw error;
    }
  }
  
  // Revoke access to medical record
  async revokeMedicalRecordAccess(
    recordId: string,
    userId: Principal
  ): Promise<{ Ok?: string; Err?: string }> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.revokeMedicalRecordAccess(
        recordId,
        userId
      );
      
      if ('Ok' in result) {
        return result;
      } else {
        throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Unknown error');
      }
    } catch (error) {
      console.error('Error revoking medical record access:', error);
      throw error;
    }
  }
  
  // Get audit logs
  async getAuditLogs(
    recordType?: 'SessionNote' | 'Prescription' | 'TreatmentSummary',
    recordId?: string,
    limit?: number
  ): Promise<{ ok?: AuditLog[]; err?: string }> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const recordTypeOpt = recordType ? [{ [recordType]: null }] : [];
      const recordIdOpt = recordId ? [recordId] : [];
      const limitOpt = limit ? [BigInt(limit)] : [];
      const result = await this.actor.getAuditLogs(recordTypeOpt, recordIdOpt, limitOpt);
      return result;
    } catch (error) {
      console.error('Error getting audit logs:', error);
      throw error;
    }
  }
}

// Singleton instance
export const authService = new AuthService();

// Utility functions
export const formatAppointmentStatus = (status: AppointmentStatus): string => {
  if ('scheduled' in status) return 'Scheduled';
  if ('confirmed' in status) return 'Confirmed';
  if ('inProgress' in status) return 'In Progress';
  if ('completed' in status) return 'Completed';
  if ('cancelled' in status) return 'Cancelled';
  if ('rescheduled' in status) return 'Rescheduled';
  return 'Unknown';
};

export const formatAppointmentType = (type: AppointmentType): string => {
  if ('consultation' in type) return 'Consultation';
  if ('followUp' in type) return 'Follow-up';
  if ('emergency' in type) return 'Emergency';
  if ('routine' in type) return 'Routine';
  if ('therapy' in type) return 'Therapy';
  if ('examination' in type) return 'Examination';
  return 'Unknown';
};

export const createAppointmentStatus = (status: string): AppointmentStatus => {
  switch (status.toLowerCase()) {
    case 'scheduled': return { scheduled: null };
    case 'confirmed': return { confirmed: null };
    case 'inprogress': return { inProgress: null };
    case 'completed': return { completed: null };
    case 'cancelled': return { cancelled: null };
    case 'rescheduled': return { rescheduled: null };
    default: return { scheduled: null };
  }
};

export const createAppointmentType = (type: string): AppointmentType => {
  switch (type.toLowerCase()) {
    case 'consultation': return { consultation: null };
    case 'followup': return { followUp: null };
    case 'emergency': return { emergency: null };
    case 'routine': return { routine: null };
    case 'therapy': return { therapy: null };
    case 'examination': return { examination: null };
    default: return { consultation: null };
  }
};