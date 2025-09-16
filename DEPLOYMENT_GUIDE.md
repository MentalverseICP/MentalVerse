# MentalVerse Deployment Guide

This guide provides comprehensive instructions for deploying MentalVerse to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Local Development Deployment](#local-development-deployment)
4. [Production Deployment](#production-deployment)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **DFX**: Latest version (Internet Computer SDK)
- **Git**: For version control

### Required Accounts

- **Internet Computer**: For canister deployment
- **OpenAI**: For AI features (API key required)
- **Hosting Service**: For backend deployment (Railway, Heroku, AWS, etc.)
- **Frontend Hosting**: For frontend deployment (Vercel, Netlify, etc.)

### Installation

```bash
# Install DFX
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"

# Verify installations
node --version
npm --version
dfx --version
```

## Environment Setup

### 1. Clone and Setup Repository

```bash
git clone <repository-url>
cd MentalVerse

# Use automated setup
node setup-env.js

# Or manual setup
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

### 2. Configure Environment Variables

#### Development Environment

**Frontend (.env.local)**:
```env
VITE_IC_NETWORK=local
VITE_IC_HOST=http://localhost:4943
VITE_CANISTER_ID_MENTALVERSE=rrkah-fqaaa-aaaaa-aaaaq-cai
VITE_CANISTER_ID_MVT_TOKEN=ryjl3-tyaaa-aaaaa-aaaba-cai
VITE_CANISTER_ID_SECURE_MESSAGING=rdmx6-jaaaa-aaaaa-aaadq-cai
VITE_INTERNET_IDENTITY_URL=http://localhost:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai
VITE_API_BASE_URL=http://localhost:3001
NODE_ENV=development
```

**Backend (.env)**:
```env
PORT=3001
NODE_ENV=development
OPENAI_API_KEY=your-openai-api-key
FRONTEND_URL=http://localhost:5173
IC_NETWORK=local
IC_HOST=http://localhost:4943
CANISTER_ID_MENTALVERSE=rrkah-fqaaa-aaaaa-aaaaq-cai
CANISTER_ID_MVT_TOKEN=ryjl3-tyaaa-aaaaa-aaaba-cai
CANISTER_ID_SECURE_MESSAGING=rdmx6-jaaaa-aaaaa-aaadq-cai
SESSION_SECRET=your-secure-session-secret
```

#### Production Environment

**Frontend (.env.production)**:
```env
VITE_IC_NETWORK=ic
VITE_IC_HOST=https://ic0.app
VITE_CANISTER_ID_MENTALVERSE=your-production-canister-id
VITE_CANISTER_ID_MVT_TOKEN=your-production-token-canister-id
VITE_CANISTER_ID_SECURE_MESSAGING=your-production-messaging-canister-id
VITE_INTERNET_IDENTITY_URL=https://identity.ic0.app
VITE_API_BASE_URL=https://your-backend-domain.com
NODE_ENV=production
```

**Backend (.env.production)**:
```env
PORT=3001
NODE_ENV=production
OPENAI_API_KEY=your-production-openai-api-key
FRONTEND_URL=https://your-frontend-domain.com
IC_NETWORK=ic
IC_HOST=https://ic0.app
CANISTER_ID_MENTALVERSE=your-production-canister-id
CANISTER_ID_MVT_TOKEN=your-production-token-canister-id
CANISTER_ID_SECURE_MESSAGING=your-production-messaging-canister-id
SESSION_SECRET=your-production-session-secret
```

## Local Development Deployment

### 1. Start Local IC Replica

```bash
# Start the local Internet Computer replica
dfx start --background

# Verify it's running
dfx ping
```

### 2. Deploy Canisters

```bash
# Deploy all canisters
dfx deploy

# Or deploy individually
dfx deploy mentalverse
dfx deploy mvt_token
dfx deploy secure_messaging

# Check deployment status
dfx canister status --all
```

### 3. Update Environment Variables

```bash
# Get canister IDs
dfx canister id mentalverse
dfx canister id mvt_token
dfx canister id secure_messaging

# Update .env files with actual canister IDs
```

### 4. Install Dependencies and Start Services

```bash
# Install all dependencies
npm run install:all

# Start backend (in one terminal)
cd backend
npm run dev

# Start frontend (in another terminal)
cd frontend
npm run dev
```

### 5. Verify Local Deployment

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- IC Dashboard: http://localhost:4943/_/dashboard

## Production Deployment

### Phase 1: Internet Computer Deployment

#### 1. Prepare for IC Mainnet

```bash
# Ensure you have cycles for deployment
dfx wallet balance

# If needed, get cycles from the cycles faucet or exchange
```

#### 2. Deploy to IC Mainnet

```bash
# Deploy to mainnet
dfx deploy --network ic

# Verify deployment
dfx canister status --all --network ic

# Get production canister IDs
dfx canister id mentalverse --network ic
dfx canister id mvt_token --network ic
dfx canister id secure_messaging --network ic
```

#### 3. Update Production Environment Files

```bash
# Update frontend/.env.production with actual canister IDs
# Update backend/.env.production with actual canister IDs
```

### Phase 2: Backend Deployment

#### Option A: Railway Deployment

1. **Create Railway Account**: Sign up at railway.app
2. **Connect Repository**: Link your GitHub repository
3. **Configure Environment Variables**:
   ```
   PORT=3001
   NODE_ENV=production
   OPENAI_API_KEY=your-api-key
   FRONTEND_URL=https://your-frontend-domain.com
   IC_NETWORK=ic
   IC_HOST=https://ic0.app
   CANISTER_ID_MENTALVERSE=your-canister-id
   CANISTER_ID_MVT_TOKEN=your-token-canister-id
   CANISTER_ID_SECURE_MESSAGING=your-messaging-canister-id
   SESSION_SECRET=your-secure-session-secret
   ```
4. **Deploy**: Railway will automatically deploy from your repository

#### Option B: Heroku Deployment

```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set OPENAI_API_KEY=your-api-key
heroku config:set FRONTEND_URL=https://your-frontend-domain.com
heroku config:set IC_NETWORK=ic
heroku config:set IC_HOST=https://ic0.app
heroku config:set CANISTER_ID_MENTALVERSE=your-canister-id
heroku config:set CANISTER_ID_MVT_TOKEN=your-token-canister-id
heroku config:set CANISTER_ID_SECURE_MESSAGING=your-messaging-canister-id
heroku config:set SESSION_SECRET=your-secure-session-secret

# Deploy
git push heroku main
```

### Phase 3: Frontend Deployment

#### Option A: Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Configure Environment Variables**:
   - Go to Vercel dashboard
   - Add environment variables from `.env.production`

3. **Deploy**:
   ```bash
   cd frontend
   vercel --prod
   ```

#### Option B: Netlify Deployment

1. **Build the Frontend**:
   ```bash
   cd frontend
   cp .env.production .env.local
   npm run build
   ```

2. **Deploy to Netlify**:
   - Drag and drop the `dist/` folder to Netlify
   - Or connect your GitHub repository
   - Configure environment variables in Netlify dashboard

### Phase 4: DNS and SSL Configuration

1. **Configure Custom Domains**:
   - Frontend: Configure your domain to point to Vercel/Netlify
   - Backend: Configure your domain to point to Railway/Heroku

2. **SSL Certificates**:
   - Most hosting services provide automatic SSL
   - Verify HTTPS is working for both frontend and backend

## Post-Deployment Verification

### 1. Functional Testing

Use the comprehensive testing guide (`TESTING_GUIDE.md`):

```bash
# Run the testing checklist
# ✅ Authentication flow
# ✅ Secure messaging
# ✅ Token operations
# ✅ Error handling
# ✅ Cross-browser compatibility
```

### 2. Performance Testing

```bash
# Check canister performance
dfx canister status --all --network ic

# Monitor response times
# Test with multiple concurrent users
# Verify error rates are acceptable
```

### 3. Security Verification

- ✅ All API keys are secure and not exposed
- ✅ HTTPS is enforced
- ✅ CORS is properly configured
- ✅ Session security is implemented
- ✅ Input validation is working

## Monitoring and Maintenance

### 1. Canister Monitoring

```bash
# Check canister cycles
dfx canister status mentalverse --network ic
dfx canister status mvt_token --network ic
dfx canister status secure_messaging --network ic

# Top up cycles if needed
dfx canister deposit-cycles <amount> <canister-id> --network ic
```

### 2. Application Monitoring

- **Error Rates**: Monitor application error logs
- **Response Times**: Track API response times
- **User Activity**: Monitor authentication and messaging activity
- **Resource Usage**: Monitor server resources and costs

### 3. Regular Maintenance

```bash
# Update dependencies regularly
npm audit
npm update

# Update DFX
dfx upgrade

# Backup important data
# Monitor security advisories
```

## Troubleshooting

### Common Deployment Issues

#### 1. Canister Deployment Failures

**Problem**: Deployment fails with cycle errors

**Solution**:
```bash
# Check wallet balance
dfx wallet balance

# Get cycles from faucet or exchange
# Retry deployment
dfx deploy --network ic
```

#### 2. Environment Variable Issues

**Problem**: Configuration not loading correctly

**Solutions**:
- Verify all environment variables are set
- Check variable names match exactly
- Restart services after changes
- Use the setup script: `node setup-env.js`

#### 3. CORS Issues

**Problem**: Frontend can't connect to backend

**Solutions**:
- Verify FRONTEND_URL in backend environment
- Check CORS configuration in backend
- Ensure both services use HTTPS in production

#### 4. Authentication Issues

**Problem**: Internet Identity login fails

**Solutions**:
- Verify Internet Identity URL is correct
- Check canister IDs are accurate
- Clear browser cache and localStorage
- Verify IC network configuration

### Emergency Procedures

#### 1. Service Outage

1. Check service status dashboards
2. Verify canister status: `dfx canister status --all --network ic`
3. Check hosting service status
4. Review error logs
5. Implement rollback if necessary

#### 2. Security Incident

1. Immediately rotate API keys and secrets
2. Review access logs
3. Update security configurations
4. Notify users if necessary
5. Document incident and response

## Rollback Procedures

### 1. Canister Rollback

```bash
# Stop current canister
dfx canister stop <canister-id> --network ic

# Deploy previous version
# (Ensure you have the previous code version)
dfx deploy <canister-name> --network ic

# Verify rollback
dfx canister status <canister-id> --network ic
```

### 2. Application Rollback

- **Frontend**: Revert to previous deployment in Vercel/Netlify
- **Backend**: Revert to previous deployment in Railway/Heroku
- **Database**: Restore from backup if necessary

## Best Practices

### 1. Deployment Checklist

- [ ] All tests pass
- [ ] Environment variables configured
- [ ] Security review completed
- [ ] Performance testing done
- [ ] Monitoring configured
- [ ] Rollback plan prepared
- [ ] Documentation updated

### 2. Security Best Practices

- Use strong, unique secrets for production
- Regularly rotate API keys and secrets
- Monitor for security vulnerabilities
- Keep dependencies updated
- Use HTTPS everywhere
- Implement proper error handling

### 3. Performance Best Practices

- Monitor canister cycles usage
- Optimize API calls and responses
- Implement caching where appropriate
- Monitor and optimize bundle sizes
- Use CDN for static assets

## Support and Resources

- **Internet Computer Documentation**: https://internetcomputer.org/docs
- **DFX Documentation**: https://sdk.dfinity.org/docs
- **Project Issues**: GitHub Issues
- **Community Support**: IC Developer Discord

---

**Note**: This deployment guide should be updated as the project evolves. Always test deployments in a staging environment before production deployment.