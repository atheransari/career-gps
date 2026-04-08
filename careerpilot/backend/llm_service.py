import json
import logging
import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_exponential
from config import config

logger = logging.getLogger(__name__)

if config.GEMINI_API_KEY:
    genai.configure(api_key=config.GEMINI_API_KEY)

# Free-tier Gemini models can hit daily/request quotas quickly.
# Gemma models tend to be available under different quota buckets for many keys.
model = genai.GenerativeModel('gemma-3-4b-it')

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True
)
async def get_ats_score(resume_text: str) -> dict:
    if not config.GEMINI_API_KEY:
        raise ValueError("Gemini API key is missing or not configured properly. Please update your .env file.")

    prompt = """You are an ATS (Applicant Tracking System) expert. Analyse the resume and return ONLY a JSON object with these exact fields:
- overall_score: number 0-100
- keyword_score: number 0-100  
- formatting_score: number 0-100
- sections_score: number 0-100
- action_verbs_score: number 0-100
- issues: array of strings describing specific problems
- strengths: array of strings describing what is good
No explanation, no markdown, just the JSON object.

Resume to analyze:
""" + resume_text

    try:
        response = await model.generate_content_async(prompt)
        
        content = response.text.strip()
        
        # Strip potential markdown block wrapping from the JSON response
        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]
            
        if content.endswith("```"):
            content = content[:-3]
            
        content = content.strip()
        
        return json.loads(content)
    except Exception as e:
        logger.error(f"Failed to get ATS score: {e}")
        raise
