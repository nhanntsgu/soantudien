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

export function resolveModelName(requestedModel?: string): string {
  if (!requestedModel || requestedModel === 'gemini-3.5-flash-lite') {
    return 'gemini-3.1-flash-lite';
  }
  if (requestedModel === 'gemini-3.6-flash' || requestedModel === 'gemini-3.5-flash') {
    return 'gemini-3.8-flash';
  }
  return requestedModel;
}

export async function generateWithModelFallback(
  ai: GoogleGenAI,
  primaryModel: string,
  contents: string,
  systemInstruction?: string
) {
  const config = systemInstruction ? { systemInstruction } : undefined;
  try {
    return await ai.models.generateContent({
      model: primaryModel,
      contents,
      ...(config ? { config } : {}),
    });
  } catch (err: any) {
    const msg = String(err?.message || '');
    if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
      return await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents,
        ...(config ? { config } : {}),
      });
    }
    throw err;
  }
}

export default async function generateHandler(req: any, res: any) {
  if (req.method && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, model, apiKey, apiMode } = parseBody(req.body);
    const key =
      apiMode === 'custom' && apiKey
        ? apiKey.trim()
        : process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!key) {
      return res.status(400).json({ error: 'API key is missing' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is missing' });
    }

    const ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const resolvedModel = resolveModelName(model);
    const response = await generateWithModelFallback(ai, resolvedModel, prompt);

    return res.status(200).json({ text: response.text });
  } catch (err: any) {
    console.error('Generation error:', err);
    return res.status(500).json({ error: err?.message || 'Generation failed' });
  }
}
