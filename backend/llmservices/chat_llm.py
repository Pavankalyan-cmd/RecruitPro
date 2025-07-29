import os
from dotenv import load_dotenv
from typing import List, Dict
from google import genai
from google.genai.types import GenerateContentConfig, ThinkingConfig
import json
from services.parser import clean_firestore_data
load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def chat_ai(jd: Dict, candidates: List[Dict], query: str) -> Dict:
    cleaned_jd = clean_firestore_data(jd)
    cleaned_candidates = clean_firestore_data(candidates)

    contents = [
        {
            "role": "user",
            "parts": [{
                "text": f"""
You are a skilled recruitment assistant. 
Given a JD and top candidates (below), answer user queries concisely.
Your task:
- Answer the user's question based **strictly** on the given data.
- Do **NOT** repeat the full candidate or JD content.
- Be **concise**, focused, and **insightful**.
- Provide **comparative analysis** if multiple candidates are involved.
- If referring to resumes, do NOT return raw URLs.
  Instead, say:
  "You can view his resume here: [View Resume](https://recruitpro.blob.core.windows.net/...)"
- When useful, briefly summarize the candidate’s experience before linking the resume.
- Avoid generic or vague replies. Use specific fields like skills, scores, or experience when relevant.
- Never speculate beyond the data provided.



Job Description:
{json.dumps(cleaned_jd)}

Top Candidates:
{json.dumps(cleaned_candidates)}

User Query: {query}
""" }]
        }
    ]

    config = GenerateContentConfig(
        temperature=0.3,
        max_output_tokens=2048,
        response_mime_type="text/plain",  
        thinking_config=ThinkingConfig(thinking_budget=0)
    )

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents,
            config=config
        )
        return {
            "response": response.candidates[0].content.parts[0].text
        }
    except Exception as e:
        return {
            "response": f"⚠️ Gemini Error: {str(e)}"
        }
