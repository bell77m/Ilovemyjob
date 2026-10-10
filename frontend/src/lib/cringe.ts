// Pure logic shared by the server functions and the pages. No DOM, no fetch.
// Python twin: mcp_server.py (build_prompt, enforce_agree, synergy). Keep the two in step.

export type Pair = { human: string; linkedin: string }

// Few-shot examples first, then the request. reverse = LinkedIn post -> honest sentence.
export function buildPrompt(text: string, cringe: number, examples: Pair[], reverse = false): string {
  let p = ''
  for (const ex of examples) {
    p += reverse ? `LinkedIn: ${ex.linkedin}\nHuman: ${ex.human}\n\n`
                 : `Human: ${ex.human}\nLinkedIn: ${ex.linkedin}\n\n`
  }
  return p + (reverse ? `LinkedIn post: ${text}` : `Cringe level: ${cringe}/10\nHuman text: ${text}`)
}

// F12: every post ends with "Agree?". Always.
// Small models echo the few-shot format ("Human: ...", "LinkedIn:") or chat ("Here is the post:"); drop that first.
export function enforceAgree(text: string): string {
  const t = text.trim()
    .replace(/^here(?: is|'s)[^\n]*:[ \t]*\n\s*/i, '')
    .replace(/^human:[^\n]*\n+/i, '')
    .replace(/^linkedin(?: post)?:\s*/i, '')
  // Model often puts emoji or hashtags after "Agree?"; any "Agree?" on the last line counts.
  if (/agree\?/i.test(t.split('\n').pop() ?? '')) return t
  return t ? t + '\n\nAgree?' : 'Agree?'
}

// Newline-delimited JSON (Ollama's stream, and our /api/translate): a network chunk can end mid-line.
export function splitNdjson(buf: string): [any[], string] {
  const lines = buf.split('\n')
  const rest = lines.pop() ?? ''
  return [lines.filter(l => l.trim()).map(l => JSON.parse(l)), rest]
}

// Vector DB: an array and a for loop.
// ponytail: O(n) scan per query, fine to a few hundred pairs; precompute vectors past that.
export function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i] }
  return dot / (Math.sqrt(na * nb) || 1)
}

export function topK(q: number[], vecs: number[][], k: number): number[] {
  return vecs.map((v, i) => [cosine(q, v), i]).sort((x, y) => y[0] - x[0]).slice(0, k).map(p => p[1])
}

// F8. Same rule as synergy() in mcp_server.py: substring count, 10 points per hit, max 100.
export function synergyScore(text: string, words: string[]): { score: number; buzzwords: string[] } {
  const lower = text.toLowerCase()
  let hits = 0
  const buzzwords: string[] = []
  for (const w of words) {
    const n = lower.split(w).length - 1
    if (n) { hits += n; buzzwords.push(w) }
  }
  return { score: Math.min(100, hits * 10), buzzwords }
}

// Premium paywall: split off the conclusion (last two sentence ends, so usually the point plus "Agree?").
// One sentence or none: the whole post is premium.
export function paywall(text: string): [free: string, paid: string] {
  const ends = [...text.matchAll(/[.!?](?=\s)/g)].map(m => m.index + 1)
  const cut = ends.length >= 2 ? ends[ends.length - 2] : 0
  return [text.slice(0, cut), text.slice(cut)]
}
