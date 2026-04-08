import logging
import fitz  # PyMuPDF
from fastapi.testclient import TestClient
from main import app

# Keep detailed logs during testing
logging.basicConfig(level=logging.INFO)

def create_dummy_pdf():
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "Jane Doe\nSenior Software Engineer\nPython, React, FastAPI")
    doc.save("dummy_resume.pdf")
    doc.close()

if __name__ == "__main__":
    print("Creating dummy PDF...")
    create_dummy_pdf()
    
    print("Initializing TestClient...")
    client = TestClient(app)
    
    print("Testing /api/parse-resume endpoint...")
    with open("dummy_resume.pdf", "rb") as f:
        files = {"file": ("dummy_resume.pdf", f, "application/pdf")}
        response = client.post("/api/parse-resume", files=files)
        
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
