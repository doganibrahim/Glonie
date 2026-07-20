from sqlalchemy.orm import Session
from database import SessionLocal, Lesson, Card, init_db

BASE_IMG = "http://localhost:8000/assets/images"
BASE_AUD = "http://localhost:8000/assets/audio"


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
    db.flush()

    lesson1_cards = [
        Card(
            lesson_id=lesson1.id, order_index=1,
            image_url=f"{BASE_IMG}/man.png",
            audio_url=f"{BASE_AUD}/man.mp3",
            text_target="Man", text_ipa="/mæn/", card_type="STORY"),
        Card(
            lesson_id=lesson1.id, order_index=2,
            image_url=f"{BASE_IMG}/woman.png",
            audio_url=f"{BASE_AUD}/woman.mp3",
            text_target="Woman", text_ipa="/ˈwʊmən/", card_type="STORY"),
        Card(
            lesson_id=lesson1.id, order_index=3,
            image_url=f"{BASE_IMG}/boy.png",
            audio_url=f"{BASE_AUD}/boy.mp3",
            text_target="Boy", text_ipa="/bɔɪ/", card_type="STORY"),
        Card(
            lesson_id=lesson1.id, order_index=4,
            image_url=f"{BASE_IMG}/girl.png",
            audio_url=f"{BASE_AUD}/girl.mp3",
            text_target="Girl", text_ipa="/ɡɜːrl/", card_type="STORY"),
        Card(
            lesson_id=lesson1.id, order_index=5,
            image_url=f"{BASE_IMG}/family.png",
            audio_url=f"{BASE_AUD}/family.mp3",
            text_target="Family", text_ipa="/ˈfæməli/", card_type="STORY"),
        Card(
            lesson_id=lesson1.id, order_index=6,
            image_url=f"{BASE_IMG}/father_of_son.png",
            audio_url=f"{BASE_AUD}/father.mp3",
            text_target="Father", text_ipa="/ˈfɑːðər/", card_type="STORY"),
    ]

    # Lesson 2: "Who is Who?" (order_index: 2)
    lesson2 = Lesson(order_index=2, title="Who is Who?")
    db.add(lesson2)
    db.flush()

    lesson2_cards = [
        Card(lesson_id=lesson2.id, order_index=1,
             image_url=f"{BASE_IMG}/question_man.png",
             audio_url=f"{BASE_AUD}/who_is_man.mp3",
             text_target="Who is the man?",
             text_ipa="/huː ɪz ðə mæn/", card_type="STORY"),
        Card(lesson_id=lesson2.id, order_index=2,
             image_url=f"{BASE_IMG}/mr_smith.png",
             audio_url=f"{BASE_AUD}/mr_smith.mp3",
             text_target="He is Mr. Smith.",
             text_ipa="/hiː ɪz ˈmɪstər smɪθ/", card_type="STORY"),
        Card(lesson_id=lesson2.id, order_index=3,
             image_url=f"{BASE_IMG}/mrs_smith.png",
             audio_url=f"{BASE_AUD}/mrs_smith.mp3",
             text_target="She is Mrs. Smith.",
             text_ipa="/ʃiː ɪz ˈmɪsɪz smɪθ/", card_type="STORY"),
        Card(lesson_id=lesson2.id, order_index=4,
             image_url=f"{BASE_IMG}/mrs_smith.png",
             audio_url=f"{BASE_AUD}/mrs_smith.mp3",
             text_target="Mrs. Smith is a {blank}.",
             text_ipa="/ˈmɪsɪz smɪθ ɪz ə/",
             card_type="FILL_BLANK", correct_answer="woman"),
        Card(lesson_id=lesson2.id, order_index=5,
             image_url=f"{BASE_IMG}/mother.png",
             audio_url=f"{BASE_AUD}/mother.mp3",
             text_target="She is the mother.",
             text_ipa="/ʃiː ɪz ðə ˈmʌðər/", card_type="STORY"),
        Card(lesson_id=lesson2.id, order_index=6,
             image_url=f"{BASE_IMG}/son.png",
             audio_url=f"{BASE_AUD}/son.mp3",
             text_target="Their son is young.",
             text_ipa="/ðɛr sʌn ɪz jʌŋ/", card_type="STORY"),
        Card(lesson_id=lesson2.id, order_index=7,
             image_url=f"{BASE_IMG}/daughter.png",
             audio_url=f"{BASE_AUD}/daughter.mp3",
             text_target="She is the daughter.",
             text_ipa="/ʃiː ɪz ðə ˈdɔːtər/", card_type="STORY"),
        Card(lesson_id=lesson2.id, order_index=8,
             image_url=f"{BASE_IMG}/question_man.png",
             audio_url=f"{BASE_AUD}/who_is_man.mp3",
             text_target="Who is the man?",
             text_ipa="/huː ɪz ðə mæn/", card_type="SPEECH"),
        Card(lesson_id=lesson2.id, order_index=9,
             image_url=f"{BASE_IMG}/daughter.png",
             audio_url=f"{BASE_AUD}/daughter.mp3",
             text_target="Who is the daughter?",
             text_ipa="/huː ɪz ðə ˈdɔːtər/", card_type="SPEECH"),
    ]

    # Lesson 3: "Plurals and Numbers" (order_index: 3)
    lesson3 = Lesson(order_index=3, title="Plurals and Numbers")
    db.add(lesson3)
    db.flush()

    lesson3_cards = [
        Card(lesson_id=lesson3.id, order_index=1,
             image_url=f"{BASE_IMG}/one_man.png",
             audio_url=f"{BASE_AUD}/one_man.mp3",
             text_target="One man.", text_ipa="/wʌn mæn/", card_type="STORY"),
        Card(lesson_id=lesson3.id, order_index=2,
             image_url=f"{BASE_IMG}/two_men.png",
             audio_url=f"{BASE_AUD}/two_men.mp3",
             text_target="Two men.", text_ipa="/tuː mɛn/", card_type="STORY"),
        Card(lesson_id=lesson3.id, order_index=3,
             image_url=f"{BASE_IMG}/three_women.png",
             audio_url=f"{BASE_AUD}/three_women.mp3",
             text_target="Three women.", text_ipa="/θriː ˈwɪmɪn/", card_type="STORY"),
        Card(lesson_id=lesson3.id, order_index=4,
             image_url=f"{BASE_IMG}/children.png",
             audio_url=f"{BASE_AUD}/children.mp3",
             text_target="The children are playing.",
             text_ipa="/ðə ˈtʃɪldrən ɑr pleɪɪŋ/", card_type="STORY"),
        Card(lesson_id=lesson3.id, order_index=5,
             image_url=f"{BASE_IMG}/children.png",
             audio_url=f"{BASE_AUD}/children.mp3",
             text_target="The {blank} are playing.",
             text_ipa="/ðə ˈtʃɪldrən ɑr pleɪɪŋ/",
             card_type="FILL_BLANK", correct_answer="children"),
        Card(lesson_id=lesson3.id, order_index=6,
             image_url=f"{BASE_IMG}/families.png",
             audio_url=f"{BASE_AUD}/families.mp3",
             text_target="These are families.",
             text_ipa="/ðiːz ɑr ˈfæməliz/", card_type="STORY"),
        Card(lesson_id=lesson3.id, order_index=7,
             image_url=f"{BASE_IMG}/how_many.png",
             audio_url=f"{BASE_AUD}/how_many.mp3",
             text_target="How many people?",
             text_ipa="/haʊ ˈmɛni ˈpipəl/", card_type="STORY"),
        Card(lesson_id=lesson3.id, order_index=8,
             image_url=f"{BASE_IMG}/how_many.png",
             audio_url=f"{BASE_AUD}/how_many.mp3",
             text_target="How many people?",
             text_ipa="/haʊ ˈmɛni ˈpipəl/", card_type="SPEECH"),
    ]

    # Lesson 4: "Chapter 1 Exercises" (order_index: 4)
    lesson4 = Lesson(order_index=4, title="Chapter 1 Exercises")
    db.add(lesson4)
    db.flush()

    lesson4_cards = [
        Card(lesson_id=lesson4.id, order_index=1,
             image_url=f"{BASE_IMG}/exercise_family.png",
             audio_url=f"{BASE_AUD}/describe_family.mp3",
             text_target="This is a family.",
             text_ipa="/ðɪs ɪz ə ˈfæməli/", card_type="STORY"),
        Card(lesson_id=lesson4.id, order_index=2,
             image_url=f"{BASE_IMG}/exercise_family.png",
             audio_url=f"{BASE_AUD}/describe_family.mp3",
             text_target="Describe this family.",
             text_ipa="/dɪˈskraɪb ðɪs ˈfæməli/", card_type="SPEECH"),
        Card(lesson_id=lesson4.id, order_index=3,
             image_url=f"{BASE_IMG}/complete_sentence.png",
             audio_url=f"{BASE_AUD}/complete_sentence.mp3",
             text_target="The man is older than the boy.",
             text_ipa="/ðə mæn ɪz ˈoʊldər ðæn ðə bɔɪ/", card_type="STORY"),
        Card(lesson_id=lesson4.id, order_index=4,
             image_url=f"{BASE_IMG}/complete_sentence.png",
             audio_url=f"{BASE_AUD}/complete_sentence.mp3",
             text_target="The man is {blank} than the boy.",
             text_ipa="/ðə mæn ɪz ðæn ðə bɔɪ/",
             card_type="FILL_BLANK", correct_answer="older"),
        Card(lesson_id=lesson4.id, order_index=5,
             image_url=f"{BASE_IMG}/count_exercise.png",
             audio_url=f"{BASE_AUD}/count_exercise.mp3",
             text_target="Count the family members.",
             text_ipa="/kaʊnt ðə ˈfæməli ˈmɛmbərz/", card_type="SPEECH"),
        Card(lesson_id=lesson4.id, order_index=6,
             image_url=f"{BASE_IMG}/identify_exercise.png",
             audio_url=f"{BASE_AUD}/identify_exercise.mp3",
             text_target="She is the {blank} of the family.",
             text_ipa="/ʃiː ɪz ðə ʌv ðə ˈfæməli/",
             card_type="FILL_BLANK", correct_answer="mother"),
        Card(lesson_id=lesson4.id, order_index=7,
             image_url=f"{BASE_IMG}/review_vocab.png",
             audio_url=f"{BASE_AUD}/review_vocab.mp3",
             text_target="Review: What is this?",
             text_ipa="/rɪˈvju wʌt ɪz ðɪs/", card_type="SPEECH"),
        Card(lesson_id=lesson4.id, order_index=8,
             image_url=f"{BASE_IMG}/final_exercise.png",
             audio_url=f"{BASE_AUD}/final_exercise.mp3",
             text_target="Tell me about your family.",
             text_ipa="/tɛl mi əˈbaʊt jʊr ˈfæməli/", card_type="SPEECH"),
    ]

    all_cards = lesson1_cards + lesson2_cards + lesson3_cards + lesson4_cards
    for card in all_cards:
        db.add(card)

    db.commit()
    print(f"✅ Successfully seeded Chapter 1: 4 lessons, {len(all_cards)} cards")


def seed_chapter_2(db: Session):
    """Seed Chapter 2: The Year - temporal vocabulary, ordinals, existential structures"""

    # Lesson 5: Months and Weeks
    lesson5 = Lesson(order_index=5, title="Months and Weeks")
    db.add(lesson5)
    db.flush()

    lesson5_cards = [
        Card(lesson_id=lesson5.id, order_index=1,
             image_url=f"{BASE_IMG}/twelve_months.png",
             audio_url=f"{BASE_AUD}/twelve_months.mp3",
             text_target="There are twelve months in a year.",
             text_ipa="/ðɛr ɑr twɛlv mʌnθs ɪn ə jɪr/", card_type="STORY"),
        Card(lesson_id=lesson5.id, order_index=2,
             image_url=f"{BASE_IMG}/january.png",
             audio_url=f"{BASE_AUD}/january.mp3",
             text_target="January is the first month of the year.",
             text_ipa="/ˈdʒænjuˌɛri ɪz ðə fɜrst mʌnθ ʌv ðə jɪr/", card_type="STORY"),
        Card(lesson_id=lesson5.id, order_index=3,
             image_url=f"{BASE_IMG}/february.png",
             audio_url=f"{BASE_AUD}/february.mp3",
             text_target="February is the second month.",
             text_ipa="/ˈfɛbruˌɛri ɪz ðə ˈsɛkənd mʌnθ/", card_type="STORY"),
        Card(lesson_id=lesson5.id, order_index=4,
             image_url=f"{BASE_IMG}/march.png",
             audio_url=f"{BASE_AUD}/march.mp3",
             text_target="March is the third month.",
             text_ipa="/mɑrtʃ ɪz ðə θɜrd mʌnθ/", card_type="STORY"),
        Card(lesson_id=lesson5.id, order_index=5,
             image_url=f"{BASE_IMG}/december.png",
             audio_url=f"{BASE_AUD}/december.mp3",
             text_target="December is the twelfth and last month.",
             text_ipa="/dɪˈsɛmbər ɪz ðə twɛlfθ ænd læst mʌnθ/", card_type="STORY"),
        Card(lesson_id=lesson5.id, order_index=6,
             image_url=f"{BASE_IMG}/four_weeks.png",
             audio_url=f"{BASE_AUD}/four_weeks.mp3",
             text_target="A month has four weeks.",
             text_ipa="/ə mʌnθ hæz fɔr wiks/", card_type="STORY"),
        Card(lesson_id=lesson5.id, order_index=7,
             image_url=f"{BASE_IMG}/seven_days.png",
             audio_url=f"{BASE_AUD}/seven_days.mp3",
             text_target="A week has seven days.",
             text_ipa="/ə wik hæz ˈsɛvən deɪz/", card_type="STORY"),
        Card(lesson_id=lesson5.id, order_index=8,
             image_url=f"{BASE_IMG}/twelve_months.png",
             audio_url=f"{BASE_AUD}/twelve_months.mp3",
             text_target="There are {blank} months in a year.",
             text_ipa="/ðɛr ɑr mʌnθs ɪn ə jɪr/",
             card_type="FILL_BLANK", correct_answer="twelve"),
    ]

    # Lesson 6: Days and Ordinals
    lesson6 = Lesson(order_index=6, title="Days and Ordinals")
    db.add(lesson6)
    db.flush()

    lesson6_cards = [
        Card(lesson_id=lesson6.id, order_index=1,
             image_url=f"{BASE_IMG}/monday.png",
             audio_url=f"{BASE_AUD}/monday.mp3",
             text_target="Monday is the first day of the week.",
             text_ipa="/ˈmʌndeɪ ɪz ðə fɜrst deɪ ʌv ðə wik/", card_type="STORY"),
        Card(lesson_id=lesson6.id, order_index=2,
             image_url=f"{BASE_IMG}/tuesday.png",
             audio_url=f"{BASE_AUD}/tuesday.mp3",
             text_target="Tuesday is the second day.",
             text_ipa="/ˈtuzdeɪ ɪz ðə ˈsɛkənd deɪ/", card_type="STORY"),
        Card(lesson_id=lesson6.id, order_index=3,
             image_url=f"{BASE_IMG}/wednesday.png",
             audio_url=f"{BASE_AUD}/wednesday.mp3",
             text_target="Wednesday is the third day.",
             text_ipa="/ˈwɛnzdeɪ ɪz ðə θɜrd deɪ/", card_type="STORY"),
        Card(lesson_id=lesson6.id, order_index=4,
             image_url=f"{BASE_IMG}/sunday.png",
             audio_url=f"{BASE_AUD}/sunday.mp3",
             text_target="Sunday is the seventh and last day.",
             text_ipa="/ˈsʌndeɪ ɪz ðə ˈsɛvənθ ænd læst deɪ/", card_type="STORY"),
        Card(lesson_id=lesson6.id, order_index=5,
             image_url=f"{BASE_IMG}/how_many_days.png",
             audio_url=f"{BASE_AUD}/how_many_days.mp3",
             text_target="How many days are there in a week?",
             text_ipa="/haʊ ˈmɛni deɪz ɑr ðɛr ɪn ə wik/", card_type="STORY"),
        Card(lesson_id=lesson6.id, order_index=6,
             image_url=f"{BASE_IMG}/seven_days.png",
             audio_url=f"{BASE_AUD}/seven_days.mp3",
             text_target="There are seven days in a week.",
             text_ipa="/ðɛr ɑr ˈsɛvən deɪz ɪn ə wik/", card_type="STORY"),
        Card(lesson_id=lesson6.id, order_index=7,
             image_url=f"{BASE_IMG}/monday.png",
             audio_url=f"{BASE_AUD}/monday.mp3",
             text_target="{blank} is the first day of the week.",
             text_ipa="/ɪz ðə fɜrst deɪ ʌv ðə wik/",
             card_type="FILL_BLANK", correct_answer="Monday"),
        Card(lesson_id=lesson6.id, order_index=8,
             image_url=f"{BASE_IMG}/how_many_days.png",
             audio_url=f"{BASE_AUD}/how_many_days.mp3",
             text_target="How many days are there in a week?",
             text_ipa="/haʊ ˈmɛni deɪz ɑr ðɛr ɪn ə wik/", card_type="SPEECH"),
    ]

    # Lesson 7: Chapter 2 Exercises
    lesson7 = Lesson(order_index=7, title="Chapter 2 Exercises")
    db.add(lesson7)
    db.flush()

    lesson7_cards = [
        Card(lesson_id=lesson7.id, order_index=1,
             image_url=f"{BASE_IMG}/calendar.png",
             audio_url=f"{BASE_AUD}/how_many_months.mp3",
             text_target="How many months are there in a year?",
             text_ipa="/haʊ ˈmɛni mʌnθs ɑr ðɛr ɪn ə jɪr/", card_type="STORY"),
        Card(lesson_id=lesson7.id, order_index=2,
             image_url=f"{BASE_IMG}/calendar.png",
             audio_url=f"{BASE_AUD}/how_many_months.mp3",
             text_target="How many months are there in a year?",
             text_ipa="/haʊ ˈmɛni mʌnθs ɑr ðɛr ɪn ə jɪr/", card_type="SPEECH"),
        Card(lesson_id=lesson7.id, order_index=3,
             image_url=f"{BASE_IMG}/january.png",
             audio_url=f"{BASE_AUD}/january.mp3",
             text_target="{blank} is the first month of the year.",
             text_ipa="/ɪz ðə fɜrst mʌnθ ʌv ðə jɪr/",
             card_type="FILL_BLANK", correct_answer="January"),
        Card(lesson_id=lesson7.id, order_index=4,
             image_url=f"{BASE_IMG}/december.png",
             audio_url=f"{BASE_AUD}/december.mp3",
             text_target="December is the {blank} month of the year.",
             text_ipa="/dɪˈsɛmbər ɪz ðə mʌnθ ʌv ðə jɪr/",
             card_type="FILL_BLANK", correct_answer="last"),
        Card(lesson_id=lesson7.id, order_index=5,
             image_url=f"{BASE_IMG}/sunday.png",
             audio_url=f"{BASE_AUD}/sunday.mp3",
             text_target="{blank} is the last day of the week.",
             text_ipa="/ɪz ðə læst deɪ ʌv ðə wik/",
             card_type="FILL_BLANK", correct_answer="Sunday"),
        Card(lesson_id=lesson7.id, order_index=6,
             image_url=f"{BASE_IMG}/fourteen_days.png",
             audio_url=f"{BASE_AUD}/fourteen_days.mp3",
             text_target="Two weeks have fourteen days.",
             text_ipa="/tu wiks hæv ˌfɔrˈtin deɪz/", card_type="STORY"),
        Card(lesson_id=lesson7.id, order_index=7,
             image_url=f"{BASE_IMG}/fourteen_days.png",
             audio_url=f"{BASE_AUD}/fourteen_days.mp3",
             text_target="Two weeks have {blank} days.",
             text_ipa="/tu wiks hæv deɪz/",
             card_type="FILL_BLANK", correct_answer="fourteen"),
        Card(lesson_id=lesson7.id, order_index=8,
             image_url=f"{BASE_IMG}/calendar.png",
             audio_url=f"{BASE_AUD}/which_month.mp3",
             text_target="Which month is the first month?",
             text_ipa="/wɪtʃ mʌnθ ɪz ðə fɜrst mʌnθ/", card_type="SPEECH"),
    ]

    all_cards = lesson5_cards + lesson6_cards + lesson7_cards
    for card in all_cards:
        db.add(card)
    db.commit()
    print(f"✅ Successfully seeded Chapter 2: 3 lessons, {len(all_cards)} cards")


def seed_chapter_3(db: Session):
    """Seed Chapter 3: Names - possession, possessive adjectives, words & letters"""

    # Lesson 8: Names and Possession
    lesson8 = Lesson(order_index=8, title="Names and Possession")
    db.add(lesson8)
    db.flush()

    lesson8_cards = [
        Card(lesson_id=lesson8.id, order_index=1,
             image_url=f"{BASE_IMG}/mr_smith.png",
             audio_url=f"{BASE_AUD}/has_wife.mp3",
             text_target="Mr. Smith has a wife.",
             text_ipa="/ˈmɪstər smɪθ hæz ə waɪf/", card_type="STORY"),
        Card(lesson_id=lesson8.id, order_index=2,
             image_url=f"{BASE_IMG}/mrs_smith.png",
             audio_url=f"{BASE_AUD}/her_name.mp3",
             text_target="Her name is Mrs. Smith.",
             text_ipa="/hɜr neɪm ɪz ˈmɪsɪz smɪθ/", card_type="STORY"),
        Card(lesson_id=lesson8.id, order_index=3,
             image_url=f"{BASE_IMG}/mrs_smith.png",
             audio_url=f"{BASE_AUD}/has_husband.mp3",
             text_target="Mrs. Smith has a husband.",
             text_ipa="/ˈmɪsɪz smɪθ hæz ə ˈhʌzbənd/", card_type="STORY"),
        Card(lesson_id=lesson8.id, order_index=4,
             image_url=f"{BASE_IMG}/mr_smith.png",
             audio_url=f"{BASE_AUD}/his_name.mp3",
             text_target="His name is Mr. Smith.",
             text_ipa="/hɪz neɪm ɪz ˈmɪstər smɪθ/", card_type="STORY"),
        Card(lesson_id=lesson8.id, order_index=5,
             image_url=f"{BASE_IMG}/son.png",
             audio_url=f"{BASE_AUD}/has_son.mp3",
             text_target="Mr. Smith has a son. His name is John.",
             text_ipa="/ˈmɪstər smɪθ hæz ə sʌn hɪz neɪm ɪz dʒɑn/", card_type="STORY"),
        Card(lesson_id=lesson8.id, order_index=6,
             image_url=f"{BASE_IMG}/daughter.png",
             audio_url=f"{BASE_AUD}/has_daughter.mp3",
             text_target="Mr. Smith has a daughter. Her name is Helen.",
             text_ipa="/ˈmɪstər smɪθ hæz ə ˈdɔːtər hɜr neɪm ɪz ˈhɛlən/", card_type="STORY"),
        Card(lesson_id=lesson8.id, order_index=7,
             image_url=f"{BASE_IMG}/mrs_smith.png",
             audio_url=f"{BASE_AUD}/her_name.mp3",
             text_target="{blank} name is Mrs. Smith.",
             text_ipa="/neɪm ɪz ˈmɪsɪz smɪθ/",
             card_type="FILL_BLANK", correct_answer="Her"),
        Card(lesson_id=lesson8.id, order_index=8,
             image_url=f"{BASE_IMG}/mr_smith.png",
             audio_url=f"{BASE_AUD}/his_name.mp3",
             text_target="{blank} name is Mr. Smith.",
             text_ipa="/neɪm ɪz ˈmɪstər smɪθ/",
             card_type="FILL_BLANK", correct_answer="His"),
    ]

    # Lesson 9: Family Relations
    lesson9 = Lesson(order_index=9, title="Family Relations")
    db.add(lesson9)
    db.flush()

    lesson9_cards = [
        Card(lesson_id=lesson9.id, order_index=1,
             image_url=f"{BASE_IMG}/family.png",
             audio_url=f"{BASE_AUD}/have_children.mp3",
             text_target="Mr. and Mrs. Smith have three children.",
             text_ipa="/ˈmɪstər ænd ˈmɪsɪz smɪθ hæv θri ˈtʃɪldrən/", card_type="STORY"),
        Card(lesson_id=lesson9.id, order_index=2,
             image_url=f"{BASE_IMG}/children.png",
             audio_url=f"{BASE_AUD}/their_children.mp3",
             text_target="Their children are John, Helen, and Alice.",
             text_ipa="/ðɛr ˈtʃɪldrən ɑr dʒɑn ˈhɛlən ænd ˈælɪs/", card_type="STORY"),
        Card(lesson_id=lesson9.id, order_index=3,
             image_url=f"{BASE_IMG}/son.png",
             audio_url=f"{BASE_AUD}/their_son.mp3",
             text_target="John is their son.",
             text_ipa="/dʒɑn ɪz ðɛr sʌn/", card_type="STORY"),
        Card(lesson_id=lesson9.id, order_index=4,
             image_url=f"{BASE_IMG}/girl.png",
             audio_url=f"{BASE_AUD}/their_daughters.mp3",
             text_target="Helen and Alice are their daughters.",
             text_ipa="/ˈhɛlən ænd ˈælɪs ɑr ðɛr ˈdɔːtərz/", card_type="STORY"),
        Card(lesson_id=lesson9.id, order_index=5,
             image_url=f"{BASE_IMG}/boy.png",
             audio_url=f"{BASE_AUD}/two_sisters.mp3",
             text_target="John has two sisters.",
             text_ipa="/dʒɑn hæz tu ˈsɪstərz/", card_type="STORY"),
        Card(lesson_id=lesson9.id, order_index=6,
             image_url=f"{BASE_IMG}/girl.png",
             audio_url=f"{BASE_AUD}/brother_sister.mp3",
             text_target="Helen has one brother and one sister.",
             text_ipa="/ˈhɛlən hæz wʌn ˈbrʌðər ænd wʌn ˈsɪstər/", card_type="STORY"),
        Card(lesson_id=lesson9.id, order_index=7,
             image_url=f"{BASE_IMG}/boy.png",
             audio_url=f"{BASE_AUD}/two_sisters.mp3",
             text_target="John has two {blank}.",
             text_ipa="/dʒɑn hæz tu/",
             card_type="FILL_BLANK", correct_answer="sisters"),
        Card(lesson_id=lesson9.id, order_index=8,
             image_url=f"{BASE_IMG}/family.png",
             audio_url=f"{BASE_AUD}/have_children.mp3",
             text_target="Mr. and Mrs. Smith have three children.",
             text_ipa="/ˈmɪstər ænd ˈmɪsɪz smɪθ hæv θri ˈtʃɪldrən/", card_type="SPEECH"),
    ]

    # Lesson 10: Words and Letters
    lesson10 = Lesson(order_index=10, title="Words and Letters")
    db.add(lesson10)
    db.flush()

    lesson10_cards = [
        Card(lesson_id=lesson10.id, order_index=1,
             image_url=f"{BASE_IMG}/name_john.png",
             audio_url=f"{BASE_AUD}/john_is_name.mp3",
             text_target="\"John\" is a name.",
             text_ipa="/dʒɑn ɪz ə neɪm/", card_type="STORY"),
        Card(lesson_id=lesson10.id, order_index=2,
             image_url=f"{BASE_IMG}/word_man.png",
             audio_url=f"{BASE_AUD}/man_is_word.mp3",
             text_target="\"Man\" is a word.",
             text_ipa="/mæn ɪz ə wɜrd/", card_type="STORY"),
        Card(lesson_id=lesson10.id, order_index=3,
             image_url=f"{BASE_IMG}/letters_man.png",
             audio_url=f"{BASE_AUD}/three_letters_man.mp3",
             text_target="There are three letters in the word \"man\".",
             text_ipa="/ðɛr ɑr θri ˈlɛtərz ɪn ðə wɜrd mæn/", card_type="STORY"),
        Card(lesson_id=lesson10.id, order_index=4,
             image_url=f"{BASE_IMG}/letters_girl.png",
             audio_url=f"{BASE_AUD}/four_letters_girl.mp3",
             text_target="There are four letters in the word \"girl\".",
             text_ipa="/ðɛr ɑr fɔr ˈlɛtərz ɪn ðə wɜrd ɡɜrl/", card_type="STORY"),
        Card(lesson_id=lesson10.id, order_index=5,
             image_url=f"{BASE_IMG}/letters_family.png",
             audio_url=f"{BASE_AUD}/six_letters_family.mp3",
             text_target="There are six letters in the word \"family\".",
             text_ipa="/ðɛr ɑr sɪks ˈlɛtərz ɪn ðə wɜrd ˈfæməli/", card_type="STORY"),
        Card(lesson_id=lesson10.id, order_index=6,
             image_url=f"{BASE_IMG}/letters_man.png",
             audio_url=f"{BASE_AUD}/three_letters_man.mp3",
             text_target="There are {blank} letters in the word \"man\".",
             text_ipa="/ðɛr ɑr ˈlɛtərz ɪn ðə wɜrd mæn/",
             card_type="FILL_BLANK", correct_answer="three"),
        Card(lesson_id=lesson10.id, order_index=7,
             image_url=f"{BASE_IMG}/letters_family.png",
             audio_url=f"{BASE_AUD}/six_letters_family.mp3",
             text_target="There are {blank} letters in the word \"family\".",
             text_ipa="/ðɛr ɑr ˈlɛtərz ɪn ðə wɜrd ˈfæməli/",
             card_type="FILL_BLANK", correct_answer="six"),
        Card(lesson_id=lesson10.id, order_index=8,
             image_url=f"{BASE_IMG}/word_man.png",
             audio_url=f"{BASE_AUD}/man_is_word.mp3",
             text_target="\"Man\" is a word.",
             text_ipa="/mæn ɪz ə wɜrd/", card_type="SPEECH"),
    ]

    # Lesson 11: Chapter 3 Exercises
    lesson11 = Lesson(order_index=11, title="Chapter 3 Exercises")
    db.add(lesson11)
    db.flush()

    lesson11_cards = [
        Card(lesson_id=lesson11.id, order_index=1,
             image_url=f"{BASE_IMG}/mr_smith.png",
             audio_url=f"{BASE_AUD}/has_wife.mp3",
             text_target="Has Mr. Smith a wife?",
             text_ipa="/hæz ˈmɪstər smɪθ ə waɪf/", card_type="STORY"),
        Card(lesson_id=lesson11.id, order_index=2,
             image_url=f"{BASE_IMG}/mr_smith.png",
             audio_url=f"{BASE_AUD}/has_wife.mp3",
             text_target="Yes, Mr. Smith has a wife.",
             text_ipa="/jɛs ˈmɪstər smɪθ hæz ə waɪf/", card_type="STORY"),
        Card(lesson_id=lesson11.id, order_index=3,
             image_url=f"{BASE_IMG}/mrs_smith.png",
             audio_url=f"{BASE_AUD}/her_name.mp3",
             text_target="What is the name of his wife?",
             text_ipa="/wʌt ɪz ðə neɪm ʌv hɪz waɪf/", card_type="STORY"),
        Card(lesson_id=lesson11.id, order_index=4,
             image_url=f"{BASE_IMG}/boy.png",
             audio_url=f"{BASE_AUD}/no_brother.mp3",
             text_target="Has John a brother?",
             text_ipa="/hæz dʒɑn ə ˈbrʌðər/", card_type="STORY"),
        Card(lesson_id=lesson11.id, order_index=5,
             image_url=f"{BASE_IMG}/boy.png",
             audio_url=f"{BASE_AUD}/no_brother.mp3",
             text_target="No, John has not a brother.",
             text_ipa="/noʊ dʒɑn hæz nɑt ə ˈbrʌðər/", card_type="STORY"),
        Card(lesson_id=lesson11.id, order_index=6,
             image_url=f"{BASE_IMG}/daughter.png",
             audio_url=f"{BASE_AUD}/has_daughter.mp3",
             text_target="Mr. Smith has a {blank}. Her name is Helen.",
             text_ipa="/ˈmɪstər smɪθ hæz ə hɜr neɪm ɪz ˈhɛlən/",
             card_type="FILL_BLANK", correct_answer="daughter"),
        Card(lesson_id=lesson11.id, order_index=7,
             image_url=f"{BASE_IMG}/children.png",
             audio_url=f"{BASE_AUD}/their_children.mp3",
             text_target="{blank} children are John, Helen, and Alice.",
             text_ipa="/ˈtʃɪldrən ɑr dʒɑn ˈhɛlən ænd ˈælɪs/",
             card_type="FILL_BLANK", correct_answer="Their"),
        Card(lesson_id=lesson11.id, order_index=8,
             image_url=f"{BASE_IMG}/family.png",
             audio_url=f"{BASE_AUD}/have_children.mp3",
             text_target="What are the names of their children?",
             text_ipa="/wʌt ɑr ðə neɪmz ʌv ðɛr ˈtʃɪldrən/", card_type="SPEECH"),
    ]

    all_cards = lesson8_cards + lesson9_cards + lesson10_cards + lesson11_cards
    for card in all_cards:
        db.add(card)
    db.commit()
    print(f"✅ Successfully seeded Chapter 3: 4 lessons, {len(all_cards)} cards")


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

        print("Seeding Chapter 2 curriculum...")
        seed_chapter_2(db)

        print("Seeding Chapter 3 curriculum...")
        seed_chapter_3(db)

        print("\n🎉 Database seeding completed successfully!")

    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
