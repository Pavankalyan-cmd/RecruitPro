from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from firebase_config import db, verify_firebase_token
import json
from llmservices.chat_llm import chat_ai

router = APIRouter()  

class ChatTopMatchesRequest(BaseModel):
    jd_id: str
    query: str
@router.post("/chat-top-matches")
async def chat_top_matches(request: Request, req: ChatTopMatchesRequest):
    
    uid = verify_firebase_token(request)

    jd_doc = db.collection("users").document(uid).collection("job_descriptions").document(req.jd_id).get()
    if not jd_doc.exists:
        raise HTTPException(status_code=404, detail="Job Description not found")

    jd_data = jd_doc.to_dict()


    top_score_docs = (
        db.collection("users")
          .document(uid)
          .collection("top_score")
          .document(req.jd_id)
          .collection("candidates")
          .get()
    )
    top_candidates = [doc.to_dict() for doc in top_score_docs]

    if not top_candidates:
        raise HTTPException(status_code=404, detail="No top match candidates found")

    try:
        response = chat_ai(jd_data, top_candidates, req.query)
        return {"response": response} 
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")