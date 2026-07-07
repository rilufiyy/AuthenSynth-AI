from fastapi import FastAPI, HTTPException, BackgroundTasks
from typing import Optional, Dict, Any, List
from fastapi.middleware.cors import CORSMiddleware
from app.models.schemas import DetectRequest, DetectResponse
import os

app = FastAPI(title="AuthenSynth AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/v1/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.post("/v1/detect", response_model=DetectResponse)
async def detect_content(request: DetectRequest):
    if request.modality not in ["text", "image", "audio", "video", "code"]:
        raise HTTPException(status_code=400, detail="Invalid modality")
        
    from app.reasoning.openai_agent import analyze_content
    result = await analyze_content(request.content, request.modality)
    return result