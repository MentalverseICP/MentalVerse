# MentalVerse Backend Deployment Guide

This guide walks you through deploying the Node.js backend server for MentalVerse on Render, which will handle OpenAI API calls securely for the MindMate chatbot.

## 🏗️ Architecture Overview

**Before (Insecure):**
```
Frontend → OpenAI API (API key exposed)
```

**After (Secure):**
```
Frontend → Backend Server → OpenAI API (API key secure)
```

## 📋 Prerequisites

1. **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **GitHub Repository**: Your code should be in a GitHub repository

## 🚀 Step 1: Deploy Backend to Render

### Option A: Using Render Dashboard (Recommended)

1. **Create New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: `mentalverse-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (for testing) or Starter ($7/month for production)

3. **Set Environment Variables**
   ```
   NODE_ENV=production
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   FRONTEND_URL=https://your-frontend-domain.com
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (usually 2-5 minutes)
   - Note your backend URL: `https://mentalverse-backend.onrender.com`

### Option B: Using render.yaml (Advanced)

1. **Update render.yaml**
   ```yaml
   services:
     - type: web
       name: mentalverse-backend
       env: node
       plan: free
       buildCommand: npm install
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: OPENAI_API_KEY
           sync: false
         - key: FRONTEND_URL
           value: https://your-frontend-domain.com
   ```

2. **Deploy via Git**
   ```bash
   git add .
   git commit -m "Add backend deployment config"
   git push origin main
   ```

## 🌐 Step 2: Update Frontend Configuration

### Update Environment Variables

1. **Update `.env.local`** (or create from `.env.example`):
   ```env
   # Backend API Configuration
   VITE_BACKEND_URL=https://mentalverse-backend.onrender.com
   
   # Other existing variables...
   REACT_APP_BACKEND_CANISTER_ID=u6s2n-gx777-77774-qaaba-cai
   REACT_APP_IC_HOST=http://localhost:4943
   ```

2. **For Production Frontend** (Vercel/Netlify):
   ```env
   VITE_BACKEND_URL=https://mentalverse-backend.onrender.com
   ```

### Update CORS Configuration

In your backend `server.js`, update the CORS origins:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com', 'https://mentalverse.vercel.app']
    : ['http://localhost:3000', 'http://localhost:5173'],
  // ... other CORS settings
}));
```

## 🧪 Step 3: Test the Deployment

### Test Backend Health
```bash
curl https://mentalverse-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "service": "MentalVerse Backend"
}
```

### Test Chat API
```bash
curl -X POST https://mentalverse-backend.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, I need some support today"}
    ]
  }'
```

### Test Frontend Integration

1. **Start Frontend Locally**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Test Chatbot**:
   - Open `http://localhost:5173`
   - Click the chat widget
   - Send a test message
   - Verify you get a response from MindMate

## 📊 Step 4: Monitor and Optimize

### Monitor Logs
```bash
# View Render logs
render logs --service mentalverse-backend
```

### Monitor OpenAI Usage
- Check [OpenAI Usage Dashboard](https://platform.openai.com/usage)
- Set up billing alerts
- Monitor token consumption

### Performance Optimization

1. **Enable Render Auto-Sleep** (Free plan):
   - Service sleeps after 15 minutes of inactivity
   - First request after sleep takes ~30 seconds

2. **Upgrade to Starter Plan** ($7/month):
   - No auto-sleep
   - Better performance
   - Custom domains

## 🔒 Security Best Practices

### Environment Variables
- ✅ Never commit API keys to Git
- ✅ Use Render's environment variable system
- ✅ Rotate API keys regularly

### Rate Limiting
- ✅ Backend includes rate limiting (10 requests/minute)
- ✅ Monitor for abuse
- ✅ Adjust limits based on usage

### CORS Configuration
- ✅ Only allow your frontend domains
- ✅ Update CORS when deploying to new domains

## 🚨 Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**
   - Check environment variables in Render dashboard
   - Ensure API key starts with `sk-`
   - Verify API key has sufficient credits

2. **CORS Errors**
   - Update `FRONTEND_URL` environment variable
   - Check CORS configuration in `server.js`
   - Ensure frontend is using correct backend URL

3. **Rate Limiting Errors**
   - Implement exponential backoff in frontend
   - Monitor usage patterns
   - Consider upgrading OpenAI plan

4. **Service Sleeping (Free Plan)**
   - First request after 15 minutes takes longer
   - Consider upgrading to Starter plan
   - Implement loading states in frontend

### Debug Steps

1. **Check Backend Health**:
   ```bash
   curl https://your-backend-url.onrender.com/health
   ```

2. **Check Render Logs**:
   - Go to Render dashboard
   - Select your service
   - View "Logs" tab

3. **Test API Directly**:
   ```bash
   curl -X POST https://your-backend-url.onrender.com/api/chat \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"test"}]}'
   ```

## 💰 Cost Estimation

### Render Hosting
- **Free Plan**: $0/month (with limitations)
- **Starter Plan**: $7/month (recommended for production)

### OpenAI API
- **GPT-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **Estimated**: $5-20/month for moderate usage (1000-5000 conversations)

### Total Monthly Cost
- **Development**: $0 (Free Render + minimal OpenAI usage)
- **Production**: $12-27/month (Starter Render + moderate OpenAI usage)

## 🔄 Continuous Deployment

### Auto-Deploy Setup
1. Connect GitHub repository to Render
2. Enable auto-deploy on main branch
3. Push changes to trigger deployment

### Deployment Workflow
```bash
# Make changes
git add .
git commit -m "Update backend functionality"
git push origin main

# Render automatically deploys
# Check deployment status in dashboard
```

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Production Checklist](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

## 🆘 Support

If you encounter issues:

1. **Check the logs** first (Render dashboard → Logs)
2. **Verify environment variables** are set correctly
3. **Test the health endpoint** to ensure service is running
4. **Review this guide** for common solutions
5. **Check OpenAI status** at [status.openai.com](https://status.openai.com)

---

**🎉 Congratulations!** Your MentalVerse backend is now securely deployed and ready to handle AI conversations for your users.

**Next Steps:**
1. Deploy your frontend with the updated backend URL
2. Test the complete user flow
3. Monitor usage and costs
4. Consider implementing user authentication for personalized conversations