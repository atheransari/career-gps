import json
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
async def generate_interview_questions(resume_text: str, job_description: str, job_title: str) -> list:
    if not config.GEMINI_API_KEY:
        raise ValueError("Gemini API key is missing or not configured properly.")

    prompt = f"""You are an expert tech interviewer. Based on the resume and job description below, generate exactly 5 highly relevant interview questions the candidate is likely to face.

For each question, provide a STAR-method answer framework tailored to the candidate's background.

Return ONLY a valid JSON array of 5 objects. Each object must have:
- "question": the interview question string
- "category": one of "Technical", "Behavioral", "Situational", "Role-Specific"  
- "star_guide": object with keys "situation", "task", "action", "result" — each a short string hint (1-2 sentences)
- "difficulty": one of "Easy", "Medium", "Hard"

No markdown, no explanation. Just the JSON array.

Job Title: {job_title}

Resume:
{resume_text}

Job Description:
{job_description}
"""

    try:
        response = await model.generate_content_async(prompt)
        content = response.text.strip()

        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]

        content = content.strip()
        questions = json.loads(content)

        if not isinstance(questions, list):
            return []

        return questions[:5]

    except Exception as e:
        logger.error(f"Failed to generate interview questions: {e}")
        raise
