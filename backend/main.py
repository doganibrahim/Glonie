from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import tempfile, os, threading

from database import init_db, get_db
from schemas import LessonResponse
import crud

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