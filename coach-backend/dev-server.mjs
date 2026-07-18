// Local dev server for the Pianote AI teacher — returns demo replies so the UI
// is testable without deploying. For REAL Workers AI replies locally, run the
// Worker instead:  cd coach-backend && npx wrangler dev   (also serves :8787)
import { createServer } from 'node:http';
import { mockReply } from './coach-core.mjs';

const PORT = process.env.PORT || 8787;

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
  req.on('end', () => {
    let reply;
    try { reply = mockReply(JSON.parse(raw || '{}')); }
    catch (e) { res.writeHead(500, { 'content-type': 'application/json', ...cors }); return res.end(JSON.stringify({ error: 'coach_failed' })); }
    res.writeHead(200, { 'content-type': 'application/json', ...cors });
    res.end(JSON.stringify({ reply }));
  });
});

server.listen(PORT, () => {
  console.log(`Pianote coach dev server (demo replies) on http://localhost:${PORT}/coach`);
  console.log('For real Workers AI replies locally: npx wrangler dev');
});
