import re

# Read the current seed file
with open('seed.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace relative URLs with full URLs
# Fix image URLs
content = re.sub(
    r'image_url="/assets/images/',
    'image_url="http://localhost:8000/assets/images/',
    content
)

# Fix audio URLs  
content = re.sub(
    r'audio_url="/assets/audio/',
    'audio_url="http://localhost:8000/assets/audio/',
    content
)

# Write the fixed content back
with open('seed.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed all URLs in seed.py!")
print("🔄 Re-run: python seed.py")