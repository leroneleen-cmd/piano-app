// Local dev server for the Pianote AI teacher — lets you test the chat without deploying.
// Run:  ANTHROPIC_API_KEY=sk-ant-... node coach-backend/dev-server.mjs
// Without a key it returns a demo reply so the UI is still testable.
import { createServer } from 'node:http';
import { buildPayload, callClaude, mockReply } from './coach-core.mjs';

const PORT = process.env.PORT || 8787;
const KEY = process.env.ANTHROPIC_API_KEY || '';

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

const server = createServer((req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
  if (req.method !== 'POST' || !req.url.startsWith('/coach')) {
    res.writeHead(404, cors); return res.end('not found');
  }
  let raw = '';
  req.on('data', c => { raw += c; if (raw.length > 200000) req.destroy(); });
  req.on('end', async () => {
    let reply, status = 200;
    try {
      const body = JSON.parse(raw || '{}');
      reply = KEY ? await callClaude(KEY, buildPayload(body)) : mockReply(body);
    } catch (e) {
      status = 500; reply = null;
      console.error('coach error:', e.message);
    }
    res.writeHead(status, { 'content-type': 'application/json', ...cors });
    res.end(JSON.stringify(reply != null ? { reply } : { error: 'coach_failed' }));
  });
});

server.listen(PORT, () => {
  console.log(`Pianote coach dev server on http://localhost:${PORT}/coach`);
  console.log(KEY ? 'Using real Claude (ANTHROPIC_API_KEY set).' : 'No API key — returning demo replies.');
});
