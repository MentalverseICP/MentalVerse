# MentalVerse Phase 0 Testing Guide

This guide provides comprehensive manual testing steps to verify all Phase 0 fixes are working correctly.

## 🧪 Testing Environment Setup

### Prerequisites
1. **Local Development Environment**
   ```bash
   # Setup development environment
   node setup-env.js development
   
   # Start local IC replica
   cd mentalverse
   dfx start --clean
   
   # Deploy canisters
   dfx deploy
   
   # Start backend server
   cd ../backend
   npm install
   npm start
   
   # Start frontend
   cd ../frontend
   npm install
   npm run dev
   ```

2. **Production Environment**
   ```bash
   # Setup production environment
   node setup-env.js production
   
   # Verify canister IDs match deployment
   cat mentalverse/canister_ids.json
   ```

## 🔐 Authentication & AuthClient Testing

### Test 1: Initial Authentication Flow
**Objective**: Verify AuthClient initialization and first-time login

**Steps**:
1. Open application in incognito/private browser window
2. Navigate to the application URL
3. Click "Connect Wallet" or "Sign In"
4. Complete Internet Identity authentication
5. Verify successful login and dashboard access

**Expected Results**:
- ✅ AuthClient initializes without errors
- ✅ Internet Identity flow completes successfully
- ✅ User is redirected to dashboard after authentication
- ✅ No duplicate authentication sessions created
- ✅ Console shows proper initialization logs

### Test 2: Wallet Reconnect & Session Persistence
**Objective**: Test automatic reconnection and session handling

**Steps**:
1. Login successfully (from Test 1)
2. Close browser tab (not entire browser)
3. Reopen application in new tab
4. Verify automatic reconnection
5. Refresh the page multiple times
6. Close entire browser and reopen

**Expected Results**:
- ✅ Automatic reconnection works without manual login
- ✅ Session persists across page refreshes
- ✅ Session persists across browser restarts (if configured)
- ✅ No duplicate authentication attempts
- ✅ User remains on dashboard after reconnect

### Test 3: Logout & Session Cleanup
**Objective**: Verify proper session cleanup on logout

**Steps**:
1. Login successfully
2. Navigate to different pages in the app
3. Click logout button
4. Verify redirect to login page
5. Try to access protected routes directly
6. Attempt to login again

**Expected Results**:
- ✅ Logout clears all session data immediately
- ✅ User redirected to login/landing page
- ✅ Protected routes redirect to authentication
- ✅ Fresh login works without issues
- ✅ No residual authentication state

## 🚪 Onboarding Bypass Testing

### Test 4: New User Onboarding Flow
**Objective**: Verify new users go through onboarding

**Steps**:
1. Use fresh Internet Identity (create new one)
2. Login to application
3. Verify onboarding flow starts
4. Complete onboarding process
5. Verify redirect to dashboard

**Expected Results**:
- ✅ New users are directed to onboarding
- ✅ Onboarding flow completes successfully
- ✅ User profile is created properly
- ✅ Dashboard access granted after completion

### Test 5: Existing User Bypass
**Objective**: Verify existing users skip onboarding

**Steps**:
1. Use Internet Identity from completed onboarding
2. Login to application
3. Verify direct redirect to dashboard
4. Check that onboarding is not shown
5. Verify all user data is accessible

**Expected Results**:
- ✅ Existing users bypass onboarding completely
- ✅ Direct redirect to dashboard
- ✅ User data loads correctly
- ✅ No onboarding UI elements shown
- ✅ All features accessible immediately

## 🔒 Secure Messaging Testing

### Test 6: Principal Validation
**Objective**: Test secure messaging principal validation

**Steps**:
1. Login with valid user
2. Navigate to messaging section
3. Attempt to send message to valid user
4. Try invalid principal formats (if accessible)
5. Test conversation creation

**Expected Results**:
- ✅ Valid principals are accepted
- ✅ Invalid principals are rejected with clear errors
- ✅ Messaging client initializes properly
- ✅ Conversations can be created successfully
- ✅ Error messages are user-friendly

### Test 7: Messaging Error Handling
**Objective**: Test error handling in messaging operations

**Steps**:
1. Login successfully
2. Navigate to messaging
3. Test messaging with network disconnected
4. Reconnect network and retry
5. Test with invalid canister states

**Expected Results**:
- ✅ Network errors are handled gracefully
- ✅ Retry mechanisms work properly
- ✅ User receives appropriate error messages
- ✅ Recovery after network restoration
- ✅ No application crashes or freezes

## 🎭 Actor & Canister Testing

### Test 8: Token Actor Consistency
**Objective**: Verify token operations work correctly

**Steps**:
1. Login successfully
2. Navigate to token/wallet section
3. Check token balance display
4. Attempt token transfer (if available)
5. View transaction history

**Expected Results**:
- ✅ Token balance loads correctly
- ✅ Token operations complete successfully
- ✅ Frontend and backend use same canister IDs
- ✅ Transaction history displays properly
- ✅ No actor creation errors in console

### Test 9: Cross-Canister Communication
**Objective**: Test communication between different canisters

**Steps**:
1. Login successfully
2. Perform operations that involve multiple canisters
3. Check console for inter-canister call logs
4. Verify data consistency across services

**Expected Results**:
- ✅ Inter-canister calls succeed
- ✅ Data remains consistent across services
- ✅ No timeout or connection errors
- ✅ Proper error handling for failed calls

## 🌍 Environment Variable Testing

### Test 10: Development Environment
**Objective**: Verify development environment configuration

**Steps**:
1. Run `node setup-env.js development`
2. Check generated `.env.local` files
3. Start application in development mode
4. Verify local canister connections
5. Check console for environment logs

**Expected Results**:
- ✅ Correct development canister IDs used
- ✅ Local IC host configuration
- ✅ Development API endpoints
- ✅ Proper fallback mechanisms
- ✅ Clear environment logging

### Test 11: Production Environment
**Objective**: Verify production environment configuration

**Steps**:
1. Run `node setup-env.js production`
2. Check generated `.env.production` files
3. Build application for production
4. Verify production canister IDs
5. Test with IC mainnet (if deployed)

**Expected Results**:
- ✅ Correct production canister IDs used
- ✅ IC mainnet host configuration
- ✅ Production API endpoints
- ✅ Secure configuration settings
- ✅ No development artifacts in production

## 🔍 Error Handling & Logging Testing

### Test 12: Authentication Error Scenarios
**Objective**: Test error handling in authentication flows

**Steps**:
1. Interrupt authentication process
2. Test with invalid Internet Identity
3. Test network disconnection during auth
4. Check error messages and recovery

**Expected Results**:
- ✅ Clear error messages displayed
- ✅ Graceful handling of auth failures
- ✅ Proper logging of error events
- ✅ Recovery mechanisms work
- ✅ No application crashes

### Test 13: Network Error Handling
**Objective**: Test application behavior under network issues

**Steps**:
1. Login successfully
2. Disconnect network
3. Attempt various operations
4. Reconnect network
5. Verify recovery behavior

**Expected Results**:
- ✅ Network errors detected and reported
- ✅ User-friendly error messages
- ✅ Automatic retry mechanisms
- ✅ Successful recovery after reconnection
- ✅ Data integrity maintained

## 📊 Performance & Stability Testing

### Test 14: Load & Stress Testing
**Objective**: Verify application stability under load

**Steps**:
1. Open multiple browser tabs
2. Login simultaneously in multiple tabs
3. Perform concurrent operations
4. Monitor memory usage and performance
5. Check for memory leaks

**Expected Results**:
- ✅ Multiple sessions handled correctly
- ✅ No significant performance degradation
- ✅ Memory usage remains stable
- ✅ No duplicate session conflicts
- ✅ Consistent behavior across tabs

## 📋 Test Results Documentation

### Test Execution Checklist

**Authentication & AuthClient**
- [ ] Test 1: Initial Authentication Flow
- [ ] Test 2: Wallet Reconnect & Session Persistence
- [ ] Test 3: Logout & Session Cleanup

**Onboarding Bypass**
- [ ] Test 4: New User Onboarding Flow
- [ ] Test 5: Existing User Bypass

**Secure Messaging**
- [ ] Test 6: Principal Validation
- [ ] Test 7: Messaging Error Handling

**Actor & Canister**
- [ ] Test 8: Token Actor Consistency
- [ ] Test 9: Cross-Canister Communication

**Environment Variables**
- [ ] Test 10: Development Environment
- [ ] Test 11: Production Environment

**Error Handling & Logging**
- [ ] Test 12: Authentication Error Scenarios
- [ ] Test 13: Network Error Handling

**Performance & Stability**
- [ ] Test 14: Load & Stress Testing

### Issue Tracking Template

```markdown
## Issue: [Brief Description]

**Test**: [Test Number and Name]
**Severity**: [Critical/High/Medium/Low]
**Environment**: [Development/Production]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Console Errors**:
```
[Any console errors or logs]
```

**Screenshots/Videos**:
[If applicable]

**Additional Notes**:
[Any other relevant information]
```

## 🚀 Deployment Verification

### Pre-Deployment Checklist
- [ ] All tests pass in development environment
- [ ] Environment variables configured correctly
- [ ] Canister IDs match deployment target
- [ ] Security configurations verified
- [ ] Performance benchmarks met

### Post-Deployment Verification
- [ ] Production environment tests pass
- [ ] Live application accessible
- [ ] Authentication flows work on mainnet
- [ ] Inter-canister communication functional
- [ ] Error handling works in production

---

**Note**: This testing guide should be executed thoroughly before any production deployment. Document all issues found and ensure they are resolved before proceeding to the next phase of development.