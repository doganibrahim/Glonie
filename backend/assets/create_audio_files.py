import pyttsx3
import os
import time

def create_audio_file(text, filename):
    """Create audio file from text using text-to-speech"""
    try:
        # Initialize TTS engine
        engine = pyttsx3.init()
        
        # Set properties (slower speech, female voice if available)
        engine.setProperty('rate', 150)  # Speed of speech
        engine.setProperty('volume', 0.9)  # Volume level (0.0 to 1.0)
        
        # Try to set a better voice
        voices = engine.getProperty('voices')
        if voices:
            # Prefer female voice if available
            for voice in voices:
                if 'female' in voice.name.lower() or 'woman' in voice.name.lower():
                    engine.setProperty('voice', voice.id)
                    break
        
        # Save to file
        audio_path = f'audio/{filename}'
        engine.save_to_file(text, audio_path)
        engine.runAndWait()
        
        print(f"✅ Created: {audio_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error creating {filename}: {e}")
        return False

# Create audio directory if it doesn't exist
os.makedirs('audio', exist_ok=True)

# Audio content for each card
audio_content = [
    ("Man", "man.mp3"),
    ("Woman", "woman.mp3"), 
    ("Boy", "boy.mp3"),
    ("Girl", "girl.mp3"),
    ("Family", "family.mp3"),
    ("Father", "father.mp3"),
    ("Who is the man?", "who_is_man.mp3"),
    ("He is Mister Smith", "mr_smith.mp3"),
    ("Mrs Smith is a", "mrs_smith.mp3"),
    ("She is the mother", "mother.mp3"),
    ("Their son is young", "son.mp3"),
    ("Who is the daughter?", "daughter.mp3"),
    ("One man", "one_man.mp3"),
    ("Two men", "two_men.mp3"),
    ("Three women", "three_women.mp3"),
    ("The children are playing", "children.mp3"),
    ("These are families", "families.mp3"),
    ("How many people?", "how_many.mp3"),
    ("Describe this family", "describe_family.mp3"),
    ("The man is taller than the boy", "complete_sentence.mp3"),
    ("Count the family members", "count_exercise.mp3"),
    ("She is the mother of the family", "identify_exercise.mp3"),
    ("Review: What is this?", "review_vocab.mp3"),
    ("Tell me about your family", "final_exercise.mp3"),
]

print("🔊 Creating audio files using Text-to-Speech...")
print("=" * 50)

success_count = 0
total_count = len(audio_content)

for text, filename in audio_content:
    if create_audio_file(text, filename):
        success_count += 1
    time.sleep(0.5)  # Small delay between files

print("=" * 50)
print(f"🎉 Audio generation complete!")
print(f"✅ Successfully created: {success_count}/{total_count} files")
print(f"📁 Location: backend/assets/audio/")

if success_count < total_count:
    print(f"⚠️  {total_count - success_count} files failed to generate")
    print("💡 Install pyttsx3 if not available: pip install pyttsx3")