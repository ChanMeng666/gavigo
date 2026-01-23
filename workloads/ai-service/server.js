const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to simulated response if no API key
      return res.json({
        response: `I received your message: "${message}". (OpenAI API key not configured - this is a simulated response)`
      });
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant for GAVIGO IRE platform. Be concise and friendly.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    res.json({ response });
  } catch (error) {
    console.error('OpenAI API error:', error);

    // Return simulated response on error
    res.json({
      response: `I received your message: "${req.body.message}". (API error - this is a fallback response)`
    });
  }
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AI Service running on port ${PORT}`);
  console.log(`OpenAI API key configured: ${!!process.env.OPENAI_API_KEY}`);
});
