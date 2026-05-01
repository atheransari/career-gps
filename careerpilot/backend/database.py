from supabase import create_client, Client
from config import config
import logging

logger = logging.getLogger(__name__)

supabase_url = config.SUPABASE_URL
supabase_key = config.SUPABASE_KEY

# Initialize Supabase client
# We wrapped this in a try-except because the user might not have valid credentials yet.
try:
    if supabase_url == "your_supabase_url_here" or supabase_key == "your_supabase_key_here":
        logger.warning("Supabase credentials are placeholders. Database operations will fail.")
        supabase: Client = None
    else:
        supabase: Client = create_client(supabase_url, supabase_key)
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {e}")
    supabase = None
