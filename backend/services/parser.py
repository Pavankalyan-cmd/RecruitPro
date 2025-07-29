import io
from docx import Document
from google.cloud.firestore_v1 import DocumentSnapshot
from datetime import datetime
from typing import Any


def extract_text_from_docx(data):
    doc = Document(io.BytesIO(data))
    return "\n".join([para.text.strip() for para in doc.paragraphs if para.text.strip()])


def clean_firestore_data(data: Any) -> Any:
    if isinstance(data, dict):
        return {k: clean_firestore_data(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [clean_firestore_data(v) for v in data]
    elif isinstance(data, datetime):
        return data.isoformat()
    else:
        return data