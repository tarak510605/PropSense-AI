import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

export default {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV || 'development',
  AI_SERVICE: process.env.AI_SERVICE || 'openai',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  OLLAMA_URL: process.env.OLLAMA_URL || 'http://localhost:11434'
};
