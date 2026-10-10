# LinkedIn Translator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "Ilovemyjob", an offline web page plus MCP server that rewrites plain sentences as cringe LinkedIn posts with a local Ollama model, few-shot RAG, and a Netscape 96 look.

**Architecture:** One `index.html` (inline CSS + vanilla JS) calls Ollama's HTTP API straight from the browser, with no backend. Pure logic (prompt building, NDJSON parsing, "Agree?" rule, cosine top-k, synergy score) lives in `lib.js` so `tests.js` can check it in Node and in the browser. `mcp_server.py` (FastMCP, stdio) mirrors the same logic in Python and reads the same `prompts.json` and `cringe.json`.

**Tech Stack:** HTML/CSS/vanilla JS, Ollama (`llama3.2:3b`, `nomic-embed-text`), Python 3.10+ standard library + `mcp` SDK, Node 18+ (tests only), `python -m http.server` or `docker compose`.

**Spec:** [REQUIREMENTS.md](../../../REQUIREMENTS.md). UI rules: [DESIGN.md](../../../DESIGN.md). Reference CSS: [preview.html](../../../preview.html).

## Global Constraints

- Offline: zero external requests at runtime. No CDN, no web fonts, no jQuery, no npm packages, no build step.
- `.agents/skills/web` says "use jQuery". REQUIREMENTS.md §5 says vanilla JS and §9 says no CDN. The spec wins; vendoring jQuery is out of scope unless the user asks.
- DESIGN.md wins over REQUIREMENTS.md §5 on markup: no `<table>` layout, no real `<marquee>`/`<blink>`. Use CSS grid/flex and the CSS marquee from DESIGN.md.
- Ollama base URL `http://localhost:11434`. Generate: `POST /api/generate`. Embed: `POST /api/embed` with `{"model": "nomic-embed-text", "input": [...]}`.
- Models: `llama3.2:3b` (generate), `nomic-embed-text` (embed). Both read from `prompts.json`, never hard-coded elsewhere.
- Embedding prefixes: `search_document: ` on corpus texts, `search_query: ` on user text.
- Web input limit: `maxlength="500"`. MCP limits: `linkedinify.text` 500 chars, `decrypt_recruiter.post` 3000 chars, `cringe` clamped to 1–10.
- Model output and retrieved sources go into the DOM with `textContent` or `append(string)`, never `innerHTML`.
- Error text for Ollama down: web `This program has performed an illegal operation: your LLM is unemployed. Run \`ollama serve\`.`; MCP `Ollama is unemployed. Run \`ollama serve\`.`
- Forward posts always end with `Agree?` (F12), on web and in MCP. Reverse output never gets it.
- MCP: stdio only, no `print()` to stdout (it corrupts the protocol), no file writes, no network calls except Ollama on localhost.
- Accessibility: labelled inputs, keyboard-reachable buttons, output in `aria-live="polite"`. Must look right at 800×600 and never scroll horizontally at 375px.
- Tests: one behavior per check, named after it. No network in unit tests (`.agents/rules/testing.md`).
- Each task ends by running the `update-progress` skill (`.agents/skills/update-progress/SKILL.md`), then a Conventional Commit.

## Review Focus

1. **Ollama down, or page blocked by CORS** (opened via `file://` or `127.0.0.1:8000`): the error dialog appears, buttons re-enable, page never freezes. Task 2 manual step 6; Task 7 `test_ollama_down_raises_unemployed`.
2. **Model not pulled** (Ollama answers 404 or sends `{"error": ...}` mid-stream): the user sees Ollama's own message, not a blank box. Task 2 stream loop checks `m.error`; Task 7 `test_http_error_shows_ollama_message`.
3. **A network chunk splits a JSON line or a multi-byte emoji**: no `JSON.parse` crash, no `�`. Task 1 `splitNdjson` checks; Task 2 uses `TextDecoderStream`.
4. **Embedding model missing while the chat model works**: translation still streams and the page says "Sources: vibes only". Task 5 manual step; Task 7 `test_embed_failure_still_translates`.
5. **Odd MCP input or launch dir** (empty text, 600 chars, `cringe=99`, server launched from another cwd): rejects, cuts, clamps, and still finds its JSON files. Task 6 cwd check; Task 7 `test_linkedinify_*` checks.

## Prerequisites (once, before Task 2)

Ollama is not installed natively on this machine. Pick one:

```bash
# Option A: Docker (CPU only)
docker compose up -d          # wait until the "pull" container exits
# Option B: native Ollama (faster with GPU)
ollama pull llama3.2:3b && ollama pull nomic-embed-text
OLLAMA_ORIGINS=http://localhost:8000 ollama serve
```

Serve the page (Option B only, Docker already serves on :8000): `python -m http.server 8000`.

Browser checks below use the chrome-devtools MCP tools (`navigate_page`, `fill`, `click`, `wait_for`, `take_screenshot`, `evaluate_script`), or a human with a browser.

## File Map

| File | Responsibility | Task |
|------|----------------|------|
| `prompts.json` | Model names, Ollama URL, temperature, both system prompts, buzzword list | 1 |
| `lib.js` | Pure functions shared by page and tests: `buildPrompt`, `enforceAgree`, `splitNdjson`, `cosine`, `topK`, `synergyScore` | 1, 5, 9 |
| `tests.js` | Plain checks for `lib.js`; runs in Node and the browser | 1, 5, 9 |
| `tests.html` | Opens `tests.js` in a browser | 1 |
| `index.html` | The app: markup, inline CSS, inline JS wiring DOM to Ollama | 2, 3, 5, 8, 9 |
| `cringe.json` | RAG corpus of `{human, linkedin}` pairs | 4 |
| `mcp_server.py` | FastMCP stdio server, Python twin of `lib.js` + Ollama calls | 6, 7 |
| `test_mcp_server.py` | Plain-assert checks for `mcp_server.py` | 6, 7 |
| `AGENTS.md` | Overview + Commands sections | 10 |

Skipped on purpose: F10 Buzzword Bingo, F11 modem sound (could-haves). Add them when everything in §10 passes and there is time left.

---

### Task 1: Shared config and pure prompt logic

**Files:**
- Create: `prompts.json`, `lib.js`, `tests.js`, `tests.html`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `prompts.json` keys: `ollama` (string), `model` (string), `embedModel` (string), `temperature` (number), `system` (string), `reverseSystem` (string), `buzzwords` (string[]).
  - `buildPrompt(text: string, cringe: number, examples: {human, linkedin}[], reverse = false): string`
  - `enforceAgree(text: string): string`
  - `splitNdjson(buf: string): [object[], string]` (parsed whole lines, leftover partial line)
  - `check(name: string, cond: boolean)` test helper in `tests.js`.

- [ ] **Step 0: Branch**

```bash
git checkout -b feat/linkedin-translator
```

- [ ] **Step 1: Write the failing tests**

`tests.js`:

```js
// Plain checks for lib.js. Browser: open tests.html (title shows PASS/FAIL). Node: see AGENTS.md Commands.
let fails = 0;
function check(name, cond) {
  if (!cond) fails++;
  console.log((cond ? 'ok   ' : 'FAIL ') + name);
}

const fired = { human: 'I got fired.', linkedin: 'Thrilled.' };
check('buildPrompt puts examples before the user text',
  buildPrompt('I overslept.', 7, [fired]) ===
  'Human: I got fired.\nLinkedIn: Thrilled.\n\nCringe level: 7/10\nHuman text: I overslept.');
check('buildPrompt without examples is level plus text',
  buildPrompt('x', 3, []) === 'Cringe level: 3/10\nHuman text: x');
check('buildPrompt reverse flips example order and drops cringe',
  buildPrompt('Thrilled to announce...', 7, [fired], true) ===
  'LinkedIn: Thrilled.\nHuman: I got fired.\n\nLinkedIn post: Thrilled to announce...');

check('enforceAgree appends Agree? when missing', enforceAgree('Grateful. #Growth') === 'Grateful. #Growth\n\nAgree?');
check('enforceAgree keeps an existing Agree?', enforceAgree('Grateful. Agree?') === 'Grateful. Agree?');
check('enforceAgree ignores case and trailing whitespace', enforceAgree('grateful. agree?  \n') === 'grateful. agree?');
check('enforceAgree on empty output is just Agree?', enforceAgree('') === 'Agree?');

let [msgs, rest] = splitNdjson('{"response":"Hi"}\n{"respon');
check('splitNdjson parses whole lines', msgs.length === 1 && msgs[0].response === 'Hi');
check('splitNdjson keeps the partial line', rest === '{"respon');
[msgs, rest] = splitNdjson(rest + 'se":"🚀"}\n');
check('splitNdjson finishes a line split across chunks', msgs[0].response === '🚀' && rest === '');
check('splitNdjson skips blank lines', splitNdjson('\n\n')[0].length === 0);

console.log(fails ? `${fails} FAILED` : 'ALL PASS');
if (typeof document !== 'undefined') document.title = fails ? 'FAIL' : 'PASS';
if (typeof process !== 'undefined') process.exitCode = fails ? 1 : 0;
```

`tests.html`:

```html
<!doctype html>
<meta charset="utf-8">
<title>Tests</title>
<p>Results are in the console. The tab title shows PASS or FAIL.</p>
<script src="lib.js"></script>
<script src="tests.js"></script>
```

- [ ] **Step 2: Run tests to verify they fail**

Run (Bash): `touch lib.js && node -e "const r=f=>require('fs').readFileSync(f,'utf8');eval(r('lib.js')+';'+r('tests.js'))"`
Expected: `ReferenceError: buildPrompt is not defined`

- [ ] **Step 3: Write `lib.js`**

```js
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
```

`prompts.json`:

```json
{
  "ollama": "http://localhost:11434",
  "model": "llama3.2:3b",
  "embedModel": "nomic-embed-text",
  "temperature": 0.9,
  "system": "You are a LinkedIn thought leader. Rewrite the user's text as a LinkedIn post.\nRules:\n- Turn every bad event into a growth opportunity or lesson.\n- Humblebrag. Be \"humbled\", \"thrilled\", \"grateful\".\n- Use buzzwords: synergy, leverage, journey, disrupt, passionate.\n- Short one-sentence paragraphs.\n- Add 2-5 emoji and 2-4 hashtags.\n- End with \"Agree?\"\n- Scale absurdity to the cringe level (1 = mild, 10 = unhinged).\n- Output only the post. No preamble.",
  "reverseSystem": "Translate this LinkedIn post into the blunt, honest sentence the author actually means. One or two sentences. No emoji.",
  "buzzwords": ["synergy", "leverage", "journey", "humbled", "grateful", "disrupt", "passionate", "thought leader", "🚀"]
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node -e "const r=f=>require('fs').readFileSync(f,'utf8');eval(r('lib.js')+';'+r('tests.js'))"`
Expected: 11 `ok` lines, then `ALL PASS`, exit code 0.
Also: `python -c "import json;c=json.load(open('prompts.json',encoding='utf-8'));print(c['model'])"` prints `llama3.2:3b`.

- [ ] **Step 5: Update progress and commit**

Run the `update-progress` skill, then:

```bash
git add prompts.json lib.js tests.js tests.html PROGRESS.md docs/README.md
git commit -m "feat: add shared prompts config and pure prompt helpers"
```

---

### Task 2: MVP page: translate, stream, error dialog (F1, F2, F5, F12)

**Files:**
- Create: `index.html`

**Interfaces:**
- Consumes: `buildPrompt`, `enforceAgree`, `splitNdjson` from `lib.js`; `prompts.json` keys `ollama`, `model`, `system`, `temperature`.
- Produces (DOM ids later tasks edit): `#form`, `#text`, `#go`, `#out`, `#status`, `#err`, `#err-msg`, `#marquee`, `#pause`. JS: `$(id)`, `cfg`, `showError(msg)`, `setBusy(on)`, `ollama(path, body): Promise<Response>`, `translate()`.

- [ ] **Step 1: Write `index.html`**

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LinkedIn Translator 96</title>
<style>
/* Tokens and recipes from DESIGN.md (same as preview.html) */
:root {
  --silver: #c0c0c0; --hl: #ffffff; --light: #dfdfdf; --shadow: #808080; --dark: #0a0a0a;
  --navy: #000080; --navy-end: #1084d0;
  --font-page: "Times New Roman", Times, serif;
  --font-ui: "MS Sans Serif", "Microsoft Sans Serif", Tahoma, Geneva, sans-serif;
  --font-mono: "Courier New", Courier, monospace;
  --raised:  inset -1px -1px var(--dark), inset 1px 1px var(--hl), inset -2px -2px var(--shadow), inset 2px 2px var(--light);
  --sunken:  inset -1px -1px var(--hl), inset 1px 1px var(--shadow), inset -2px -2px var(--light), inset 2px 2px var(--dark);
  --pressed: inset -1px -1px var(--hl), inset 1px 1px var(--dark), inset -2px -2px var(--light), inset 2px 2px var(--shadow);
  --window:  inset -1px -1px var(--dark), inset 1px 1px var(--light), inset -2px -2px var(--shadow), inset 2px 2px var(--hl);
  --default: inset 0 0 0 1px var(--dark), inset -2px -2px var(--dark), inset 2px 2px var(--hl), inset -3px -3px var(--shadow), inset 3px 3px var(--light);
  --page-bg: #c0c0c0; --page-fg: #000; --heading: #000;
  --wordart: linear-gradient(#000080, #990099 50%, #cc0000); --wordart-shadow: #fff;
}
@media (prefers-color-scheme: dark) {
  :root { --page-bg: #000; --page-fg: #fff; --heading: #0f0; --wordart: linear-gradient(#ff0, #f90 50%, #f00); --wordart-shadow: #900; }
}
* { box-sizing: border-box; }
body { margin: 8px; background: var(--page-bg); color: var(--page-fg); font: 16px/1.25 var(--font-page); }
.page { max-width: 760px; margin: 0 auto; }
header { text-align: center; }
.wordart {
  margin: 8px 0; font: 700 36px/1.1 "Arial Black", Arial, Helvetica, sans-serif; color: transparent;
  background: var(--wordart); -webkit-background-clip: text; background-clip: text;
  filter: drop-shadow(2px 2px 0 var(--wordart-shadow));
}
:focus-visible { outline: 1px dotted currentColor; outline-offset: 1px; }
hr { border: 0; border-top: 1px solid var(--shadow); border-bottom: 1px solid var(--hl); margin: 16px 0; }
.small { font-size: 13px; }

/* Chrome: silver stays silver on every page variant */
.window { background: var(--silver); color: #000; padding: 3px; box-shadow: var(--window); font: 11px/1.2 var(--font-ui); }
.titlebar {
  display: flex; align-items: center; height: 18px; padding: 0 2px 0 3px;
  color: #fff; font: bold 11px var(--font-ui); background: linear-gradient(90deg, var(--navy), var(--navy-end));
}
.window-body { padding: 8px; }
.field { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin: 6px 0 8px; }
.buttons { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 6px; }
button {
  min-width: 75px; min-height: 24px; padding: 0 12px;
  font: 11px var(--font-ui); color: #000; background: var(--silver);
  border: 0; border-radius: 0; box-shadow: var(--raised);
}
button.default { box-shadow: var(--default); }
button:active:not(:disabled), button[aria-pressed="true"] { box-shadow: var(--pressed); padding: 2px 11px 0 13px; }
button:focus-visible { outline: 1px dotted #000; outline-offset: -5px; }
button:disabled { color: var(--shadow); text-shadow: 1px 1px var(--hl); }
textarea {
  display: block; width: 100%; min-height: 24px; margin-top: 4px; padding: 3px 4px; resize: vertical;
  font: 11px var(--font-ui); color: #000; background: #fff; border: 0; border-radius: 0; box-shadow: var(--sunken);
}
::placeholder { color: var(--shadow); opacity: 1; }
.doc {
  min-height: 120px; margin: 0; padding: 6px; background: #fff; box-shadow: var(--sunken);
  font: 16px/1.25 var(--font-page); white-space: pre-wrap; overflow-wrap: anywhere;
}
.statusbar { display: flex; gap: 2px; height: 20px; margin-top: 2px; }
.statusbar > * { flex: 1; padding: 3px 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-shadow: inset 1px 1px var(--shadow), inset -1px -1px var(--hl); }
dialog.window { border: 0; max-width: min(400px, calc(100vw - 16px)); }
dialog::backdrop { background: none; }

/* One marquee per viewport, with a Pause button (WCAG 2.2.2) */
.marquee-row { display: flex; align-items: center; gap: 6px; }
.marquee { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; font-weight: 700; }
.marquee > span { display: inline-block; padding-left: 100%; animation: marquee 10s linear infinite; }
.marquee:is(:hover, :focus-within, .paused) > span { animation-play-state: paused; }
@keyframes marquee { to { transform: translateX(-100%); } }
@media (prefers-reduced-motion: reduce) { .marquee > span { animation: none; padding-left: 0; } }
</style>
</head>
<body>
<div class="page">
  <header>
    <h1 class="wordart">LinkedIn Translator 96</h1>
    <p>Type what actually happened. Get a post your boss will love.</p>
    <div class="marquee-row">
      <div class="marquee" id="marquee" tabindex="0"><span>*** Now with RAG (Retrieval-Augmented Grandstanding) and MCP (Most Cringe Protocol) *** Runs offline so HR can't see *** Agree? ***</span></div>
      <button type="button" id="pause" aria-pressed="false">Pause</button>
    </div>
  </header>
  <hr>
  <main class="window">
    <div class="titlebar"><span>Make It Professional - Translator</span></div>
    <form class="window-body" id="form">
      <label for="text"><b>What actually happened?</b></label>
      <textarea id="text" maxlength="500" rows="3" required placeholder="I got fired."></textarea>
      <div class="buttons">
        <button type="submit" class="default" id="go" disabled>Make It Professional™</button>
      </div>
    </form>
    <div class="window-body">
      <div id="out" class="doc" aria-live="polite"></div>
    </div>
    <div class="statusbar"><span id="status">Document: Done</span></div>
  </main>
</div>

<dialog id="err" class="window" aria-labelledby="err-title">
  <div class="titlebar"><span id="err-title">LINKEDIN caused an error</span></div>
  <div class="window-body">
    <p id="err-msg"></p>
    <form method="dialog" class="buttons"><button class="default">OK</button></form>
  </div>
</dialog>

<script src="lib.js"></script>
<script>
const $ = id => document.getElementById(id);
const UNEMPLOYED = 'This program has performed an illegal operation: your LLM is unemployed. Run `ollama serve`. ' +
  '(Also open this page at http://localhost:8000, or Ollama will not let it in.)';
let cfg;

function showError(msg) { $('err-msg').textContent = msg; $('err').showModal(); }
function setBusy(on) { $('go').disabled = on; }

// fetch() throws on connection refused AND on CORS block; both mean "Ollama can't be reached".
async function ollama(path, body) {
  let r;
  try { r = await fetch(cfg.ollama + path, { method: 'POST', body: JSON.stringify(body) }); }
  catch { throw new Error(UNEMPLOYED); }
  if (!r.ok) throw new Error('Ollama said: ' + ((await r.json().catch(() => null))?.error || r.status));
  return r;
}

async function translate() {
  const text = $('text').value.trim();
  if (!text) return;
  const out = $('out');
  setBusy(true);
  out.textContent = '';
  $('status').textContent = 'Connecting to thought leadership...';
  try {
    const examples = [];
    const r = await ollama('/api/generate', {
      model: cfg.model, system: cfg.system, prompt: buildPrompt(text, 7, examples),
      stream: true, options: { temperature: cfg.temperature },
    });
    // TextDecoderStream keeps multi-byte emoji intact across chunk boundaries.
    const reader = r.body.pipeThrough(new TextDecoderStream()).getReader();
    let buf = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      let msgs;
      [msgs, buf] = splitNdjson(buf + value);
      for (const m of msgs) {
        if (m.error) throw new Error('Ollama said: ' + m.error);
        out.textContent += m.response || '';
      }
    }
    out.textContent = enforceAgree(out.textContent);
    $('status').textContent = 'Document: Done';
  } catch (e) {
    $('status').textContent = 'Document: Error';
    showError(e.message);
  } finally {
    setBusy(false);
  }
}

$('form').addEventListener('submit', e => { e.preventDefault(); translate(); });
$('pause').addEventListener('click', e => {
  const paused = $('marquee').classList.toggle('paused');
  e.currentTarget.setAttribute('aria-pressed', paused);
});

fetch('prompts.json').then(r => r.json()).then(c => { cfg = c; setBusy(false); })
  .catch(() => showError('Cannot read prompts.json. Serve this folder with: python -m http.server 8000'));
</script>
</body>
</html>
```

- [ ] **Step 2: Unit tests still pass**

Run: `node -e "const r=f=>require('fs').readFileSync(f,'utf8');eval(r('lib.js')+';'+r('tests.js'))"`
Expected: `ALL PASS`.

- [ ] **Step 3: Happy path in browser**

Ollama running (Prerequisites). Navigate to `http://localhost:8000/`, fill `#text` with `I got fired.`, click `Make It Professional™`.
Expected: `#go` is disabled while text appears token by token in `#out`; when done, `#out` ends with `Agree?`, status shows `Document: Done`, `#go` enabled again.

- [ ] **Step 4: Check 800×600 and 375px**

`resize_page` to 800×600, screenshot: silver page, WordArt title, beveled window. `resize_page` to 375×700, then `evaluate_script`: `document.documentElement.scrollWidth <= innerWidth`.
Expected: `true` (no horizontal scroll).

- [ ] **Step 5: Keyboard and accessibility**

Tab from the top. Expected order: marquee, Pause, textarea, button. Each shows a dotted focus rectangle. `#out` has `aria-live="polite"`.

- [ ] **Step 6: Ollama down**

Stop Ollama (`docker compose stop ollama`, or quit `ollama serve`). Click the button again.
Expected: the Win95 dialog shows the "unemployed" text, OK or Esc closes it, the button is enabled again, the page still scrolls and types. Start Ollama again afterwards.

- [ ] **Step 7: Update progress and commit**

Run the `update-progress` skill, then:

```bash
git add index.html PROGRESS.md docs/README.md
git commit -m "feat: add streaming LinkedIn translator page with error dialog"
```

---

### Task 3: Copy button, loading messages, cringe slider (F3, F4, F6)

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: Task 2 DOM ids and JS (`$`, `setBusy`, `translate`, `showError`).
- Produces: `#cringe` (range 1–10), `#cringe-val`, `#copy`. `localStorage.cringe` holds the last level.

- [ ] **Step 1: Add markup**

In `index.html`, replace:

```html
      <textarea id="text" maxlength="500" rows="3" required placeholder="I got fired."></textarea>
      <div class="buttons">
        <button type="submit" class="default" id="go" disabled>Make It Professional™</button>
      </div>
```

with:

```html
      <textarea id="text" maxlength="500" rows="3" required placeholder="I got fired."></textarea>
      <div class="field">
        <label for="cringe">Cringe level:</label>
        <input type="range" id="cringe" min="1" max="10" value="7">
        <output id="cringe-val" for="cringe">7</output>/10
      </div>
      <div class="buttons">
        <button type="submit" class="default" id="go" disabled>Make It Professional™</button>
        <button type="button" id="copy" disabled>Copy to Clipboard</button>
      </div>
```

- [ ] **Step 2: Rotate loading messages until the first token**

Replace:

```js
  out.textContent = '';
  $('status').textContent = 'Connecting to thought leadership...';
  try {
```

with:

```js
  $('copy').disabled = true;
  let started = false, i = 0;
  const tick = () => {
    const msg = LOADING[i++ % LOADING.length];
    $('status').textContent = msg;
    if (!started) out.textContent = msg;
  };
  tick();
  const ticker = setInterval(tick, 1500);
  try {
```

Replace:

```js
        if (m.error) throw new Error('Ollama said: ' + m.error);
        out.textContent += m.response || '';
```

with:

```js
        if (m.error) throw new Error('Ollama said: ' + m.error);
        if (!started) { started = true; clearInterval(ticker); out.textContent = ''; }
        out.textContent += m.response || '';
```

Replace:

```js
    out.textContent = enforceAgree(out.textContent);
    $('status').textContent = 'Document: Done';
  } catch (e) {
    $('status').textContent = 'Document: Error';
    showError(e.message);
  } finally {
    setBusy(false);
  }
```

with:

```js
    out.textContent = enforceAgree(out.textContent);
    $('status').textContent = 'Document: Done';
    $('copy').disabled = false;
  } catch (e) {
    if (!started) out.textContent = '';
    $('status').textContent = 'Document: Error';
    showError(e.message);
  } finally {
    clearInterval(ticker);
    setBusy(false);
  }
```

Add after `let cfg;`:

```js
const LOADING = ['Humbled to be generating...', 'Leveraging synergies...', 'Circling back...', 'Disrupting your request...'];
```

- [ ] **Step 3: Slider with remembered level, and use it in the prompt**

Replace `prompt: buildPrompt(text, 7, examples),` with `prompt: buildPrompt(text, +$('cringe').value, examples),`.

Add before the `fetch('prompts.json')` line:

```js
// localStorage can throw (private mode, blocked storage); the slider still works without it.
const cringe = $('cringe');
try { cringe.value = localStorage.cringe || 7; } catch {}
const syncCringe = () => {
  $('cringe-val').textContent = cringe.value;
  try { localStorage.cringe = cringe.value; } catch {}
};
cringe.addEventListener('input', syncCringe);
syncCringe();

$('copy').addEventListener('click', () =>
  navigator.clipboard.writeText($('out').textContent)
    .then(() => { $('status').textContent = 'Copied. Friends lost: all.'; })
    .catch(() => showError('Clipboard blocked. Select the post and press Ctrl+C.')));
```

- [ ] **Step 4: Browser check**

Reload `http://localhost:8000/`. Set slider to 10, submit `I ate a sandwich.`
Expected: `#out` and status cycle "Humbled to be generating..." style messages until the first token, then stream. After done, `Copy to Clipboard` is enabled; click it, then `evaluate_script`: `navigator.clipboard.readText()` equals `#out` text. Reload page: slider still at 10. Submit at 1 and at 10: level-10 post is visibly more unhinged.

- [ ] **Step 5: Update progress and commit**

Run the `update-progress` skill, then:

```bash
git add index.html PROGRESS.md
git commit -m "feat: add copy button, loading messages and cringe slider"
```

---

### Task 4: Cringe corpus

**Files:**
- Create: `cringe.json`

**Interfaces:**
- Produces: JSON array of `{ "human": string, "linkedin": string }`. The four REQUIREMENTS.md §4 rows come first, in order.

- [ ] **Step 1: Write the failing check**

Run: `python -c "import json;d=json.load(open('cringe.json',encoding='utf-8'));assert len(d)>=10 and d[0]['human']=='I got fired.' and all(p['human'] and p['linkedin'] for p in d);print(len(d))"`
Expected: `FileNotFoundError`.

- [ ] **Step 2: Write `cringe.json`**

Hand-written, no scraped posts, no real names.

```json
[
  { "human": "I got fired.", "linkedin": "Thrilled to announce I'm open to new opportunities after an incredible journey. Grateful for every lesson. 🚀 #OpenToWork #Growth" },
  { "human": "I ate a sandwich.", "linkedin": "Today I paused for lunch and realized: a sandwich is just layers working in synergy. Just like great teams. 🥪 Agree?" },
  { "human": "I overslept.", "linkedin": "I chose rest over hustle culture this morning. Burnout is not a KPI. ☀️ #Wellness #Leadership" },
  { "human": "My code doesn't work.", "linkedin": "Failure is just success in beta. 7 lessons today's production outage taught me about resilience. 🧵👇" },
  { "human": "My train was late.", "linkedin": "My train was 40 minutes late today. Most people would complain. I saw 40 minutes of unplanned deep work. 🚆 Delays are just pivots in disguise. #Mindset #Resilience Agree?" },
  { "human": "My kid spilled juice on my laptop.", "linkedin": "My 4-year-old just taught me more about crisis management than any MBA. 🧃💻 When the unexpected hits, leaders don't panic. They iterate. #Parenting #Leadership Agree?" },
  { "human": "My dog ate my report.", "linkedin": "My golden retriever consumed my quarterly report this morning. Humbled. Sometimes the market tells you to start fresh. 🐕📉 #Pivot #Growth Agree?" },
  { "human": "It's raining.", "linkedin": "It's raining today. ☔ Grateful for the reminder that growth needs storms. Every drop is a seed of opportunity. #Gratitude #Journey Agree?" },
  { "human": "I skipped the gym.", "linkedin": "Today I disrupted my own routine and skipped the gym. 💪 Rest is a strategic investment. Passionate about sustainable high performance. #Wellness #Leadership Agree?" },
  { "human": "I spilled my coffee.", "linkedin": "Spilled my coffee this morning. ☕ Instead of a setback, I chose to leverage gratitude. Thrilled to be caffeinated by resilience instead. #MorningRoutine #Growth Agree?" },
  { "human": "I pushed a bug to production.", "linkedin": "Thrilled to share that I shipped a feature our users didn't know they needed: an outage. 🐛🚀 Failure is just data with feelings. #Engineering #Ownership Agree?" },
  { "human": "Nobody replied to my job applications.", "linkedin": "Humbled to announce I've been ghosted by 47 incredible companies. 👻 Each silence taught me something about patience and personal branding. #OpenToWork #Journey Agree?" }
]
```

- [ ] **Step 3: Run the check to verify it passes**

Run the Step 1 command again.
Expected: prints `12`.

- [ ] **Step 4: Update progress and commit**

Run the `update-progress` skill. Add to PROGRESS.md **Next**: `- [ ] Team grows cringe.json to 30–50 pairs (commuting, kids, pets, weather, gym, coffee...).` Then:

```bash
git add cringe.json PROGRESS.md docs/README.md
git commit -m "feat: add starter cringe corpus for RAG"
```

---

### Task 5: Browser RAG with sources panel (F13)

**Files:**
- Modify: `lib.js`, `tests.js`, `index.html`

**Interfaces:**
- Consumes: `cringe.json`; `prompts.json` key `embedModel`; Task 2/3 JS.
- Produces:
  - `cosine(a: number[], b: number[]): number` (0 when either vector is all zeros)
  - `topK(q: number[], vecs: number[][], k: number): number[]` (indices, best first)
  - JS in `index.html`: `corpus`, `vecs` (side → Promise of vectors), `embed(texts)`, `index(side)`, `retrieve(text, side): Promise<{human, linkedin}[]>`, `showSources(examples, reverse)`. DOM: `#sources-head`, `#sources`.

- [ ] **Step 1: Write the failing tests**

In `tests.js`, insert before the `console.log(fails ? ...` line:

```js
check('cosine of identical vectors is 1', Math.abs(cosine([1, 2], [1, 2]) - 1) < 1e-9);
check('cosine of orthogonal vectors is 0', cosine([1, 0], [0, 1]) === 0);
check('cosine with a zero vector is 0, not NaN', cosine([0, 0], [1, 1]) === 0);
check('topK returns indices best first', topK([1, 0], [[0, 1], [1, 0], [1, 1]], 2).join() === '1,2');
check('topK with k larger than corpus returns all', topK([1, 0], [[1, 0]], 3).join() === '0');
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node -e "const r=f=>require('fs').readFileSync(f,'utf8');eval(r('lib.js')+';'+r('tests.js'))"`
Expected: `ReferenceError: cosine is not defined`.

- [ ] **Step 3: Add to `lib.js`**

```js
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run the Step 2 command. Expected: `ALL PASS`.

- [ ] **Step 5: Sources markup**

In `index.html`, replace:

```html
      <div id="out" class="doc" aria-live="polite"></div>
```

with:

```html
      <div id="out" class="doc" aria-live="polite"></div>
      <p class="small"><b id="sources-head"></b></p>
      <ul id="sources" class="small"></ul>
```

- [ ] **Step 6: Retrieval code**

Replace `let cfg;` with:

```js
let cfg, corpus = [];
const vecs = {}; // side ('human' | 'linkedin') -> Promise<number[][]>, built on first use
const NAMES = ['Chad Synergy, Chief Vibes Officer', 'Brenda Leverage, VP of Gratitude', 'Kyle Disrupt, Serial Thought Leader'];
```

Add after the `ollama()` function:

```js
async function embed(texts) {
  const r = await ollama('/api/embed', { model: cfg.embedModel, input: texts });
  return (await r.json()).embeddings;
}

function index(side) {
  vecs[side] ??= embed(corpus.map(p => 'search_document: ' + p[side]));
  return vecs[side];
}

// RAG is a bonus: if embedding fails, translate with no examples.
async function retrieve(text, side) {
  try {
    const [docs, [q]] = await Promise.all([index(side), embed(['search_query: ' + text])]);
    return topK(q, docs, 3).map(i => corpus[i]);
  } catch {
    delete vecs[side]; // retry next time, e.g. after `ollama pull nomic-embed-text`
    return [];
  }
}

function showSources(examples, reverse) {
  $('sources-head').textContent = examples.length ? `Sources: ${examples.length} thought leaders` : 'Sources: vibes only';
  $('sources').replaceChildren(...examples.map((ex, i) => {
    const li = document.createElement('li');
    li.append(Object.assign(document.createElement('b'), { textContent: NAMES[i] + ': ' }), reverse ? ex.human : ex.linkedin);
    return li;
  }));
}
```

In `translate()`, replace `const examples = [];` with `const examples = await retrieve(text, 'human');`.

Replace:

```js
    out.textContent = enforceAgree(out.textContent);
    $('status').textContent = 'Document: Done';
```

with:

```js
    out.textContent = enforceAgree(out.textContent);
    showSources(examples, false);
    $('status').textContent = examples.length ? 'Document: Done' : 'Sources: vibes only';
```

Replace the last line block:

```js
fetch('prompts.json').then(r => r.json()).then(c => { cfg = c; setBusy(false); })
  .catch(() => showError('Cannot read prompts.json. Serve this folder with: python -m http.server 8000'));
```

with:

```js
(async () => {
  try {
    [cfg, corpus] = await Promise.all(['prompts.json', 'cringe.json'].map(f => fetch(f).then(r => r.json())));
  } catch {
    return showError('Cannot read prompts.json or cringe.json. Serve this folder with: python -m http.server 8000');
  }
  setBusy(false);
  $('status').textContent = `Indexing thought leadership... 0/${corpus.length}`;
  try {
    await index('human');
    $('status').textContent = `Indexing thought leadership... ${corpus.length}/${corpus.length}`;
  } catch {
    delete vecs.human;
    $('status').textContent = 'Sources: vibes only';
  }
})();
```

- [ ] **Step 7: Browser check, RAG on**

Reload. Expected: status shows `Indexing thought leadership... 12/12` within 5 s. Submit `I got fired.` Expected: `Sources: 3 thought leaders` with 3 list items, one of them the "Thrilled to announce I'm open to new opportunities..." post.

- [ ] **Step 8: Browser check, embed model missing**

Remove the embed model: `docker compose exec ollama ollama rm nomic-embed-text` (or `ollama rm nomic-embed-text`). Reload, submit `I got fired.`
Expected: post still streams and ends with `Agree?`; panel and status show `Sources: vibes only`. Restore: `ollama pull nomic-embed-text` (same `docker compose exec` prefix for Docker).

- [ ] **Step 9: Update progress and commit**

Run the `update-progress` skill, then:

```bash
git add lib.js tests.js index.html PROGRESS.md
git commit -m "feat: add RAG few-shot retrieval with sources panel"
```

---

### Task 6: MCP server core and `synergy_score` tool (F14, part 1)

**Files:**
- Create: `mcp_server.py`, `test_mcp_server.py`

**Interfaces:**
- Consumes: `prompts.json`, `cringe.json`.
- Produces (Python, module `mcp_server`):
  - `HERE: Path`, `CFG: dict`, `CORPUS: list[dict]`, `UNEMPLOYED: str`, `mcp: FastMCP`
  - `cosine(a, b) -> float`, `top_k(q, vecs, k=3) -> list[int]`
  - `synergy(text: str, words: list[str]) -> dict` → `{"score": int, "buzzwords": list[str]}`
  - `enforce_agree(text: str) -> str`
  - `build_prompt(text: str, cringe: int, examples: list[dict], reverse: bool = False) -> str`
  - `clean(text: str, limit: int) -> str` (strip, cut to limit, `ValueError` if empty)
  - Tool `synergy_score(text: str) -> dict`

- [ ] **Step 1: Install the SDK**

Run: `python -m pip install mcp`
Expected: `Successfully installed mcp-...` (or "already satisfied").

- [ ] **Step 2: Write the failing tests**

`test_mcp_server.py`:

```python
"""Plain-assert checks for mcp_server.py. Run: python test_mcp_server.py"""
import mcp_server as m

W = ["synergy", "journey", "thought leader", "🚀"]
FIRED = {"human": "I got fired.", "linkedin": "Thrilled."}


def test_corpus_starts_with_spec_rows():
    assert len(m.CORPUS) >= 10 and m.CORPUS[0]["human"] == "I got fired."


def test_synergy_counts_every_hit():
    assert m.synergy("Synergy! synergy on my journey 🚀", W) == {"score": 40, "buzzwords": ["synergy", "journey", "🚀"]}


def test_synergy_matches_multi_word_terms():
    assert m.synergy("A Thought Leader.", W)["buzzwords"] == ["thought leader"]


def test_synergy_caps_at_100():
    assert m.synergy("synergy " * 20, W)["score"] == 100


def test_synergy_of_plain_text_is_zero():
    assert m.synergy("I ate a sandwich.", W) == {"score": 0, "buzzwords": []}


def test_synergy_score_tool_uses_config_words():
    assert m.synergy_score("Humbled and grateful")["buzzwords"] == ["humbled", "grateful"]


def test_synergy_score_rejects_empty():
    try:
        m.synergy_score("   ")
        assert False, "expected ValueError"
    except ValueError:
        pass


def test_enforce_agree_appends_when_missing():
    assert m.enforce_agree("Grateful. #Growth") == "Grateful. #Growth\n\nAgree?"


def test_enforce_agree_keeps_existing():
    assert m.enforce_agree("grateful. agree?  \n") == "grateful. agree?"


def test_build_prompt_matches_lib_js():
    assert m.build_prompt("I overslept.", 7, [FIRED]) == \
        "Human: I got fired.\nLinkedIn: Thrilled.\n\nCringe level: 7/10\nHuman text: I overslept."
    assert m.build_prompt("Thrilled to announce...", 7, [FIRED], reverse=True) == \
        "LinkedIn: Thrilled.\nHuman: I got fired.\n\nLinkedIn post: Thrilled to announce..."


def test_top_k_best_first_and_zero_safe():
    assert m.top_k([1, 0], [[0, 1], [1, 0], [1, 1]], 2) == [1, 2]
    assert m.cosine([0, 0], [1, 1]) == 0


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
            print("ok  ", name)
    print("ALL PASS")
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `python test_mcp_server.py`
Expected: `ModuleNotFoundError: No module named 'mcp_server'`.

- [ ] **Step 4: Write `mcp_server.py`**

```python
"""Most Cringe Protocol: LinkedIn translator tools for AI agents, over stdio.

Spec: REQUIREMENTS.md section 7. Python twin of lib.js; keep the two in step.
Never print() here: stdout is the MCP channel.
"""
import json
import math
import urllib.error
import urllib.request
from pathlib import Path

from mcp.server.fastmcp import FastMCP

HERE = Path(__file__).resolve().parent  # agents launch us from any cwd
CFG = json.loads((HERE / "prompts.json").read_text(encoding="utf-8"))
CORPUS = json.loads((HERE / "cringe.json").read_text(encoding="utf-8"))
UNEMPLOYED = "Ollama is unemployed. Run `ollama serve`."

mcp = FastMCP("ilovemyjob")


def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    return dot / (math.sqrt(sum(x * x for x in a) * sum(y * y for y in b)) or 1)


def top_k(q, vecs, k=3):
    return sorted(range(len(vecs)), key=lambda i: cosine(q, vecs[i]), reverse=True)[:k]


def synergy(text, words):
    lower = text.lower()
    hits = {w: lower.count(w) for w in words}
    found = [w for w in words if hits[w]]
    return {"score": min(100, sum(hits.values()) * 10), "buzzwords": found}


def enforce_agree(text):
    t = text.strip()
    if t.lower().endswith("agree?"):
        return t
    return t + "\n\nAgree?" if t else "Agree?"


def build_prompt(text, cringe, examples, reverse=False):
    p = ""
    for ex in examples:
        p += (f"LinkedIn: {ex['linkedin']}\nHuman: {ex['human']}\n\n" if reverse
              else f"Human: {ex['human']}\nLinkedIn: {ex['linkedin']}\n\n")
    return p + (f"LinkedIn post: {text}" if reverse else f"Cringe level: {cringe}/10\nHuman text: {text}")


def clean(text, limit):
    text = text.strip()[:limit]
    if not text:
        raise ValueError("text is empty")
    return text


@mcp.tool()
def synergy_score(text: str) -> dict:
    """Count LinkedIn buzzwords in text. Returns {"score": 0-100, "buzzwords": [...]}. No LLM."""
    return synergy(clean(text, 3000), CFG["buzzwords"])


if __name__ == "__main__":
    mcp.run()  # stdio
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `python test_mcp_server.py`
Expected: 11 `ok` lines, then `ALL PASS`.

- [ ] **Step 6: Server finds its files from another cwd, and lists the tool**

Run: `cd .. && python -c "import sys,asyncio; sys.path.insert(0,'Ilovemyjob'); import mcp_server as m; print(len(m.CORPUS), [t.name for t in asyncio.run(m.mcp.list_tools())])"`
Expected: `12 ['synergy_score']`.

- [ ] **Step 7: Update progress and commit**

Run the `update-progress` skill, then:

```bash
git add mcp_server.py test_mcp_server.py PROGRESS.md docs/README.md
git commit -m "feat: add MCP server with synergy_score tool"
```

---

### Task 7: MCP `linkedinify` and `decrypt_recruiter` with RAG (F14, part 2)

**Files:**
- Modify: `mcp_server.py`, `test_mcp_server.py`

**Interfaces:**
- Consumes: Task 6 helpers.
- Produces:
  - `ollama(path: str, body: dict) -> dict` (raises `RuntimeError(UNEMPLOYED)` when unreachable, `RuntimeError("Ollama said: ...")` on HTTP error)
  - `_vecs: dict[str, list]` cache, `examples_for(text, side) -> list[dict]` (`[]` if embedding fails)
  - `generate(system, prompt) -> str`
  - Tools `linkedinify(text: str, cringe: int = 7) -> str`, `decrypt_recruiter(post: str) -> str`

- [ ] **Step 1: Write the failing tests**

In `test_mcp_server.py`, add after `FIRED = ...`:

```python
import io
import urllib.error

REAL_OLLAMA = m.ollama if hasattr(m, "ollama") else None


def fake_ollama(path, body):
    """Corpus vectors [1,0],[1,1],[1,2]...; query [1,0]. Records the last generate body."""
    if path == "/api/embed":
        return {"embeddings": [[1.0, float(i)] for i in range(len(body["input"]))]}
    fake_ollama.last = body
    return {"response": "  Grateful for this journey. #Growth  "}


def use_fake():
    m.ollama = fake_ollama
    m._vecs.clear()
```

Add before `if __name__ == "__main__":`:

```python
def test_linkedinify_enforces_agree_and_clamps_cringe():
    use_fake()
    assert m.linkedinify("I got fired.", 99).endswith("Agree?")
    assert "Cringe level: 10/10" in fake_ollama.last["prompt"]
    m.linkedinify("I got fired.", -5)
    assert "Cringe level: 1/10" in fake_ollama.last["prompt"]


def test_linkedinify_adds_three_examples():
    use_fake()
    m.linkedinify("I got fired.")
    assert fake_ollama.last["prompt"].count("Human: ") == 3
    assert fake_ollama.last["system"] == m.CFG["system"]


def test_linkedinify_cuts_text_to_500():
    use_fake()
    m.linkedinify("x" * 600)
    assert "x" * 500 in fake_ollama.last["prompt"] and "x" * 501 not in fake_ollama.last["prompt"]


def test_linkedinify_rejects_empty():
    use_fake()
    try:
        m.linkedinify("  ")
        assert False, "expected ValueError"
    except ValueError:
        pass


def test_decrypt_recruiter_uses_reverse_prompt_without_agree():
    use_fake()
    out = m.decrypt_recruiter("Thrilled to announce my next chapter!")
    assert not out.endswith("Agree?")
    assert fake_ollama.last["system"] == m.CFG["reverseSystem"]
    assert fake_ollama.last["prompt"].endswith("LinkedIn post: Thrilled to announce my next chapter!")


def test_embed_failure_still_translates():
    def no_embed(path, body):
        if path == "/api/embed":
            raise RuntimeError("Ollama said: model not found")
        return fake_ollama(path, body)
    m.ollama = no_embed
    m._vecs.clear()
    assert m.linkedinify("I got fired.").endswith("Agree?")
    assert "Human: " not in fake_ollama.last["prompt"]


def _with_urlopen(fn, raiser):
    m.ollama = REAL_OLLAMA
    m._vecs.clear()
    orig = m.urllib.request.urlopen
    m.urllib.request.urlopen = raiser
    try:
        fn()
        assert False, "expected RuntimeError"
    except RuntimeError as e:
        return str(e)
    finally:
        m.urllib.request.urlopen = orig


def test_ollama_down_raises_unemployed():
    def refuse(*a, **k):
        raise urllib.error.URLError("connection refused")
    assert _with_urlopen(lambda: m.linkedinify("I got fired."), refuse) == m.UNEMPLOYED


def test_http_error_shows_ollama_message():
    def not_found(*a, **k):
        raise urllib.error.HTTPError("u", 404, "Not Found", {}, io.BytesIO(b'{"error":"model not found"}'))
    assert "model not found" in _with_urlopen(lambda: m.decrypt_recruiter("Thrilled."), not_found)
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `python test_mcp_server.py`
Expected: `AttributeError: module 'mcp_server' has no attribute '_vecs'` (or `linkedinify`).

- [ ] **Step 3: Add Ollama calls and tools to `mcp_server.py`**

Insert after `clean()` and before the `synergy_score` tool:

```python
def ollama(path, body):
    req = urllib.request.Request(CFG["ollama"] + path, json.dumps(body).encode(),
                                 {"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:  # Ollama is up but unhappy, e.g. model not pulled
        raise RuntimeError("Ollama said: " + e.read().decode(errors="replace")) from e
    except (urllib.error.URLError, OSError) as e:
        raise RuntimeError(UNEMPLOYED) from e


# side ('human' | 'linkedin') -> corpus vectors. Built on first call, not at startup,
# so the server starts even while Ollama is down.
_vecs = {}


def examples_for(text, side):
    """Top 3 corpus pairs closest to text on the given side. [] if embedding fails (vibes only)."""
    try:
        if side not in _vecs:
            _vecs[side] = ollama("/api/embed", {"model": CFG["embedModel"],
                                                "input": ["search_document: " + p[side] for p in CORPUS]})["embeddings"]
        q = ollama("/api/embed", {"model": CFG["embedModel"], "input": ["search_query: " + text]})["embeddings"][0]
    except RuntimeError:
        return []
    return [CORPUS[i] for i in top_k(q, _vecs[side])]


def generate(system, prompt):
    return ollama("/api/generate", {"model": CFG["model"], "system": system, "prompt": prompt,
                                    "stream": False, "options": {"temperature": CFG["temperature"]}})["response"].strip()


@mcp.tool()
def linkedinify(text: str, cringe: int = 7) -> str:
    """Rewrite a plain sentence as a LinkedIn post. text: max 500 chars. cringe: 1 (mild) to 10 (unhinged)."""
    text = clean(text, 500)
    cringe = max(1, min(10, int(cringe)))
    return enforce_agree(generate(CFG["system"], build_prompt(text, cringe, examples_for(text, "human"))))


@mcp.tool()
def decrypt_recruiter(post: str) -> str:
    """Translate a LinkedIn post into the one or two honest sentences the author means. post: max 3000 chars."""
    post = clean(post, 3000)
    return generate(CFG["reverseSystem"], build_prompt(post, 0, examples_for(post, "linkedin"), reverse=True))
```

In `test_mcp_server.py`, `REAL_OLLAMA` is now always defined; replace its line with `REAL_OLLAMA = m.ollama`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `python test_mcp_server.py`
Expected: 19 `ok` lines, then `ALL PASS`.

- [ ] **Step 5: Live smoke test through Claude Code**

Ollama running. Run: `claude mcp add ilovemyjob -- python "C:\Users\User\Desktop\StupidProject\Ilovemyjob\mcp_server.py"`
In a new Claude Code session, run `/mcp`. Expected: `ilovemyjob` lists `linkedinify`, `decrypt_recruiter`, `synergy_score`.
Ask: "Use linkedinify on: I fixed a typo." Expected: a post that ends with `Agree?`.
Stop Ollama, ask again. Expected: tool error containing `Ollama is unemployed. Run \`ollama serve\`.`; ask a third time with Ollama back up, and it works, so the server stayed alive.

- [ ] **Step 6: Update progress and commit**

Run the `update-progress` skill, then:

```bash
git add mcp_server.py test_mcp_server.py PROGRESS.md
git commit -m "feat: add linkedinify and decrypt_recruiter MCP tools with RAG"
```

---

### Task 8: Reverse mode on the page (F7)

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: `retrieve(text, side)`, `showSources(examples, reverse)`, `buildPrompt(..., reverse)`, `cfg.reverseSystem`.
- Produces: `#reverse` button; `translate(reverse: boolean)`.

- [ ] **Step 1: Button**

Replace:

```html
        <button type="submit" class="default" id="go" disabled>Make It Professional™</button>
```

with:

```html
        <button type="submit" class="default" id="go" disabled>Make It Professional™</button>
        <button type="button" id="reverse" disabled>Decrypt Recruiter</button>
```

- [ ] **Step 2: Parameterize `translate`**

Replace `function setBusy(on) { $('go').disabled = on; }` with:

```js
function setBusy(on) { $('go').disabled = $('reverse').disabled = on; }
```

Replace `async function translate() {` with `async function translate(reverse = false) {`.

Replace `const examples = await retrieve(text, 'human');` with `const examples = await retrieve(text, reverse ? 'linkedin' : 'human');`.

Replace:

```js
      model: cfg.model, system: cfg.system, prompt: buildPrompt(text, +$('cringe').value, examples),
```

with:

```js
      model: cfg.model, system: reverse ? cfg.reverseSystem : cfg.system,
      prompt: buildPrompt(text, +$('cringe').value, examples, reverse),
```

Replace:

```js
    out.textContent = enforceAgree(out.textContent);
    showSources(examples, false);
```

with:

```js
    out.textContent = reverse ? out.textContent.trim() : enforceAgree(out.textContent);
    showSources(examples, reverse);
```

Replace `$('form').addEventListener('submit', e => { e.preventDefault(); translate(); });` with:

```js
$('form').addEventListener('submit', e => { e.preventDefault(); translate(false); });
$('reverse').addEventListener('click', () => { if ($('form').reportValidity()) translate(true); });
```

- [ ] **Step 3: Browser check**

Paste `Thrilled to announce I'm embarking on an exciting new chapter of my journey. 🚀 Agree?` into `#text`, click `Decrypt Recruiter`.
Expected: one or two blunt sentences (e.g. "I got fired."), no `Agree?` appended, both buttons disabled during generation, sources list shows `human` side texts. Empty textarea + `Decrypt Recruiter` shows the browser's "fill out this field" hint and sends nothing.

- [ ] **Step 4: Update progress and commit**

Run the `update-progress` skill, then:

```bash
git add index.html PROGRESS.md
git commit -m "feat: add Decrypt Recruiter reverse mode"
```

---

### Task 9: Synergy Meter and fake engagement (F8, F9)

**Files:**
- Modify: `lib.js`, `tests.js`, `index.html`

**Interfaces:**
- Consumes: `cfg.buzzwords`.
- Produces: `synergyScore(text: string, words: string[]): {score: number, buzzwords: string[]}` (same rule as Python `synergy`: case-insensitive substring count, 10 points per hit, cap 100). DOM: `#meter`, `#meter-label`, `#engage`.

- [ ] **Step 1: Write the failing tests**

In `tests.js`, insert before the `console.log(fails ? ...` line:

```js
const W = ['synergy', 'journey', 'thought leader', '🚀'];
check('synergyScore counts every hit, 10 points each', synergyScore('Synergy! synergy on my journey 🚀', W).score === 40);
check('synergyScore lists each word once, in list order', synergyScore('🚀 synergy synergy', W).buzzwords.join() === 'synergy,🚀');
check('synergyScore matches multi-word terms', synergyScore('A Thought Leader.', W).buzzwords.join() === 'thought leader');
check('synergyScore caps at 100', synergyScore('synergy '.repeat(20), W).score === 100);
check('synergyScore of plain text is 0', synergyScore('I ate a sandwich.', W).score === 0);
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node -e "const r=f=>require('fs').readFileSync(f,'utf8');eval(r('lib.js')+';'+r('tests.js'))"`
Expected: `ReferenceError: synergyScore is not defined`.

- [ ] **Step 3: Add to `lib.js`**

```js
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run the Step 2 command. Expected: `ALL PASS`.

- [ ] **Step 5: Markup and CSS**

In `index.html`, replace:

```html
      <p class="small"><b id="sources-head"></b></p>
```

with:

```html
      <p class="small" id="engage"></p>
      <div class="field">
        <span id="meter-label">Synergy: 0%</span>
        <span class="progress" aria-hidden="true"><span id="meter"></span></span>
      </div>
      <p class="small"><b id="sources-head"></b></p>
```

Add to the `<style>` block, after the `.statusbar > *` rule:

```css
.progress { flex: 1; max-width: 200px; height: 20px; padding: 3px; background: #fff; box-shadow: var(--sunken); }
.progress > span { display: block; width: 0; height: 100%; background: repeating-linear-gradient(90deg, var(--navy) 0 8px, transparent 8px 10px); }
```

- [ ] **Step 6: Wire it**

Add after `showSources()`:

```js
function showStats(text, reverse) {
  const s = synergyScore(text, cfg.buzzwords);
  $('meter').style.width = s.score + '%';
  $('meter-label').textContent = `Synergy: ${s.score}% (${s.buzzwords.join(', ') || 'none detected'})`;
  const n = max => Math.floor(Math.random() * max).toLocaleString('en-US');
  $('engage').textContent = reverse ? '' : `${n(9999)} reactions · ${n(999)} comments · ${n(99)} reposts`;
}
```

In `translate()`, replace `showSources(examples, reverse);` with:

```js
    showSources(examples, reverse);
    showStats(out.textContent, reverse);
```

- [ ] **Step 7: Browser check**

Submit `I got fired.`. Expected: under the post, `1,234 reactions · 56 comments · 7 reposts` style line; `Synergy: N% (journey, grateful, ...)` with a chunky navy block bar sized N%. Check 375px width again: `document.documentElement.scrollWidth <= innerWidth` is `true`.

- [ ] **Step 8: Update progress and commit**

Run the `update-progress` skill, then:

```bash
git add lib.js tests.js index.html PROGRESS.md
git commit -m "feat: add Synergy Meter and fake engagement counts"
```

---

### Task 10: Acceptance pass and project docs

**Files:**
- Modify: `AGENTS.md` (Overview, Commands), `PROGRESS.md`

**Interfaces:**
- Consumes: everything above.
- Produces: filled `AGENTS.md` sections; REQUIREMENTS.md §10 checklist results recorded in PROGRESS.md.

- [ ] **Step 1: Fill `AGENTS.md`**

Replace:

```markdown
## Overview
## Commands
```

with:

```markdown
## Overview
LinkedIn Translator: `index.html` (vanilla JS, no build) calls local Ollama to rewrite sentences as LinkedIn posts. `lib.js` holds pure logic, `mcp_server.py` exposes the same tools over MCP stdio. `prompts.json` and `cringe.json` are shared by both. Spec: `REQUIREMENTS.md`.

## Commands
- Run app: `docker compose up -d`, or `ollama serve` + `python -m http.server 8000`; open http://localhost:8000
- JS tests: `node -e "const r=f=>require('fs').readFileSync(f,'utf8');eval(r('lib.js')+';'+r('tests.js'))"` (or open `/tests.html`)
- Python tests: `python -m pip install mcp && python test_mcp_server.py`
- MCP: `claude mcp add ilovemyjob -- python <abs path>/mcp_server.py`
```

- [ ] **Step 2: Run both suites**

Run the JS and Python test commands above.
Expected: both print `ALL PASS`.

- [ ] **Step 3: Walk REQUIREMENTS.md §10**

Go through each of the 11 boxes in REQUIREMENTS.md §10 in the browser and Claude Code. "Works with Wi-Fi turned off": disconnect, reload, translate; DevTools `list_network_requests` shows only `localhost` URLs. Record any failing box as a new item in PROGRESS.md **Next** with what broke.

- [ ] **Step 4: Update progress and commit**

Run the `update-progress` skill (tick "Fill AGENTS.md Overview and Commands", "Build index.html MVP", "Write cringe.json corpus, then RAG and mcp_server.py"), then:

```bash
git add AGENTS.md PROGRESS.md docs/README.md
git commit -m "docs: fill AGENTS.md overview and commands after acceptance pass"
```

---

## Task Dependency Map

```
1 ──► 2 ──► 3 ──► 5 ──► 8 ──► 9 ──► 10
      4 ──────────┘
1,4 ──► 6 ──► 7 ─────────────────────┘
```

After Task 1 and Task 4, a second person can take Tasks 6–7 (Python) while the first does 2, 3, 5, 8, 9 (`index.html`). Task 10 needs all of them.
