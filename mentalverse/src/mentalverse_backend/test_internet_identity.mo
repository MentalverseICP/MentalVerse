import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Nat64 "mo:base/Nat64";
import Array "mo:base/Array";

// Import the InternetIdentity actor for testing
import InternetIdentity "./internet_identity";

// Test module for Internet Identity functionality
module {
  
  // Test helper functions
  public func assertEqual<T>(actual: T, expected: T, message: Text) {
    // In a real test framework, this would do proper assertion
    Debug.print("Test: " # message);
  };
  
  public func assertTrue(condition: Bool, message: Text) {
    if (condition) {
      Debug.print("✓ PASS: " # message);
    } else {
      Debug.print("✗ FAIL: " # message);
    };
  };
  
  public func assertFalse(condition: Bool, message: Text) {
    if (not condition) {
      Debug.print("✓ PASS: " # message);
    } else {
      Debug.print("✗ FAIL: " # message);
    };
  };
  
  // Test data
  let testUserId = Principal.fromText("rdmx6-jaaaa-aaaah-qcaiq-cai");
  let testDeviceInfo = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
  let testAnchor: Nat64 = 12345;
  
  // Test session creation and validation
  public func testSessionManagement() : async () {
    Debug.print("\n=== Testing Session Management ===");
    
    // Test session creation
    let session = await InternetIdentity.createSession(testUserId, testDeviceInfo);
    assertTrue(session.userId == testUserId, "Session userId should match");
    assertTrue(session.isActive, "New session should be active");
    assertTrue(Text.size(session.sessionId) > 0, "Session ID should not be empty");
    assertTrue(session.expiresAt > session.createdAt, "Expiration should be after creation");
    
    // Test session validation
    let isValid = await InternetIdentity.isSessionValid(session);
    assertTrue(isValid, "New session should be valid");
    
    // Test session activity update
    let updatedSession = await InternetIdentity.updateSessionActivity(session);
    assertTrue(updatedSession.lastActivity >= session.lastActivity, "Last activity should be updated");
    
    // Test session invalidation
    let invalidatedSession = await InternetIdentity.invalidateSession(session);
    assertFalse(invalidatedSession.isActive, "Invalidated session should not be active");
    
    let isInvalidSessionValid = await InternetIdentity.isSessionValid(invalidatedSession);
    assertFalse(isInvalidSessionValid, "Invalidated session should not be valid");
  };
  
  // Test identity profile management
  public func testIdentityProfile() : async () {
    Debug.print("\n=== Testing Identity Profile ===");
    
    // Test profile creation
    let profile = await InternetIdentity.createIdentityProfile(testUserId, testAnchor);
    assertTrue(profile.userId == testUserId, "Profile userId should match");
    assertTrue(profile.anchor == testAnchor, "Profile anchor should match");
    assertTrue(profile.isVerified, "Profile should be verified");
    assertTrue(profile.loginCount == 1, "Initial login count should be 1");
    
    // Test login info update
    let updatedProfile = await InternetIdentity.updateLoginInfo(profile);
    assertTrue(updatedProfile.loginCount == 2, "Login count should increment");
    assertTrue(updatedProfile.lastLogin >= profile.lastLogin, "Last login should be updated");
  };
  
  // Test token generation and validation
  public func testTokenSecurity() : async () {
    Debug.print("\n=== Testing Token Security ===");
    
    let sessionId = "test_session_123";
    
    // Test token generation
    let token = await InternetIdentity.generateSessionToken(testUserId, sessionId);
    assertTrue(Text.size(token) > 0, "Token should not be empty");
    assertTrue(Text.contains(token, #char '.'), "Token should contain timestamp separator");
    
    // Test token validation with correct parameters
    let isValidToken = await InternetIdentity.validateAuthToken(token, testUserId, sessionId);
    assertTrue(isValidToken, "Token should be valid with correct parameters");
    
    // Test token validation with wrong user
    let wrongUserId = Principal.fromText("rrkah-fqaaa-aaaah-qcaiq-cai");
    let isInvalidToken = await InternetIdentity.validateAuthToken(token, wrongUserId, sessionId);
    assertFalse(isInvalidToken, "Token should be invalid with wrong user");
    
    // Test token validation with wrong session
    let wrongSessionId = "wrong_session_456";
    let isInvalidSession = await InternetIdentity.validateAuthToken(token, testUserId, wrongSessionId);
    assertFalse(isInvalidSession, "Token should be invalid with wrong session");
  };
  
  // Test password hashing and verification
  public func testPasswordSecurity() : async () {
    Debug.print("\n=== Testing Password Security ===");
    
    let password = "SecurePassword123!";
    
    // Test salt generation
    let salt = await InternetIdentity.generateSalt(testUserId);
    assertTrue(Text.size(salt) > 0, "Salt should not be empty");
    
    // Test password hashing
    let hashedPassword = await InternetIdentity.hashPassword(password, salt);
    assertTrue(Text.size(hashedPassword) > 0, "Hashed password should not be empty");
    
    // Test password verification with correct password
    let isCorrectPassword = await InternetIdentity.verifyPassword(password, hashedPassword, salt);
    assertTrue(isCorrectPassword, "Correct password should verify");
    
    // Test password verification with wrong password
    let wrongPassword = "WrongPassword456!";
    let isWrongPassword = await InternetIdentity.verifyPassword(wrongPassword, hashedPassword, salt);
    assertFalse(isWrongPassword, "Wrong password should not verify");
    
    // Test that same password with different salt produces different hash
    let salt2 = await InternetIdentity.generateSalt(testUserId);
    let hashedPassword2 = await InternetIdentity.hashPassword(password, salt2);
    assertTrue(hashedPassword != hashedPassword2, "Same password with different salt should produce different hash");
  };
  
  // Test API key generation and validation
  public func testApiKeySecurity() : async () {
    Debug.print("\n=== Testing API Key Security ===");
    
    let purpose = "mobile_app_access";
    
    // Test API key generation
    let apiKey = await InternetIdentity.generateApiKey(testUserId, purpose);
    assertTrue(Text.size(apiKey) > 0, "API key should not be empty");
    
    // Test API key validation
    let isValidApiKey = await InternetIdentity.validateApiKey(apiKey);
    assertTrue(isValidApiKey, "Generated API key should be valid");
    
    // Test invalid API key
    let invalidApiKey = "invalid_key_123";
    let isInvalidApiKey = await InternetIdentity.validateApiKey(invalidApiKey);
    assertFalse(isInvalidApiKey, "Invalid API key should not validate");
    
    // Test API key format
    assertTrue(Text.size(apiKey) > 15, "API key should be longer than 15 characters");
  };
  
  // Test permission system
  public func testPermissionSystem() : async () {
    Debug.print("\n=== Testing Permission System ===");
    
    // Test user with correct role
    let userRole = ?"doctor";
    let hasCorrectPermission = await InternetIdentity.hasPermission(testUserId, "doctor", userRole);
    assertTrue(hasCorrectPermission, "User with correct role should have permission");
    
    // Test admin role (should have all permissions)
    let adminRole = ?"admin";
    let hasAdminPermission = await InternetIdentity.hasPermission(testUserId, "doctor", adminRole);
    assertTrue(hasAdminPermission, "Admin should have all permissions");
    
    // Test user with wrong role
    let wrongRole = ?"patient";
    let hasWrongPermission = await InternetIdentity.hasPermission(testUserId, "doctor", wrongRole);
    assertFalse(hasWrongPermission, "User with wrong role should not have permission");
    
    // Test user with no role
    let noRole: ?Text = null;
    let hasNoPermission = await InternetIdentity.hasPermission(testUserId, "doctor", noRole);
    assertFalse(hasNoPermission, "User with no role should not have permission");
  };
  
  // Test audit logging
  public func testAuditLogging() : async () {
    Debug.print("\n=== Testing Audit Logging ===");
    
    let action = "user_login";
    let details = "User logged in successfully";
    
    // Test audit log creation
    let auditLog = await InternetIdentity.createAuditLog(testUserId, action, details);
    assertTrue(auditLog.userId == testUserId, "Audit log userId should match");
    assertTrue(auditLog.action == action, "Audit log action should match");
    assertTrue(auditLog.details == details, "Audit log details should match");
    assertTrue(auditLog.timestamp > 0, "Audit log should have valid timestamp");
  };
  
  // Test rate limiting
  public func testRateLimiting() : async () {
    Debug.print("\n=== Testing Rate Limiting ===");
    
    let windowDuration = 60 * 1_000_000_000; // 1 minute in nanoseconds
    let maxRequests = 5;
    
    // Create initial rate limit
    let initialRateLimit = {
      userId = testUserId;
      action = "api_call";
      count = 0;
      windowStart = Time.now();
      windowDuration = windowDuration;
    };
    
    // Test rate limit check (should pass initially)
    let canProceed1 = await InternetIdentity.checkRateLimit(initialRateLimit, maxRequests);
    assertTrue(canProceed1, "Initial rate limit check should pass");
    
    // Test rate limit update
    let updatedRateLimit = await InternetIdentity.updateRateLimit(initialRateLimit);
    assertTrue(updatedRateLimit.count == 1, "Rate limit count should increment");
    
    // Simulate multiple requests
    var currentRateLimit = updatedRateLimit;
    var i = 1;
    while (i < maxRequests) {
      currentRateLimit := await InternetIdentity.updateRateLimit(currentRateLimit);
      i += 1;
    };
    
    // Should still be within limit
    let canProceed2 = await InternetIdentity.checkRateLimit(currentRateLimit, maxRequests);
    assertTrue(canProceed2, "Should still be within rate limit");
    
    // One more request should exceed limit
    let exceededRateLimit = await InternetIdentity.updateRateLimit(currentRateLimit);
    let canProceed3 = await InternetIdentity.checkRateLimit(exceededRateLimit, maxRequests);
    assertFalse(canProceed3, "Should exceed rate limit");
  };
  
  // Run all tests
  public func runAllTests() : async () {
    Debug.print("\n🧪 Starting Internet Identity Tests...");
    
    await testSessionManagement();
    await testIdentityProfile();
    await testTokenSecurity();
    await testPasswordSecurity();
    await testApiKeySecurity();
    await testPermissionSystem();
    await testAuditLogging();
    await testRateLimiting();
    
    Debug.print("\n✅ All tests completed!");
  };
}