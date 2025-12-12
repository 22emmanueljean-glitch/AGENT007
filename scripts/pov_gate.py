from dataclasses import dataclass

@dataclass
class PoVSignals:
    non_bot_pr_or_issues: int
    unsolicited_thank_yous: int
    unique_clones_per_day: int
    sustained_days: int

def passes_pov(s: PoVSignals) -> bool:
    return (
        s.non_bot_pr_or_issues >= 10
        and s.unsolicited_thank_yous >= 3
        and s.unique_clones_per_day >= 50
        and s.sustained_days >= 14
    )
