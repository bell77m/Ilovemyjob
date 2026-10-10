# Ilovemyjob — LinkedIn Translator

> "I got fired" → "Thrilled to announce I'm embarking on an exciting new chapter of my journey. 🚀 Agree?"

Stupid Hackathon entry. User types a normal human sentence. A local LLM rewrites it as a LinkedIn post: humblebrag, fake lessons, emoji, hashtags, "Agree?". Runs fully offline, because your boss must never know.

## 1. Goal

- Turn any plain sentence into peak LinkedIn speak.
- Run on a laptop with a local LLM. No API key, no cloud, no cost.
- Look like a 1996 homepage (see `DESIGN.md`, Netscape 96). A modern social network rendered in the ugliest era of the web is the joke.
- Demo works in under 5 minutes of setup on hackathon Wi-Fi (meaning: no Wi-Fi).

## 2. Users

| User | Wants |
|------|-------|
| Hackathon judge | Laugh within 10 seconds. |
| Office worker | Post about eating a sandwich as if it were a Series A. |
| Recruiter | Already speaks this. Uses Reverse mode to learn human. |

## 3. Features

### Must have (MVP, build first)

- **F1 Translate.** Text box ("What actually happened?") + button `Make It Professional™`. Output box shows LinkedIn post.
- **F2 Streaming output.** Tokens appear one by one, like a 28.8k modem. Button disabled while generating.
- **F3 Copy button.** `Copy to Clipboard` so user can post it for real and lose friends.
- **F4 Loading messages.** Rotate while waiting: "Humbled to be generating...", "Leveraging synergies...", "Circling back...", "Disrupting your request...".
- **F5 Error box.** If Ollama is not running, show a Win95 error dialog: "This program has performed an illegal operation: your LLM is unemployed. Run `ollama serve`." Never fail silently.

### Should have (if time)

- **F6 Cringe level slider** 1–10. Sent to the prompt. 1 = "mildly corporate". 10 = "my toddler's first steps taught me about B2B sales".
- **F7 Reverse mode** (`Decrypt Recruiter`). LinkedIn post → what it really means. Same model, different system prompt.
- **F8 Synergy Meter.** Count buzzwords in output (synergy, leverage, journey, humbled, grateful, disrupt, passionate, thought leader, 🚀). Show as Win95 progress bar. Pure JS, word list in an array.
- **F9 Fake engagement.** Under the post: random "1,337 reactions · 420 comments · 69 reposts". Visitor counter style per `DESIGN.md`.

### Could have (only if everything else works)

- **F10 Buzzword Bingo** 5×5 card that auto-marks squares as the post streams in.
- **F11 Modem sound** on submit (one `.wav`, `<audio>` tag).
- **F12 "Agree?" enforcer.** If model forgot to end with "Agree?", append it. Always.

### Won't have

Accounts, database, posting to real LinkedIn, mobile app, fine-tuning, history, analytics. Skipped on purpose.

## 4. Example translations (use as test cases and few-shot examples)

| Human | LinkedIn |
|-------|----------|
| I got fired. | Thrilled to announce I'm open to new opportunities after an incredible journey. Grateful for every lesson. 🚀 #OpenToWork #Growth |
| I ate a sandwich. | Today I paused for lunch and realized: a sandwich is just layers working in synergy. Just like great teams. 🥪 Agree? |
| I overslept. | I chose rest over hustle culture this morning. Burnout is not a KPI. ☀️ #Wellness #Leadership |
| My code doesn't work. | Failure is just success in beta. 7 lessons today's production outage taught me about resilience. 🧵👇 |

## 5. Tech stack (deliberately stupid)

Rule: maximum dumb, still demo-proof. Every stupid choice must still work on stage.

| Layer | Choice | Why it is stupid | Why it still works |
|-------|--------|------------------|--------------------|
| Frontend | **One `index.html`**, inline CSS + vanilla JS | No React, no build, no `node_modules`. Like 1996. | Opens anywhere. Nothing to break. |
| Layout | `<table>` layout, `<marquee>`, `<blink>`-style CSS | Banned since 2004. | Browsers still render it. Matches `DESIGN.md`. |
| Styling | `DESIGN.md` Netscape 96 tokens, copied from `preview.html` | A 2026 AI app styled like Windows 95. | Starter CSS already exists. |
| LLM runtime | **Ollama** on `localhost:11434` | Your laptop fan is the backend. | One install, one command, offline. |
| Model | `llama3.2:3b` (default). `qwen2.5:0.5b` for potato laptops. | A billion parameters to write "Agree?". | Small, fast on CPU, good enough at cringe. |
| Backend | **None.** Browser calls Ollama HTTP API directly with `fetch`. | Zero-tier architecture. | Fewer moving parts, nothing to deploy. |
| Server | `python -m http.server 8000` | Python used only to serve one file. | Already installed on most laptops. |
| Database | **None.** Cringe level saved in `localStorage`. | Your browser is the DB. | Only per-user setting needed. |
| Deploy | Run from laptop at the table. Optional: `index.html` on a USB stick labeled "FLOPPY". | No cloud. | Cannot go down because of venue Wi-Fi. |
| Tests | One `tests.html` with `console.assert` for Synergy Meter + "Agree?" enforcer | No test framework. | Follows `.agents/rules/testing.md` spirit: smallest check that fails if logic breaks. |

### LLM call

`POST http://localhost:11434/api/generate`

```json
{
  "model": "llama3.2:3b",
  "system": "<system prompt below>",
  "prompt": "Cringe level: 7/10\nHuman text: I ate a sandwich.",
  "stream": true,
  "options": { "temperature": 0.9 }
}
```

Response is newline-delimited JSON. Read with `response.body.getReader()`, append each `.response` chunk to output, stop on `"done": true`.

### System prompt (v1)

```
You are a LinkedIn thought leader. Rewrite the user's text as a LinkedIn post.
Rules:
- Turn every bad event into a growth opportunity or lesson.
- Humblebrag. Be "humbled", "thrilled", "grateful".
- Use buzzwords: synergy, leverage, journey, disrupt, passionate.
- Short one-sentence paragraphs.
- Add 2-5 emoji and 2-4 hashtags.
- End with "Agree?"
- Scale absurdity to the cringe level (1 = mild, 10 = unhinged).
- Output only the post. No preamble.
```

Reverse mode prompt: "Translate this LinkedIn post into the blunt, honest sentence the author actually means. One or two sentences. No emoji."

## 6. Setup (target: under 5 minutes)

```powershell
# 1. Install Ollama from https://ollama.com, then:
ollama pull llama3.2:3b
# 2. Allow the page to call Ollama (CORS), then start it:
$env:OLLAMA_ORIGINS = "http://localhost:8000"
ollama serve
# 3. In the project folder:
python -m http.server 8000
# 4. Open http://localhost:8000
```

Opening `index.html` via `file://` fails CORS unless `OLLAMA_ORIGINS=*`. Use the Python server.

## 7. Non-functional requirements

- **Offline.** Zero external requests at runtime. No CDN, fonts are system fonts per `DESIGN.md`.
- **Speed.** First token under 3 s on a normal laptop with `llama3.2:3b`. Full post under 20 s.
- **Input limit.** Max 500 characters, enforced by `maxlength`. Stops someone pasting a novel during demo.
- **Safety.** Output is inserted with `textContent`, never `innerHTML`. Model output is untrusted.
- **Accessibility.** Labels on inputs, buttons reachable by keyboard, output in an `aria-live="polite"` region. Ugly is fine; unusable is not.
- **Screen.** Looks right at 800×600 (the joke) and does not break on a phone (the judges).

## 8. Acceptance criteria (demo checklist)

- [ ] Type "I got fired", click button, LinkedIn post streams in with emoji, hashtags, ending "Agree?".
- [ ] Kill Ollama, click button: Win95 error dialog appears, page does not freeze.
- [ ] Copy button puts the post on clipboard.
- [ ] Works with Wi-Fi turned off.
- [ ] Page looks like `preview.html` theme.
- [ ] (Should) Slider at 1 vs 10 gives visibly different cringe.
- [ ] (Should) Reverse mode turns a real LinkedIn post into one honest sentence.

## 9. Build order

1. `index.html` skeleton with theme CSS from `preview.html`.
2. F1 + F2 + F5: fetch to Ollama with streaming and error dialog. **Demo-able from here.**
3. F3, F4.
4. F6, F7, F8, F9.
5. Could-haves, only if bored.

## 10. Demo script (60 seconds)

1. "LinkedIn is a language. We built Google Translate for it. Runs offline so HR can't see."
2. Ask a judge for their worst week. Type it in.
3. Cringe slider to 10. Stream it. Read it out loud in a keynote voice.
4. Reverse mode on a real LinkedIn post from a judge's feed.
5. End with: "Agree?"
