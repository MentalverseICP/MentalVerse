# MindMate Chatbot Setup Guide

## Overview
We have successfully integrated MindMate, an empathetic AI mental health chatbot, into our MentalVerse landing page. The chatbot appears as a floating chat widget in the bottom-right corner of the homepage, buut we are looking to make changes on the ui placement later

## Features
- **Empathetic AI**: Uses GPT-4o with a specialized mental health assistant personality
- **Floating Interface**: Non-intrusive chat widget that can be toggled open/closed
- **Responsive Design**: Works on both desktop and mobile devices
- **Dark/Light Theme**: Automatically adapts to your site's theme
- **Conversation Memory**: Maintains context within the chat session
- **Mental Health Focus**: Specifically designed for supportive, non-judgmental conversations

## Setup Instructions

### 1. Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Create a new API key
4. Copy the API key (starts with `sk-`)

### 2. Configure Environment Variables
1. Navigate to the `frontend` directory
2. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Open `.env.local` and replace `your_openai_api_key_here` with your actual API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

### 3. Start the Development Server
```bash
cd frontend
npm install
npm run dev
```

### 4. Test the Chatbot
1. Open your browser to `http://localhost:5173/`
2. Look for the green chat bubble in the bottom-right corner
3. Click it to open the chat interface
4. Start a conversation with MindMate

## Chatbot Personality
MindMate is configured with the following characteristics:
- **Empathetic and non-judgmental**
- **Warm, compassionate, and calm tone**
- **Detects emotional states** from user language
- **Provides evidence-based coping strategies**
- **Offers grounding exercises and mindfulness prompts**
- **Maintains appropriate boundaries** (not a replacement for professional therapy)
- **Crisis awareness** - recommends professional help when needed

## Technical Details

### Files Created/Modified
1. **New File**: `frontend/src/components/Chatbot.tsx` - Main chatbot component
2. **Modified**: `frontend/src/pages/LandingPage.tsx` - Added chatbot to landing page
3. **Modified**: `frontend/.env.example` - Added OpenAI API key configuration

### Dependencies Used
- **OpenAI API**: For AI responses
- **Framer Motion**: For smooth animations
- **Lucide React**: For icons
- **Tailwind CSS**: For styling

### API Configuration
- **Model**: GPT-4o
- **Temperature**: 0.7 (balanced creativity/consistency)
- **Max Tokens**: 500 (concise responses)
- **Frequency/Presence Penalty**: Reduces repetition

## Security Considerations
- API key is stored in environment variables (not in code)
- Client-side API calls
- Rate limiting should be implemented for production use

## Customization Options

### Styling
The chatbot uses Tailwind CSS classes and can be customized by modifying the `Chatbot.tsx` component.

### Personality
Modify the system prompt in the `sendMessage` function to adjust MindMate's personality and responses.

### Position
Change the positioning by modifying the CSS classes in the main container div.

## Production Deployment
For production deployment:
1. Move API calls to your backend to secure the API key
2. Implement rate limiting
3. Add error logging and monitoring
4. Consider adding user authentication for personalized conversations

## Support
The chatbot is now fully integrated and ready to use. Users can access mental health support directly from our landing page through the floating chat interface.

## Cost Considerations
- OpenAI API usage is pay-per-token
- Monitor usage through OpenAI dashboard
- Consider implementing usage limits for cost control
- GPT-4o costs approximately $0.005 per 1K input tokens and $0.015 per 1K output tokens

---

**Note**: Remember to keep your OpenAI API key secure and never commit it to version control. Always use environment variables for sensitive configuration.
