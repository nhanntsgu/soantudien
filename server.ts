import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import checkHandler from './api/gemini/check.js';
import generateHandler from './api/gemini/generate.js';
import reviewHandler from './api/gemini/review.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Mount API routes shared with Vercel Serverless Functions (/api/gemini/*.ts)
  app.post('/api/gemini/check', (req, res) => checkHandler(req, res));
  app.post('/api/gemini/generate', (req, res) => generateHandler(req, res));
  app.post('/api/gemini/review', (req, res) => reviewHandler(req, res));

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

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
