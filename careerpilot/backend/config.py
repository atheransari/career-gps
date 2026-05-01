import os
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

class Config:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    JSEARCH_API_KEY = os.getenv("JSEARCH_API_KEY")
    SUPABASE_URL = os.getenv("SUPABASE_URL", "your_supabase_url_here")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "your_supabase_key_here")
    JWT_SECRET = os.getenv("JWT_SECRET", "change_this_to_a_random_string_for_security")
    JWT_ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

config = Config()
