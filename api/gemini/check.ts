import { GoogleGenAI } from '@google/genai';

function parseBody(body: any): Record<string, any> {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

export default async function checkHandler(req: any, res: any) {
  if (req.method && req.method !== 'POST') {
    return res.status(405).json({ valid: false, error: 'Method Not Allowed' });
  }

  try {
    const { apiKey, apiMode } = parseBody(req.body);
    const key =
      apiMode === 'custom'
        ? apiKey?.trim()
        : process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!key) {
      return res.status(400).json({ valid: false, error: 'API key is missing' });
    }

    if (apiMode !== 'custom') {
      return res.status(200).json({ valid: true });
    }

    const ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    try {
      await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: 'Ping',
      });
    } catch (innerErr: any) {
      const msg = String(innerErr?.message || '');
      if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
        await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: 'Ping',
        });
      } else {
        throw innerErr;
      }
    }

    return res.status(200).json({ valid: true });
  } catch (err: any) {
    console.error('API check error:', err);
    return res.status(400).json({ valid: false, error: err?.message || 'Invalid API key' });
  }
}
