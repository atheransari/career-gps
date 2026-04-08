import io
import logging
from pdfminer.high_level import extract_text

logger = logging.getLogger(__name__)

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts text from a PDF file provided as bytes.
    """
    try:
        with io.BytesIO(file_bytes) as pdf_file:
            text = extract_text(pdf_file)
            return text.strip()
    except Exception as e:
        logger.error(f"Failed to extract text from PDF: {e}")
        return ""
