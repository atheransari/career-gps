import httpx
import json
import logging
from config import config
import google.generativeai as genai

logger = logging.getLogger(__name__)

if config.GEMINI_API_KEY:
    genai.configure(api_key=config.GEMINI_API_KEY)

# Free-tier Gemini models can hit daily/request quotas quickly.
model = genai.GenerativeModel('gemma-3-4b-it')

def extract_job_titles(resume_text: str) -> list:
    """
    Extracts top 3 suitable job titles from a given resume using Gemini API.
    Returns a list of strings representing job titles.
    """
    if not config.GEMINI_API_KEY:
        raise ValueError("Gemini API key is missing or not configured properly.")

    prompt = f"""You are an expert tech recruiter. Based on the following resume text, identify the top 3 most suitable and common job titles the candidate is highly qualified for. 
Return ONLY a valid JSON array of exactly 3 strings representing the job titles, e.g. ["Software Engineer", "Frontend Developer", "Full Stack Developer"].
No explanation, no markdown blocks around the JSON array.

Resume:
{resume_text}
"""

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(temperature=0, candidate_count=1)
        )
        content = response.text.strip()
        
        # Clean up potential markdown formatting wrapping the JSON
        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]
            
        if content.endswith("```"):
            content = content[:-3]
            
        content = content.strip()
        job_titles = json.loads(content)
        
        if not isinstance(job_titles, list):
            return []
            
        return job_titles[:3]

    except Exception as e:
        logger.error(f"Failed to extract job titles: {e}")
        return []


def fetch_jobs(query: str, location: str = "India") -> list:
    """
    Calls JSearch API via RapidAPI to search for jobs.
    Returns a list of up to 10 mapped job objects.
    """
    if not config.JSEARCH_API_KEY or config.JSEARCH_API_KEY == "your_key_here":
        raise ValueError("JSEARCH_API_KEY is missing or not configured properly. Please update your .env file.")

    url = "https://jsearch.p.rapidapi.com/search"
    search_query = f"{query} in {location}"

    querystring = {
        "query": search_query, 
        "page": "1", 
        "num_pages": "1", 
        "country": "in"
    }

    headers = {
        "X-RapidAPI-Key": config.JSEARCH_API_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
    }

    try:
        response = httpx.get(url, headers=headers, params=querystring, timeout=15.0)
        response.raise_for_status()
        
        data = response.json()
        job_results = data.get("data", [])
        
        mapped_jobs = []
        for job in job_results[:10]:
            snippet = job.get("job_description", "")
            if snippet:
                snippet = snippet[:500] # Return only the first 500 chars as requested
                
            salary_min = job.get("job_min_salary")
            salary_max = job.get("job_max_salary")
            
            # Formatting location gracefully based on available fields from JSearch API
            city = job.get('job_city')
            state = job.get('job_state')
            country = job.get('job_country')
            job_loc = ", ".join(filter(None, [city, state, country])) or "Remote / Location Not Specified"
            
            mapped_jobs.append({
                "title": job.get("job_title", "Unknown Title"),
                "company": job.get("employer_name", "Unknown Company"),
                "location": job_loc,
                "salary_min": salary_min,
                "salary_max": salary_max,
                "job_description": snippet,
                "apply_link": job.get("job_apply_link") or job.get("employer_website") or "#"
            })
            
        return mapped_jobs
        
    except Exception as e:
        logger.error(f"Failed to fetch jobs from RapidAPI: {e}")
        raise
