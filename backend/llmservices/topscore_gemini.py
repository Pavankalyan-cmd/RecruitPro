import os
import json
from dotenv import load_dotenv
from typing import List, Dict
from google import genai
from google.genai.types import GenerateContentConfig
load_dotenv()
client = genai.Client(api_key="GEMINI_API_KEY")

client = genai.Client()


def analyze_multiple_resumes_structured(job_text: str, candidates: List[Dict]) -> List[Dict]:
    response_schema = {
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "uid": { "type": "string" },
      "candidate_id": { "type": "string" },
      "name": { "type": "string" },
      "contact": { "type": "string" },
      "email": { "type": "string" },
      "education": { "type": "string" },
      "designation": { "type": "string" },
      "experience": { "type": "string" },
      "resume_url": { "type": "string" },
      "profile_type": { "type": "string" },
      "skills_score": { "type": "number", "minimum": 0, "maximum": 100 },
      "skills_explanation": { "type": "string" },
      "experience_score": { "type": "number", "minimum": 0, "maximum": 100 },
      "experience_explanation": { "type": "string" },
      "education_score": { "type": "number", "minimum": 0, "maximum": 100 },
      "education_explanation": { "type": "string" },
      "certifications_score": { "type": "number", "minimum": 0, "maximum": 100 },
      "certifications_explanation": { "type": "string" },
      "skills_matched": {
        "type": "array",
        "items": { "type": "string" }
      },
      "key_achievements": {
        "type": "array",
        "items": { "type": "string" }
      },
      
    },
    "required": [
      "uid", "candidate_id", "name", "contact",  "email", "education","experience",
      "designation", "resume_url", "skills_score", "skills_explanation",
      "experience_score", "experience_explanation",
      "education_score", "education_explanation",
      "certifications_score", "certifications_explanation",
      "skills_matched", "key_achievements"
    ],
    "propertyOrdering": [
      "uid", "candidate_id", "name", "email", "contact","experience",
      "education", "designation", "resume_url", "profile_type",
      "skills_score", "skills_explanation",
      "experience_score", "experience_explanation",
      "education_score", "education_explanation",
      "certifications_score", "certifications_explanation",
      "skills_matched", "key_achievements"
    ]
  }
}


    
    prompt = f"""
You are an expert recruitment analyst. Given a job description and a candidate resume, evaluate how well the candidate matches the role 
across key hiring dimensions: Skills, Experience, Education, and Certifications. For each section, extract relevant information from the
resume and score the match against the job requirements from 0–100.
using structured output.
Only return valid JSON list. Do not include markdown or commentary.

Job Description:
{job_text}

Candidate Resumes:
{json.dumps(candidates, indent=2)}

Instructions:
For each candidate, evaluate the following:

Scoring Criteria for each category (0–100):

- **90–100:** Excellent match. Fully satisfies all key requirements.
- **70–89:** Good match. Covers most important criteria with minor gaps.
- **50–69:** Moderate match. Partially meets expectations but missing key items.
- **30–49:** Weak match. Only a few relevant elements are present.
- **0–29:** Very poor or no alignment.

1. **Skills (0–100)**  
- Extract key technical and soft skills from the resume  
- Compare against required and preferred job skills  
- Consider: relevance, recency, frequency, and completeness  
- Score high only if most core skills are well covered  

2. **Experience (0–100)**  
- Analyze previous roles: titles, domains, seniority, tools  
- Match against job responsibilities and industry context  
- Consider years of experience, job function, and progression  
- Score higher for aligned roles with strong duration  

3. **Education (0–100)**  
- Check degree(s), field of study, institution(s), and graduation year(s)  
- Compare to job requirements  
- Score higher for exact or higher degree levels and relevant fields  

4. **Certifications (0–100)**  
- Evaluate relevance and validity of certifications to the role  
- Score based on match and industry recognition

5. Classify each candidate as either a "fresher" or a "senior_engineer" or "mid_level_professional based on their total years of experience:

If the candidate has less than 1 year of experience, classify profile_type as "fresher".

If the candidate has 4 or more years of experience, classify profile_type as "senior_engineer".

If experience is between 2 and 4 years,  classify profile_type as "mid_level_professional"
6. Return a field called "skills_matched" which lists all the technical skills that are present in both the job description and the candidate's resume. Only include exact or highly relevant matches (e.g.,
 "Python" in both counts as a match; "Java" vs "JavaScript" does not). Do not infer skills not clearly mentioned in the resume.


Output Format: Return a list of candidate evaluation objects matching the predefined JSON schema.

    """

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=response_schema 
            ),
        )
        parsed = response.parsed 
        return parsed
    except Exception as e:
        return [{
            "error": str(e),
            "raw_candidates": candidates[:2] 
        }]

