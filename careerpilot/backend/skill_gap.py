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
async def analyse_skill_gap(resume_text: str, job_description: str) -> dict:
    if not config.GEMINI_API_KEY:
        raise ValueError("Gemini API key is missing or not configured properly. Please update your .env file.")

    prompt = f"""Compare this resume against this job description. Return ONLY a JSON object with:
- match_percentage: number 0-100
- strong_skills: array of {{"skill": "skill name", "level": "strong"}}
- partial_skills: array of {{"skill": "skill name", "level": "partial"}}
- missing_skills: array of {{"skill": "skill name", "importance": "critical" | "important" | "nice-to-have"}}
- summary: one sentence summary

No markdown, just JSON.

Resume:
{resume_text}

Job Description:
{job_description}
"""

    try:
        response = await model.generate_content_async(
            prompt,
            generation_config=genai.types.GenerationConfig(temperature=0, candidate_count=1)
        )
        content = response.text.strip()
        
        # Strip potential markdown formatting block for JSON parsing robustness
        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]
            
        if content.endswith("```"):
            content = content[:-3]
            
        content = content.strip()
        return json.loads(content)
        
    except Exception as e:
        logger.error(f"Failed to analyse skill gap: {e}")
        raise


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True
)
async def generate_roadmap(missing_skills: list, job_title: str) -> list:
    if not config.GEMINI_API_KEY:
        raise ValueError("Gemini API key is missing or not configured properly.")

    skills_str = ", ".join(missing_skills)
    prompt = f"""Create a week-by-week upskilling roadmap for someone who wants to become a {job_title}. They need to learn: {skills_str}.

Return ONLY a JSON array of weeks. Each week object has:
- week: number
- title: short title like 'Python fundamentals'
- tasks: array of strings (specific daily tasks)
- resource: object with 'name' and 'url' (one free specific resource, e.g. course name + URL if possible)
- outcome: what they can do by end of week

Maximum 8 weeks. No markdown, just JSON array.
"""

    try:
        response = await model.generate_content_async(
            prompt,
            generation_config=genai.types.GenerationConfig(temperature=0, candidate_count=1)
        )
        content = response.text.strip()
        
        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]
            
        if content.endswith("```"):
            content = content[:-3]
            
        content = content.strip()
        roadmap = json.loads(content)
        
        if not isinstance(roadmap, list):
            return []
            
        return roadmap
        
    except Exception as e:
        logger.error(f"Failed to generate roadmap: {e}")
        raise
