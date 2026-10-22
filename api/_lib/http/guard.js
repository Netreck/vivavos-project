/**
 * Proteções básicas das rotas que gastam créditos da OpenAI.
 *
 * - Só aceita chamadas feitas pelo próprio site (cabeçalho Origin igual ao host).
 * - Limita quantas fotos cada IP pode enviar por janela de tempo.
 * - Recusa imagens grandes demais (o app já comprime para ~200–400 KB).
 *
 * O limite fica na memória de cada instância serverless, então é uma barreira
 * simples, não uma garantia: o teto real de gastos deve ser configurado também
 * no painel da OpenAI (Billing → Limits).
 */

const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const MAX_REQUESTS_PER_WINDOW = 15;
const MAX_IMAGE_CHARS = 3_000_000; // ~2,2 MB de imagem em base64

const hitsByIp = new Map();

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return req.socket?.remoteAddress || 'desconhecido';
}

function isSameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (hitsByIp.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hitsByIp.set(ip, recent);

  // Limpeza ocasional para a memória não crescer sem fim
  if (hitsByIp.size > 5000) {
    for (const [key, times] of hitsByIp) {
      if (times.every((t) => now - t >= WINDOW_MS)) hitsByIp.delete(key);
    }
  }

  return recent.length > MAX_REQUESTS_PER_WINDOW;
}

/**
 * Valida a requisição. Devolve null se estiver tudo certo, ou { status, code, message } para recusar.
 */
export function guardRequest(req) {
  if (!isSameOrigin(req)) {
    return { status: 403, code: 'FORBIDDEN_ORIGIN', message: 'Esta rota só pode ser usada pelo site do Vivavós.' };
  }

  if (isRateLimited(clientIp(req))) {
    return {
      status: 429,
      code: 'TOO_MANY_REQUESTS',
      message: 'Muitas fotos enviadas em pouco tempo. Espere alguns minutos e tente de novo.',
    };
  }

  const image = req.body?.imageBase64;
  if (typeof image === 'string' && image.length > MAX_IMAGE_CHARS) {
    return { status: 413, code: 'IMAGE_TOO_LARGE', message: 'A foto é grande demais. Tente tirar outra foto.' };
  }

  return null;
}
