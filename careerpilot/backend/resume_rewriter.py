import logging
import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_exponential
from config import config

logger = logging.getLogger(__name__)

if config.GEMINI_API_KEY:
    genai.configure(api_key=config.GEMINI_API_KEY)

# Free-tier Gemini models can hit daily/request quotas quickly.
model = genai.GenerativeModel('gemma-3-4b-it')

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True
)
async def rewrite_resume(resume_text: str) -> str:
    if not config.GEMINI_API_KEY:
        raise ValueError("Gemini API key is missing or not configured properly. Please update your .env file.")

    prompt = f"""You are an expert resume writer. Rewrite the following resume to:
1. Add strong action verbs to every bullet point
2. Quantify achievements wherever possible (add realistic estimates if numbers are missing)
3. Fix ATS issues: remove tables, columns, graphics references
4. Add missing standard sections if absent (Summary, Skills, Experience, Education)
5. Improve keyword density for tech jobs

Return ONLY the rewritten resume as plain text. Preserve all real information — do not invent fake companies or roles.

Resume:
{resume_text}
"""

    try:
        response = await model.generate_content_async(
            prompt,
            generation_config=genai.types.GenerationConfig(temperature=0, candidate_count=1)
        )
        
        return response.text.strip()
    except Exception as e:
        logger.error(f"Failed to rewrite resume: {e}")
        raise
