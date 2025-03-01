import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import 'dotenv/config';
import { Readable } from 'stream';
import axios from 'axios'; // Added axios for HTTP requests
import { PassThrough } from 'stream'; // Import PassThrough for streaming
import { getBookMetadataById, DEFAULT_BOOKS_METADATA } from './src/utils/serverBookMetadata.js';

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Load ElevenLabs API key from environment variables
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Function to synthesize speech using ElevenLabs API with dynamic voice ID
const synthesizeSpeech = async (text, voiceId) => {
  try {
    const response = await axios.post(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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
  const { text, bookId } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'No text provided for synthesis.' });
  }

  try {
    // Get the appropriate voice ID for the book
    const bookMetadata = getBookMetadataById(bookId);
    const voiceId = bookMetadata?.authorVoiceID || process.env.ELEVENLABS_VOICE_ID; // Fallback to env var
    
    const data = await synthesizeSpeech(text, voiceId);
    res.json({ audio: data.audioUrl, duration: data.duration });
  } catch (error) {
    res.status(500).json({ error: 'Failed to synthesize speech.' });
  }
});

// Modified /chat endpoint with better debugging and error handling for bookId
app.post('/chat', async (req, res) => {
  
  // Handle both possible locations for bookId (top level and nested)
  let bookId = req.body.bookId;
  
  // Ensure bookId is a string and use default if not present
  if (!bookId || typeof bookId !== 'string') {
    console.log("Invalid or missing bookId, using default");
    bookId = "1"; // Use Feynman as default (ID: "1")
  }
  
  console.log("Final bookId being used:", bookId);
  
  const { messages } = req.body;
  
  try {
    // Get book metadata including system prompt and voice ID
    const bookMetadata = getBookMetadataById(bookId);
    
    if (!bookMetadata) {
      console.log("WARNING: Could not find book metadata for ID:", bookId);
      console.log("Available books:", DEFAULT_BOOKS_METADATA.map(b => ({ id: b.id, title: b.title })));
    }
    
    // Use book-specific system prompt or fallback to default
    const systemPrompt = bookMetadata?.systemPrompt || 
      "You are a helpful assistant explaining concepts from the book. Keep responses to less than 100 words.";
    
    // Add a system message with instructions specific to this book
    const systemMessage = {
      role: 'system',
      content: systemPrompt
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

    // Request audio synthesis with book-specific voice ID
    let audioUrl = '';
    try {
      const voiceId = bookMetadata?.authorVoiceID || process.env.ELEVENLABS_VOICE_ID;
      const audioResponse = await synthesizeSpeech(reply, voiceId);
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
