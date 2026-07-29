from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import tempfile, os, threading
from dotenv import load_dotenv

# Yükle .env dosyasını (üst dizindeki)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from database import init_db, get_db
from schemas import LessonResponse
from pydantic import BaseModel
import crud
from google import genai
import google.auth

# Vertex AI client - Application Default Credentials kullanır
# Kurmak için: gcloud auth application-default login
try:
    _credentials, _project = google.auth.default(
        scopes=["https://www.googleapis.com/auth/cloud-platform"]
    )
except Exception:
    _credentials = None
    _project = None

ai_client = genai.Client(
    vertexai=True,
    project=os.environ.get("GOOGLE_CLOUD_PROJECT", "doc-to-meow-501010"),
    location=os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1"),
    credentials=_credentials,
)

class AnswerRequest(BaseModel):
    correct: bool
    session_id: str

# ---------- Whisper (lazy-loaded on first transcribe call) ----------
_whisper_model = None
_whisper_lock = threading.Lock()

def get_whisper():
    global _whisper_model
    if _whisper_model is None:
        with _whisper_lock:
            if _whisper_model is None:
                from faster_whisper import WhisperModel
                # 'tiny' is ~75 MB, fast enough on CPU for single words/short phrases
                _whisper_model = WhisperModel("tiny", device="cpu", compute_type="int8")
    return _whisper_model

app = FastAPI(title="Glonie API", description="EdTech SaaS for language acquisition", version="1.0.0")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React/Vite dev server
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Static files serving for images and audio
app.mount("/assets", StaticFiles(directory="assets"), name="assets")

init_db()

@app.on_event("startup")
async def startup_event():
    """Pre-load the Whisper model and sync embeddings in a background thread on server start."""
    import asyncio
    from embeddings import sync_card_embeddings
    
    def background_startup():
        get_whisper()
        db = next(get_db())
        sync_card_embeddings(db, ai_client)
        
    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, background_startup)



@app.get("/")
def read_root():
    return {"msg": "hello, glonie!"}


@app.post("/api/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    lang: str = Form("en"),
):
    """Transcribe uploaded audio using faster-whisper (Whisper tiny model)."""
    # Save upload to a temp file so faster-whisper can read it
    suffix = os.path.splitext(audio.filename or "recording.webm")[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name

    try:
        model = get_whisper()
        segments, _ = model.transcribe(tmp_path, language=lang, beam_size=1)
        transcript = " ".join(seg.text.strip() for seg in segments).strip()
        return {"transcript": transcript}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.unlink(tmp_path)


@app.get("/api/lessons", response_model=list[LessonResponse])
def get_lessons(db: Session = Depends(get_db)):
    """Returns a list of all lessons"""
    lessons = crud.get_lessons(db)
    return lessons


@app.get("/api/lessons/{lesson_id}", response_model=LessonResponse)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    """Returns a specific lesson containing its array of cards"""
    lesson = crud.get_lesson_by_id(db, lesson_id)
    
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    return lesson


@app.get("/api/lessons/{lesson_id}/adaptive", response_model=LessonResponse)
def get_adaptive_lesson(lesson_id: int, session_id: str, db: Session = Depends(get_db)):
    """Returns a specific lesson with cards ordered adaptively for the user"""
    lesson = crud.get_adaptive_lesson_by_id(db, lesson_id, session_id)
    
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    return lesson


@app.post("/api/cards/{card_id}/answer")
def submit_card_answer(card_id: int, answer: AnswerRequest, db: Session = Depends(get_db)):
    """Update SM-2 stats for a specific card"""
    stat = crud.update_user_card_stat(db, answer.session_id, card_id, answer.correct)
    return {"status": "ok", "next_review_at": stat.next_review_at}

class HintRequest(BaseModel):
    attempt: int

@app.post("/api/cards/{card_id}/hint")
def get_card_hint(card_id: int, request: HintRequest, db: Session = Depends(get_db)):
    card = crud.get_card_by_id(db, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
        
    prompt = f"""
    Sen, 'Doğal Yaklaşım' (Gramer kuralları olmadan, çeviri yapmadan, sezgisel öğrenme) yöntemini benimsemiş dostane bir dil öğretmenisin. 
    Kullanıcı İngilizce bir kelimeyi bulmakta zorlanıyor ({request.attempt}. denemesi).
    
    Hedef Kelime: {card.correct_answer or card.text_target}
    Bağlam/Cümle: {card.text_target}
    
    Görevlerin:
    1. Hedef kelimeyi (Cevabı) ASLA doğrudan söyleme.
    2. Cevaba giden Türkçe, anımsatıcı (sokratik) bir ipucu ver. 
    3. Eğer {request.attempt} > 2 ise ipucu biraz daha belirgin olabilir ama yine de kelimeyi doğrudan verme.
    4. Sadece ipucunu içeren kısa ve samimi bir yanıt ver.
    """
    
    try:
        response = ai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return {"hint": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
def socratic_chat(request: ChatRequest, db: Session = Depends(get_db)):
    from embeddings import search_similar_cards
    
    similar_cards = search_similar_cards(db, ai_client, request.message, top_k=5)
    
    # {blank} içeren alıştırma cümlelerini temizle, sadece tam cümleleri al
    clean_sentences = []
    for c in similar_cards:
        sentence = c.text_target
        if '{blank}' not in sentence:
            clean_sentences.append(sentence)
        elif c.correct_answer:
            # {blank} yerine doğru cevabı koy
            clean_sentences.append(sentence.replace('{blank}', c.correct_answer))
    
    context_section = f"""
    [Bağlam - İsteğe bağlı] Kullanıcının uygulamada öğrendiği bazı cümleler:
    {context_text}
    Bu cümleleri YALNIZCA doğal ve yerinde düşünüyorsan kullan; zorla yerleştirme.
    """ if context_text else ""

    prompt = f"""
Sen samimi, sıcak ve 'Doğal Yaklaşım' metodunu benimseyen deneyimli bir İngilizce öğretmenisin.
Kullanıcı seninle Türkçe konuşuyor; sen de TÜRKÇE yanıt veriyorsun.

{context_section}

YETKİN VE GENEL OLARAK YAKLAŞ:
- Sadece uygulamadaki kelimelere sınırlı kalma. Genel İngilizce bilginle de yardım et.
- Bir kelime veya ifade sorulduğunda Türkçe karşılığını doğrudan söyleme.
  Bunun yerine o kelimeyi çağrıştıran kısa bir sahne, duygu veya kullanım bağlamı yaz.
  Ardından kullanıcının o anlamı kendisinin bulmasını sağlayacak bir soru sor.
  → Örnek: "longer ne demek?" sorusuna kötü yanıt: "Daha uzun demek."
  → Örnek: "longer ne demek?" sorusuna iyi yanıt: "Bir cetvel düşün — iki kalemi karşılaştırıyorsun. Biri 15 cm, diğeri 20 cm. 20 cm olanı tarif etmek için hangisini söylerdin sence?"
- Gramer sorusunda kural tablosu verme; somut bir örnek cümleyle yönlendir ve farkı kullanıcıya sezdir.
- Yanıt 2-3 cümle olsun. Sona mutlaka kullanıcıyı düşündürecek tek bir soru ekle.
- Samimi, teşvik edici ve merak uyandırıcı bir ton kullan.

Kullanıcının Sorusu: {request.message}
    """
    
    try:
        response = ai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class StoryRequest(BaseModel):
    session_id: str

@app.post("/api/stories/generate")
def generate_story(request: StoryRequest, db: Session = Depends(get_db)):
    from database import UserCardStat, Card, GeneratedStory
    from datetime import datetime
    
    stats = db.query(UserCardStat).filter(UserCardStat.session_id == request.session_id).all()
    if not stats:
        raise HTTPException(status_code=400, detail="Henüz yeterli kelime öğrenmedin! Önce biraz ders çalışmalısın.")
        
    card_ids = [s.card_id for s in stats]
    cards = db.query(Card).filter(Card.id.in_(card_ids)).all()
    
    known_sentences = [c.text_target for c in cards]
    context_text = "\n".join([f"- {s}" for s in known_sentences])
    
    prompt = f"""
    Sen, 'Doğal Yaklaşım' (çeviri veya gramer kuralı olmadan) yöntemini benimsemiş bir dil öğretmenisin. 
    Kullanıcı şu ana kadar sadece şu İngilizce cümleleri ve buradaki kelimeleri öğrendi:
    {context_text}
    
    Görevlerin:
    1. Kullanıcının öğrendiği bu kelimeleri ve yapıları (ve sadece bunları veya çok temel uluslararası kelimeleri/bağlaçları) kullanarak ÇOK KISA, basit ve eğlenceli bir İngilizce hikaye (2-3 paragraf) yaz.
    2. Kullanıcının henüz öğrenmediği zor kelimelerden ve karmaşık gramer yapılarından KESİNLİKLE uzak dur. 
    3. Hikayenin sonuna Türkçe olarak, okuduğunu anlama (doğal çıkarım) tarzında ufak bir motive edici not veya çok basit bir soru ekle.
    4. Yanıtı markdown formatında ver.
    """
    
    try:
        response = ai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        new_story = GeneratedStory(
            session_id=request.session_id,
            content=response.text,
            created_at=datetime.utcnow()
        )
        db.add(new_story)
        db.commit()
        db.refresh(new_story)
        
        return {"id": new_story.id, "content": new_story.content, "created_at": new_story.created_at}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stories")
def get_stories(session_id: str, db: Session = Depends(get_db)):
    from database import GeneratedStory
    stories = db.query(GeneratedStory).filter(GeneratedStory.session_id == session_id).order_by(GeneratedStory.created_at.desc()).all()
    return stories