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

# Gemini client (API key, .env içinden GEMINI_API_KEY olarak okunur)
ai_client = genai.Client()

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
    
    similar_cards = search_similar_cards(db, ai_client, request.message, top_k=3)
    context_text = "\n".join([f"- {c.text_target}" for c in similar_cards]) if similar_cards else "(İlgili örnek cümle bulunamadı)"
    
    prompt = f"""
    Sen, 'Doğal Yaklaşım' yöntemini benimsemiş Sokratik bir dil öğretmenisin. Kullanıcının İngilizce öğrenimiyle ilgili sorduğu soruya Türkçe yanıt ver.
    
    Görevlerin ve Kuralların:
    1. Gramer kurallarını, tabloları veya formülleri (Subject + verb vb.) ASLA doğrudan verme.
    2. Cevabı doğrudan söylemek yerine, kullanıcının kendi kendine bulmasını sağlayacak yönlendirici bir soru sor veya bir örnek verip kuralı kendisinin sezmesini bekle.
    3. Kullanıcının şu ana kadar öğrendiği şu cümleleri (bağlamı) gerektiğinde örnek olarak kullanarak sezgisel bir çıkarım yapmasını sağla:
    {context_text}
    
    Kullanıcının Sorusu: {request.message}
    
    Sadece, onu düşündürecek kısa ve cana yakın bir Türkçe yanıt ver.
    """
    
    try:
        response = ai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))