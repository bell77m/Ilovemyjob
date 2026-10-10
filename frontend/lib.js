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
function enforceAgree(text) {
  const t = text.trim();
  if (/agree\?$/i.test(t)) return t;
  return t ? t + '\n\nAgree?' : 'Agree?';
}

// Ollama streams newline-delimited JSON; a network chunk can end mid-line.
function splitNdjson(buf) {
  const lines = buf.split('\n');
  const rest = lines.pop();
  return [lines.filter(l => l.trim()).map(l => JSON.parse(l)), rest];
}
