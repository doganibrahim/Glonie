from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from database import init_db, get_db
from schemas import LessonResponse
import crud

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