from fastapi import FastAPI, Header, HTTPException, Depends
from pydantic import BaseModel
from typing import List
import os

app = FastAPI()

# --- API key guard ---
def require_api_key(x_api_key: str = Header(default=None, alias="x-api-key")):
    expected = os.getenv("API_KEY")
    if not expected:
        raise HTTPException(status_code=500, detail="API_KEY not configured")
    if x_api_key != expected:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")

# --- Versioning ---
MODEL_VERSION = os.getenv("OR_V", "v1")

# --- Request schema ---
class Item(BaseModel):
    id: str
    score: float
    cluster_id: int | None = None

class ORRequest(BaseModel):
    items: List[Item]
    max_items: int = 5

# --- Health ---
@app.get("/health")
def health():
    return {"status": "ok", "or_v": MODEL_VERSION}

# --- Optimization (v1: greedy) ---
@app.post("/select", dependencies=[Depends(require_api_key)])
def select_items(req: ORRequest):
    # simple greedy: sort by score
    sorted_items = sorted(req.items, key=lambda x: x.score, reverse=True)

    selected = sorted_items[: req.max_items]

    return {
        "or_v": MODEL_VERSION,
        "selected": [
            {
                "id": i.id,
                "score": i.score,
                "cluster_id": i.cluster_id
            }
            for i in selected
        ]
    }