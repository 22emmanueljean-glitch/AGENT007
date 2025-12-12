"""
Humanization: avoid robotic cadence and spam patterns.
This stub outputs suggested windows; the Publisher uses it.
"""

import random
from dataclasses import dataclass

@dataclass
class HumanizedWindow:
    earliest_minute_offset: int
    latest_minute_offset: int

def suggest_post_window() -> HumanizedWindow:
    # Randomize a posting window between 7 minutes and 180 minutes from "now".
    start = random.randint(7, 60)
    end = start + random.randint(15, 120)
    return HumanizedWindow(start, min(end, 180))
