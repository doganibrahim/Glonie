from fastapi import FastAPI
from database import init_db

app = FastAPI()

init_db()

@app.get("/")
def read_root():
    return {"msg": "hello, glonie!"}