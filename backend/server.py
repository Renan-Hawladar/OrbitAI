from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import timedelta
import json

from database import init_db, UserDB, ProfileDB, CareerAnalysisDB
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from pdf_parser import parse_pdf_from_base64
from gemini_service import GeminiService

app = FastAPI(title="Career Compass API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    await init_db()
    print("MongoDB initialized successfully")

# Pydantic Models
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str

class ProfileResponse(BaseModel):
    name: Optional[str]
    degree: Optional[str]
    qualifications: Optional[str]
    skills: Optional[str]
    gemini_api_key: Optional[str]
    profile_picture_base64: Optional[str]
    cv_pdf_base64: Optional[str]
    cv_text: Optional[str]

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    degree: Optional[str] = None
    qualifications: Optional[str] = None
    skills: Optional[str] = None
    gemini_api_key: Optional[str] = None
    profile_picture_base64: Optional[str] = None
    cv_pdf_base64: Optional[str] = None

class CareerSearchRequest(BaseModel):
    career_query: str

# Routes
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "mongodb"}

@app.post("/api/auth/register", response_model=TokenResponse)
async def register(request: RegisterRequest):
    # Check if user already exists
    existing_user = await UserDB.find_by_email(request.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(request.password)
    new_user = await UserDB.create_user(request.email, hashed_password)
    
    # Create empty profile for user
    await ProfileDB.create_profile(new_user["user_id"])
    
    # Generate token
    access_token = create_access_token(
        data={"sub": new_user["email"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return TokenResponse(access_token=access_token, email=new_user["email"])

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    # Find user
    user = await UserDB.find_by_email(request.email)
    if not user or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Generate token
    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return TokenResponse(access_token=access_token, email=user["email"])

@app.get("/api/profile", response_model=ProfileResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    profile = await ProfileDB.find_by_user_id(current_user["user_id"])
    if not profile:
        # Create profile if it doesn't exist
        profile = await ProfileDB.create_profile(current_user["user_id"])
    
    return ProfileResponse(
        name=profile.get("name"),
        degree=profile.get("degree"),
        qualifications=profile.get("qualifications"),
        skills=profile.get("skills"),
        gemini_api_key=profile.get("gemini_api_key"),
        profile_picture_base64=profile.get("profile_picture_base64"),
        cv_pdf_base64=profile.get("cv_pdf_base64"),
        cv_text=profile.get("cv_text")
    )

@app.put("/api/profile")
async def update_profile(
    request: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    profile = await ProfileDB.find_by_user_id(current_user["user_id"])
    if not profile:
        await ProfileDB.create_profile(current_user["user_id"])
    
    # Prepare update data
    update_data = {}
    
    if request.name is not None:
        update_data["name"] = request.name
    if request.degree is not None:
        update_data["degree"] = request.degree
    if request.qualifications is not None:
        update_data["qualifications"] = request.qualifications
    if request.skills is not None:
        update_data["skills"] = request.skills
    if request.gemini_api_key is not None:
        update_data["gemini_api_key"] = request.gemini_api_key
    if request.profile_picture_base64 is not None:
        update_data["profile_picture_base64"] = request.profile_picture_base64
    
    # Handle PDF upload and parsing
    if request.cv_pdf_base64 is not None:
        update_data["cv_pdf_base64"] = request.cv_pdf_base64
        # Parse PDF to extract text
        try:
            cv_text = parse_pdf_from_base64(request.cv_pdf_base64)
            update_data["cv_text"] = cv_text
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error parsing PDF: {str(e)}")
    
    # Update profile
    await ProfileDB.update_profile(current_user["user_id"], update_data)
    
    return {"message": "Profile updated successfully"}

@app.post("/api/analyze-career")
async def analyze_career(current_user: dict = Depends(get_current_user)):
    # Get user profile
    profile = await ProfileDB.find_by_user_id(current_user["user_id"])
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Check if Gemini API key is set
    if not profile.get("gemini_api_key"):
        raise HTTPException(
            status_code=400,
            detail="Gemini API key not set. Please update your profile with a valid API key."
        )
    
    # Check if profile is complete
    if not all([profile.get("name"), profile.get("degree"), profile.get("qualifications"), 
                profile.get("skills"), profile.get("cv_text")]):
        raise HTTPException(
            status_code=400,
            detail="Profile incomplete. Please fill all required fields including CV upload."
        )
    
    # Prepare profile data
    profile_data = {
        "name": profile.get("name"),
        "degree": profile.get("degree"),
        "qualifications": profile.get("qualifications"),
        "skills": profile.get("skills"),
        "cv_text": profile.get("cv_text")
    }
    
    # Call Gemini API
    gemini_service = GeminiService(profile.get("gemini_api_key"))
    try:
        career_paths = await gemini_service.analyze_career_paths(profile_data)
        
        # Save analysis result
        await CareerAnalysisDB.create_analysis(
            current_user["user_id"],
            json.dumps(career_paths)
        )
        
        return {"career_paths": career_paths}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing career paths: {str(e)}")

@app.post("/api/search-career")
async def search_career(
    request: CareerSearchRequest,
    current_user: dict = Depends(get_current_user)
):
    # Get user profile
    profile = await ProfileDB.find_by_user_id(current_user["user_id"])
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Check if Gemini API key is set
    if not profile.get("gemini_api_key"):
        raise HTTPException(
            status_code=400,
            detail="Gemini API key not set. Please update your profile with a valid API key."
        )
    
    # Check if profile is complete
    if not all([profile.get("name"), profile.get("degree"), profile.get("qualifications"), 
                profile.get("skills"), profile.get("cv_text")]):
        raise HTTPException(
            status_code=400,
            detail="Profile incomplete. Please fill all required fields including CV upload."
        )
    
    # Prepare profile data
    profile_data = {
        "name": profile.get("name"),
        "degree": profile.get("degree"),
        "qualifications": profile.get("qualifications"),
        "skills": profile.get("skills"),
        "cv_text": profile.get("cv_text")
    }
    
    # Call Gemini API
    gemini_service = GeminiService(profile.get("gemini_api_key"))
    try:
        career_paths = await gemini_service.search_career_path(profile_data, request.career_query)
        return {"career_paths": career_paths}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching career path: {str(e)}")

@app.get("/api/analyses")
async def get_analyses(current_user: dict = Depends(get_current_user)):
    analyses = await CareerAnalysisDB.find_by_user_id(current_user["user_id"])
    
    return {
        "analyses": [
            {
                "id": analysis.get("analysis_id"),
                "created_at": analysis.get("created_at").isoformat(),
                "result": json.loads(analysis.get("analysis_result_json"))
            }
            for analysis in analyses
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
