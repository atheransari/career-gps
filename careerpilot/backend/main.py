from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from resume_parser import extract_text_from_pdf
from llm_service import get_ats_score
from resume_rewriter import rewrite_resume
from job_matcher import fetch_jobs, extract_job_titles
from skill_gap import analyse_skill_gap, generate_roadmap
from interview_coach import generate_interview_questions
from typing import List, Optional
import auth
from database import supabase
import interview_service

app = FastAPI(title="CareerCopilot API")

# --- Pydantic Models ---

class InterviewAnswerRequest(BaseModel):
    question: str
    transcript: str
    duration_seconds: int
    pause_count: int
    filler_words: List[str]
    words_per_minute: int

class InterviewQuestionsRequest(BaseModel):
    type: str

@app.get("/api/interview/questions")
async def get_interview_questions_bulk(type: str):
    if type not in ["Technical", "HR", "Behavioural"]:
        raise HTTPException(status_code=400, detail="Invalid interview type")
    try:
        questions = await interview_service.generate_bulk_questions(type)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/interview/analyse")
async def analyse_interview(request: InterviewAnswerRequest):
    try:
        analysis = await interview_service.analyse_interview_answer(
            request.question,
            request.transcript,
            request.duration_seconds,
            request.pause_count,
            request.filler_words,
            request.words_per_minute
        )
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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

class UserSignup(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TrackCreate(BaseModel):
    job_title: str
    job_description: str
    resume_text: str
    ats_score: int
    skill_gap: dict
    roadmap: list

class TrackUpdate(BaseModel):
    current_week: Optional[int] = None
    completed_tasks: Optional[List[str]] = None
    status: Optional[str] = None

# --- Setup CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routes ---

@app.get("/health")
def health_check():
    return {"status": "ok"}

# --- Auth Endpoints ---

@app.post("/api/auth/signup")
async def signup(user_data: UserSignup):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    try:
        response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password
        })
        if response.user is None:
            raise HTTPException(status_code=400, detail="Signup failed — check your email and password")
        user_obj = {"id": response.user.id, "email": response.user.email}
        token = response.session.access_token if response.session else ""
        return {"access_token": token, "token_type": "bearer", "user": user_obj, "email_confirmation_required": response.session is None}
    except HTTPException:
        raise
    except Exception as e:
        detail = str(e)
        if "already registered" in detail or "already exists" in detail:
            raise HTTPException(status_code=400, detail="An account with this email already exists.")
        raise HTTPException(status_code=500, detail=detail)

@app.post("/api/auth/login")
async def login(user_data: UserLogin):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    try:
        response = supabase.auth.sign_in_with_password({
            "email": user_data.email,
            "password": user_data.password
        })
        if response.user is None or response.session is None:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        user_obj = {"id": response.user.id, "email": response.user.email}
        return {"access_token": response.session.access_token, "token_type": "bearer", "user": user_obj}
    except HTTPException:
        raise
    except Exception as e:
        detail = str(e)
        if "Email not confirmed" in detail:
            raise HTTPException(status_code=401, detail="Please confirm your email before logging in.")
        if "Invalid login credentials" in detail:
            raise HTTPException(status_code=401, detail="Invalid email or password.")
        raise HTTPException(status_code=500, detail=detail)

class ForgotPassword(BaseModel):
    email: EmailStr

@app.post("/api/auth/forgot-password")
async def forgot_password(data: ForgotPassword):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    try:
        supabase.auth.reset_password_email(data.email)
        return {"message": "Password reset email sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Resume & Analysis Endpoints ---

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
async def ats_score(request: ResumeScoreRequest, current_user: Optional[dict] = Depends(auth.get_optional_user)):
    if not request.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty")
        
    try:
        score_data = await get_ats_score(request.resume_text)
        
        if current_user and supabase:
            try:
                # Fetch previous score
                prev_res = supabase.table("resume_versions").select("ats_score").eq("user_id", current_user["id"]).order("created_at", desc=True).limit(1).execute()
                prev_score = prev_res.data[0]["ats_score"] if prev_res.data else None
                
                if prev_score is not None:
                    score_data["delta"] = score_data["overall_score"] - prev_score
                    
                # Insert new score
                supabase.table("resume_versions").insert({
                    "user_id": current_user["id"],
                    "resume_text": request.resume_text,
                    "ats_score": score_data["overall_score"]
                }).execute()
            except Exception as e:
                print(f"Error saving resume version: {e}")

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

# --- Track Endpoints ---

@app.get("/api/tracks")
async def get_tracks(current_user: dict = Depends(auth.get_current_user)):
    try:
        response = supabase.table("tracks").select("*").eq("user_id", current_user["id"]).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tracks")
async def create_track(track_data: TrackCreate, current_user: dict = Depends(auth.get_current_user)):
    new_track = {
        "user_id": current_user["id"],
        **track_data.dict(),
        "status": "active"
    }
    try:
        response = supabase.table("tracks").insert(new_track).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tracks/{track_id}")
async def get_track(track_id: int, current_user: dict = Depends(auth.get_current_user)):
    try:
        response = supabase.table("tracks").select("*").eq("id", track_id).eq("user_id", current_user["id"]).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Track not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/tracks/{track_id}")
async def update_track(track_id: int, track_update: TrackUpdate, current_user: dict = Depends(auth.get_current_user)):
    update_data = {k: v for k, v in track_update.dict().items() if v is not None}
    try:
        response = supabase.table("tracks").update(update_data).eq("id", track_id).eq("user_id", current_user["id"]).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Track not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Resume History ---

@app.get("/api/resume/history")
async def get_resume_history(current_user: dict = Depends(auth.get_current_user)):
    try:
        response = supabase.table("resume_versions").select("ats_score, created_at").eq("user_id", current_user["id"]).order("created_at", desc=False).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Interview Sessions ---

class InterviewSessionCreate(BaseModel):
    session_type: str
    question: str
    transcript: str
    overall_score: int
    fluency_score: int
    confidence_score: int
    content_score: int
    duration_seconds: int
    words_per_minute: int
    filler_count: int

@app.post("/api/interview/sessions")
async def save_interview_session(session: InterviewSessionCreate, current_user: dict = Depends(auth.get_current_user)):
    try:
        response = supabase.table("interview_sessions").insert({
            "user_id": current_user["id"],
            "session_type": session.session_type,
            "question": session.question,
            "transcript": session.transcript,
            "overall_score": session.overall_score,
            "fluency_score": session.fluency_score,
            "confidence_score": session.confidence_score,
            "content_score": session.content_score,
            "duration_seconds": session.duration_seconds,
            "words_per_minute": session.words_per_minute,
            "filler_count": session.filler_count,
        }).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/interview/sessions")
async def get_interview_sessions(current_user: dict = Depends(auth.get_current_user)):
    try:
        response = supabase.table("interview_sessions").select("*").eq("user_id", current_user["id"]).order("created_at", desc=True).limit(20).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

