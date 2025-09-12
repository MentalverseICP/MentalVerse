/// <reference types="vite/client" />
import { HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { secureMessagingService, SecureMessagingService } from './secureMessaging';

// Import the generated declarations (these will be created after deployment)
// import { mentalverse_backend } from '../../../declarations/mentalverse_backend';

// Backend service interface
export interface BackendService {
  // Authentication
  registerUser: (role: string) => Promise<{ Ok?: string; Err?: string }>;
  getCurrentUser: () => Promise<{ Ok?: { id: Principal; role: string }; Err?: string }>;
  
  // Token operations
  getTokenBalance: () => Promise<{ Ok?: TokenBalance; Err?: string }>;
  transferTokens: (to: Principal, amount: number) => Promise<{ Ok?: string; Err?: string }>;
  stakeTokens: (amount: number, lockPeriod: number) => Promise<{ Ok?: string; Err?: string }>;
  unstakeTokens: (amount: number) => Promise<{ Ok?: string; Err?: string }>;
  claimStakingRewards: () => Promise<{ Ok?: number; Err?: string }>;
  getUserStake: () => Promise<{ Ok?: StakeInfo; Err?: string }>;
  getTransactionHistory: (startIndex: number, limit: number) => Promise<Transaction[]>;
  getUserEarningHistory: () => Promise<EarningRecord[]>;
  getUserSpendingHistory: () => Promise<SpendingRecord[]>;
  earnTokens: (amount: number, reason: string) => Promise<{ Ok?: string; Err?: string }>;
  spendTokens: (amount: number, reason: string) => Promise<{ Ok?: string; Err?: string }>;
  
  // Faucet operations
  getFaucetStats: () => Promise<{ Ok?: FaucetStats; Err?: string }>;
  getFaucetClaimHistory: () => Promise<FaucetClaim[]>;
  claimFaucetTokens: () => Promise<{ Ok?: string; Err?: string }>;
  
  // Patient management
  createPatientProfile: (patientData: PatientData) => Promise<{ Ok?: Patient; Err?: string }>;
  getPatientProfile: () => Promise<{ Ok?: Patient; Err?: string }>;
  
  // Doctor management
  createDoctorProfile: (doctorData: DoctorData) => Promise<{ Ok?: Doctor; Err?: string }>;
  getAllDoctors: () => Promise<Doctor[]>;
  getDoctorById: (doctorId: string) => Promise<{ Ok?: Doctor; Err?: string }>;
  
  // Appointment management
  createAppointment: (appointmentData: AppointmentData) => Promise<{ Ok?: Appointment; Err?: string }>;
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => Promise<{ Ok?: Appointment; Err?: string }>;
  getPatientAppointments: () => Promise<Appointment[]>;
  getDoctorAppointments: () => Promise<Appointment[]>;
  
  // Medical records
  createMedicalRecord: (recordData: MedicalRecordData) => Promise<{ Ok?: MedicalRecord; Err?: string }>;
  getPatientMedicalRecords: () => Promise<MedicalRecord[]>;
  getMedicalRecordById: (recordId: string) => Promise<{ Ok?: MedicalRecord; Err?: string }>;
  createSessionNote: (patientId: Principal, content: string, sessionId?: string) => Promise<{ Ok?: string; Err?: string }>;
  getSessionNotes: (patientId?: Principal) => Promise<SessionNote[]>;
  createPrescription: (patientId: Principal, medication: string, dosage: string, instructions: string, duration: string) => Promise<{ Ok?: string; Err?: string }>;
  getPrescriptions: (patientId?: Principal) => Promise<Prescription[]>;
  createTreatmentSummary: (patientId: Principal, summary: string, recommendations: string[], nextAppointment?: string) => Promise<{ Ok?: string; Err?: string }>;
  getTreatmentSummaries: (patientId?: Principal) => Promise<TreatmentSummary[]>;
  grantMedicalRecordAccess: (recordId: string, userId: Principal, accessLevel: string) => Promise<{ Ok?: string; Err?: string }>;
  revokeMedicalRecordAccess: (recordId: string, userId: Principal) => Promise<{ Ok?: string; Err?: string }>;
  getAuditLogs: (recordTypeOpt?: { [key: string]: null }[], recordIdOpt?: string[], limitOpt?: bigint[]) => Promise<{ ok?: AuditLog[]; err?: string }>;
  
  // Messaging
  sendMessage: (receiverId: Principal, content: string, messageType: string) => Promise<{ Ok?: Message; Err?: string }>;
  getMessages: (otherUserId: Principal) => Promise<Message[]>;
  markMessageAsRead: (messageId: string) => Promise<{ Ok?: string; Err?: string }>;
  
  // Secure messaging
  createTherapyConversation: (therapistId: Principal, sessionId: string) => Promise<{ ok?: string; err?: string }>;
  sendSecureMessage: (conversationId: string, recipientId: Principal, content: string, messageType: { [key: string]: null }) => Promise<{ ok?: string; err?: string }>;
  getUserSecureConversations: () => Promise<{ ok?: SecureConversation[]; err?: string }>;
  getSecureConversationMessages: (conversationId: string, limit?: bigint[], offset?: bigint[]) => Promise<{ ok?: SecureMessage[]; err?: string }>;
  registerUserEncryptionKey: (publicKey: string, keyType: { RSA2048?: null; ECDSA?: null; Ed25519?: null }) => Promise<{ ok?: string; err?: string }>;
  getSecureMessagingHealth: () => Promise<{ status: string; timestamp: bigint }>;
  
  // System
  healthCheck: () => Promise<{ status: string; timestamp: bigint; version: string }>;
  getSystemStats: () => Promise<SystemStats>;
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
        identityProvider: import.meta.env.VITE_INTERNET_IDENTITY_URL || 'http://localhost:4943/?canisterId=uxrrr-q7777-77774-qaaaq-cai',
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
      host: import.meta.env.VITE_IC_HOST || 'http://localhost:4943',
    });

    // In development, fetch root key
    if (import.meta.env.DEV) {
      await agent.fetchRootKey();
    }

    // Create actor with deployed canister ID
    const canisterId = import.meta.env.VITE_BACKEND_CANISTER_ID || 'u6s2n-gx777-77774-qaaba-cai';
    
    // This would use the generated declarations in a real implementation
    // this.actor = Actor.createActor(idlFactory, { agent, canisterId });
    
    // For now, we'll create a mock actor
    this.actor = this.createMockActor(agent, canisterId);

    // Initialize secure messaging service
    try {
      await secureMessagingService.init(this.authClient!);
      this.secureMessaging = secureMessagingService;
    } catch (error) {
      console.error('Failed to initialize secure messaging:', error);
    }

    // Get user role
    try {
      const result = await this.actor.getCurrentUser();
      if ('Ok' in result && result.Ok) {
        this.userRole = result.Ok.role;
      }
    } catch (error) {
      console.error('Failed to get user role:', error);
    }
  }

  private createMockActor(_agent: HttpAgent, _canisterId: string): BackendService {
    // This is a mock implementation - replace with actual Actor.createActor call
    return {
      registerUser: async (role: string) => ({ Ok: `User registered with role: ${role}` }),
      getCurrentUser: async () => ({ 
        Ok: { 
          id: this.userPrincipal!, 
          role: this.userRole || 'patient' 
        } 
      }),
      
      // Token operations mock implementations
      getTokenBalance: async () => ({
        Ok: {
          total: 1250.75,
          available: 850.25,
          staked: 400.50,
          pending: 0,
          balance: 850.25
        }
      }),
      transferTokens: async (_to: Principal, amount: number) => ({ Ok: `Transferred ${amount} MVT tokens` }),
      stakeTokens: async (amount: number, lockPeriod: number) => ({ Ok: `Staked ${amount} MVT tokens for ${lockPeriod} days` }),
      unstakeTokens: async (amount: number) => ({ Ok: `Unstaked ${amount} MVT tokens` }),
      claimStakingRewards: async () => ({ Ok: 25.5 }),
      getUserStake: async () => ({
        Ok: {
          amount: 400.50,
          lockPeriod: 90,
          startTime: Date.now() - 259200000,
          endTime: Date.now() + 7516800000,
          unlockTime: Date.now() + 7516800000,
          stakeTime: Date.now() - 259200000,
          rewardRate: 0.12,
          accumulatedRewards: 25.5,
          rewards: 25.5
        }
      }),
      getTransactionHistory: async (_startIndex: number, _limit: number) => [
        {
          id: '1',
          type: 'earn' as const,
          amount: 50,
          timestamp: Date.now() - 86400000,
          description: 'Appointment completion reward',
          status: 'completed' as const
        },
        {
          id: '2',
          type: 'spend' as const,
          amount: -200,
          timestamp: Date.now() - 172800000,
          description: 'Premium consultation booking',
          status: 'completed' as const
        },
        {
          id: '3',
          type: 'stake' as const,
          amount: -400.50,
          timestamp: Date.now() - 259200000,
          description: 'Staked for 90 days',
          status: 'completed' as const
        }
      ],
      getUserEarningHistory: async () => [
        {
          id: '1',
          type: 'appointment_completion' as const,
          amount: 50,
          timestamp: Date.now() - 86400000,
          description: 'Completed therapy session'
        },
        {
          id: '2',
          type: 'platform_usage' as const,
          amount: 10,
          timestamp: Date.now() - 172800000,
          description: 'Daily platform engagement'
        }
      ],
      getUserSpendingHistory: async () => [
        {
          id: '1',
          type: 'premium_consultation' as const,
          amount: 200,
          timestamp: Date.now() - 172800000,
          description: 'Premium consultation with Dr. Smith'
        }
      ],
      earnTokens: async (amount: number, reason: string) => ({ Ok: `Earned ${amount} MVT tokens for ${reason}` }),
      spendTokens: async (amount: number, reason: string) => ({ Ok: `Spent ${amount} MVT tokens for ${reason}` }),
      
      // Faucet operations mock implementations
      getFaucetStats: async () => ({
        Ok: {
          dailyLimit: 100,
          claimedToday: 25,
          totalClaimed: 1250,
          nextClaimTime: Date.now() + 3600000 // 1 hour from now
        }
      }),
      getFaucetClaimHistory: async () => [
        {
          id: '1',
          amount: 25,
          timestamp: Date.now() - 3600000,
          status: 'completed' as const
        },
        {
          id: '2',
          amount: 25,
          timestamp: Date.now() - 7200000,
          status: 'completed' as const
        },
        {
          id: '3',
          amount: 25,
          timestamp: Date.now() - 10800000,
          status: 'pending' as const
        }
      ],
      claimFaucetTokens: async () => ({ Ok: 'Successfully claimed 25 MVT tokens from faucet' }),
      createPatientProfile: async (data: PatientData) => ({ Ok: { ...data, id: this.userPrincipal!, medicalHistory: [], allergies: [], currentMedications: [], createdAt: BigInt(Date.now()), updatedAt: BigInt(Date.now()) } }),
      getPatientProfile: async () => ({ Err: 'Not implemented' }),
      createDoctorProfile: async (_data: DoctorData) => ({ Err: 'Not implemented' }),
      getAllDoctors: async () => [],
      getDoctorById: async (_id: string) => ({ Err: 'Not implemented' }),
      createAppointment: async (_data: AppointmentData) => ({ Err: 'Not implemented' }),
      updateAppointmentStatus: async (_id: string, _status: AppointmentStatus) => ({ Err: 'Not implemented' }),
      getPatientAppointments: async () => [],
      getDoctorAppointments: async () => [],
      createMedicalRecord: async (_data: MedicalRecordData) => ({ Err: 'Not implemented' }),
      getPatientMedicalRecords: async () => [],
      getMedicalRecordById: async (_id: string) => ({ Err: 'Not implemented' }),
      createSessionNote: async (_patientId: Principal, _content: string, _sessionId?: string) => ({ Ok: 'Session note created' }),
      getSessionNotes: async (_patientId?: Principal) => [],
      createPrescription: async (_patientId: Principal, _medication: string, _dosage: string, _instructions: string, _duration: string) => ({ Ok: 'Prescription created' }),
      getPrescriptions: async (_patientId?: Principal) => [],
      createTreatmentSummary: async (_patientId: Principal, _summary: string, _recommendations: string[], _nextAppointment?: string) => ({ Ok: 'Treatment summary created' }),
      getTreatmentSummaries: async (_patientId?: Principal) => [],
      grantMedicalRecordAccess: async (_recordId: string, _userId: Principal, _accessLevel: string) => ({ Ok: 'Access granted' }),
      revokeMedicalRecordAccess: async (_recordId: string, _userId: Principal) => ({ Ok: 'Access revoked' }),
      getAuditLogs: async (_recordTypeOpt?: { [key: string]: null }[], _recordIdOpt?: string[], _limitOpt?: bigint[]) => ({ ok: [] }),
      sendMessage: async (_receiverId: Principal, _content: string, _messageType: string) => ({ Err: 'Not implemented' }),
      getMessages: async (_otherUserId: Principal) => [],
      markMessageAsRead: async (_messageId: string) => ({ Err: 'Not implemented' }),
      createTherapyConversation: async (_therapistId: Principal, _sessionId: string) => ({ ok: 'Conversation created' }),
      sendSecureMessage: async (_conversationId: string, _recipientId: Principal, _content: string, _messageType: { [key: string]: null }) => ({ ok: 'Message sent' }),
      getUserSecureConversations: async () => ({ ok: [] }),
      getSecureConversationMessages: async (_conversationId: string, _limit?: bigint[], _offset?: bigint[]) => ({ ok: [] }),
      registerUserEncryptionKey: async (_publicKey: string, _keyType: { RSA2048?: null; ECDSA?: null; Ed25519?: null }) => ({ ok: 'Key registered' }),
      getSecureMessagingHealth: async () => ({ status: 'healthy', timestamp: BigInt(Date.now()) }),
      healthCheck: async () => ({ status: 'healthy', timestamp: BigInt(Date.now()), version: '1.0.0' }),
      getSystemStats: async () => ({ totalPatients: 0, totalDoctors: 0, totalAppointments: 0, totalMedicalRecords: 0, totalMessages: 0 }),
    };
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

  async registerUser(role: 'patient' | 'therapist'): Promise<{ success: boolean; message: string }> {
    if (!this.actor) {
      return { success: false, message: 'Not authenticated' };
    }

    try {
      const result = await this.actor.registerUser(role);
      if ('Ok' in result && result.Ok) {
        this.userRole = role;
        return { success: true, message: result.Ok };
      } else {
        const errorMessage = ('Err' in result && result.Err) ? result.Err : 'Registration failed';
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  }

  async getTokenBalance(): Promise<TokenBalance> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }

    try {
      const result = await this.actor.getTokenBalance();
      if ('Ok' in result && result.Ok) {
        return result.Ok;
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
      return await this.actor.getTransactionHistory(0, 50);
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
        throw new Error(result.Err);
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
        throw new Error(result.Err);
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
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Transfer tokens error:', error);
      throw error;
    }
  }

  // === INTER-CANISTER SECURE MESSAGING ===
  
  // Create a therapy conversation through the backend
  async createTherapyConversation(therapistId: string, sessionId: string): Promise<any> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const therapistPrincipal = Principal.fromText(therapistId);
      const result = await this.actor.createTherapyConversation(therapistPrincipal, sessionId);
      
      if ('ok' in result) {
        return result.ok;
      } else {
        throw new Error(result.err);
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
  ): Promise<any> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await this.actor.sendSecureMessage(conversationId, recipientId, content, messageType);
      
      if ('ok' in result) {
        return result.ok;
      } else {
        throw new Error(result.err);
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
      return result;
    } catch (error) {
      console.error('Error getting secure conversations:', error);
      throw error;
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
      return result;
    } catch (error) {
      console.error('Error getting secure conversation messages:', error);
      throw error;
    }
  }
  
  // Register user encryption key
  async registerUserEncryptionKey(
    publicKey: string,
    keyType: 'RSA2048' | 'ECDSA' | 'Ed25519' = 'Ed25519'
  ): Promise<any> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const keyTypeVariant = { [keyType]: null };
      const result = await this.actor.registerUserEncryptionKey(publicKey, keyTypeVariant);
      
      if ('ok' in result) {
        return result.ok;
      } else {
        throw new Error(result.err);
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

  // Medical Records Functions
  
  // Create session note
  async createSessionNote(
    patientId: string,
    sessionId: string,
    content: string,
    encryptionLevel: 'None' | 'Basic' | 'Advanced' = 'Basic'
  ): Promise<any> {
    if (!this.actor) {
      throw new Error('Not authenticated');
    }
    
    try {
      const patientPrincipal = Principal.fromText(patientId);
      const result = await this.actor.createSessionNote(patientPrincipal, content, sessionId);
      
      if ('Ok' in result) {
        return result.Ok;
      } else {
        throw new Error(result.Err);
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
      return result;
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
        throw new Error(result.Err);
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
      return result;
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
        throw new Error(result.Err);
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
      return result;
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
        throw new Error(result.Err);
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
        throw new Error(result.Err);
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