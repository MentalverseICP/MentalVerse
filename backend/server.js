import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { icMiddleware, icRoutes, initializeIC } from './src/ic-integration/index.js';
import {
  InputSanitizer,
  sanitizeMiddleware,
  createValidationRules,
  handleValidationErrors,
  suspiciousActivityLimiter,
  SECURITY_CONFIG
} from './src/middleware/inputSanitizer.js';
import {
  authenticateToken,
  requireRole,
  requirePermission,
  requireOwnership,
  requireValidSession,
  auditLog,
  ROLES,
  PERMISSIONS
} from './src/middleware/auth.js';
import authRoutes from './src/routes/auth.js';
import chatRoutes from './src/routes/chat.js';
import consentRoutes from './src/routes/consent.js';
import dataErasureRoutes from './src/routes/dataErasure.js';
import { auditAllEvents, auditSecurityEvents } from './src/middleware/auditMiddleware.js';

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

// Initialize IC integration
initializeIC().catch(console.error);

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

// Audit middleware
app.use(auditAllEvents());
app.use(auditSecurityEvents());

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

// Use IC integration middleware
app.use(icMiddleware);

// Authentication routes (no auth required)
app.use('/api/auth', authRoutes);

// Chat routes
app.use('/api/chat', chatRoutes);

// Consent routes
app.use('/api/consent', consentRoutes);

// Data erasure routes (GDPR Right to be Forgotten)
app.use('/api/data-erasure', dataErasureRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'MentalVerse Backend'
  });
});

// IC integration routes
app.use('/api/ic', icRoutes);

// User registration is now handled by /api/auth/register
// This endpoint is kept for backward compatibility but redirects to the new auth system
app.post('/api/users/register', (req, res) => {
  res.status(301).json({
    message: 'User registration has moved to /api/auth/register',
    redirectTo: '/api/auth/register'
  });
});

// Appointment/session management endpoint
app.post('/api/appointments',
  authenticateToken,
  requirePermission(PERMISSIONS.CREATE_APPOINTMENT),
  suspiciousActivityLimiter,
  sanitizeMiddleware({
    body: {
      patientId: { type: 'id', idType: 'principal' },
      therapistId: { type: 'id', idType: 'principal' },
      notes: { type: 'text', options: { maxLength: SECURITY_CONFIG.MAX_LENGTHS.notes } },
      sessionType: { type: 'text', options: { pattern: /^(individual|group|family)$/, strict: true } },
      scheduledDate: { type: 'text' },
      duration: { type: 'text', options: { pattern: /^[0-9]+$/, maxLength: 3 } }
    }
  }),
  createValidationRules('appointment'),
  handleValidationErrors,
  auditLog('CREATE_APPOINTMENT', 'appointment'),
  async (req, res) => {
    try {
      const {
        patientId,
        therapistId,
        notes,
        sessionType,
        scheduledDate,
        duration
      } = req.body;
      
      const { principal: currentUserPrincipal, role: currentUserRole } = req.user;
      
      // Role-based validation
      if (currentUserRole === ROLES.PATIENT) {
        // Patients can only create appointments for themselves
        if (patientId !== currentUserPrincipal) {
          return res.status(403).json({
            error: 'Access denied',
            message: 'Patients can only create appointments for themselves'
          });
        }
      } else if (currentUserRole === ROLES.THERAPIST) {
        // Therapists can only create appointments where they are the therapist
        if (therapistId !== currentUserPrincipal) {
          return res.status(403).json({
            error: 'Access denied',
            message: 'Therapists can only create appointments for their own practice'
          });
        }
      }
      // Admins can create appointments for anyone
      
      // Validate required fields
      if (!patientId || !therapistId) {
        return res.status(400).json({
          error: 'Missing required appointment information',
          message: 'Patient ID and Therapist ID are required'
        });
      }
      
      // Validate date format
      const appointmentDate = new Date(scheduledDate);
      if (isNaN(appointmentDate.getTime())) {
        return res.status(400).json({
          error: 'Invalid date format',
          message: 'Please provide a valid date for the appointment'
        });
      }
      
      // Ensure appointment is in the future
      if (appointmentDate <= new Date()) {
        return res.status(400).json({
          error: 'Invalid appointment time',
          message: 'Appointment must be scheduled for a future date'
        });
      }
      
      // Create appointment object
      const appointment = {
        id: `appt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        patientId,
        therapistId,
        notes: notes || '',
        sessionType,
        scheduledDate: appointmentDate.toISOString(),
        duration: parseInt(duration) || 60,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        createdBy: currentUserPrincipal
      };
      
      // IC integration for secure appointment creation
      const userPrincipal = req.headers['x-user-principal'];
      if (req.icAgent && userPrincipal) {
        try {
          await req.userSession.createAppointment(userPrincipal, appointment);
          appointment.icCreated = true;
        } catch (icError) {
          console.warn('IC appointment creation warning:', icError.message);
          appointment.icCreated = false;
        }
      }
      
      res.status(201).json({
        success: true,
        appointment: {
          id: appointment.id,
          patientId: appointment.patientId,
          therapistId: appointment.therapistId,
          sessionType: appointment.sessionType,
          scheduledDate: appointment.scheduledDate,
          duration: appointment.duration,
          status: appointment.status,
          createdBy: appointment.createdBy
        },
        message: 'Appointment created successfully'
      });
      
    } catch (error) {
      console.error('Appointment creation error:', error);
      res.status(500).json({
        error: 'Failed to create appointment',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Chat interaction logging endpoint
app.post('/api/log-interaction',
  authenticateToken,
  requirePermission(PERMISSIONS.LOG_INTERACTION),
  suspiciousActivityLimiter,
  sanitizeMiddleware({ 
    body: {
      message: { type: 'text', options: { maxLength: SECURITY_CONFIG.MAX_LENGTHS.message } },
      emotionalTone: { type: 'text', options: { pattern: /^[a-zA-Z]+$/ } },
      sessionId: { type: 'id', idType: 'sessionId' }
    }
  }),
  createValidationRules('logInteraction'),
  handleValidationErrors,
  auditLog('LOG_INTERACTION', 'interaction'),
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
      const { principal: currentUserPrincipal, role: currentUserRole } = req.user;
      const userPrincipal = req.headers['x-user-principal'] || currentUserPrincipal;
      
      // Role-based validation for interaction logging
      if (currentUserRole === ROLES.PATIENT) {
        // Patients can only log interactions for themselves
        if (userPrincipal !== currentUserPrincipal) {
          return res.status(403).json({
            error: 'Access denied',
            message: 'Patients can only log interactions for themselves'
          });
        }
      }
      // Therapists and admins can log interactions for others (for system purposes)
      
      const logEntry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: message,
        emotionalTone: emotionalTone,
        sessionId: sessionId,
        timestamp: new Date().toISOString(),
        status: 'logged',
        loggedBy: currentUserPrincipal,
        loggerRole: currentUserRole
      };
      
      // IC integration for secure message logging
      if (req.icAgent && userPrincipal) {
        try {
          // Log interaction securely on IC
          await req.userSession.logSecureMessage(
            userPrincipal,
            message,
            emotionalTone,
            sessionId,
            {
              loggedBy: currentUserPrincipal,
              loggerRole: currentUserRole
            }
          );
          
          // Update user session stats
          await req.userSession.updateUserStats(userPrincipal, {
            totalInteractions: 1,
            lastActivity: new Date().toISOString()
          });
          
          logEntry.icLogged = true;
          logEntry.status = 'securely_logged';
        } catch (icError) {
          console.warn('IC logging warning:', icError.message);
          logEntry.icLogged = false;
          logEntry.icError = icError.message;
        }
      }
      
      res.json({
        success: true,
        logEntry: {
          id: logEntry.id,
          emotionalTone: logEntry.emotionalTone,
          sessionId: logEntry.sessionId,
          timestamp: logEntry.timestamp,
          status: logEntry.status,
          loggedBy: logEntry.loggedBy
        },
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
  authenticateToken,
  requirePermission(PERMISSIONS.SEND_MESSAGE),
  chatLimiter,
  suspiciousActivityLimiter,
  sanitizeMiddleware({
    body: {
      messages: { type: 'array' },
      sessionId: { type: 'id', idType: 'sessionId' },
      userId: { type: 'id', idType: 'principal' }
    }
  }),
  [
    body('messages').isArray().withMessage('Messages must be an array'),
    body('messages.*.role').isIn(['user', 'assistant', 'system']).withMessage('Invalid message role'),
    body('messages.*.content').isString().isLength({ min: 1, max: SECURITY_CONFIG.MAX_LENGTHS.message }).withMessage(`Message content must be between 1 and ${SECURITY_CONFIG.MAX_LENGTHS.message} characters`),
    body('userId').optional().isString().withMessage('User ID must be a string')
  ],
  handleValidationErrors,
  auditLog('SEND_MESSAGE', 'chat'),
  async (req, res) => {
    try {
      let { messages, userId } = req.body;
      const { principal: currentUserPrincipal, role: currentUserRole } = req.user;
      
      // Role-based validation for user ownership
      if (userId && currentUserRole === ROLES.PATIENT) {
        // Patients can only send messages as themselves
        if (userId !== currentUserPrincipal) {
          return res.status(403).json({
            error: 'Access denied',
            message: 'Patients can only send messages as themselves'
          });
        }
      }
      // Therapists and admins can send messages on behalf of others (for system purposes)
      
      // Additional sanitization for messages array content
      if (Array.isArray(messages)) {
        messages = messages.map(msg => {
          if (msg && typeof msg === 'object') {
            return {
              role: msg.role,
              content: InputSanitizer.sanitizeText(msg.content, {
                maxLength: SECURITY_CONFIG.MAX_LENGTHS.message,
                allowHtml: false
              })
            };
          }
          return msg;
        }).filter(msg => msg && msg.content && msg.content.trim().length > 0);
      }
      
      // Check for suspicious patterns in message content
      const messageContent = messages.map(m => m.content).join(' ');
      const suspiciousCheck = InputSanitizer.detectSuspiciousInput(messageContent);
      
      if (suspiciousCheck.isSuspicious && suspiciousCheck.severity === 'high') {
        console.warn('Suspicious chat input detected:', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          patterns: suspiciousCheck.patterns,
          messagePreview: messageContent.substring(0, 100)
        });
        
        return res.status(400).json({
          error: 'Invalid message content',
          message: 'Your message contains potentially harmful content'
        });
      }

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

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
      
      // IC integration for user session and token operations
      const sessionId = req.headers['x-session-id'] || 'anonymous';
      const userPrincipal = req.headers['x-user-principal'] || currentUserPrincipal;
      const effectiveUserId = userId || currentUserPrincipal;
      
      // Update user session with chat interaction
      if (req.icAgent && userPrincipal) {
        try {
          await req.userSession.updateUserStats(userPrincipal, {
            chatInteractions: 1,
            emotionalTone: emotionalTone.primary,
            lastActivity: new Date().toISOString()
          });
          
          // Award tokens for positive interactions
          if (emotionalTone.severity !== 'critical') {
            await req.userSession.awardTokens(userPrincipal, 10, 'chat_interaction');
          }
        } catch (icError) {
          console.warn('IC integration warning:', icError.message);
        }
      }
      
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
          sessionId: sessionId,
          supportLevel: emotionalTone.severity === 'critical' ? 'crisis' : 
                       emotionalTone.severity === 'elevated' ? 'enhanced' : 'standard'
        },
        usage: completion.usage,
        tokens: {
          awarded: emotionalTone.severity !== 'critical' ? 10 : 0,
          reason: 'chat_interaction'
        }
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
  
  // Start automatic token cleanup job (every 30 minutes)
  setInterval(() => {
    try {
      const { JWTService } = require('./src/middleware/auth.js');
      JWTService.cleanupExpiredTokens();
      console.log(`🧹 Token cleanup completed at ${new Date().toISOString()}`);
    } catch (error) {
      console.error('Automatic token cleanup failed:', error);
    }
  }, 30 * 60 * 1000); // 30 minutes
  
  console.log('🔄 Automatic token cleanup job started (every 30 minutes)');
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