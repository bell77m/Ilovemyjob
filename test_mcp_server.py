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
