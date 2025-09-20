# MentalVerse Backend Server

Node.js backend server for MentalVerse with OpenAI integration for the MindMate chatbot.

## Features

- 🤖 **OpenAI Integration**: Secure server-side API calls to OpenAI GPT-4o-mini
- 🔒 **Security**: Helmet, CORS, rate limiting, and input validation
- 🚀 **Production Ready**: Optimized for deployment on Render, Heroku, or similar platforms
- 📊 **Monitoring**: Health check endpoint and error logging
- 🛡️ **Rate Limiting**: Prevents API abuse and controls costs
- ✅ **Validation**: Input sanitization and validation for all endpoints

## 🏗️ Architecture

### Backend Components
- **Express.js Server**: RESTful API with middleware for security and validation
- **Smart Contract Proxy**: All authentication and data operations delegated to blockchain smart contracts
- **IC Integration**: Direct integration with Internet Computer canisters for decentralized operations
- **Middleware Stack**: Input sanitization, rate limiting, CORS, and audit logging
- **Legacy Support**: Backward compatibility during smart contract migration

### Security Features
- **Smart Contract Security**: All sensitive operations handled by decentralized blockchain contracts
- **HIPAA Compliance**: Healthcare data protection standards maintained through smart contracts
- **GDPR Compliance**: European data protection regulations enforced by blockchain
- **Input Sanitization**: XSS and injection attack prevention
- **Rate Limiting**: API abuse prevention
- **Audit Logging**: Comprehensive security event tracking via smart contracts
- **Decentralized Authentication**: User authentication managed entirely by smart contracts

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your OpenAI API key
# Get your API key from: https://platform.openai.com/api-keys
```

### 3. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:3001`

### 4. Test the API
```bash
# Health check
curl http://localhost:3001/health

# Test chat endpoint
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, I'm feeling anxious today"}
    ]
  }'
```

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and basic information.

### Chat with AI
```
POST /api/chat
```

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Your message here"
    }
  ]
}
```

**Response:**
```json
{
  "message": {
    "role": "assistant",
    "content": "AI response here",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 30,
    "total_tokens": 80
  }
}
```

## Deployment to Render

### 1. Create Render Account
Sign up at [render.com](https://render.com)

### 2. Connect Repository
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select the `backend` directory as the root

### 3. Configure Build Settings
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Node Version**: 18 or higher

### 4. Environment Variables
Add these environment variables in Render dashboard:

```
NODE_ENV=production
OPENAI_API_KEY=your_actual_openai_api_key
FRONTEND_URL=https://your-frontend-domain.com
```

### 5. Deploy
Click "Create Web Service" and wait for deployment.

## Alternative Deployment Options

### Heroku
```bash
# Install Heroku CLI and login
heroku create mentalverse-backend

# Set environment variables
heroku config:set OPENAI_API_KEY=your_api_key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Railway
```bash
# Install Railway CLI
railway login
railway new

# Set environment variables
railway variables set OPENAI_API_KEY=your_api_key

# Deploy
railway up
```

## Frontend Integration

Update your frontend to use the backend API instead of direct OpenAI calls:

```typescript
// Replace direct OpenAI API calls with:
const response = await fetch(`${BACKEND_URL}/api/chat`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: apiMessages
  })
});

const data = await response.json();
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes, 10 chat requests per minute
- **Input Validation**: Message length and format validation
- **CORS Protection**: Configured for specific frontend domains
- **Helmet**: Security headers for production
- **Error Handling**: Sanitized error responses

## Cost Optimization

- Uses GPT-4o-mini for cost efficiency
- Limits conversation context to last 10 messages
- Rate limiting prevents API abuse
- Token usage monitoring included in responses

## Monitoring

- Health check endpoint for uptime monitoring
- Error logging for debugging
- Usage statistics in API responses
- Graceful shutdown handling

## Development

```bash
# Start with auto-reload
npm run dev

# Production build
npm run build

# Start production server
npm start
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3001 |
| `NODE_ENV` | Environment | No | development |
| `OPENAI_API_KEY` | OpenAI API key | Yes | - |
| `FRONTEND_URL` | Frontend domain | No | localhost:5173 |

## Troubleshooting

### Common Issues

1. **OpenAI API Key Error**
   - Ensure your API key is valid and has sufficient credits
   - Check the key is properly set in environment variables

2. **CORS Errors**
   - Update `FRONTEND_URL` to match your frontend domain
   - Ensure the frontend is making requests to the correct backend URL

3. **Rate Limiting**
   - Implement exponential backoff in frontend
   - Monitor usage and adjust limits if needed

### Logs
```bash
# View logs on Render
render logs --service your-service-name

# Local development
npm run dev
```

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify environment variables are set correctly
3. Test the health endpoint first
4. Review the API documentation above

---

**Note**: Keep your OpenAI API key secure and never commit it to version control. Monitor your usage to control costs.