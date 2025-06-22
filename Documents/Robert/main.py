#!/usr/bin/env python3
"""
DevCraft AI - Générateur d'Applications Intelligentes
Backend FastAPI avec interface React intégrée
"""

import os
import sys
from pathlib import Path

# Configuration du path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
import uvicorn
from contextlib import asynccontextmanager

# Import des modules API
from api.server import app as api_app
from api.models import *
from api.utils import setup_logging, cleanup_old_archives

# Configuration de l'environnement
ENVIRONMENT = os.getenv("RAILWAY_ENVIRONMENT", "development")
PORT = int(os.getenv("PORT", 8000))
HOST = "0.0.0.0"

# Configuration des répertoires
STATIC_DIR = project_root / "dist"
LOGS_DIR = project_root / "logs"
WORKSPACE_DIR = project_root / "workspace"
ARCHIVES_DIR = project_root / "archives"

# Créer les répertoires nécessaires
for directory in [LOGS_DIR, WORKSPACE_DIR, ARCHIVES_DIR]:
    directory.mkdir(exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestion du cycle de vie de l'application"""
    # Startup
    setup_logging(str(LOGS_DIR))
    print("🚀 DevCraft AI Backend démarré")
    print(f"📡 API disponible sur: http://{HOST}:{PORT}/api")
    print(f"🔍 Health check: http://{HOST}:{PORT}/health")
    
    if ENVIRONMENT != "production":
        print("🎨 Frontend Dev: http://localhost:5173")
    
    yield
    
    # Shutdown
    cleanup_old_archives()
    print("👋 DevCraft AI Backend arrêté")

# Création de l'application principale
app = FastAPI(
    title="DevCraft AI",
    description="Générateur d'Applications Intelligentes",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs" if ENVIRONMENT != "production" else None,
    redoc_url="/api/redoc" if ENVIRONMENT != "production" else None
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if ENVIRONMENT != "production" else ["https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montage de l'API
app.mount("/api", api_app)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Endpoint de santé pour Railway"""
    return {
        "status": "healthy",
        "service": "DevCraft AI",
        "version": "2.0.0",
        "environment": ENVIRONMENT,
        "timestamp": "2024-12-10T12:00:00Z"
    }

# Configuration pour servir le frontend
if STATIC_DIR.exists():
    # Servir les fichiers statiques
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR / "assets")), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Servir le frontend React"""
        file_path = STATIC_DIR / full_path
        
        # Si le fichier existe, le servir
        if file_path.is_file():
            return FileResponse(file_path)
        
        # Sinon, servir index.html pour le routing React
        index_path = STATIC_DIR / "index.html"
        if index_path.exists():
            return FileResponse(index_path)
        
        return HTMLResponse("Frontend not built. Run 'npm run build' first.")
else:
    @app.get("/")
    async def development_info():
        """Info de développement quand le frontend n'est pas build"""
        return {
            "message": "DevCraft AI Backend",
            "status": "development",
            "frontend_dev": "http://localhost:5173",
            "api_docs": f"http://{HOST}:{PORT}/api/docs",
            "health": f"http://{HOST}:{PORT}/health"
        }

if __name__ == "__main__":
    # Configuration pour le développement local
    config = {
        "host": HOST,
        "port": PORT,
        "reload": ENVIRONMENT != "production",
        "log_level": "info",
        "access_log": True
    }
    
    print(f"🚀 Démarrage de DevCraft AI sur {HOST}:{PORT}")
    uvicorn.run("main:app", **config)
