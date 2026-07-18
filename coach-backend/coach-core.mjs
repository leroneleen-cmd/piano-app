// Shared logic for the Pianote AI piano teacher.
// Backend runs on Cloudflare Workers AI (free tier, no credit card, no extra key).
// Used by the Worker (worker.js) and the local dev server (dev-server.mjs).

// Cloudflare Workers AI model. Llama 3.3 70B ≈ Haiku-level quality, multilingual.
// Cheaper/lighter option to stretch the free allocation: '@cf/meta/llama-3.1-8b-instruct'.
export const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
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

// Chat messages for Workers AI: system prompt first, then the conversation.
export function buildMessages(body = {}) {
  return [{ role: 'system', content: buildSystem(body.context) }, ...cleanMessages(body.messages)];
}

// Offline mock so the chat UI can be tested without the AI binding.
export function mockReply(body = {}) {
  const last = cleanMessages(body.messages).filter(m => m.role === 'user').pop();
  const q = last ? last.content : '';
  return `【mode démo — sans IA】 Bonne question : « ${q.slice(0, 80)} ». `
    + `Voici un conseil : commence lentement, mains séparées, puis assemble à petit tempo. `
    + `Dans Pianote, essaie le cours de ton niveau puis un morceau guidé pour appliquer. `
    + `(Déploie le Worker Cloudflare pour des réponses réelles via Workers AI.)`;
}
