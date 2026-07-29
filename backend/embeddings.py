import json
import numpy as np
from sqlalchemy.orm import Session
from database import CardEmbedding, Card
from google import genai

def generate_embedding(text: str, client: genai.Client) -> list[float]:
    response = client.models.embed_content(
        model="models/text-embedding-004",
        contents=text
    )
    return response.embeddings[0].values

def cosine_similarity(a: list[float], b: list[float]) -> float:
    a_np = np.array(a)
    b_np = np.array(b)
    norm_a = np.linalg.norm(a_np)
    norm_b = np.linalg.norm(b_np)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a_np, b_np) / (norm_a * norm_b))

def sync_card_embeddings(db: Session, client: genai.Client):
    """Generates embeddings for all cards that don't have them yet."""
    cards = db.query(Card).all()
    for card in cards:
        existing = db.query(CardEmbedding).filter(CardEmbedding.card_id == card.id).first()
        if not existing:
            text_to_embed = card.text_target
            emb = generate_embedding(text_to_embed, client)
            new_emb = CardEmbedding(
                card_id=card.id,
                embedding=json.dumps(emb)
            )
            db.add(new_emb)
    db.commit()

def search_similar_cards(db: Session, client: genai.Client, query: str, top_k: int = 3):
    query_emb = generate_embedding(query, client)
    
    all_embeddings = db.query(CardEmbedding).all()
    results = []
    for item in all_embeddings:
        emb_list = json.loads(item.embedding)
        sim = cosine_similarity(query_emb, emb_list)
        results.append((sim, item.card_id))
        
    results.sort(key=lambda x: x[0], reverse=True)
    top_ids = [card_id for _, card_id in results[:top_k]]
    
    if not top_ids:
        return []
        
    cards = db.query(Card).filter(Card.id.in_(top_ids)).all()
    card_map = {c.id: c for c in cards}
    return [card_map[id] for id in top_ids if id in card_map]
