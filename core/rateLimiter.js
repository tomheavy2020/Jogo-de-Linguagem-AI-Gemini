// core/rateLimiter.js
// Rate limiter em memória (sliding window). Sem dependências externas.
const buckets = new Map();

function cleanup(windowMs) {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (now - entry.windowStart > windowMs) buckets.delete(key);
  }
}

function createRateLimiter({
  windowMs = 60_000,
  max = 10,
  message = 'Muitas tentativas. Tente novamente em instantes.',
  keyFn = (req) => req.headers['x-forwarded-for'] || req.socket.remoteAddress,
} = {}) {
  const interval = setInterval(() => cleanup(windowMs), windowMs).unref();

  return function rateLimit(req, res, next) {
    const key = `${keyFn(req)}:${req.url}`;
    const now = Date.now();
    let entry = buckets.get(key);

    if (!entry || now - entry.windowStart > windowMs) {
      entry = { count: 1, windowStart: now };
      buckets.set(key, entry);
      return next();
    }

    entry.count++;

    if (entry.count > max) {
      const retryAfterSec = Math.ceil((windowMs - (now - entry.windowStart)) / 1000);
      res.set('Retry-After', String(retryAfterSec));
      return res.status(429).json({ success: false, error: message, retryAfter: retryAfterSec });
    }

    next();
  };
}

// Limites prontos
const authLimiter = createRateLimiter({ windowMs: 15 * 60_000, max: 5, message: 'Muitas tentativas de login. Aguarde 15 minutos.' });
const commandLimiter = createRateLimiter({ windowMs: 60_000, max: 20, message: 'Limite de comandos excedido. Aguarde um minuto.' });

module.exports = { authLimiter, commandLimiter };
