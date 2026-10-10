// Pure logic shared by index.html and tests.js. No DOM, no fetch.

// Few-shot examples first, then the request. reverse = LinkedIn post -> honest sentence.
function buildPrompt(text, cringe, examples, reverse = false) {
  let p = '';
  for (const ex of examples) {
    p += reverse ? `LinkedIn: ${ex.linkedin}\nHuman: ${ex.human}\n\n`
                 : `Human: ${ex.human}\nLinkedIn: ${ex.linkedin}\n\n`;
  }
  return p + (reverse ? `LinkedIn post: ${text}` : `Cringe level: ${cringe}/10\nHuman text: ${text}`);
}

// F12: every post ends with "Agree?". Always.
// Small models echo the few-shot format ("Human: ...", "LinkedIn:") or chat ("Here is the post:"); drop that first.
function enforceAgree(text) {
  const t = text.trim()
    .replace(/^here(?: is|'s)[^\n]*:\s*/i, '')
    .replace(/^human:[^\n]*\n+/i, '')
    .replace(/^linkedin(?: post)?:\s*/i, '');
  if (/agree\?$/i.test(t)) return t;
  return t ? t + '\n\nAgree?' : 'Agree?';
}

// Ollama streams newline-delimited JSON; a network chunk can end mid-line.
function splitNdjson(buf) {
  const lines = buf.split('\n');
  const rest = lines.pop();
  return [lines.filter(l => l.trim()).map(l => JSON.parse(l)), rest];
}

// Vector DB: a JS array and a for loop.
// ponytail: O(n) scan per query, fine to a few hundred pairs; precompute cringe.vectors.json past that.
function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na * nb) || 1);
}

function topK(q, vecs, k) {
  return vecs.map((v, i) => [cosine(q, v), i]).sort((x, y) => y[0] - x[0]).slice(0, k).map(p => p[1]);
}

// F8. Same rule as synergy() in mcp_server.py: substring count, 10 points per hit, max 100.
function synergyScore(text, words) {
  const lower = text.toLowerCase();
  let hits = 0;
  const buzzwords = [];
  for (const w of words) {
    const n = lower.split(w).length - 1;
    if (n) { hits += n; buzzwords.push(w); }
  }
  return { score: Math.min(100, hits * 10), buzzwords };
}
