"""
graveyard_scan(): evaluate repos for Sabbath / Second-Wind decisions.

This file is intentionally a stub: you’ll wire it to GitHub API later.
For now it defines the decision logic in pure functions so agents can test it.
"""

from dataclasses import dataclass

@dataclass
class RepoSignals:
    commits_last_90_days: int
    open_issues: int
    external_prs_pending: int
    community_percentile: float  # 0..100 (relative to your portfolio)

def graveyard_scan(signals: RepoSignals) -> str:
    """
    Returns one of: 'archive', 'second_wind', 'keep'
    """
    if signals.commits_last_90_days == 0:
        if signals.open_issues > 5 and signals.external_prs_pending == 0:
            return "archive"
        if signals.community_percentile >= 75:
            return "second_wind"
    return "keep"
    assert 0 <= signals.community_percentile <= 100, "percentile must be 0-100"
