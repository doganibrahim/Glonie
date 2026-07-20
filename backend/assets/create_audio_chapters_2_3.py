"""
Chapter 2 & 3 icin TTS ses dosyalari olusturma scripti.
Her adimda ilerleme bildirimi verir.

Kullanim:
    cd backend/assets
    python create_audio_chapters_2_3.py
"""

import pyttsx3
import os
import time
import sys


def generate_one(text, filepath):
    """Her dosya icin motoru yeniden baslat (Windows pyttsx3 bug workaround)"""
    engine = pyttsx3.init()
    engine.setProperty("rate", 140)
    engine.setProperty("volume", 0.9)
    voices = engine.getProperty("voices")
    if voices:
        for voice in voices:
            if "zira" in voice.name.lower():
                engine.setProperty("voice", voice.id)
                break
    engine.save_to_file(text, filepath)
    engine.runAndWait()
    engine.stop()
    del engine


def main():
    print("=" * 60)
    print("  GLONIE - Chapter 2 & 3 Ses Dosyasi Olusturucu")
    print("=" * 60)
    print()

    # ADIM 1: Dizin kontrolu
    print("[ADIM 1/5] Audio klasoru kontrol ediliyor...")
    os.makedirs("audio", exist_ok=True)
    print("  -> audio/ klasoru hazir.\n")

    # ADIM 2: TTS motoru test ediliyor
    print("[ADIM 2/5] TTS motoru test ediliyor...")
    try:
        test_engine = pyttsx3.init()
        voices = test_engine.getProperty("voices")
        chosen = voices[0].name if voices else "default"
        for v in voices:
            if "zira" in v.name.lower():
                chosen = v.name
                break
        test_engine.stop()
        del test_engine
        print(f"  -> Ses: {chosen}")
        print("  -> Motor hazir.\n")
    except Exception as e:
        print(f"  !! HATA: TTS motoru baslatilamadi: {e}")
        print("  !! pip install pyttsx3")
        sys.exit(1)

    # ADIM 3: Ses listesi hazirlaniyor
    print("[ADIM 3/5] Ses dosyasi listesi hazirlaniyor...")

    chapter_2_audio = [
        ("There are twelve months in a year.", "twelve_months.mp3"),
        ("January is the first month of the year.", "january.mp3"),
        ("February is the second month.", "february.mp3"),
        ("March is the third month.", "march.mp3"),
        ("December is the twelfth and last month.", "december.mp3"),
        ("A month has four weeks.", "four_weeks.mp3"),
        ("A week has seven days.", "seven_days.mp3"),
        ("Monday is the first day of the week.", "monday.mp3"),
        ("Tuesday is the second day.", "tuesday.mp3"),
        ("Wednesday is the third day.", "wednesday.mp3"),
        ("Sunday is the seventh and last day.", "sunday.mp3"),
        ("How many days are there in a week?", "how_many_days.mp3"),
        ("How many months are there in a year?", "how_many_months.mp3"),
        ("Two weeks have fourteen days.", "fourteen_days.mp3"),
        ("Which month is the first month?", "which_month.mp3"),
    ]

    chapter_3_audio = [
        ("Mister Smith has a wife.", "has_wife.mp3"),
        ("Her name is Missus Smith.", "her_name.mp3"),
        ("Missus Smith has a husband.", "has_husband.mp3"),
        ("His name is Mister Smith.", "his_name.mp3"),
        ("Mister Smith has a son. His name is John.", "has_son.mp3"),
        ("Mister Smith has a daughter. Her name is Helen.", "has_daughter.mp3"),
        ("Mister and Missus Smith have three children.", "have_children.mp3"),
        ("Their children are John, Helen, and Alice.", "their_children.mp3"),
        ("John is their son.", "their_son.mp3"),
        ("Helen and Alice are their daughters.", "their_daughters.mp3"),
        ("John has two sisters.", "two_sisters.mp3"),
        ("Helen has one brother and one sister.", "brother_sister.mp3"),
        ("John is a name.", "john_is_name.mp3"),
        ("Man is a word.", "man_is_word.mp3"),
        ("There are three letters in the word man.", "three_letters_man.mp3"),
        ("There are four letters in the word girl.", "four_letters_girl.mp3"),
        ("There are six letters in the word family.", "six_letters_family.mp3"),
        ("No, John has not a brother.", "no_brother.mp3"),
    ]

    all_audio = chapter_2_audio + chapter_3_audio
    total = len(all_audio)
    print(f"  -> Chapter 2: {len(chapter_2_audio)} dosya")
    print(f"  -> Chapter 3: {len(chapter_3_audio)} dosya")
    print(f"  -> TOPLAM: {total} dosya olusturulacak.\n")

    # ADIM 4: Ses dosyalari olusturuluyor
    print("[ADIM 4/5] Ses dosyalari olusturuluyor...")
    print("-" * 60)
    sys.stdout.flush()

    success = 0
    failed = []

    for i, (text, filename) in enumerate(all_audio, 1):
        progress = f"[{i:02d}/{total}]"
        audio_path = f"audio/{filename}"
        try:
            generate_one(text, audio_path)
            size = os.path.getsize(audio_path) if os.path.exists(audio_path) else 0
            print(f"  {progress} OK  {filename:<25s} ({size:>7,} bytes)")
            success += 1
        except Exception as e:
            print(f"  {progress} FAIL {filename:<25s} HATA: {e}")
            failed.append(filename)
        sys.stdout.flush()

    print("-" * 60)
    print()

    # ADIM 5: Ozet raporu
    print("[ADIM 5/5] Ozet raporu:")
    print(f"  -> Basarili: {success}/{total}")
    if failed:
        print(f"  -> Basarisiz: {len(failed)}/{total}")
        for f in failed:
            print(f"     - {f}")
    print(f"  -> Konum: backend/assets/audio/")
    print()
    print("=" * 60)
    if success == total:
        print("  TAMAMLANDI! Tum ses dosyalari basariyla olusturuldu.")
    else:
        print(f"  UYARI: {len(failed)} dosya olusturulamadi.")
    print("=" * 60)


if __name__ == "__main__":
    main()
