// Cloudflare Worker — production backend for the Pianote AI piano teacher.
// Deploy:  cd coach-backend && npx wrangler deploy
// Secret:  npx wrangler secret put ANTHROPIC_API_KEY
import { buildPayload, callClaude } from './coach-core.mjs';

// Lock this down to your app origins in production.
const ALLOW_ORIGINS = new Set([
  'https://apprendre-piano.netlify.app',
  'capacitor://localhost', // iOS Capacitor WebView
  'http://localhost:4599',
  'http://localhost:8100',
]);

function corsHeaders(origin) {
  const allow = ALLOW_ORIGINS.has(origin) ? origin : 'https://apprendre-piano.netlify.app';
  return {
    'access-control-allow-origin': allow,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'vary': 'Origin',
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const url = new URL(request.url);
    if (request.method !== 'POST' || !url.pathname.startsWith('/coach')) {
      return new Response('not found', { status: 404, headers: cors });
    }
    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: 'server_not_configured' }, 500, cors);
    }
    try {
      const body = await request.json();
      // TODO(prod): verify body.subscription (StoreKit JWS) here before spending tokens.
      const reply = await callClaude(env.ANTHROPIC_API_KEY, buildPayload(body));
      return json({ reply }, 200, cors);
    } catch (e) {
      return json({ error: 'coach_failed', detail: String(e.message || e).slice(0, 200) }, 500, cors);
    }
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json', ...cors } });
}
