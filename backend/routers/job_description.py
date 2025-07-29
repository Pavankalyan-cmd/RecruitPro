from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from services.parser import extract_text_from_docx
from firebase_config import verify_firebase_token, db
from pydantic import BaseModel
from typing import List, Optional
from google import genai
import os
import json
from dotenv import load_dotenv
from urllib.parse import urlparse
import uuid
from storage.azure import upload_resume_to_azure ,delete_resume_from_azure
from google.genai.types import GenerateContentConfig,Part 
from  services.scoring import calculate_total_score
from storage.firestore import save_topscore_results_to_firestore
from llmservices.topscore_gemini import analyze_multiple_resumes_structured
from services.scoring import initialize_user_weights
load_dotenv()

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))


router = APIRouter()

class JobDescription(BaseModel):
    jobtitle: str
    company: str
    location: Optional[str]
    required_experience: Optional[str]
    job_type: Optional[str]
    required_skills: List[str]
    responsibilities: Optional[str]
    qualifications: str
    salary_range: Optional[str]
    posted_date: Optional[str]
    contact_email: Optional[str]
    description: str



@router.post("/upload-jd")
async def upload_multiple_jds(
    request: Request,
    jd_files: List[UploadFile] = File(...)
):
    uid = verify_firebase_token(request)
    results = []
    initialize_user_weights(uid)

    for jd_file in jd_files:
        try:
            jd_bytes = await jd_file.read()
            jd_filename = jd_file.filename.lower()
            jd_content_type = jd_file.content_type or "application/pdf"
            jd_id = str(uuid.uuid4())

            jd_url = upload_resume_to_azure(
                uid=uid,
                candidate_id=jd_id,
                filename=jd_file.filename,
                content=jd_bytes,
                content_type=jd_file.content_type or "application/pdf"
            )

            if jd_filename.endswith(".docx") or jd_content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                # Extract text for docx (fallback if Part fails)
                extracted_text = extract_text_from_docx(jd_bytes)
                file_part = Part.from_text(extracted_text)
            else:
                # Default to binary Part for PDFs
                file_part = Part.from_bytes(
                    data=jd_bytes,
                    mime_type=jd_content_type
                )
            jd_schema = JobDescription.schema_json(indent=2)
            prompt = f"""
            You are an information extraction engine.

            Task: Read the job description   extract ONLY the information that is explicitly supported by the text. Do NOT guess or invent anything.

            Output: return ONLY valid JSON. Do not include comments, markdown, or extra text.
            Extract the following fields:

            - **jobtitle**: The exact job title for the role.
            - **company**: The company or organization offering the job.
            - **location**: The primary job location or work location if mentioned. Use city and/or country. If the job is remote, include "Remote".
            - **required_experience**: The total years or range of professional experience required for the role (e.g., "3+ years", "5–7 years").
            - **job_type**: Full-time, part-time, contract, internship, etc.
            - **required_skills**: A list of core technical or soft skills mentioned (e.g., Python, communication, SQL, etc.).
            - **responsibilities**: Bullet points or a paragraph describing what the job role involves or expects the candidate to do.
            - **qualifications**: Educational background or certifications required (e.g., "Bachelor's in Computer Science").
            - **salary_range**: If a salary or compensation range is mentioned (e.g., "₹10–15 LPA", "$70,000–$90,000"), include it.
            - **posted_date**: The date when the job was posted, if explicitly mentioned.
            - **contact_email**: Any email provided for applications or inquiries.
            - **description**: The full body text of the job description or its overview.

            Match this schema:
            {jd_schema}

            """
            try:
                response = await client.aio.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=[file_part, prompt],
                    config=GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=JobDescription,
                        temperature=0.2
                    )
                )
                jd_model = response.text  
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

            try:
                jd_model = response.text  
                jd_dict = jd_model.dict()
            except Exception as parse_err:
   
                jd_dict = json.loads(response.text)



            jd_dict.update({
                "uid": uid,
                "jd_id": jd_id,
                "jd_url": jd_url
            })

            db.collection("users").document(uid).collection("job_descriptions").document(jd_id).set(jd_dict)

            results.append({
                "filename": jd_file.filename,
                "jd_id": jd_id,
                "parsed_data": jd_dict
            })

            candidates_ref = db.collection("users").document(uid).collection("candidates")
            candidates = candidates_ref.stream()
            candidate_list = []
            for doc in candidates:
                data = doc.to_dict()
                candidate_list.append(data)
                  

            def has_skill_overlap(jd_skills, candidate_skills, min_overlap=2):
                return len(set(jd_skills).intersection(set(candidate_skills))) >= min_overlap


            jd_skills = jd_dict.get("required_skills", [])    



            filtered_candidates = []
            for c in candidate_list:
                candidate_skills = c.get("technical_skills", [])
                if has_skill_overlap(jd_skills, candidate_skills, min_overlap=1):
                    filtered_candidates.append(c)
   


            if filtered_candidates:
                topscore_results = analyze_multiple_resumes_structured(jd_dict, filtered_candidates)
     

                for candidate in topscore_results:
                        result = calculate_total_score(candidate, uid)
    
                        candidate["total_score"] = result["total_score"]
                        candidate["score_breakdown"] = result["breakdown"]

                save_topscore_results_to_firestore(uid=uid, jd_id=jd_id, topscore_results=topscore_results)
            else:
         
                return "matching candidates found for the given JD."


            
            
        except Exception as e:
            results.append({
                "filename": jd_file.filename,
                "error": str(e)
            })

    return {
        "status": "completed",
        "uid": uid,
        "results": results
    }




@router.get("/job-descriptions")
async def get_job_descriptions(request: Request):
    try:
        uid = verify_firebase_token(request)

        jd_ref = db.collection("users").document(uid).collection("job_descriptions")
        docs = jd_ref.stream()

        jd_list = []
        for doc in docs:
            jd = doc.to_dict()
            jd["id"] = doc.id
            jd_list.append(jd)

        return {
            "status": "success",
            "uid": uid,
            "job_descriptions": jd_list
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching JDs: {str(e)}")
    


@router.delete("/job-description/{jd_id}")
async def delete_job_description(request: Request, jd_id: str):
    try:
        uid = verify_firebase_token(request)

        jd_doc_ref = db.collection("users").document(uid).collection("job_descriptions").document(jd_id)
        doc_snapshot = jd_doc_ref.get()

        if not doc_snapshot.exists:
            raise HTTPException(status_code=404, detail="Job Description not found")

        jd_data = doc_snapshot.to_dict()

        # Delete the associated file from Azure, if any
        jd_url = jd_data.get("jd_url")
        if jd_url:
            parsed_url = urlparse(jd_url)
            blob_path = parsed_url.path.lstrip(f"/{os.getenv('AZURE_CONTAINER_NAME')}/")
            delete_resume_from_azure(blob_path)

        # Delete JD document
        jd_doc_ref.delete()

        # Delete associated top score document
        top_score_jd_ref = db.collection("users").document(uid).collection("top_score").document(jd_id)
        top_score_jd_ref.delete()

        return {
            "status": "success",
            "message": f"Job Description {jd_id}, associated file, and top score deleted successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting JD: {str(e)}")
