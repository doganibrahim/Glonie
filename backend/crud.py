from sqlalchemy.orm import Session
from database import Lesson, Card


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