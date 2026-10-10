"""Most Cringe Protocol: LinkedIn translator tools for AI agents, over stdio.

Spec: REQUIREMENTS.md section 7. Python twin of frontend/lib.js; keep the two in step.
Never print() here: stdout is the MCP channel.
"""
import json
import math
import re
import urllib.error
import urllib.request
from pathlib import Path

from mcp.server.mcpserver import MCPServer  # mcp 2.x; FastMCP in 1.x
from mcp.server.mcpserver.exceptions import ToolError

HERE = Path(__file__).resolve().parent  # agents launch us from any cwd
CFG = json.loads((HERE / "prompts.json").read_text(encoding="utf-8"))
CORPUS = json.loads((HERE / "cringe.json").read_text(encoding="utf-8"))
UNEMPLOYED = "Ollama is unemployed. Run `ollama serve`."

mcp = MCPServer("ilovemyjob")


# mcp 2.x shows the agent only ToolError text ("Error executing tool X" for anything else).
class OllamaError(ToolError, RuntimeError): pass
class EmptyText(ToolError, ValueError): pass


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
    # Small models echo the few-shot format ("Human: ...", "LinkedIn:") or chat ("Here is the post:"); drop that first.
    t = re.sub(r"^here(?: is|'s)[^\n]*:\s*", "", text.strip(), flags=re.I)
    t = re.sub(r"^human:[^\n]*\n+", "", t, flags=re.I)
    t = re.sub(r"^linkedin(?: post)?:\s*", "", t, flags=re.I)
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
        raise EmptyText("text is empty")
    return text


def ollama(path, body):
    req = urllib.request.Request(CFG["ollama"] + path, json.dumps(body).encode(),
                                 {"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:  # Ollama is up but unhappy, e.g. model not pulled
        raise OllamaError("Ollama said: " + e.read().decode(errors="replace")) from e
    except (urllib.error.URLError, OSError) as e:
        raise OllamaError(UNEMPLOYED) from e


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


@mcp.tool()
def synergy_score(text: str) -> dict:
    """Count LinkedIn buzzwords in text. Returns {"score": 0-100, "buzzwords": [...]}. No LLM."""
    return synergy(clean(text, 3000), CFG["buzzwords"])


if __name__ == "__main__":
    mcp.run()  # stdio
