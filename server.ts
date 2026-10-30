import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // API Endpoints
  app.post('/api/gemini/check', async (req, res) => {
    try {
      const { apiKey, apiMode } = req.body;
      const key = apiMode === 'default' ? (process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY) : apiKey;
      
      if (!key) {
        return res.status(400).json({ valid: false, error: 'API key is missing' });
      }

      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: 'Ping',
        config: { maxOutputTokens: 1 },
      });

      return res.json({ valid: true });
    } catch (err: any) {
      console.error('API check error:', err);
      return res.status(400).json({ valid: false, error: err.message || 'Invalid API key' });
    }
  });

  app.post('/api/gemini/generate', async (req, res) => {
    try {
      const { prompt, model, apiKey, apiMode } = req.body;
      const key = apiMode === 'custom' && apiKey ? apiKey : (process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY);

      if (!key) {
        return res.status(400).json({ error: 'API key is missing' });
      }

      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: model || 'gemini-3.5-flash-lite',
        contents: prompt,
      });

      return res.json({ text: response.text });
    } catch (err: any) {
      console.error('Generation error:', err);
      return res.status(500).json({ error: err.message || 'Generation failed' });
    }
  });

  if (isProduction) {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
