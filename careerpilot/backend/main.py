from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from resume_parser import extract_text_from_pdf
from llm_service import get_ats_score
from resume_rewriter import rewrite_resume
from job_matcher import fetch_jobs, extract_job_titles
from skill_gap import analyse_skill_gap, generate_roadmap
from interview_coach import generate_interview_questions
from typing import List

app = FastAPI(title="CareerCopilot API")

class ResumeScoreRequest(BaseModel):
    resume_text: str

class SkillGapRequest(BaseModel):
    resume_text: str
    job_description: str

class RoadmapRequest(BaseModel):
    missing_skills: List[str]
    job_title: str

class InterviewPrepRequest(BaseModel):
    resume_text: str
    job_description: str
    job_title: str

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        file_bytes = await file.read()
        text = extract_text_from_pdf(file_bytes)
        
        return {
            "text": text,
            "char_count": len(text)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

@app.post("/api/ats-score")
async def ats_score(request: ResumeScoreRequest):
    if not request.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty")
        
    try:
        score_data = await get_ats_score(request.resume_text)
        return score_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze resume: {str(e)}")

@app.post("/api/rewrite-resume")
async def api_rewrite_resume(request: ResumeScoreRequest):
    if not request.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty")
        
    try:
        rewritten_text = await rewrite_resume(request.resume_text)
        return {"rewritten": rewritten_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to rewrite resume: {str(e)}")

@app.get("/api/jobs")
async def get_jobs(query: str):
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    try:
        jobs = fetch_jobs(query)
        return {"jobs": jobs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch jobs: {str(e)}")

@app.post("/api/extract-job-titles")
async def api_extract_job_titles(request: ResumeScoreRequest):
    if not request.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty")
        
    try:
        titles = extract_job_titles(request.resume_text)
        return {"job_titles": titles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract titles: {str(e)}")

@app.post("/api/skill-gap")
async def api_skill_gap(request: SkillGapRequest):
    if not request.resume_text.strip() or not request.job_description.strip():
        raise HTTPException(status_code=400, detail="Resume text and job description cannot be empty")
        
    try:
        analysis = await analyse_skill_gap(request.resume_text, request.job_description)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyse skill gap: {str(e)}")

@app.post("/api/roadmap")
async def api_roadmap(request: RoadmapRequest):
    if not request.missing_skills or not request.job_title.strip():
        raise HTTPException(status_code=400, detail="Missing skills and job title are required")
        
    try:
        roadmap = await generate_roadmap(request.missing_skills, request.job_title)
        return {"roadmap": roadmap}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate roadmap: {str(e)}")

@app.post("/api/interview-prep")
async def api_interview_prep(request: InterviewPrepRequest):
    if not request.resume_text.strip() or not request.job_description.strip():
        raise HTTPException(status_code=400, detail="Resume text and job description are required")

    try:
        questions = await generate_interview_questions(request.resume_text, request.job_description, request.job_title)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate interview questions: {str(e)}")
