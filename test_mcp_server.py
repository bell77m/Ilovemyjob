"""Plain-assert checks for mcp_server.py. Run: python test_mcp_server.py"""
import asyncio
import http.client
import io
import urllib.error

import mcp_server as m

W = ["synergy", "journey", "thought leader", "🚀"]
FIRED = {"human": "I got fired.", "linkedin": "Thrilled."}
REAL_OLLAMA = m.ollama


def fake_ollama(path, body):
    """Corpus vectors [1,0],[1,1],[1,2]...; query [1,0]. Records the last generate body."""
    if path == "/api/embed":
        return {"embeddings": [[1.0, float(i)] for i in range(len(body["input"]))]}
    fake_ollama.last = body
    return {"response": "  Grateful for this journey. #Growth  "}


def use_fake():
    m.ollama = fake_ollama
    m._vecs.clear()


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


def test_enforce_agree_drops_echoed_linkedin_label():
    assert m.enforce_agree("LinkedIn: Grateful. Agree?") == "Grateful. Agree?"


def test_enforce_agree_drops_echoed_human_line_and_label():
    assert m.enforce_agree("Human: I forgot my umbrella.\nLinkedIn: Soaked. Agree?") == "Soaked. Agree?"


def test_enforce_agree_keeps_agree_followed_by_emoji_or_hashtags():
    assert m.enforce_agree("Grateful. Agree? 🤪 #blessed") == "Grateful. Agree? 🤪 #blessed"


def test_enforce_agree_appends_when_agree_only_in_earlier_line():
    assert m.enforce_agree("Agree? Maybe.\nGrateful.") == "Agree? Maybe.\nGrateful.\n\nAgree?"


def test_enforce_agree_keeps_heres_what_i_learned_opener():
    assert m.enforce_agree("Here's what I learned from getting fired: nothing. Agree?") == \
        "Here's what I learned from getting fired: nothing. Agree?"


def test_enforce_agree_drops_here_is_preamble():
    assert m.enforce_agree("Here is the rewritten LinkedIn post:\n\nGrateful. Agree?") == "Grateful. Agree?"


def test_build_prompt_matches_lib_js():
    assert m.build_prompt("I overslept.", 7, [FIRED]) == \
        "Human: I got fired.\nLinkedIn: Thrilled.\n\nCringe level: 7/10\nHuman text: I overslept."
    assert m.build_prompt("Thrilled to announce...", 7, [FIRED], reverse=True) == \
        "LinkedIn: Thrilled.\nHuman: I got fired.\n\nLinkedIn post: Thrilled to announce..."


def test_top_k_best_first_and_zero_safe():
    assert m.top_k([1, 0], [[0, 1], [1, 0], [1, 1]], 2) == [1, 2]
    assert m.cosine([0, 0], [1, 1]) == 0


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


def test_http_error_shows_only_the_error_field():
    def not_found(*a, **k):
        raise urllib.error.HTTPError("u", 404, "Not Found", {}, io.BytesIO(b'{"error":"model not found"}'))
    assert _with_urlopen(lambda: m.decrypt_recruiter("Thrilled."), not_found) == "Ollama said: model not found"


def test_timeout_says_ollama_is_slow_not_down():
    def too_slow(*a, **k):
        raise TimeoutError("timed out")
    assert _with_urlopen(lambda: m.decrypt_recruiter("Thrilled."), too_slow) == m.SLOW


def test_cut_off_reply_is_a_tool_error():
    def hang_up(*a, **k):
        raise http.client.IncompleteRead(b"")
    assert _with_urlopen(lambda: m.decrypt_recruiter("Thrilled."), hang_up) == m.GARBLED


def test_non_json_reply_is_a_tool_error():
    assert _with_urlopen(lambda: m.decrypt_recruiter("Thrilled."), lambda *a, **k: io.BytesIO(b"<html>")) == m.GARBLED


def test_decrypt_recruiter_blank_answer_says_no_comment():
    m.ollama = lambda path, body: {"embeddings": [[1.0, 0.0]] * len(body["input"])} if path == "/api/embed" else {"response": "  \n "}
    m._vecs.clear()
    assert m.decrypt_recruiter("Thrilled to announce...") == "No comment."


def test_agent_sees_error_text():
    for tool, args, msg in [("synergy_score", {"text": " "}, "text is empty"),
                            ("linkedinify", {"text": "x"}, m.UNEMPLOYED)]:
        def refuse(*a, **k):
            raise urllib.error.URLError("connection refused")
        orig, m.urllib.request.urlopen, m.ollama = m.urllib.request.urlopen, refuse, REAL_OLLAMA
        try:
            asyncio.run(m.mcp.call_tool(tool, args))
            assert False, "expected tool error"
        except Exception as e:
            assert msg in str(e), str(e)
        finally:
            m.urllib.request.urlopen = orig


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
            print("ok  ", name)
    print("ALL PASS")
