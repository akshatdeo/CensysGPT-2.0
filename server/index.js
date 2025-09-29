import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { summarizeData } from './services/summarizer.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => {
  res.json({ message: 'Censys AI Summarization API is running!' });
});

app.post('/summarize', async (req, res) => {
  try {
    const { data, model } = req.body;

    if (!data) {
      return res.status(400).json({
        error: 'No data provided. Please include data in the request body.'
      });
    }

    console.log('Received data for summarization:', typeof data, Array.isArray(data) ? data.length : 'N/A');
    console.log('Using model:', model || 'default (from env)');

    const summary = await summarizeData(data, model);

    res.json({
      success: true,
      summary,
      metadata: {
        dataType: typeof data,
        processedAt: new Date().toISOString(),
        recordCount: Array.isArray(data) ? data.length : 1
      }
    });
  } catch (error) {
    console.error('Error in /summarize endpoint:', error);
    res.status(500).json({
      error: 'Failed to generate summary',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});