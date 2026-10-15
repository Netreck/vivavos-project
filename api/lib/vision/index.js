import { OpenAIVisionProvider } from './OpenAIVisionProvider.js';

let cachedProvider = null;

export function getVisionProvider() {
  if (cachedProvider) return cachedProvider;

  const providerType = (process.env.VISION_PROVIDER || 'openai').toLowerCase();

  switch (providerType) {
    case 'openai':
    default:
      cachedProvider = new OpenAIVisionProvider({
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        baseUrl: process.env.OPENAI_BASE_URL,
      });
      break;
  }

  return cachedProvider;
}
