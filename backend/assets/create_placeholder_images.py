from PIL import Image, ImageDraw, ImageFont
import os

def create_placeholder_image(text, filename, size=(400, 300), bg_color=(200, 230, 200), text_color=(60, 60, 60)):
    """Create a placeholder image with text"""
    # Create image
    img = Image.new('RGB', size, bg_color)
    draw = ImageDraw.Draw(img)
    
    # Try to use a font, fallback to default if not available
    try:
        font = ImageFont.truetype("arial.ttf", 40)
    except:
        font = ImageFont.load_default()
    
    # Calculate text position (centered)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (size[0] - text_width) // 2
    y = (size[1] - text_height) // 2
    
    # Draw text
    draw.text((x, y), text, fill=text_color, font=font)
    
    # Save image
    img.save(f'images/{filename}')
    print(f"Created: images/{filename}")

# Create images directory if it doesn't exist
os.makedirs('images', exist_ok=True)
os.makedirs('audio', exist_ok=True)

# Create placeholder images for all cards
placeholder_images = [
    ("MAN", "man.png"),
    ("WOMAN", "woman.png"),
    ("BOY", "boy.png"),
    ("GIRL", "girl.png"),
    ("FAMILY", "family.png"),
    ("FATHER", "father.png"),
    ("WHO IS THE\nMAN?", "question_man.png"),
    ("MR. SMITH", "mr_smith.png"),
    ("MRS. SMITH", "mrs_smith.png"),
    ("MOTHER", "mother.png"),
    ("SON", "son.png"),
    ("DAUGHTER", "daughter.png"),
    ("ONE MAN", "one_man.png"),
    ("TWO MEN", "two_men.png"),
    ("THREE\nWOMEN", "three_women.png"),
    ("CHILDREN", "children.png"),
    ("FAMILIES", "families.png"),
    ("HOW MANY\nPEOPLE?", "how_many.png"),
    ("DESCRIBE\nFAMILY", "exercise_family.png"),
    ("COMPLETE\nSENTENCE", "complete_sentence.png"),
    ("COUNT\nEXERCISE", "count_exercise.png"),
    ("IDENTIFY\nEXERCISE", "identify_exercise.png"),
    ("REVIEW\nVOCAB", "review_vocab.png"),
    ("FINAL\nEXERCISE", "final_exercise.png"),
]

print("Creating placeholder images...")
for text, filename in placeholder_images:
    create_placeholder_image(text, filename)

# Create placeholder audio files (empty MP3s)
print("\nCreating placeholder audio files...")
audio_files = [
    "man.mp3", "woman.mp3", "boy.mp3", "girl.mp3", "family.mp3", "father.mp3",
    "who_is_man.mp3", "mr_smith.mp3", "mrs_smith.mp3", "mother.mp3", "son.mp3", "daughter.mp3",
    "one_man.mp3", "two_men.mp3", "three_women.mp3", "children.mp3", "families.mp3", "how_many.mp3",
    "describe_family.mp3", "complete_sentence.mp3", "count_exercise.mp3", 
    "identify_exercise.mp3", "review_vocab.mp3", "final_exercise.mp3"
]

for audio_file in audio_files:
    # Create empty file
    with open(f'audio/{audio_file}', 'wb') as f:
        f.write(b'')  # Empty file for now
    print(f"Created: audio/{audio_file}")

print("\n✅ All placeholder files created!")
print("📁 Images: backend/assets/images/")
print("🔊 Audio: backend/assets/audio/")