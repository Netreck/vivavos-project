import { guardRequest } from './_lib/http/guard.js';

const MAX_TEXT_LENGTH = 2500;

// Instrução de estilo para a voz: sotaque brasileiro e ritmo calmo para pessoas idosas
const VOICE_INSTRUCTIONS =
  'Fale em português do Brasil, com sotaque brasileiro natural. Fale de forma calma, clara e acolhedora, ' +
  'como quem explica algo com paciência para uma pessoa idosa. Pronuncie bem cada palavra e os números.';

/**
 * Converte texto em fala (mp3) com a API de voz da OpenAI.
 * O navegador usa esta rota no lugar da voz do sistema, que muitas vezes não tem português do Brasil.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Método não permitido. Utilize POST.' } });
  }

  // Cada tela fala várias vezes, então o limite aqui é maior que o das fotos
  const rejection = guardRequest(req, { maxRequests: 80 });
  if (rejection) {
    return res.status(rejection.status).json({ error: { code: rejection.code, message: rejection.message } });
  }

  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  if (!text) {
    return res.status(400).json({ error: { code: 'TEXT_REQUIRED', message: 'Nenhum texto para falar.' } });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return res.status(413).json({ error: { code: 'TEXT_TOO_LONG', message: 'Texto longo demais para falar.' } });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'sua-chave-aqui') {
    // Sem chave: o navegador usa a própria voz como reserva
    return res.status(503).json({ error: { code: 'TTS_UNAVAILABLE', message: 'Voz da OpenAI não configurada.' } });
  }

  try {
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    const response = await fetch(`${baseUrl}/audio/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts',
        voice: process.env.OPENAI_TTS_VOICE || 'coral',
        input: text,
        instructions: VOICE_INSTRUCTIONS,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.error?.message || `Erro na API de voz da OpenAI (${response.status})`);
    }

    const audio = Buffer.from(await response.arrayBuffer());
    res.statusCode = 200;
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    res.end(audio);
  } catch (error) {
    console.error('Erro em /api/speak:', error);
    return res.status(502).json({ error: { code: 'TTS_FAILED', message: error.message || 'Falha ao gerar a voz.' } });
  }
}
