from sqlalchemy.orm import Session
from database import SessionLocal, Lesson, Card, init_db


def clear_database(db: Session):
    """Clear all existing data"""
    db.query(Card).delete()
    db.query(Lesson).delete()
    db.commit()


def seed_chapter_1(db: Session):
    """Seed Chapter 1 curriculum data with 4 lessons"""
    
    # Lesson 1: "The Core Family" (order_index: 1)
    lesson1 = Lesson(order_index=1, title="The Core Family")
    db.add(lesson1)
    db.flush()  # Get the ID
    
    lesson1_cards = [
        Card(
            lesson_id=lesson1.id,
            order_index=1,
            image_url="http://localhost:8000/assets/images/man.png",
            audio_url="http://localhost:8000/assets/audio/man.mp3",
            text_target="Man",
            text_ipa="/mæn/",
            card_type="STORY"
        ),
        Card(
            lesson_id=lesson1.id,
            order_index=2,
            image_url="http://localhost:8000/assets/images/woman.png",
            audio_url="http://localhost:8000/assets/audio/woman.mp3",
            text_target="Woman",
            text_ipa="/ˈwʊmən/",
            card_type="STORY"
        ),
        Card(
            lesson_id=lesson1.id,
            order_index=3,
            image_url="http://localhost:8000/assets/images/boy.png",
            audio_url="http://localhost:8000/assets/audio/boy.mp3",
            text_target="Boy",
            text_ipa="/bɔɪ/",
            card_type="STORY"
        ),
        Card(
            lesson_id=lesson1.id,
            order_index=4,
            image_url="http://localhost:8000/assets/images/girl.png",
            audio_url="http://localhost:8000/assets/audio/girl.mp3",
            text_target="Girl",
            text_ipa="/ɡɜːrl/",
            card_type="STORY"
        ),
        Card(
            lesson_id=lesson1.id,
            order_index=5,
            image_url="http://localhost:8000/assets/images/family.png",
            audio_url="http://localhost:8000/assets/audio/family.mp3",
            text_target="Family",
            text_ipa="/ˈfæməli/",
            card_type="STORY"
        ),
        Card(
            lesson_id=lesson1.id,
            order_index=6,
            image_url="http://localhost:8000/assets/images/father_of_son.png",
            audio_url="http://localhost:8000/assets/audio/father.mp3",
            text_target="Father",
            text_ipa="/ˈfɑːðər/",
            card_type="STORY"
        )
    ]
    
    # Lesson 2: "Who is Who?" (order_index: 2)
    lesson2 = Lesson(order_index=2, title="Who is Who?")
    db.add(lesson2)
    db.flush()
    
    lesson2_cards = [
        Card(
            lesson_id=lesson2.id,
            order_index=1,
            image_url="http://localhost:8000/assets/images/question_man.png",
            audio_url="http://localhost:8000/assets/audio/who_is_man.mp3",
            text_target="Who is the man?",
            text_ipa="/huː ɪz ðə mæn/",
            card_type="SPEECH"
        ),
        Card(
            lesson_id=lesson2.id,
            order_index=2,
            image_url="http://localhost:8000/assets/images/mr_smith.png",
            audio_url="http://localhost:8000/assets/audio/mr_smith.mp3",
            text_target="He is Mr. Smith.",
            text_ipa="/hiː ɪz ˈmɪstər smɪθ/",
            card_type="STORY"
        ),
        Card(
            lesson_id=lesson2.id,
            order_index=3,
            image_url="http://localhost:8000/assets/images/mrs_smith.png",
            audio_url="http://localhost:8000/assets/audio/mrs_smith.mp3",
            text_target="Mrs. Smith is a {blank}.",
            text_ipa="/ˈmɪsɪz smɪθ ɪz ə/",
            card_type="FILL_BLANK"
        ),
        Card(
            lesson_id=lesson2.id,
            order_index=4,
            image_url="http://localhost:8000/assets/images/mother.png",
            audio_url="http://localhost:8000/assets/audio/mother.mp3",
            text_target="She is the mother.",
            text_ipa="/ʃiː ɪz ðə ˈmʌðər/",
            card_type="STORY"
        ),
        Card(
            lesson_id=lesson2.id,
            order_index=5,
            image_url="http://localhost:8000/assets/images/son.png",
            audio_url="http://localhost:8000/assets/audio/son.mp3",
            text_target="Their son is young.",
            text_ipa="/ðɛr sʌn ɪz jʌŋ/",
            card_type="STORY"
        ),
        Card(
            lesson_id=lesson2.id,
            order_index=6,
            image_url="http://localhost:8000/assets/images/daughter.png",
            audio_url="http://localhost:8000/assets/audio/daughter.mp3",
            text_target="Who is the daughter?",
            text_ipa="/huː ɪz ðə ˈdɔːtər/",
            card_type="SPEECH"
        )
    ]
    
    # Lesson 3: "Plurals and Numbers" (order_index: 3)
    lesson3 = Lesson(order_index=3, title="Plurals and Numbers")
    db.add(lesson3)
    db.flush()
    
    lesson3_cards = [
        Card(
            lesson_id=lesson3.id,
            order_index=1,
            image_url="http://localhost:8000/assets/images/one_man.png",
            audio_url="http://localhost:8000/assets/audio/one_man.mp3",
            text_target="One man.",
            text_ipa="/wʌn mæn/",
            card_type="STORY"
        ),
        Card(
            lesson_id=lesson3.id,
            order_index=2,
            image_url="http://localhost:8000/assets/images/two_men.png",
            audio_url="http://localhost:8000/assets/audio/two_men.mp3",
            text_target="Two men.",
            text_ipa="/tuː mɛn/",
            card_type="STORY"
        ),
        Card(
            lesson_id=lesson3.id,
            order_index=3,
            image_url="http://localhost:8000/assets/images/three_women.png",
            audio_url="http://localhost:8000/assets/audio/three_women.mp3",
            text_target="Three women.",
            text_ipa="/θriː ˈwɪmɪn/",
            card_type="STORY"
        ),
        Card(
            lesson_id=lesson3.id,
            order_index=4,
            image_url="http://localhost:8000/assets/images/children.png",
            audio_url="http://localhost:8000/assets/audio/children.mp3",
            text_target="The {blank} are playing.",
            text_ipa="/ðə ˈtʃɪldrən ɑr pleɪɪŋ/",
            card_type="FILL_BLANK"
        ),
        Card(
            lesson_id=lesson3.id,
            order_index=5,
            image_url="http://localhost:8000/assets/images/families.png",
            audio_url="http://localhost:8000/assets/audio/families.mp3",
            text_target="These are families.",
            text_ipa="/ðiːz ɑr ˈfæməliz/",
            card_type="STORY"
        ),
        Card(
            lesson_id=lesson3.id,
            order_index=6,
            image_url="http://localhost:8000/assets/images/how_many.png",
            audio_url="http://localhost:8000/assets/audio/how_many.mp3",
            text_target="How many people?",
            text_ipa="/haʊ ˈmɛni ˈpipəl/",
            card_type="SPEECH"
        )
    ]
    
    # Lesson 4: "Chapter 1 Exercises" (order_index: 4)
    lesson4 = Lesson(order_index=4, title="Chapter 1 Exercises")
    db.add(lesson4)
    db.flush()
    
    lesson4_cards = [
        Card(
            lesson_id=lesson4.id,
            order_index=1,
            image_url="http://localhost:8000/assets/images/exercise_family.png",
            audio_url="http://localhost:8000/assets/audio/describe_family.mp3",
            text_target="Describe this family.",
            text_ipa="/dɪˈskraɪb ðɪs ˈfæməli/",
            card_type="SPEECH"
        ),
        Card(
            lesson_id=lesson4.id,
            order_index=2,
            image_url="http://localhost:8000/assets/images/complete_sentence.png",
            audio_url="http://localhost:8000/assets/audio/complete_sentence.mp3",
            text_target="The man is {blank} than the boy.",
            text_ipa="/ðə mæn ɪz ðæn ðə bɔɪ/",
            card_type="FILL_BLANK"
        ),
        Card(
            lesson_id=lesson4.id,
            order_index=3,
            image_url="http://localhost:8000/assets/images/count_exercise.png",
            audio_url="http://localhost:8000/assets/audio/count_exercise.mp3",
            text_target="Count the family members.",
            text_ipa="/kaʊnt ðə ˈfæməli ˈmɛmbərz/",
            card_type="SPEECH"
        ),
        Card(
            lesson_id=lesson4.id,
            order_index=4,
            image_url="http://localhost:8000/assets/images/identify_exercise.png",
            audio_url="http://localhost:8000/assets/audio/identify_exercise.mp3",
            text_target="She is the {blank} of the family.",
            text_ipa="/ʃiː ɪz ðə ʌv ðə ˈfæməli/",
            card_type="FILL_BLANK"
        ),
        Card(
            lesson_id=lesson4.id,
            order_index=5,
            image_url="http://localhost:8000/assets/images/review_vocab.png",
            audio_url="http://localhost:8000/assets/audio/review_vocab.mp3",
            text_target="Review: What is this?",
            text_ipa="/rɪˈvju wʌt ɪz ðɪs/",
            card_type="SPEECH"
        ),
        Card(
            lesson_id=lesson4.id,
            order_index=6,
            image_url="http://localhost:8000/assets/images/final_exercise.png",
            audio_url="http://localhost:8000/assets/audio/final_exercise.mp3",
            text_target="Tell me about your family.",
            text_ipa="/tɛl mi əˈbaʊt jʊr ˈfæməli/",
            card_type="SPEECH"
        )
    ]
    
    # Add all cards to database
    all_cards = lesson1_cards + lesson2_cards + lesson3_cards + lesson4_cards
    for card in all_cards:
        db.add(card)
    
    db.commit()
    
    print(f"✅ Successfully seeded Chapter 1:")
    print(f"   - {len([lesson1, lesson2, lesson3, lesson4])} lessons")
    print(f"   - {len(all_cards)} cards total")
    print(f"   - Lesson 1: {len(lesson1_cards)} cards")
    print(f"   - Lesson 2: {len(lesson2_cards)} cards")
    print(f"   - Lesson 3: {len(lesson3_cards)} cards")
    print(f"   - Lesson 4: {len(lesson4_cards)} cards")


def main():
    """Main seeding function"""
    print("🌱 Initializing database...")
    init_db()
    
    db = SessionLocal()
    
    try:
        print("Clearing existing data...")
        clear_database(db)
        
        print("Seeding Chapter 1 curriculum...")
        seed_chapter_1(db)
        
        print("Database seeding completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()