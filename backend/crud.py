from sqlalchemy.orm import Session
from database import Lesson, Card, UserCardStat
from sm2 import calculate_sm2, get_quality
from datetime import datetime


def get_lessons(db: Session):
    """Fetch all lessons, ordered by order_index"""
    return db.query(Lesson).order_by(Lesson.order_index).all()


def get_lesson_by_id(db: Session, lesson_id: int):
    """Fetch a single lesson with its associated cards, ordered by the cards' order_index"""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    
    if lesson:
        # Ensure cards are ordered by order_index
        lesson.cards = sorted(lesson.cards, key=lambda card: card.order_index)
    
    return lesson

def update_user_card_stat(db: Session, session_id: str, card_id: int, correct: bool):
    stat = db.query(UserCardStat).filter(
        UserCardStat.session_id == session_id,
        UserCardStat.card_id == card_id
    ).first()
    
    q = get_quality(correct)
    
    if not stat:
        stat = UserCardStat(
            session_id=session_id,
            card_id=card_id,
            ease_factor=2.5,
            interval=0,
            repetitions=0,
            next_review_at=datetime.utcnow(),
            correct_count=0,
            wrong_count=0
        )
        db.add(stat)
        
    rep, interval, ef, next_review = calculate_sm2(q, stat.repetitions, stat.interval, stat.ease_factor)
    
    stat.repetitions = rep
    stat.interval = interval
    stat.ease_factor = ef
    stat.next_review_at = next_review
    stat.last_answered_at = datetime.utcnow()
    
    if correct:
        stat.correct_count += 1
    else:
        stat.wrong_count += 1
        
    db.commit()
    db.refresh(stat)
    return stat

def get_adaptive_lesson_by_id(db: Session, lesson_id: int, session_id: str):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        return None
        
    now = datetime.utcnow()
    
    stats = db.query(UserCardStat).filter(
        UserCardStat.session_id == session_id,
        UserCardStat.card_id.in_([c.id for c in lesson.cards])
    ).all()
    
    stat_map = {s.card_id: s for s in stats}
    
    due_cards = []
    new_cards = []
    future_cards = []
    
    for card in lesson.cards:
        if card.id in stat_map:
            stat = stat_map[card.id]
            if stat.next_review_at <= now:
                due_cards.append((card, stat.next_review_at))
            else:
                future_cards.append((card, stat.next_review_at))
        else:
            new_cards.append(card)
            
    due_cards.sort(key=lambda x: x[1])
    due_cards = [c for c, _ in due_cards]
    
    future_cards.sort(key=lambda x: x[1])
    future_cards = [c for c, _ in future_cards]
    
    lesson.cards = due_cards + new_cards + future_cards
    
    return lesson