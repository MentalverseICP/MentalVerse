import { HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

// Import the generated declarations (these will be created after deployment)
// import { mentalverse_backend } from '../../../declarations/mentalverse_backend';

// Backend service interface
export interface BackendService {
  // Authentication
  registerUser: (role: string) => Promise<{ Ok?: string; Err?: string }>;
  getCurrentUser: () => Promise<{ Ok?: { id: Principal; role: string }; Err?: string }>;
  
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
  
  // Messaging
  sendMessage: (receiverId: Principal, content: string, messageType: string) => Promise<{ Ok?: Message; Err?: string }>;
  getMessages: (otherUserId: Principal) => Promise<Message[]>;
  markMessageAsRead: (messageId: string) => Promise<{ Ok?: string; Err?: string }>;
  
  // System
  healthCheck: () => Promise<{ status: string; timestamp: bigint; version: string }>;
  getSystemStats: () => Promise<SystemStats>;
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

// Authentication service using Internet Identity
export class AuthService {
  private authClient: AuthClient | null = null;
  private actor: BackendService | null = null;
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
        identityProvider: process.env.REACT_APP_INTERNET_IDENTITY_URL || 'http://localhost:4943/?canisterId=uxrrr-q7777-77774-qaaaq-cai',
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
      host: process.env.REACT_APP_IC_HOST || 'http://localhost:4943',
    });

    // In development, fetch root key
    if (process.env.NODE_ENV === 'development') {
      await agent.fetchRootKey();
    }

    // Create actor with deployed canister ID
    const canisterId = process.env.REACT_APP_BACKEND_CANISTER_ID || 'u6s2n-gx777-77774-qaaba-cai';
    
    // This would use the generated declarations in a real implementation
    // this.actor = Actor.createActor(idlFactory, { agent, canisterId });
    
    // For now, we'll create a mock actor
    this.actor = this.createMockActor(agent, canisterId);

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
      sendMessage: async (_receiverId: Principal, _content: string, _messageType: string) => ({ Err: 'Not implemented' }),
      getMessages: async (_otherUserId: Principal) => [],
      markMessageAsRead: async (_messageId: string) => ({ Err: 'Not implemented' }),
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

  async registerUser(role: 'patient' | 'doctor'): Promise<{ success: boolean; message: string }> {
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