import math
from datetime import datetime, timedelta

def calculate_sm2(q: int, repetitions: int, interval: int, ease_factor: float):
    """
    Calculate the next interval and ease factor based on the SuperMemo-2 algorithm.
    q (quality): 0-5 scale.
      - 5: perfect response
      - 4: correct response after a hesitation
      - 3: correct response recalled with serious difficulty
      - 2: incorrect response; where the correct one seemed easy to recall
      - 1: incorrect response; the correct one remembered
      - 0: complete blackout
    """
    if q >= 3:
        if repetitions == 0:
            interval = 1
        elif repetitions == 1:
            interval = 6
        else:
            interval = math.ceil(interval * ease_factor)
        repetitions += 1
    else:
        repetitions = 0
        interval = 1
    
    ease_factor = ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    if ease_factor < 1.3:
        ease_factor = 1.3
        
    next_review_at = datetime.utcnow() + timedelta(days=interval)
    
    return repetitions, interval, ease_factor, next_review_at

def get_quality(correct: bool):
    """Simple mapping for binary correct/incorrect"""
    return 4 if correct else 1
