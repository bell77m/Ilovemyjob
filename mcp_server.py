"""Most Cringe Protocol: LinkedIn translator tools for AI agents, over stdio.

Spec: REQUIREMENTS.md section 7. Python twin of frontend/lib.js; keep the two in step.
Never print() here: stdout is the MCP channel.
"""
import json
import math
import urllib.error
import urllib.request
from pathlib import Path

from mcp.server.mcpserver import MCPServer  # mcp 2.x; FastMCP in 1.x

HERE = Path(__file__).resolve().parent  # agents launch us from any cwd
CFG = json.loads((HERE / "prompts.json").read_text(encoding="utf-8"))
CORPUS = json.loads((HERE / "cringe.json").read_text(encoding="utf-8"))
UNEMPLOYED = "Ollama is unemployed. Run `ollama serve`."

mcp = MCPServer("ilovemyjob")


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
