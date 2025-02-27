import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import 'dotenv/config';
import { Readable } from 'stream';
import axios from 'axios'; // Added axios for HTTP requests
import { PassThrough } from 'stream'; // Import PassThrough for streaming

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Load ElevenLabs API credentials from environment variables
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

// Function to synthesize speech using ElevenLabs API
const synthesizeSpeech = async (text) => {
  try {
    const response = await axios.post(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
      text: text,
      voice_settings: {
        stability: 0.75, // Adjust stability as needed
        similarity_boost: 0.75 // Adjust similarity boost as needed
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      responseType: 'arraybuffer' // To handle binary data
    });

    // Calculate audio duration using bitrate 192 kbps:
    const size = response.data.length; // size in bytes
    const duration = (size * 8) / (128 * 1000); // duration in seconds
    
    const audioBase64 = Buffer.from(response.data, 'binary').toString('base64');
    return { audioUrl: `data:audio/mpeg;base64,${audioBase64}`, duration: duration };
  } catch (error) {
    // Improved error logging
    if (error.response && error.response.data) {
      // Attempt to decode the error response
      let errorMessage;
      try {
        errorMessage = Buffer.from(error.response.data).toString('utf-8');
        const parsedMessage = JSON.parse(errorMessage);
        console.error('Error synthesizing speech:', parsedMessage);
      } catch (parseError) {
        console.error('Error synthesizing speech:', errorMessage || error.message);
      }
    } else {
      console.error('Error synthesizing speech:', error.message);
    }
    throw error;
  }
};

// Function to split text into chunks (e.g., words)
const splitTextIntoWords = (text) => {
  return text.split(/\s+/);
};

// /synthesize endpoint to handle text-to-speech requests
app.post('/synthesize', async (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'No text provided for synthesis.' });
  }

  try {
    const data = await synthesizeSpeech(text);
    res.json({ audio: data.audioUrl, duration: data.duration });
  } catch (error) {
    res.status(500).json({ error: 'Failed to synthesize speech.' });
  }
});

// /chat endpoint to handle text requests, audio synthesis, and stream text words
app.post('/chat', async (req, res) => {
  const { messages } = req.body; // messages: Array of {role, content}
  try {
    // Add a system message with instructions for the LLM
    const systemMessage = {
      role: 'system',
      content: 'You are Richard Feynman, a physicist who loves to explain complex concepts in simple terms. You are talking to a reader who is reading Feynman lectures on Physics. They might ask you questions about it or physics in general. Respond accordingly but keep Richard Feynmans joyful quirky tone. Keep your responses to less than 100 words.',
    };
    
    // Prepend the system message to the existing messages
    const enrichedMessages = [systemMessage, ...messages];

    // Get the full response from OpenAI
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: enrichedMessages,
    });

    const reply = chatCompletion.choices[0].message.content;
    const words = splitTextIntoWords(reply);

    // Request audio synthesis
    let audioUrl = '';
    try {
      const audioResponse = await synthesizeSpeech(reply);
      audioUrl = audioResponse; // `synthesizeSpeech` returns the audio URL
    } catch (synthError) {
      console.error('Audio synthesis failed:', synthError);
      // You may choose to handle this differently, e.g., send an error message to the client
    }

    // Start streaming the text words
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Flush the headers to establish SSE

    // Optionally, send the audio URL first
    if (audioUrl) {
      res.write(`data: ${JSON.stringify({ audio: audioUrl })}\n\n`);
    }

    // Stream each word every 50ms
    for (const word of words) {
      res.write(`data: ${JSON.stringify({ text: word })}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay
    }

    res.write('data: [DONE]\n\n'); // Indicate the end of the stream
    res.end();
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Something went wrong', details: error.response ? error.response.data : error.message });
  }
});

app.get('/chat', (req, res) => {
  res.send('Chat endpoint is working! (But use POST /chat for actual requests.)');
});

const port = 3000;
app.get('', (req, res) => {
  res.send(`Server running at http://localhost:${port}`);
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
