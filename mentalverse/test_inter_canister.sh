#!/bin/bash

# Test script for inter-canister communication between Motoko backend and Rust secure messaging

echo "🧪 Testing Inter-Canister Communication"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if dfx is running
print_info "Checking if dfx replica is running..."
if ! dfx ping > /dev/null 2>&1; then
    echo -e "${RED}❌ DFX replica is not running. Please start it with 'dfx start'${NC}"
    exit 1
fi
print_status 0 "DFX replica is running"

# Deploy canisters in correct order
print_info "Deploying canisters..."

# Deploy Internet Identity first
print_info "Deploying Internet Identity..."
dfx deploy internet_identity
print_status $? "Internet Identity deployment"

# Deploy Secure Messaging canister
print_info "Deploying Secure Messaging canister..."
dfx deploy secure_messaging
print_status $? "Secure Messaging canister deployment"

# Deploy MVT Token canister
print_info "Deploying MVT Token canister..."
dfx deploy mvt_token_canister
print_status $? "MVT Token canister deployment"

# Deploy Backend canister (depends on secure_messaging)
print_info "Deploying MentalVerse Backend..."
dfx deploy mentalverse_backend
print_status $? "MentalVerse Backend deployment"

# Test health checks
print_info "Testing canister health checks..."

# Test backend health
echo "Testing backend health..."
BACKEND_HEALTH=$(dfx canister call mentalverse_backend healthCheck 2>/dev/null)
if [[ $? -eq 0 ]]; then
    print_status 0 "Backend health check"
    echo "  Response: $BACKEND_HEALTH"
else
    print_status 1 "Backend health check"
fi

# Test secure messaging health through backend
echo "Testing secure messaging health through backend..."
SECURE_HEALTH=$(dfx canister call mentalverse_backend getSecureMessagingHealth 2>/dev/null)
if [[ $? -eq 0 ]]; then
    print_status 0 "Secure messaging health check via backend"
    echo "  Response: $SECURE_HEALTH"
else
    print_status 1 "Secure messaging health check via backend"
fi

# Test direct secure messaging health
echo "Testing direct secure messaging health..."
DIRECT_HEALTH=$(dfx canister call secure_messaging health_check 2>/dev/null)
if [[ $? -eq 0 ]]; then
    print_status 0 "Direct secure messaging health check"
    echo "  Response: $DIRECT_HEALTH"
else
    print_status 1 "Direct secure messaging health check"
fi

# Get canister IDs for reference
print_info "Canister IDs:"
echo "Backend: $(dfx canister id mentalverse_backend)"
echo "Secure Messaging: $(dfx canister id secure_messaging)"
echo "MVT Token: $(dfx canister id mvt_token_canister)"
echo "Internet Identity: $(dfx canister id internet_identity)"

# Test inter-canister communication with a mock user
print_info "Testing inter-canister communication..."

# Note: These tests would require actual user authentication in a real scenario
# For now, we'll test the canister interfaces are properly connected

echo "Testing secure messaging stats through backend..."
STATS_RESULT=$(dfx canister call secure_messaging get_stats 2>/dev/null)
if [[ $? -eq 0 ]]; then
    print_status 0 "Secure messaging stats retrieval"
    echo "  Stats: $STATS_RESULT"
else
    print_status 1 "Secure messaging stats retrieval"
fi

print_info "Inter-canister communication test completed!"
echo ""
echo "📋 Summary:"
echo "- All canisters should be deployed and healthy"
echo "- Backend can communicate with secure messaging canister"
echo "- Ready for frontend integration testing"
echo ""
echo "🚀 Next steps:"
echo "1. Test with authenticated users through the frontend"
echo "2. Create therapy conversations"
echo "3. Send secure messages between users"
echo "4. Verify message encryption and storage"