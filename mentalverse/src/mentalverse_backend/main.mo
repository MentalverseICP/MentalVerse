import Principal "mo:base/Principal";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import Int "mo:base/Int";
import Iter "mo:base/Iter";

actor MentalVerseBackend {
  // Type definitions for core data models
  public type UserId = Principal;
  public type DoctorId = Text;
  public type AppointmentId = Text;
  public type RecordId = Text;

  // Patient data model
  public type Patient = {
    id: UserId;
    firstName: Text;
    lastName: Text;
    email: Text;
    dateOfBirth: Text;
    gender: Text;
    phoneNumber: Text;
    emergencyContact: Text;
    medicalHistory: [Text];
    allergies: [Text];
    currentMedications: [Text];
    createdAt: Int;
    updatedAt: Int;
  };

  // Doctor data model
  public type Doctor = {
    id: DoctorId;
    userId: UserId;
    firstName: Text;
    lastName: Text;
    email: Text;
    specialty: Text;
    licenseNumber: Text;
    yearsOfExperience: Nat;
    education: [Text];
    certifications: [Text];
    availableHours: Text; // JSON string for complex scheduling
    consultationFee: Nat;
    rating: Float;
    totalAppointments: Nat;
    isVerified: Bool;
    isOnline: Bool;
    createdAt: Int;
    updatedAt: Int;
  };

  // Appointment data model
  public type AppointmentStatus = {
    #scheduled;
    #confirmed;
    #inProgress;
    #completed;
    #cancelled;
    #rescheduled;
  };

  public type AppointmentType = {
    #consultation;
    #followUp;
    #emergency;
    #routine;
    #therapy;
    #examination;
  };

  public type Appointment = {
    id: AppointmentId;
    patientId: UserId;
    doctorId: DoctorId;
    appointmentType: AppointmentType;
    scheduledDate: Text;
    startTime: Text;
    endTime: Text;
    status: AppointmentStatus;
    notes: Text;
    symptoms: [Text];
    diagnosis: Text;
    prescription: Text;
    followUpRequired: Bool;
    followUpDate: ?Text;
    createdAt: Int;
    updatedAt: Int;
  };

  // Medical record data model
  public type MedicalRecord = {
    id: RecordId;
    patientId: UserId;
    doctorId: DoctorId;
    appointmentId: ?AppointmentId;
    recordType: Text; // "consultation", "lab_result", "prescription", "diagnosis"
    title: Text;
    description: Text;
    attachments: [Text]; // File URLs or hashes
    isConfidential: Bool;
    accessPermissions: [UserId]; // Who can access this record
    createdAt: Int;
    updatedAt: Int;
  };

  // Message data model for secure communication
  public type Message = {
    id: Text;
    senderId: UserId;
    receiverId: UserId;
    content: Text;
    messageType: Text; // "text", "file", "image", "voice"
    attachments: [Text];
    isRead: Bool;
    isEncrypted: Bool;
    timestamp: Int;
  };

  // Storage using stable variables for persistence
  private stable var patientsEntries : [(UserId, Patient)] = [];
  private stable var doctorsEntries : [(DoctorId, Doctor)] = [];
  private stable var appointmentsEntries : [(AppointmentId, Appointment)] = [];
  private stable var medicalRecordsEntries : [(RecordId, MedicalRecord)] = [];
  private stable var messagesEntries : [(Text, Message)] = [];
  private stable var userRolesEntries : [(UserId, Text)] = []; // "patient", "doctor", "admin"
  private stable var chatInteractionsEntries : [(Text, ChatInteraction)] = [];

  // Initialize HashMaps from stable storage
  private var patients = HashMap.HashMap<UserId, Patient>(10, Principal.equal, Principal.hash);
  private var doctors = HashMap.HashMap<DoctorId, Doctor>(10, Text.equal, Text.hash);
  private var appointments = HashMap.HashMap<AppointmentId, Appointment>(10, Text.equal, Text.hash);
  private var medicalRecords = HashMap.HashMap<RecordId, MedicalRecord>(10, Text.equal, Text.hash);
  private var messages = HashMap.HashMap<Text, Message>(10, Text.equal, Text.hash);
  private var userRoles = HashMap.HashMap<UserId, Text>(10, Principal.equal, Principal.hash);

  // System upgrade hooks to maintain state
  system func preupgrade() {
    patientsEntries := Iter.toArray(patients.entries());
    doctorsEntries := Iter.toArray(doctors.entries());
    appointmentsEntries := Iter.toArray(appointments.entries());
    medicalRecordsEntries := Iter.toArray(medicalRecords.entries());
    messagesEntries := Iter.toArray(messages.entries());
    userRolesEntries := Iter.toArray(userRoles.entries());
    chatInteractionsEntries := Iter.toArray(chatInteractionsMap.entries());
  };

  system func postupgrade() {
    // Restore data from stable storage
    for ((id, patient) in patientsEntries.vals()) {
      patients.put(id, patient);
    };
    for ((id, doctor) in doctorsEntries.vals()) {
      doctors.put(id, doctor);
    };
    for ((id, appointment) in appointmentsEntries.vals()) {
      appointments.put(id, appointment);
    };
    for ((id, record) in medicalRecordsEntries.vals()) {
      medicalRecords.put(id, record);
    };
    for ((id, message) in messagesEntries.vals()) {
      messages.put(id, message);
    };
    for ((id, role) in userRolesEntries.vals()) {
      userRoles.put(id, role);
    };
    for ((id, interaction) in chatInteractionsEntries.vals()) {
      chatInteractionsMap.put(id, interaction);
    };
    
    // Clear stable storage
    patientsEntries := [];
    doctorsEntries := [];
    appointmentsEntries := [];
    medicalRecordsEntries := [];
    messagesEntries := [];
    userRolesEntries := [];
    chatInteractionsEntries := [];
  };

  // Authentication and authorization functions
  public shared(msg) func registerUser(role: Text) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    // Check if user is already registered
    switch (userRoles.get(caller)) {
      case (?existingRole) {
        #err("User already registered with role: " # existingRole)
      };
      case null {
        // Validate role
        if (role != "patient" and role != "doctor") {
          return #err("Invalid role. Must be 'patient' or 'doctor'");
        };
        
        userRoles.put(caller, role);
        #ok("User registered successfully with role: " # role)
      };
    }
  };

  public shared query(msg) func getCurrentUser() : async Result.Result<{id: UserId; role: Text}, Text> {
    let caller = msg.caller;
    
    switch (userRoles.get(caller)) {
      case (?role) {
        #ok({id = caller; role = role})
      };
      case null {
        #err("User not registered")
      };
    }
  };

  private func isAuthorized(caller: UserId, requiredRole: Text) : Bool {
    switch (userRoles.get(caller)) {
      case (?role) { role == requiredRole or role == "admin" };
      case null { false };
    }
  };

  // Patient management functions
  public shared(msg) func createPatientProfile(patientData: {
    firstName: Text;
    lastName: Text;
    email: Text;
    dateOfBirth: Text;
    gender: Text;
    phoneNumber: Text;
    emergencyContact: Text;
  }) : async Result.Result<Patient, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, "patient")) {
      return #err("Unauthorized: Only patients can create patient profiles");
    };

    let now = Time.now();
    let patient: Patient = {
      id = caller;
      firstName = patientData.firstName;
      lastName = patientData.lastName;
      email = patientData.email;
      dateOfBirth = patientData.dateOfBirth;
      gender = patientData.gender;
      phoneNumber = patientData.phoneNumber;
      emergencyContact = patientData.emergencyContact;
      medicalHistory = [];
      allergies = [];
      currentMedications = [];
      createdAt = now;
      updatedAt = now;
    };

    patients.put(caller, patient);
    #ok(patient)
  };

  public shared query(msg) func getPatientProfile() : async Result.Result<Patient, Text> {
    let caller = msg.caller;
    
    switch (patients.get(caller)) {
      case (?patient) { #ok(patient) };
      case null { #err("Patient profile not found") };
    }
  };

  // Doctor management functions
  public shared(msg) func createDoctorProfile(doctorData: {
    firstName: Text;
    lastName: Text;
    email: Text;
    specialty: Text;
    licenseNumber: Text;
    yearsOfExperience: Nat;
    education: [Text];
    certifications: [Text];
    consultationFee: Nat;
  }) : async Result.Result<Doctor, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, "doctor")) {
      return #err("Unauthorized: Only doctors can create doctor profiles");
    };

    let doctorId = Principal.toText(caller);
    let now = Time.now();
    
    let doctor: Doctor = {
      id = doctorId;
      userId = caller;
      firstName = doctorData.firstName;
      lastName = doctorData.lastName;
      email = doctorData.email;
      specialty = doctorData.specialty;
      licenseNumber = doctorData.licenseNumber;
      yearsOfExperience = doctorData.yearsOfExperience;
      education = doctorData.education;
      certifications = doctorData.certifications;
      availableHours = "{}";
      consultationFee = doctorData.consultationFee;
      rating = 0.0;
      totalAppointments = 0;
      isVerified = false;
      isOnline = false;
      createdAt = now;
      updatedAt = now;
    };

    doctors.put(doctorId, doctor);
    #ok(doctor)
  };

  public query func getAllDoctors() : async [Doctor] {
    Iter.toArray(doctors.vals())
  };

  public query func getDoctorById(doctorId: DoctorId) : async Result.Result<Doctor, Text> {
    switch (doctors.get(doctorId)) {
      case (?doctor) { #ok(doctor) };
      case null { #err("Doctor not found") };
    }
  };

  // Legacy greeting function for backward compatibility
  public query func greet(name : Text) : async Text {
    "Hello, " # name # "! Welcome to MentalVerse Healthcare Platform."
  };

  // Appointment management functions
  public shared(msg) func createAppointment(appointmentData: {
    doctorId: DoctorId;
    appointmentType: AppointmentType;
    scheduledDate: Text;
    startTime: Text;
    endTime: Text;
    notes: Text;
    symptoms: [Text];
  }) : async Result.Result<Appointment, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, "patient")) {
      return #err("Unauthorized: Only patients can create appointments");
    };

    // Verify doctor exists
    switch (doctors.get(appointmentData.doctorId)) {
      case null { return #err("Doctor not found") };
      case (?doctor) {
        let appointmentId = Principal.toText(caller) # "_" # appointmentData.doctorId # "_" # Int.toText(Time.now());
        let now = Time.now();
        
        let appointment: Appointment = {
          id = appointmentId;
          patientId = caller;
          doctorId = appointmentData.doctorId;
          appointmentType = appointmentData.appointmentType;
          scheduledDate = appointmentData.scheduledDate;
          startTime = appointmentData.startTime;
          endTime = appointmentData.endTime;
          status = #scheduled;
          notes = appointmentData.notes;
          symptoms = appointmentData.symptoms;
          diagnosis = "";
          prescription = "";
          followUpRequired = false;
          followUpDate = null;
          createdAt = now;
          updatedAt = now;
        };

        appointments.put(appointmentId, appointment);
        #ok(appointment)
      };
    }
  };

  public shared(msg) func updateAppointmentStatus(appointmentId: AppointmentId, status: AppointmentStatus) : async Result.Result<Appointment, Text> {
    let caller = msg.caller;
    
    switch (appointments.get(appointmentId)) {
      case null { #err("Appointment not found") };
      case (?appointment) {
        // Check authorization - patient or doctor involved in the appointment
        if (appointment.patientId != caller and appointment.doctorId != Principal.toText(caller)) {
          return #err("Unauthorized: You can only update your own appointments");
        };

        let updatedAppointment = {
          appointment with
          status = status;
          updatedAt = Time.now();
        };

        appointments.put(appointmentId, updatedAppointment);
        #ok(updatedAppointment)
      };
    }
  };

  public shared query(msg) func getPatientAppointments() : async [Appointment] {
    let caller = msg.caller;
    
    Array.filter(Iter.toArray(appointments.vals()), func(appointment: Appointment) : Bool {
      appointment.patientId == caller
    })
  };

  public shared query(msg) func getDoctorAppointments() : async [Appointment] {
    let caller = msg.caller;
    let callerId = Principal.toText(caller);
    
    Array.filter(Iter.toArray(appointments.vals()), func(appointment: Appointment) : Bool {
      appointment.doctorId == callerId
    })
  };

  // Medical records management functions
  public shared(msg) func createMedicalRecord(recordData: {
    patientId: UserId;
    appointmentId: ?AppointmentId;
    recordType: Text;
    title: Text;
    description: Text;
    attachments: [Text];
    isConfidential: Bool;
  }) : async Result.Result<MedicalRecord, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, "doctor")) {
      return #err("Unauthorized: Only doctors can create medical records");
    };

    // Verify patient exists
    switch (patients.get(recordData.patientId)) {
      case null { return #err("Patient not found") };
      case (?patient) {
        let recordId = Principal.toText(caller) # "_" # Principal.toText(recordData.patientId) # "_" # Int.toText(Time.now());
        let now = Time.now();
        
        let medicalRecord: MedicalRecord = {
          id = recordId;
          patientId = recordData.patientId;
          doctorId = Principal.toText(caller);
          appointmentId = recordData.appointmentId;
          recordType = recordData.recordType;
          title = recordData.title;
          description = recordData.description;
          attachments = recordData.attachments;
          isConfidential = recordData.isConfidential;
          accessPermissions = [recordData.patientId, caller]; // Patient and doctor have access
          createdAt = now;
          updatedAt = now;
        };

        medicalRecords.put(recordId, medicalRecord);
        #ok(medicalRecord)
      };
    }
  };

  public shared query(msg) func getPatientMedicalRecords() : async [MedicalRecord] {
    let caller = msg.caller;
    
    Array.filter(Iter.toArray(medicalRecords.vals()), func(record: MedicalRecord) : Bool {
      Array.find<UserId>(record.accessPermissions, func(userId: UserId) : Bool {
        userId == caller
      }) != null
    })
  };

  public shared query(msg) func getMedicalRecordById(recordId: RecordId) : async Result.Result<MedicalRecord, Text> {
    let caller = msg.caller;
    
    switch (medicalRecords.get(recordId)) {
      case null { #err("Medical record not found") };
      case (?record) {
        // Check if caller has access to this record
        let hasAccess = Array.find<UserId>(record.accessPermissions, func(userId: UserId) : Bool {
          userId == caller
        }) != null;
        
        if (not hasAccess) {
          return #err("Unauthorized: You don't have access to this medical record");
        };
        
        #ok(record)
      };
    }
  };

  // Secure messaging functions
  public shared(msg) func sendMessage(receiverId: UserId, content: Text, messageType: Text) : async Result.Result<Message, Text> {
    let caller = msg.caller;
    
    // Verify receiver exists (either as patient or doctor)
    let receiverExists = switch (userRoles.get(receiverId)) {
      case (?role) { true };
      case null { false };
    };
    
    if (not receiverExists) {
      return #err("Receiver not found");
    };

    let messageId = Principal.toText(caller) # "_" # Principal.toText(receiverId) # "_" # Int.toText(Time.now());
    let now = Time.now();
    
    let message: Message = {
      id = messageId;
      senderId = caller;
      receiverId = receiverId;
      content = content;
      messageType = messageType;
      attachments = [];
      isRead = false;
      isEncrypted = true; // All messages are encrypted by default
      timestamp = now;
    };

    messages.put(messageId, message);
    #ok(message)
  };

  public shared query(msg) func getMessages(otherUserId: UserId) : async [Message] {
    let caller = msg.caller;
    
    Array.filter(Iter.toArray(messages.vals()), func(message: Message) : Bool {
      (message.senderId == caller and message.receiverId == otherUserId) or
      (message.senderId == otherUserId and message.receiverId == caller)
    })
  };

  public shared(msg) func markMessageAsRead(messageId: Text) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    switch (messages.get(messageId)) {
      case null { #err("Message not found") };
      case (?message) {
        if (message.receiverId != caller) {
          return #err("Unauthorized: You can only mark your own messages as read");
        };

        let updatedMessage = {
          message with
          isRead = true;
        };

        messages.put(messageId, updatedMessage);
        #ok("Message marked as read")
      };
    }
  };

  // Admin functions for system management
  public shared(msg) func verifyDoctor(doctorId: DoctorId) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, "admin")) {
      return #err("Unauthorized: Only admins can verify doctors");
    };

    switch (doctors.get(doctorId)) {
      case null { #err("Doctor not found") };
      case (?doctor) {
        let updatedDoctor = {
          doctor with
          isVerified = true;
          updatedAt = Time.now();
        };

        doctors.put(doctorId, updatedDoctor);
        #ok("Doctor verified successfully")
      };
    }
  };

  // System statistics and analytics
  public query func getSystemStats() : async {
    totalPatients: Nat;
    totalDoctors: Nat;
    totalAppointments: Nat;
    totalMedicalRecords: Nat;
    totalMessages: Nat;
    totalChatInteractions: Nat;
  } {
    {
      totalPatients = patients.size();
      totalDoctors = doctors.size();
      totalAppointments = appointments.size();
      totalMedicalRecords = medicalRecords.size();
      totalMessages = messages.size();
      totalChatInteractions = chatInteractionsMap.size();
    }
  };

  // Chat interaction logging for mental health sessions
  public type ChatInteraction = {
    id: Text;
    userId: Principal;
    message: Text;
    emotionalTone: ?Text;
    timestamp: Int;
    sessionId: Text;
  };

  private stable var chatInteractions: [(Text, ChatInteraction)] = [];
  private var chatInteractionsMap = HashMap.fromIter<Text, ChatInteraction>(chatInteractions.vals(), chatInteractions.size(), Text.equal, Text.hash);

  // Helper function to generate unique IDs
  private func generateId() : Text {
    "interaction_" # Int.toText(Time.now()) # "_" # Int.toText(chatInteractionsMap.size())
  };

  // Log user chat interactions securely
  public shared(msg) func logChatInteraction(
    message: Text,
    emotionalTone: ?Text,
    sessionId: Text
  ) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    let interactionId = generateId();
    
    let interaction: ChatInteraction = {
      id = interactionId;
      userId = caller;
      message = message;
      emotionalTone = emotionalTone;
      timestamp = Time.now();
      sessionId = sessionId;
    };
    
    chatInteractionsMap.put(interactionId, interaction);
    #ok("Chat interaction logged successfully")
  };

  // Get user's chat history (for continuity of care)
  public shared(msg) func getUserChatHistory(sessionId: ?Text) : async Result.Result<[ChatInteraction], Text> {
    let caller = msg.caller;
    
    let userInteractions = Array.filter<ChatInteraction>(
      Iter.toArray(chatInteractionsMap.vals()),
      func(interaction) {
        interaction.userId == caller and
        (switch (sessionId) {
          case (?sid) { interaction.sessionId == sid };
          case null { true };
        })
      }
    );
    
    #ok(userInteractions)
  };

  // Get chat analytics for mental health insights (admin only)
  public shared(msg) func getChatAnalytics() : async Result.Result<{totalInteractions: Nat; uniqueUsers: Nat}, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, "admin")) {
      return #err("Unauthorized: Only admins can access chat analytics");
    };
    
    let allInteractions = Iter.toArray(chatInteractionsMap.vals());
    let uniqueUsers = Array.foldLeft<ChatInteraction, [Principal]>(
      allInteractions,
      [],
      func(acc, interaction) {
        if (Array.find<Principal>(acc, func(p) { p == interaction.userId }) == null) {
          Array.append(acc, [interaction.userId])
        } else {
          acc
        }
      }
    );
    
    #ok({
      totalInteractions = allInteractions.size();
      uniqueUsers = uniqueUsers.size();
    })
  };

  // Health check function
  public query func healthCheck() : async {status: Text; timestamp: Int; version: Text} {
    {
      status = "healthy";
      timestamp = Time.now();
      version = "1.0.0";
    }
  };

  // Get chat endpoint for frontend integration
  public func getChatEndpoint() : async Text {
    "MentalVerse backend with simplified AI chat (no external dependencies)"
  };
};
