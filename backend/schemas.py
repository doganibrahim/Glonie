from pydantic import BaseModel


# --- Card Schemas ---

class CardBase(BaseModel):
    order_index: int
    image_url: str
    audio_url: str
    text_target: str
    text_ipa: str
    card_type: str


class CardCreate(CardBase):
    lesson_id: int


class CardResponse(CardBase):
    id: int
    lesson_id: int

    model_config = {"from_attributes": True}


# --- Lesson Schemas ---

class LessonBase(BaseModel):
    order_index: int
    title: str


class LessonCreate(LessonBase):
    pass


class LessonResponse(LessonBase):
    id: int
    cards: list[CardResponse] = []

    model_config = {"from_attributes": True}