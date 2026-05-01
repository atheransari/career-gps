import json
import logging
import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_exponential
from config import config

logger = logging.getLogger(__name__)

if config.GEMINI_API_KEY:
    genai.configure(api_key=config.GEMINI_API_KEY)

model = genai.GenerativeModel('gemini-flash-latest')

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True
)
async def generate_bulk_questions(interview_type: str) -> list:
    if not config.GEMINI_API_KEY:
        raise ValueError("Gemini API key is missing.")

    prompt = f"""You are an expert interviewer. Generate exactly 10 interview questions for a {interview_type} interview.
    - If Technical: focus on coding, system design, and specialized skills.
    - If HR: focus on culture fit, career goals, and logistics.
    - If Behavioural: focus on past experiences using the STAR method.

    Return ONLY a valid JSON array of 10 strings. 
    No markdown, no explanation. Just the JSON array.
    """

    try:
        response = await model.generate_content_async(
            prompt,
            generation_config=genai.types.GenerationConfig(temperature=0, candidate_count=1)
        )
        content = response.text.strip()
        
        # Clean markdown
        if content.startswith("```json"): content = content[7:]
        elif content.startswith("```"): content = content[3:]
        if content.endswith("```"): content = content[:-3]
        
        questions = json.loads(content.strip())
        return questions[:10]
    except Exception as e:
        logger.error(f"Failed to generate bulk questions: {e}")
        raise

@retry( stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10), reraise=True)
async def analyse_interview_answer(question: str, transcript: str, duration: int, pauses: int, filler_words: list, wpm: int) -> dict:
    if not config.GEMINI_API_KEY:
        raise ValueError("Gemini API key is missing.")

    prompt = f"""You are an expert interview coach. Analyse this interview answer strictly and honestly.
    Question: {question}
    Answer given: {transcript}
    Duration: {duration} seconds
    Pauses: {pauses}
    Filler words used: {filler_words}
    Words per minute: {wpm}

    Return ONLY a JSON object with these exact fields:
    technical_accuracy: 0-100
    communication_clarity: 0-100
    answer_structure: 0-100
    confidence_score: 0-100
    overall_score: 0-100
    duration_feedback: one sentence about their pace
    what_went_well: array of exactly 2 specific strings
    improve_this: array of exactly 2 specific strings
    ideal_answer_outline: 3 bullet points of what a perfect answer looks like

    No markdown, just JSON."""

    try:
        response = await model.generate_content_async(
            prompt,
            generation_config=genai.types.GenerationConfig(temperature=0, candidate_count=1)
        )
        content = response.text.strip()
        
        if content.startswith("```json"): content = content[7:]
        elif content.startswith("```"): content = content[3:]
        if content.endswith("```"): content = content[:-3]
        
        return json.loads(content.strip())
    except Exception as e:
        logger.error(f"Failed to analyse interview answer: {e}")
        raise
