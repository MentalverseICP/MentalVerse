import Principal "mo:base/Principal";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Int "mo:base/Int";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Buffer "mo:base/Buffer";
import Option "mo:base/Option";

// Authentication and Authorization Module for MentalVerse
module {
  // Type definitions
  public type UserId = Principal;
  
  public type UserType = {
    #patient;
    #therapist;
    #admin;
  };
  
  // Permission definitions for granular access control
  public type Permission = {
    #read_own_profile;
    #update_own_profile;
    #read_patient_data;
    #write_patient_data;
    #read_session_notes;
    #write_session_notes;
    #read_prescriptions;
    #write_prescriptions;
    #manage_appointments;
    #system_admin;
    #manage_users;
    #assign_roles;
    #view_audit_logs;
    #emergency_access;
  };
  
  public type PermissionScope = {
    #own_only;
    #assigned_only;
    #department_only;
    #global;
  };
  
  // Enhanced permission with scope and conditions
  public type ScopedPermission = {
    permission: Permission;
    scope: PermissionScope;
    conditions: ?Text;
    expiresAt: ?Int;
    isActive: Bool;
  };
  
  // Role definition with granular permissions
  public type RoleDefinition = {
    name: Text;
    description: Text;
    permissions: [ScopedPermission];
    inheritsFrom: ?Text; // Role inheritance
    isSystemRole: Bool;
    createdAt: Int;
    updatedAt: Int;
  };
  
  // User permission assignment (can override role permissions)
  public type UserPermissionOverride = {
    userId: Principal;
    permission: ScopedPermission;
    reason: Text;
    grantedBy: Principal;
    grantedAt: Int;
  };
  
  public type UserProfile = {
    id: UserId;
    email: Text;
    firstName: Text;
    lastName: Text;
    userType: UserType;
    createdAt: Int;
    updatedAt: Int;
    isActive: Bool;
    lastLogin: ?Int;
    department: ?Text;
  };
  
  public type UserProfileUpdates = {
    email: ?Text;
    firstName: ?Text;
    lastName: ?Text;
    department: ?Text;
    isActive: ?Bool;
  };
  
  // Authentication state management
  public class AuthManager() {
    private var userProfiles = HashMap.HashMap<UserId, UserProfile>(100, Principal.equal, Principal.hash);
    private var userRoleAssignments = HashMap.HashMap<Principal, UserType>(100, Principal.equal, Principal.hash);
    private var userRoles = HashMap.HashMap<UserId, Text>(10, Principal.equal, Principal.hash); // Legacy support
    private var roleDefinitions = HashMap.HashMap<Text, RoleDefinition>(20, Text.equal, Text.hash);
    private var userPermissionOverrides = HashMap.HashMap<Text, UserPermissionOverride>(50, Text.equal, Text.hash);
    
    // Initialize default role definitions
    public func initializeDefaultRoles() {
      let now = Time.now();
      
      // Patient role
      let patientRole: RoleDefinition = {
        name = "patient";
        description = "Standard patient with access to own medical data";
        permissions = [
          { permission = #read_own_profile; scope = #own_only; conditions = null; expiresAt = null; isActive = true },
          { permission = #update_own_profile; scope = #own_only; conditions = null; expiresAt = null; isActive = true },
          { permission = #read_patient_data; scope = #own_only; conditions = null; expiresAt = null; isActive = true },
          { permission = #read_prescriptions; scope = #own_only; conditions = null; expiresAt = null; isActive = true }
        ];
        inheritsFrom = null;
        isSystemRole = true;
        createdAt = now;
        updatedAt = now;
      };
      
      // Therapist role
      let therapistRole: RoleDefinition = {
        name = "therapist";
        description = "Licensed therapist with patient care permissions";
        permissions = [
          { permission = #read_own_profile; scope = #own_only; conditions = null; expiresAt = null; isActive = true },
          { permission = #update_own_profile; scope = #own_only; conditions = null; expiresAt = null; isActive = true },
          { permission = #read_patient_data; scope = #assigned_only; conditions = null; expiresAt = null; isActive = true },
          { permission = #write_patient_data; scope = #assigned_only; conditions = null; expiresAt = null; isActive = true },
          { permission = #read_session_notes; scope = #assigned_only; conditions = null; expiresAt = null; isActive = true },
          { permission = #write_session_notes; scope = #assigned_only; conditions = null; expiresAt = null; isActive = true },
          { permission = #read_prescriptions; scope = #assigned_only; conditions = null; expiresAt = null; isActive = true },
          { permission = #write_prescriptions; scope = #assigned_only; conditions = null; expiresAt = null; isActive = true },
          { permission = #manage_appointments; scope = #assigned_only; conditions = null; expiresAt = null; isActive = true }
        ];
        inheritsFrom = null;
        isSystemRole = true;
        createdAt = now;
        updatedAt = now;
      };
      
      // Admin role
      let adminRole: RoleDefinition = {
        name = "admin";
        description = "System administrator with full access";
        permissions = [
          { permission = #system_admin; scope = #global; conditions = null; expiresAt = null; isActive = true },
          { permission = #manage_users; scope = #global; conditions = null; expiresAt = null; isActive = true },
          { permission = #assign_roles; scope = #global; conditions = null; expiresAt = null; isActive = true },
          { permission = #view_audit_logs; scope = #global; conditions = null; expiresAt = null; isActive = true },
          { permission = #emergency_access; scope = #global; conditions = null; expiresAt = null; isActive = true }
        ];
        inheritsFrom = null;
        isSystemRole = true;
        createdAt = now;
        updatedAt = now;
      };
      
      roleDefinitions.put("patient", patientRole);
      roleDefinitions.put("therapist", therapistRole);
      roleDefinitions.put("admin", adminRole);
    };
    
    // User registration
    public func registerUser(caller: Principal, userData: {
      email: Text;
      firstName: Text;
      lastName: Text;
      userType: UserType;
    }) : Result.Result<Text, Text> {
      // Check if user already exists
      switch (userProfiles.get(caller)) {
        case (?_existing) { return #err("User already registered") };
        case null {};
      };
      
      let now = Time.now();
      let profile: UserProfile = {
        id = caller;
        email = userData.email;
        firstName = userData.firstName;
        lastName = userData.lastName;
        userType = userData.userType;
        createdAt = now;
        updatedAt = now;
        isActive = true;
        lastLogin = null;
        department = null;
      };
      
      userProfiles.put(caller, profile);
      
      // Update legacy role mapping
      let roleText = switch (userData.userType) {
        case (#patient) { "patient" };
        case (#therapist) { "therapist" };
        case (#admin) { "admin" };
      };
      userRoles.put(caller, roleText);
      
      // Store role assignment
      userRoleAssignments.put(caller, userData.userType);
      
      #ok("User registered with role: " # roleText # ", email: " # userData.email)
    };
    
    // Update user type
    public func updateUserType(caller: Principal, userType: UserType) : Result.Result<Text, Text> {
      switch (userProfiles.get(caller)) {
        case null { return #err("User profile not found") };
        case (?profile) {
          let updatedProfile: UserProfile = {
            profile with
            userType = userType;
            updatedAt = Time.now();
          };
          userProfiles.put(caller, updatedProfile);
          
          // Update legacy role mapping
          let roleText = switch (userType) {
            case (#patient) { "patient" };
            case (#therapist) { "therapist" };
            case (#admin) { "admin" };
          };
          userRoles.put(caller, roleText);
          
          // Update role assignment
          userRoleAssignments.put(caller, userType);
          
          #ok("User type updated to: " # roleText)
        };
      }
    };
    
    // Update user profile with partial updates
     public func updateUserProfile(caller: Principal, updates: UserProfileUpdates) : Result.Result<UserProfile, Text> {
       switch (userProfiles.get(caller)) {
         case null { return #err("User profile not found") };
         case (?profile) {
           let updatedProfile: UserProfile = {
             id = profile.id;
             email = Option.get(updates.email, profile.email);
             firstName = Option.get(updates.firstName, profile.firstName);
             lastName = Option.get(updates.lastName, profile.lastName);
             userType = profile.userType;
             createdAt = profile.createdAt;
             updatedAt = Time.now();
             isActive = Option.get(updates.isActive, profile.isActive);
             lastLogin = profile.lastLogin;
             department = switch (updates.department) {
               case (?newDept) { ?newDept };
               case null { profile.department };
             };
           };
           userProfiles.put(caller, updatedProfile);
           #ok(updatedProfile)
         };
       }
     };
    
    // Get current user profile
    public func getCurrentUserProfile(caller: Principal) : Result.Result<UserProfile, Text> {
      switch (userProfiles.get(caller)) {
        case (?profile) { #ok(profile) };
        case null { #err("User profile not found") };
      }
    };
    
    // Get current user info
    public func getCurrentUser(caller: Principal) : Result.Result<{id: UserId; role: Text}, Text> {
      switch (userProfiles.get(caller)) {
        case (?profile) {
          let roleText = switch (profile.userType) {
            case (#patient) { "patient" };
            case (#therapist) { "therapist" };
            case (#admin) { "admin" };
          };
          #ok({id = caller; role = roleText})
        };
        case null { #err("User not found") };
      }
    };
    
    // Check if user has specific role
    public func hasRole(userId: Principal, requiredRole: UserType) : Bool {
      switch (userRoleAssignments.get(userId)) {
        case (?role) { role == requiredRole };
        case null { false };
      }
    };
    
    // Enhanced authorization check with multiple roles
    public func hasAnyRole(userId: Principal, allowedRoles: [UserType]) : Bool {
      switch (userRoleAssignments.get(userId)) {
        case (?userRole) {
          Array.find<UserType>(allowedRoles, func(role) { role == userRole }) != null
        };
        case null { false };
      }
    };
    
    // Basic authorization check
    public func isAuthorized(caller: UserId, requiredUserType: UserType) : Bool {
      hasRole(caller, requiredUserType)
    };
    
    // Legacy authorization check
    public func isAuthorizedLegacy(caller: UserId, requiredRole: Text) : Bool {
      switch (userRoles.get(caller)) {
        case (?role) { role == requiredRole or role == "admin" };
        case null { false };
      }
    };
    
    // Assign role to user (admin only)
    public func assignUserRole(caller: Principal, targetUserId: Principal, newRole: UserType) : Result.Result<Text, Text> {
      // Only admins can assign roles
      if (not hasRole(caller, #admin)) {
        return #err("Unauthorized: Only admins can assign roles");
      };
      
      // Update role assignment
      userRoleAssignments.put(targetUserId, newRole);
      
      // Update user profile if exists
      switch (userProfiles.get(targetUserId)) {
        case (?profile) {
          let updatedProfile: UserProfile = {
            profile with
            userType = newRole;
            updatedAt = Time.now();
          };
          userProfiles.put(targetUserId, updatedProfile);
        };
        case null { /* User profile doesn't exist, role assignment is enough */ };
      };
      
      // Update legacy role mapping
      let roleText = switch (newRole) {
        case (#patient) { "patient" };
        case (#therapist) { "therapist" };
        case (#admin) { "admin" };
      };
      userRoles.put(targetUserId, roleText);
      
      #ok("Role assigned successfully")
    };
    
    // Get user role
    public func getUserRole(caller: Principal, userId: ?Principal) : Result.Result<UserType, Text> {
      let targetUserId = switch (userId) {
        case (?id) { id };
        case null { caller };
      };
      
      // Users can check their own role, admins can check any role
      if (caller != targetUserId and not hasRole(caller, #admin)) {
        return #err("Unauthorized: Cannot access other users' roles");
      };
      
      switch (userRoleAssignments.get(targetUserId)) {
        case (?role) { #ok(role) };
        case null { #err("User role not found") };
      }
    };
    
    // Get all admin users
    public func getAdminUsers(caller: Principal) : Result.Result<[Principal], Text> {
      if (not hasRole(caller, #admin)) {
        return #err("Unauthorized: Only admins can view admin list");
      };
      
      let adminUsers = Buffer.Buffer<Principal>(0);
      for ((userId, role) in userRoleAssignments.entries()) {
        if (role == #admin) {
          adminUsers.add(userId);
        };
      };
      
      #ok(Buffer.toArray(adminUsers))
    };
    
    // Remove admin privileges
    public func removeAdminPrivileges(caller: Principal, targetUserId: Principal) : Result.Result<Text, Text> {
      if (not hasRole(caller, #admin)) {
        return #err("Unauthorized: Only admins can remove admin privileges");
      };
      
      // Update role to patient (default)
      userRoleAssignments.put(targetUserId, #patient);
      
      // Update user profile if exists
      switch (userProfiles.get(targetUserId)) {
        case (?profile) {
          let updatedProfile: UserProfile = {
            profile with
            userType = #patient;
            updatedAt = Time.now();
          };
          userProfiles.put(targetUserId, updatedProfile);
        };
        case null { /* User profile doesn't exist, role assignment is enough */ };
      };
      
      // Update legacy role mapping
      userRoles.put(targetUserId, "patient");
      
      #ok("Admin privileges removed successfully")
    };
    
    // Enhanced granular authorization with scoped permissions
    public func hasPermission(caller: Principal, requiredPermission: Permission, _resourceId: ?Text, _context: ?Text) : async Bool {
      // Get all effective permissions for the user
      let effectivePermissions = await getEffectivePermissions(caller);
      
      // Check each permission to see if it matches and scope allows access
      for (scopedPerm in effectivePermissions.vals()) {
        if (scopedPerm.permission == requiredPermission and scopedPerm.isActive) {
          // Check if permission has expired
          switch (scopedPerm.expiresAt) {
            case (?expiry) {
              if (Time.now() > expiry) {
                // Permission has expired, skip
              } else {
                return true; // Permission is valid and not expired
              };
            };
            case null {
              return true; // Permission doesn't expire
            };
          };
        };
      };
      
      false
    };
    
    // Get all effective permissions for a user (role + overrides)
    public func getEffectivePermissions(userId: Principal) : async [ScopedPermission] {
      var permissions: [ScopedPermission] = [];
      
      // Get role-based permissions
      switch (userRoleAssignments.get(userId)) {
        case (?userType) {
          let roleName = switch (userType) {
            case (#patient) { "patient" };
            case (#therapist) { "therapist" };
            case (#admin) { "admin" };
          };
          permissions := await getRolePermissions(roleName);
        };
        case null { /* No role assigned */ };
      };
      
      // Add user-specific permission overrides
      let overrideKey = Principal.toText(userId);
      switch (userPermissionOverrides.get(overrideKey)) {
        case (?override) {
          permissions := Array.append(permissions, [override.permission]);
        };
        case null { /* No overrides */ };
      };
      
      permissions
    };
    
    // Get permissions for a role (including inherited permissions)
    public func getRolePermissions(roleName: Text) : async [ScopedPermission] {
      var allPermissions: [ScopedPermission] = [];
      
      switch (roleDefinitions.get(roleName)) {
        case (?role) {
          allPermissions := role.permissions;
          
          // Add inherited permissions
          switch (role.inheritsFrom) {
            case (?parentRole) {
              let parentPermissions = await getRolePermissions(parentRole);
              allPermissions := Array.append(allPermissions, parentPermissions);
            };
            case null { /* No inheritance */ };
          };
        };
        case null { /* Role not found */ };
      };
      
      allPermissions
    };
    
    // Create or update a role definition (admin only)
    public func createRole(
      caller: Principal,
      roleName: Text,
      description: Text,
      permissions: [ScopedPermission],
      inheritsFrom: ?Text
    ) : async Result.Result<Text, Text> {
      // Only admins can create roles
      let hasAdminPermission = await hasPermission(caller, #system_admin, null, null);
      if (not hasAdminPermission) {
        return #err("Unauthorized: Only system administrators can create roles");
      };
      
      let now = Time.now();
      let roleDefinition: RoleDefinition = {
        name = roleName;
        description = description;
        permissions = permissions;
        inheritsFrom = inheritsFrom;
        isSystemRole = false;
        createdAt = now;
        updatedAt = now;
      };
      
      roleDefinitions.put(roleName, roleDefinition);
      
      #ok("Role '" # roleName # "' created successfully")
    };
    
    // Grant specific permission to a user (admin only)
    public func grantUserPermission(
      caller: Principal,
      targetUserId: Principal,
      permission: ScopedPermission,
      reason: Text
    ) : async Result.Result<Text, Text> {
      // Only admins can grant permissions
      let hasGrantPermission = await hasPermission(caller, #assign_roles, null, null);
      if (not hasGrantPermission) {
        return #err("Unauthorized: Only administrators can grant permissions");
      };
      
      let override: UserPermissionOverride = {
        userId = targetUserId;
        permission = permission;
        reason = reason;
        grantedBy = caller;
        grantedAt = Time.now();
      };
      
      let overrideKey = Principal.toText(targetUserId);
      userPermissionOverrides.put(overrideKey, override);
      
      #ok("Permission granted successfully")
    };
    
    // Revoke specific permission from a user (admin only)
    public func revokeUserPermission(
      caller: Principal,
      targetUserId: Principal
    ) : async Result.Result<Text, Text> {
      // Only admins can revoke permissions
      let hasRevokePermission = await hasPermission(caller, #assign_roles, null, null);
      if (not hasRevokePermission) {
        return #err("Unauthorized: Only administrators can revoke permissions");
      };
      
      let overrideKey = Principal.toText(targetUserId);
      switch (userPermissionOverrides.get(overrideKey)) {
        case (?_existing) {
          userPermissionOverrides.delete(overrideKey);
          #ok("Permission revoked successfully")
        };
        case null {
          #err("No permission override found for this user")
        };
      }
    };
    
    // Get user's effective permissions (for debugging/admin view)
    public func getUserPermissions(
      caller: Principal,
      targetUserId: Principal
    ) : async Result.Result<[ScopedPermission], Text> {
      // Only admins or the user themselves can view permissions
      let hasViewAuditPermission = await hasPermission(caller, #view_audit_logs, null, null);
      if (caller != targetUserId and not hasViewAuditPermission) {
        return #err("Unauthorized: Can only view own permissions or admin access required");
      };
      
      let permissions = await getEffectivePermissions(targetUserId);
      #ok(permissions)
    };
    
    // State management for upgrades
    public func preupgrade() : {
      userProfilesEntries: [(UserId, UserProfile)];
      userRoleAssignmentsEntries: [(Principal, UserType)];
      userRolesEntries: [(UserId, Text)];
      roleDefinitionsEntries: [(Text, RoleDefinition)];
      userPermissionOverridesEntries: [(Text, UserPermissionOverride)];
    } {
      {
        userProfilesEntries = Iter.toArray(userProfiles.entries());
        userRoleAssignmentsEntries = Iter.toArray(userRoleAssignments.entries());
        userRolesEntries = Iter.toArray(userRoles.entries());
        roleDefinitionsEntries = Iter.toArray(roleDefinitions.entries());
        userPermissionOverridesEntries = Iter.toArray(userPermissionOverrides.entries());
      }
    };
    
    public func postupgrade(state: {
      userProfilesEntries: [(UserId, UserProfile)];
      userRoleAssignmentsEntries: [(Principal, UserType)];
      userRolesEntries: [(UserId, Text)];
      roleDefinitionsEntries: [(Text, RoleDefinition)];
      userPermissionOverridesEntries: [(Text, UserPermissionOverride)];
    }) {
      for ((id, profile) in state.userProfilesEntries.vals()) {
        userProfiles.put(id, profile);
      };
      
      for ((userId, role) in state.userRoleAssignmentsEntries.vals()) {
        userRoleAssignments.put(userId, role);
      };
      
      for ((id, role) in state.userRolesEntries.vals()) {
        userRoles.put(id, role);
      };
      
      for ((name, definition) in state.roleDefinitionsEntries.vals()) {
        roleDefinitions.put(name, definition);
      };
      
      for ((key, override) in state.userPermissionOverridesEntries.vals()) {
        userPermissionOverrides.put(key, override);
      };
      
      // Initialize default roles if none exist
      if (roleDefinitions.size() == 0) {
        initializeDefaultRoles();
      };
    };
  };
}