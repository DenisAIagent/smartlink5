from fastapi import FastAPI, WebSocket, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Dict, Optional, List
import asyncio
import json
import subprocess
import uuid
from datetime import datetime
import logging
from pathlib import Path
import os
from .models import (
    AnalyzeRequest, AnalysisResponse, GenerateRequest, 
    GenerateResponse, StatusResponse, ErrorResponse
)
from .utils import start_generation, jobs, analyze_project_intelligent

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="DevCraft AI API",
    description="API intelligente pour génération d'applications",
    version="1.0.0",
    docs_url="/docs"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir les fichiers statiques (frontend)
if os.path.exists("frontend"):
    app.mount("/static", StaticFiles(directory="frontend"), name="static")

# Modèles Pydantic
class ProjectData(BaseModel):
    description: str
    features: List[str]
    template_type: Optional[str] = None
    additional_params: Optional[Dict] = {}

class JobStatus(BaseModel):
    job_id: str
    status: str
    progress: float
    message: str
    created_at: datetime
    updated_at: datetime

# Stockage en mémoire des jobs (à remplacer par une base de données en production)
active_jobs: Dict[str, JobStatus] = {}

@app.get("/")
async def root():
    """Page d'accueil avec redirection vers l'interface"""
    return {"message": "DevCraft AI API", "docs": "/docs", "interface": "/static/index.html"}

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_project(request: AnalyzeRequest) -> AnalysisResponse:
    """Analyse intelligente du projet utilisateur"""
    try:
        logger.info(f"Analyzing project: {request.description[:100]}...")
        
        analysis = analyze_project_intelligent(request.description, request.features)
        
        return AnalysisResponse(
            project_type=analysis["project_type"],
            tech_stack=analysis["tech_stack"],
            recommendations=[
                {"title": r["title"], "description": r["description"], "priority": r["priority"]}
                for r in analysis["recommendations"]
            ],
            complexity=analysis["complexity"],
            estimated_time=analysis["estimated_time"],
            color_palette=analysis.get("color_palette")
        )
        
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur d'analyse: {str(e)}")

@app.post("/api/generate", response_model=GenerateResponse)
async def generate_project(request: GenerateRequest) -> GenerateResponse:
    """Lance la génération d'application via CrewAI"""
    try:
        logger.info(f"Starting generation for: {request.project_name}")
        
        job = await start_generation(request.project_name, request.description)
        
        return GenerateResponse(
            job_id=job.id,
            estimated_duration="2-4 heures selon la complexité",
            message=f"Génération lancée pour '{request.project_name}'",
            project_name=request.project_name
        )
        
    except Exception as e:
        logger.error(f"Generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur de génération: {str(e)}")

@app.get("/api/status/{job_id}", response_model=StatusResponse)
async def get_job_status(job_id: str) -> StatusResponse:
    """Récupère le statut d'un job de génération"""
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job non trouvé")
    
    return StatusResponse(
        job_id=job.id,
        status=job.status,
        progress=job.progress,
        current_step=job.current_step,
        logs_available=os.path.exists(job.log_file)
    )

@app.get("/api/logs/{job_id}")
async def stream_job_logs(job_id: str) -> StreamingResponse:
    """Stream les logs de génération en temps réel"""
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job non trouvé")
    
    async def log_generator():
        last_position = 0
        while True:
            try:
                if os.path.exists(job.log_file):
                    with open(job.log_file, "r", encoding="utf-8") as f:
                        f.seek(last_position)
                        new_content = f.read()
                        if new_content:
                            last_position = f.tell()
                            yield f"data: {new_content}\n\n"
                
                if job.status in ("completed", "error"):
                    yield f"data: [STREAM_END]\n\n"
                    break
                    
                await asyncio.sleep(1)
                
            except Exception as e:
                logger.error(f"Log streaming error: {e}")
                yield f"data: [ERROR] {str(e)}\n\n"
                break
    
    return StreamingResponse(
        log_generator(), 
        media_type="text/plain",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

@app.get("/api/download/{job_id}")
async def download_project(job_id: str) -> FileResponse:
    """Télécharge le projet généré en ZIP"""
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job non trouvé")
    
    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Projet non terminé")
    
    if not job.zip_path or not os.path.exists(job.zip_path):
        raise HTTPException(status_code=404, detail="Archive non disponible")
    
    return FileResponse(
        job.zip_path,
        filename=f"devcraft-project-{job_id[:8]}.zip",
        media_type="application/zip"
    )

@app.get("/api/jobs")
async def list_jobs():
    """Liste tous les jobs (debug)"""
    return {
        "jobs": [
            {
                "id": job.id,
                "status": job.status,
                "progress": job.progress,
                "current_step": job.current_step
            }
            for job in jobs.values()
        ]
    }

# Health check
@app.get("/health")
async def health_check():
    """Vérification de santé de l'API"""
    return {"status": "healthy", "service": "DevCraft AI API"}

@app.websocket("/api/logs/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    """
    Stream des logs en temps réel
    """
    await websocket.accept()
    try:
        while True:
            if job_id not in active_jobs:
                await websocket.send_json({"error": "Job non trouvé"})
                break
                
            status = active_jobs[job_id]
            await websocket.send_json(status.dict())
            
            if status.status in ["completed", "failed"]:
                break
                
            await asyncio.sleep(1)
    except Exception as e:
        logger.error(f"Erreur WebSocket: {str(e)}")
    finally:
        await websocket.close()

async def run_generation(job_id: str, project_data: ProjectData):
    """
    Exécute main.py en arrière-plan
    """
    try:
        # Mettre à jour le statut
        active_jobs[job_id].status = "running"
        active_jobs[job_id].message = "Génération en cours..."
        
        # Préparer les arguments pour main.py
        args = [
            "python",
            "main.py",
            "--description", project_data.description,
            "--features", ",".join(project_data.features)
        ]
        
        if project_data.template_type:
            args.extend(["--template", project_data.template_type])
            
        # Exécuter main.py
        process = subprocess.Popen(
            args,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Lire la sortie en temps réel
        while True:
            output = process.stdout.readline()
            if output == '' and process.poll() is not None:
                break
            if output:
                # Mettre à jour le statut avec les logs
                active_jobs[job_id].message = output.strip()
                active_jobs[job_id].updated_at = datetime.now()
        
        # Vérifier le code de retour
        if process.returncode == 0:
            active_jobs[job_id].status = "completed"
            active_jobs[job_id].progress = 100.0
            active_jobs[job_id].message = "Génération terminée avec succès"
        else:
            active_jobs[job_id].status = "failed"
            active_jobs[job_id].message = "Erreur lors de la génération"
            
    except Exception as e:
        logger.error(f"Erreur lors de la génération: {str(e)}")
        active_jobs[job_id].status = "failed"
        active_jobs[job_id].message = f"Erreur: {str(e)}"
    finally:
        active_jobs[job_id].updated_at = datetime.now()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 