// Cloudflare Worker — backend for the Pianote AI piano teacher.
// Uses Cloudflare Workers AI (free tier, no API key, no credit card).
// Deploy:  cd coach-backend && npx wrangler deploy
import { buildMessages, MODEL, MAX_TOKENS } from './coach-core.mjs';

// Lock this down to your app origins.
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
    if (!env.AI) return json({ error: 'ai_binding_missing' }, 500, cors);
    try {
      const body = await request.json();
      // TODO(prod): verify body.subscription (StoreKit JWS) here before spending the quota.
      const out = await env.AI.run(MODEL, { messages: buildMessages(body), max_tokens: MAX_TOKENS });
      const reply = (out && (out.response ?? out.result?.response) || '').trim() || '…';
      return json({ reply }, 200, cors);
    } catch (e) {
      return json({ error: 'coach_failed', detail: String(e.message || e).slice(0, 200) }, 500, cors);
    }
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json', ...cors } });
}
