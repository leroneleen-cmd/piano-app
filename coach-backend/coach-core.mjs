// Shared logic for the Pianote AI piano teacher.
// Used by both the local dev server (dev-server.mjs) and the Cloudflare Worker (worker.js).

// Haiku 4.5 = le modèle Claude le plus économique, largement suffisant pour un
// prof de piano (tâche courte, bien cadrée, multilingue). Passe à
// 'claude-sonnet-5' si tu veux plus de finesse pédagogique (~3× le coût/token).
export const MODEL = 'claude-haiku-4-5';
export const MAX_TOKENS = 600;

const LANG_NAME = { fr: 'French', en: 'English', es: 'Spanish', de: 'German', zh: 'Simplified Chinese' };

export function buildSystem(context = {}) {
  const lang = LANG_NAME[context.lang] || 'the user’s language';
  const bits = [];
  if (context.level != null) bits.push(`current course level: ${context.level}`);
  if (context.xp != null) bits.push(`total XP: ${context.xp}`);
  if (context.streak != null) bits.push(`practice streak: ${context.streak} day(s)`);
  if (context.focus) bits.push(`currently working on: ${context.focus}`);
  const profile = bits.length ? `\nWhat you know about this student: ${bits.join(', ')}.` : '';

  return `You are the AI piano teacher inside "Pianote", an app for learning piano on your own.
Your student practices alone and needs a patient, encouraging, expert coach.

ALWAYS reply in ${lang}.

Style: warm, concrete, motivating. Keep answers short and clear — a few sentences, and a short list only when it helps. Give actionable advice: specific exercises, fingerings, scales, pieces, tempo, hand position. Celebrate progress. One idea at a time; do not overwhelm a beginner.

You can point the student to features that exist in Pianote: level-based courses, guided public-domain songs (the note lights up and waits), hands-separate practice, staff reading (treble & bass), ear training, theory (intervals, circle of fifths), technique (metronome, dexterity, hand independence), and a daily plan.

Stay strictly on piano, music, and practice. If asked something unrelated, gently steer back to the piano.${profile}`;
}

// Normalize/guard the incoming messages array.
export function cleanMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }))
    .slice(-20); // keep the last 20 turns
}

export function buildPayload(body = {}) {
  return {
    model: body.model || MODEL,
    max_tokens: MAX_TOKENS,
    system: buildSystem(body.context),
    messages: cleanMessages(body.messages),
  };
}

// Call the Anthropic Messages API. Works in Node 18+ and Cloudflare Workers (global fetch).
export async function callClaude(apiKey, payload) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Anthropic ${res.status}: ${detail.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
  return text || '…';
}

// Offline mock so the chat UI can be tested without an API key.
export function mockReply(body = {}) {
  const last = cleanMessages(body.messages).filter(m => m.role === 'user').pop();
  const q = last ? last.content : '';
  return `【mode démo — sans clé API】 Bonne question : « ${q.slice(0, 80)} ». `
    + `Voici un conseil : commence lentement, mains séparées, puis assemble à petit tempo. `
    + `Dans Pianote, essaie le cours de ton niveau puis un morceau guidé pour appliquer. `
    + `(Ajoute ta clé Anthropic au backend pour des réponses réelles.)`;
}
