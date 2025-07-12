import Principal "mo:base/Principal";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Int "mo:base/Int";
import Text "mo:base/Text";

// Internet Identity Integration Module
// This module handles authentication and identity management for the MentalVerse platform

module {
  // Type definitions for Internet Identity integration
  public type UserId = Principal;
  public type SessionId = Text;
  public type AuthToken = Text;
  
  // Session data structure
  public type UserSession = {
    userId: UserId;
    sessionId: SessionId;
    createdAt: Int;
    expiresAt: Int;
    isActive: Bool;
    lastActivity: Int;
    deviceInfo: Text;
    ipAddress: ?Text;
  };
  
  // Authentication result types
  public type AuthResult = {
    #success: {
      userId: UserId;
      sessionId: SessionId;
      expiresAt: Int;
    };
    #error: Text;
  };
  
  // User profile for Internet Identity
  public type IdentityProfile = {
    userId: UserId;
    anchor: Nat64; // Internet Identity anchor
    createdAt: Int;
    lastLogin: Int;
    loginCount: Nat;
    isVerified: Bool;
    twoFactorEnabled: Bool;
  };
  
  // Session management functions
  public func createSession(userId: UserId, deviceInfo: Text) : UserSession {
    let now = Time.now();
    let sessionId = Principal.toText(userId) # "_" # Int.toText(now);
    let expiresAt = now + (24 * 60 * 60 * 1_000_000_000); // 24 hours in nanoseconds
    
    {
      userId = userId;
      sessionId = sessionId;
      createdAt = now;
      expiresAt = expiresAt;
      isActive = true;
      lastActivity = now;
      deviceInfo = deviceInfo;
      ipAddress = null;
    }
  };
  
  public func isSessionValid(session: UserSession) : Bool {
    let now = Time.now();
    session.isActive and session.expiresAt > now
  };
  
  public func updateSessionActivity(session: UserSession) : UserSession {
    {
      session with
      lastActivity = Time.now();
    }
  };
  
  public func invalidateSession(session: UserSession) : UserSession {
    {
      session with
      isActive = false;
    }
  };
  
  // Identity verification functions
  public func createIdentityProfile(userId: UserId, anchor: Nat64) : IdentityProfile {
    let now = Time.now();
    {
      userId = userId;
      anchor = anchor;
      createdAt = now;
      lastLogin = now;
      loginCount = 1;
      isVerified = true; // Internet Identity provides verification
      twoFactorEnabled = false;
    }
  };
  
  public func updateLoginInfo(profile: IdentityProfile) : IdentityProfile {
    {
      profile with
      lastLogin = Time.now();
      loginCount = profile.loginCount + 1;
    }
  };
  
  // Security utilities
  public func generateSessionToken(userId: UserId, sessionId: SessionId) : AuthToken {
    // In a real implementation, this would use cryptographic functions
    // For now, we'll create a simple token
    Principal.toText(userId) # "_" # sessionId # "_" # Int.toText(Time.now())
  };
  
  public func validateAuthToken(token: AuthToken, expectedUserId: UserId) : Bool {
    // Simple validation - in production, use proper JWT or similar
    let userIdText = Principal.toText(expectedUserId);
    Text.startsWith(token, #text userIdText)
  };
  
  // Permission and role management
  public func hasPermission(userId: UserId, requiredRole: Text, userRoles: HashMap.HashMap<UserId, Text>) : Bool {
    switch (userRoles.get(userId)) {
      case (?role) {
        role == requiredRole or role == "admin"
      };
      case null { false };
    }
  };
  
  // Audit logging for security
  public type AuditLog = {
    userId: UserId;
    action: Text;
    timestamp: Int;
    details: Text;
    ipAddress: ?Text;
    userAgent: ?Text;
  };
  
  public func createAuditLog(userId: UserId, action: Text, details: Text) : AuditLog {
    {
      userId = userId;
      action = action;
      timestamp = Time.now();
      details = details;
      ipAddress = null;
      userAgent = null;
    }
  };
  
  // Rate limiting for security
  public type RateLimit = {
    userId: UserId;
    action: Text;
    count: Nat;
    windowStart: Int;
    windowDuration: Int; // in nanoseconds
  };
  
  public func checkRateLimit(rateLimit: RateLimit, maxRequests: Nat) : Bool {
    let now = Time.now();
    let windowEnd = rateLimit.windowStart + rateLimit.windowDuration;
    
    if (now > windowEnd) {
      // Window has expired, reset
      true
    } else {
      // Check if within limit
      rateLimit.count < maxRequests
    }
  };
  
  public func updateRateLimit(rateLimit: RateLimit) : RateLimit {
    let now = Time.now();
    let windowEnd = rateLimit.windowStart + rateLimit.windowDuration;
    
    if (now > windowEnd) {
      // Reset window
      {
        rateLimit with
        count = 1;
        windowStart = now;
      }
    } else {
      // Increment count
      {
        rateLimit with
        count = rateLimit.count + 1;
      }
    }
  };
};