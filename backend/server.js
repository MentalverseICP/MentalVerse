import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://mental-verse-deploy.vercel.app', 'https://mentalverse.vercel.app']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Chat-specific rate limiting (more restrictive)
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 chat requests per minute
  message: {
    error: 'Too many chat requests, please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'MentalVerse Backend'
  });
});

// Chat endpoint with OpenAI integration
app.post('/api/chat', 
  chatLimiter,
  [
    body('messages').isArray().withMessage('Messages must be an array'),
    body('messages.*.role').isIn(['user', 'assistant', 'system']).withMessage('Invalid message role'),
    body('messages.*.content').isString().isLength({ min: 1, max: 2000 }).withMessage('Message content must be between 1 and 2000 characters'),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { messages } = req.body;

      // Ensure we have the OpenAI API key
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({
          error: 'OpenAI API key not configured'
        });
      }

      // Prepare messages with system prompt
      const systemPrompt = {
        role: 'system',
        content: `You are MindMate, an empathetic, non-judgmental AI mental health assistant designed to support users on the MentalVerse platform. Your tone must always be warm, compassionate, calm, and human-like. 

Key guidelines:
- Detect the user's emotional state based on language cues (e.g., stressed, anxious, depressed, overwhelmed)
- Provide supportive, validating responses that acknowledge their feelings
- Offer practical coping strategies, mindfulness techniques, or gentle suggestions when appropriate
- Never provide medical diagnoses or replace professional therapy
- Encourage seeking professional help when needed
- Keep responses concise but meaningful (2-4 sentences typically)
- Use a conversational, friendly tone while maintaining professionalism
- Show genuine care and understanding in every response
- If someone expresses suicidal thoughts, immediately encourage them to contact emergency services or a crisis hotline

Remember: You're here to provide emotional support, active listening, and gentle guidance to help users feel heard and supported on their mental health journey.`
      };

      const apiMessages = [systemPrompt, ...messages.slice(-10)]; // Keep last 10 messages for context

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using gpt-4o-mini for cost efficiency
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0.3,
        presence_penalty: 0.2,
      });

      const assistantMessage = completion.choices[0]?.message;

      if (!assistantMessage) {
        throw new Error('No response from OpenAI');
      }

      res.json({
        message: {
          role: assistantMessage.role,
          content: assistantMessage.content,
          timestamp: new Date().toISOString()
        },
        usage: completion.usage
      });

    } catch (error) {
      console.error('Chat API Error:', error);
      
      // Handle specific OpenAI errors
      if (error.code === 'insufficient_quota') {
        return res.status(503).json({
          error: 'Service temporarily unavailable due to quota limits'
        });
      }
      
      if (error.code === 'rate_limit_exceeded') {
        return res.status(429).json({
          error: 'Rate limit exceeded, please try again later'
        });
      }

      res.status(500).json({
        error: 'Failed to process chat request',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MentalVerse Backend Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});