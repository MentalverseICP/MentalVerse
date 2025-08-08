import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Emotional tone detection function
function detectEmotionalTone(message) {
  const text = message.toLowerCase();
  
  // Define emotional indicators
  const emotions = {
    anxious: ['worried', 'nervous', 'scared', 'panic', 'anxiety', 'anxious', 'fear', 'terrified', 'overwhelmed'],
    depressed: ['sad', 'depressed', 'hopeless', 'empty', 'worthless', 'lonely', 'down', 'miserable', 'despair'],
    stressed: ['stressed', 'pressure', 'overwhelmed', 'exhausted', 'burned out', 'tension', 'strain'],
    angry: ['angry', 'furious', 'mad', 'irritated', 'frustrated', 'rage', 'annoyed', 'upset'],
    hopeful: ['hopeful', 'optimistic', 'better', 'improving', 'positive', 'good', 'happy', 'grateful'],
    confused: ['confused', 'lost', 'uncertain', 'unsure', 'don\'t know', 'unclear', 'mixed up'],
    excited: ['excited', 'thrilled', 'amazing', 'wonderful', 'fantastic', 'great', 'awesome'],
    calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'content', 'balanced']
  };
  
  // Crisis indicators
  const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'don\'t want to live', 'hurt myself', 'self harm'];
  
  // Check for crisis indicators first
  for (const keyword of crisisKeywords) {
    if (text.includes(keyword)) {
      return { primary: 'crisis', confidence: 'high', severity: 'critical' };
    }
  }
  
  // Score emotions based on keyword matches
  const scores = {};
  for (const [emotion, keywords] of Object.entries(emotions)) {
    scores[emotion] = keywords.filter(keyword => text.includes(keyword)).length;
  }
  
  // Find the emotion with the highest score
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) {
    return { primary: 'neutral', confidence: 'low', severity: 'normal' };
  }
  
  const primaryEmotion = Object.keys(scores).find(emotion => scores[emotion] === maxScore);
  const confidence = maxScore >= 2 ? 'high' : maxScore === 1 ? 'medium' : 'low';
  
  // Determine severity
  let severity = 'normal';
  if (['depressed', 'anxious', 'stressed'].includes(primaryEmotion) && maxScore >= 2) {
    severity = 'elevated';
  } else if (['hopeful', 'excited', 'calm'].includes(primaryEmotion)) {
    severity = 'positive';
  }
  
  return { primary: primaryEmotion, confidence, severity };
}

// Mental health tips generator
function getMentalHealthTip(emotionalTone) {
  const tips = {
    anxious: [
      "Try the 4-7-8 breathing technique: Inhale for 4, hold for 7, exhale for 8.",
      "Ground yourself with the 5-4-3-2-1 technique: 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.",
      "Remember: anxiety is temporary and you have overcome difficult moments before."
    ],
    depressed: [
      "Small steps count. Even getting out of bed or taking a shower is an achievement.",
      "Try to spend 10 minutes outside today - sunlight and fresh air can help lift your mood.",
      "Reach out to one person you trust. Connection can be healing."
    ],
    stressed: [
      "Take 5 deep breaths and remind yourself: you can only control what's in your power.",
      "Try progressive muscle relaxation: tense and release each muscle group for 5 seconds.",
      "Break overwhelming tasks into smaller, manageable steps."
    ],
    angry: [
      "Count to 10 slowly before responding. This gives your rational mind time to engage.",
      "Physical activity can help release anger energy - try a quick walk or some stretching.",
      "Ask yourself: Will this matter in 5 years? This can help put things in perspective."
    ],
    confused: [
      "It's okay not to have all the answers right now. Clarity often comes with time.",
      "Try journaling your thoughts - writing can help organize confusing feelings.",
      "Consider talking to someone you trust about what you're experiencing."
    ]
  };
  
  const emotionTips = tips[emotionalTone.primary] || [
    "Take a moment to check in with yourself and acknowledge how you're feeling.",
    "Remember to be kind to yourself - you're doing the best you can.",
    "Consider what small act of self-care you could do for yourself today."
  ];
  
  return emotionTips[Math.floor(Math.random() * emotionTips.length)];
}

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

// Chat interaction logging endpoint
app.post('/api/log-interaction',
  [
    body('message').isString().isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters'),
    body('emotionalTone').optional().isString(),
    body('sessionId').isString().withMessage('Session ID is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { message, emotionalTone, sessionId } = req.body;
      
      // In a real implementation, this would call the Internet Computer backend
      // For now, we'll simulate the logging
      const logEntry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: message,
        emotionalTone: emotionalTone,
        sessionId: sessionId,
        timestamp: new Date().toISOString(),
        status: 'logged'
      };
      
      // TODO: Integrate with Internet Computer backend
      // await icBackend.logChatInteraction(message, emotionalTone, sessionId);
      
      res.json({
        success: true,
        logEntry: logEntry,
        message: 'Chat interaction logged successfully'
      });
      
    } catch (error) {
      console.error('Log interaction error:', error);
      res.status(500).json({
        error: 'Failed to log chat interaction',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Get mental health resources endpoint
app.get('/api/resources', (req, res) => {
  res.json({
    crisis: {
      suicide_prevention: {
        name: "988 Suicide & Crisis Lifeline",
        phone: "988",
        website: "https://988lifeline.org",
        available: "24/7"
      },
      crisis_text: {
        name: "Crisis Text Line",
        text: "Text HOME to 741741",
        website: "https://www.crisistextline.org",
        available: "24/7"
      },
      emergency: {
        name: "Emergency Services",
        phone: "911",
        note: "For immediate life-threatening emergencies"
      }
    },
    support: {
      nami: {
        name: "National Alliance on Mental Illness",
        phone: "1-800-950-NAMI (6264)",
        website: "https://www.nami.org"
      },
      samhsa: {
        name: "SAMHSA National Helpline",
        phone: "1-800-662-4357",
        website: "https://www.samhsa.gov",
        note: "Treatment referral and information service"
      }
    },
    breathing_exercises: [
      {
        name: "4-7-8 Breathing",
        steps: ["Inhale for 4 counts", "Hold for 7 counts", "Exhale for 8 counts", "Repeat 3-4 times"]
      },
      {
        name: "Box Breathing",
        steps: ["Inhale for 4 counts", "Hold for 4 counts", "Exhale for 4 counts", "Hold for 4 counts"]
      }
    ],
    grounding_techniques: [
      {
        name: "5-4-3-2-1 Technique",
        description: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste"
      },
      {
        name: "Progressive Muscle Relaxation",
        description: "Tense and release each muscle group for 5 seconds, starting from your toes"
      }
    ]
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

      // Enhanced system prompt for clinical-grade mental health assistance
      const systemPrompt = {
        role: 'system',
        content: `You are MindMate, a clinical-grade AI mental health assistant on the MentalVerse platform. You provide warm, empathetic, and evidence-based support with a friendly, encouraging tone.

🎯 CORE RESPONSIBILITIES:
• Emotional tone detection: Analyze user messages for emotional states (anxious, depressed, stressed, overwhelmed, hopeful, etc.)
• Intelligent follow-up questions: Ask thoughtful, open-ended questions that encourage deeper reflection
• Mental health education: Provide brief, actionable tips and coping strategies
• Crisis recognition: Identify signs of severe distress or suicidal ideation
• Therapeutic techniques: Offer breathing exercises, mindfulness practices, and grounding techniques

💬 COMMUNICATION STYLE:
• Use warm, encouraging, and positive affirmations
• Validate emotions without judgment
• Ask one thoughtful follow-up question per response
• Keep responses concise but meaningful (3-5 sentences)
• Use "I" statements to show empathy ("I can hear that you're feeling...")
• Incorporate the user's name when provided

🧠 THERAPEUTIC APPROACHES:
• Cognitive Behavioral Therapy (CBT) techniques
• Mindfulness and grounding exercises
• Breathing techniques (4-7-8, box breathing)
• Progressive muscle relaxation
• Gratitude practices and positive reframing

⚠️ SAFETY PROTOCOLS:
• If suicidal thoughts detected: Immediately provide crisis resources (988 Suicide & Crisis Lifeline)
• For severe symptoms: Encourage professional help
• Never diagnose or prescribe medication
• Maintain appropriate boundaries

📝 RESPONSE FORMAT:
1. Acknowledge the emotion/situation
2. Provide validation and support
3. Offer a brief coping strategy or insight
4. Ask one thoughtful follow-up question
5. End with encouragement or affirmation

Remember: You're creating a safe, supportive space for mental health growth and healing.`
      };

      const apiMessages = [systemPrompt, ...messages.slice(-10)]; // Keep last 10 messages for context

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4.1', // Using gpt-4.1 as primary model
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

      // Detect emotional tone from user's last message
      const lastUserMessage = messages[messages.length - 1];
      const emotionalTone = detectEmotionalTone(lastUserMessage?.content || '');
      
      // Generate mental health tip based on emotional tone
      const mentalHealthTip = getMentalHealthTip(emotionalTone);
      
      // Enhanced response with mental health features
      const response = {
        message: {
          role: assistantMessage.role,
          content: assistantMessage.content,
          timestamp: new Date().toISOString()
        },
        analysis: {
          emotionalTone: emotionalTone,
          mentalHealthTip: mentalHealthTip,
          sessionId: req.headers['x-session-id'] || 'anonymous',
          supportLevel: emotionalTone.severity === 'critical' ? 'crisis' : 
                       emotionalTone.severity === 'elevated' ? 'enhanced' : 'standard'
        },
        usage: completion.usage
      };
      
      // Add crisis resources if needed
      if (emotionalTone.severity === 'critical') {
        response.analysis.crisisResources = {
          immediate: "988 Suicide & Crisis Lifeline",
          text: "Text HOME to 741741 for Crisis Text Line",
          emergency: "Call 911 for immediate emergency assistance",
          message: "Your safety is important. Please reach out for immediate help."
        };
      }

      res.json(response);

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