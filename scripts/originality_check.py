"""
Originality checks should be conservative.
Stub: define interfaces; implement with your own heuristics later.
"""

def originality_score(text: str) -> float:
    # Placeholder: return 1.0 for now.
    # Later: add n-gram overlap vs your own past posts + web snippets you store locally.
    return 1.0
    # TODO replace with real overlap scan vs local corpus + web cache

def passes_originality(text: str, threshold: float = 0.92) -> bool:
    return originality_score(text) >= threshold
