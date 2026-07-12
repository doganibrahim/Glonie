from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

# sqlite database connection
DATABASE_URL = "sqlite:///./glonie.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# lessons
class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    order_index = Column(Integer, unique=True, nullable=False)
    title = Column(String, nullable=False)

    cards = relationship("Card", back_populates="lesson", cascade="all, delete-orphan")

# card
class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    order_index = Column(Integer, nullable=False)
    image_url = Column(String, nullable=False)
    audio_url = Column(String, nullable=False)
    text_target = Column(String, nullable=False)
    text_ipa = Column(String, nullable=False)
    card_type = Column(String, nullable=False)
    correct_answer = Column(String, nullable=True)  # Used for FILL_BLANK cards

    lesson = relationship("Lesson", back_populates="cards")

# init
def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()