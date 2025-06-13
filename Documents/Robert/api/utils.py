import logging
import json
from pathlib import Path
from typing import Dict, List, Optional
import shutil
import zipfile
from datetime import datetime
import asyncio
import os
import uuid
import subprocess
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# Configuration
WORKSPACE_DIR = os.path.join(os.getcwd(), "workspace")
LOGS_DIR = os.path.join(os.getcwd(), "logs")

os.makedirs(WORKSPACE_DIR, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)

# Logging
logging.basicConfig(level=logging.INFO)

@dataclass
class Job:
    id: str
    process: asyncio.subprocess.Process
    log_file: str
    status: str = "running"
    zip_path: Optional[str] = None
    progress: int = 0
    current_step: Optional[str] = None

jobs: Dict[str, Job] = {}

def setup_logging(log_dir: str = "logs") -> None:
    """
    Configure le système de logging
    """
    log_path = Path(log_dir)
    log_path.mkdir(exist_ok=True)
    
    # Configuration du fichier de log
    file_handler = logging.FileHandler(
        log_path / f"devcraft_{datetime.now().strftime('%Y%m%d')}.log"
    )
    file_handler.setFormatter(
        logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    )
    logger.addHandler(file_handler)

def create_project_archive(job_id: str, output_dir: str) -> str:
    """
    Crée une archive ZIP du projet généré
    """
    try:
        # Créer le dossier des archives s'il n'existe pas
        archive_dir = Path("archives")
        archive_dir.mkdir(exist_ok=True)
        
        # Chemin de l'archive
        archive_path = archive_dir / f"project_{job_id}.zip"
        
        # Créer l'archive
        with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file_path in Path(output_dir).rglob("*"):
                if file_path.is_file():
                    zipf.write(file_path, file_path.relative_to(output_dir))
        
        return str(archive_path)
    except Exception as e:
        logger.error(f"Erreur lors de la création de l'archive: {str(e)}")
        raise

def cleanup_old_archives(max_age_days: int = 7) -> None:
    """
    Nettoie les anciennes archives
    """
    try:
        archive_dir = Path("archives")
        if not archive_dir.exists():
            return
            
        current_time = datetime.now()
        for archive in archive_dir.glob("*.zip"):
            age = current_time - datetime.fromtimestamp(archive.stat().st_mtime)
            if age.days > max_age_days:
                archive.unlink()
                logger.info(f"Archive supprimée: {archive}")
    except Exception as e:
        logger.error(f"Erreur lors du nettoyage des archives: {str(e)}")

def validate_project_data(data: Dict) -> bool:
    """
    Valide les données du projet
    """
    required_fields = ["description", "features"]
    return all(field in data for field in required_fields)

def get_project_stats() -> Dict:
    """
    Récupère les statistiques des projets générés
    """
    try:
        stats = {
            "total_projects": 0,
            "successful_generations": 0,
            "failed_generations": 0,
            "template_usage": {}
        }
        
        # TODO: Implémenter la logique de statistiques
        return stats
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des statistiques: {str(e)}")
        return {}

async def start_generation(project_name: str, description: str) -> Job:
    """Lance la génération via main.py avec arguments CLI"""
    job_id = str(uuid.uuid4())
    
    # Nettoyer le nom du projet
    clean_name = "".join(c for c in project_name if c.isalnum() or c in "-_")[:50]
    
    try:
        # Lancer main.py avec le nom du projet en argument
        process = await asyncio.create_subprocess_exec(
            "python",
            "main.py",
            clean_name,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
            cwd=os.getcwd()
        )
        
        log_file = os.path.join(LOGS_DIR, f"{job_id}.log")
        job = Job(
            id=job_id, 
            process=process, 
            log_file=log_file,
            current_step="Initialisation"
        )
        jobs[job_id] = job
        
        # Démarrer la capture des logs
        asyncio.create_task(_monitor_generation(job, clean_name))
        
        logger.info(f"Job {job_id} started for project {clean_name}")
        return job
        
    except Exception as e:
        logger.error(f"Failed to start generation: {e}")
        raise

async def _monitor_generation(job: Job, project_name: str) -> None:
    """Monitore la génération et capture les logs avec progress tracking"""
    steps = [
        "Architecture", "Développement", "Code Review", 
        "Tests Fonctionnels", "Git Versioning"
    ]
    current_step_idx = 0
    
    try:
        with open(job.log_file, "w", encoding="utf-8") as f:
            while True:
                line = await job.process.stdout.readline()
                if not line:
                    break
                    
                line_str = line.decode('utf-8', errors='ignore')
                f.write(line_str)
                f.flush()
                
                # Tracking du progress basé sur les outputs CrewAI
                if any(step.lower() in line_str.lower() for step in steps):
                    for i, step in enumerate(steps):
                        if step.lower() in line_str.lower():
                            current_step_idx = max(current_step_idx, i)
                            job.current_step = step
                            job.progress = int((current_step_idx + 1) / len(steps) * 100)
                            break
        
        # Attendre la fin du processus
        await job.process.wait()
        
        if job.process.returncode == 0:
            job.status = "completed"
            job.progress = 100
            job.current_step = "Terminé"
            
            # Créer le ZIP
            await _create_project_zip(job, project_name)
        else:
            job.status = "error"
            job.current_step = "Erreur"
            
    except Exception as e:
        logger.error(f"Error monitoring job {job.id}: {e}")
        job.status = "error"
        job.current_step = "Erreur système"

async def _create_project_zip(job: Job, project_name: str) -> None:
    """Crée le ZIP du projet généré"""
    try:
        project_path = os.path.join(WORKSPACE_DIR, project_name)
        if os.path.exists(project_path):
            # Créer le ZIP de manière asynchrone
            loop = asyncio.get_event_loop()
            zip_path = await loop.run_in_executor(
                None, 
                shutil.make_archive, 
                project_path, 
                'zip', 
                project_path
            )
            job.zip_path = zip_path
            logger.info(f"ZIP created for job {job.id}: {zip_path}")
    except Exception as e:
        logger.error(f"Failed to create ZIP for job {job.id}: {e}")

def analyze_project_intelligent(description: str, features: list[str]) -> dict:
    """Analyse intelligente du projet basée sur le contexte"""
    desc_lower = description.lower()
    
    # Détection du type de projet
    project_type = "Application Web Générique"
    tech_stack = ["React", "Vite", "Node.js", "Express"]
    recommendations = []
    color_palette = None
    
    # === DÉTECTIONS SPÉCIALISÉES ===
    
    # Pêche/Nautique
    if any(word in desc_lower for word in ["pêch", "peche", "fish", "nautique", "mer", "océan", "boat"]):
        project_type = "Plateforme Communautaire de Pêche"
        color_palette = {
            "primary": "#1e40af",     # Bleu océan profond
            "secondary": "#059669",   # Vert aquatique
            "accent": "#0284c7",      # Bleu ciel
            "neutral": "#64748b",     # Gris ardoise
            "success": "#10b981"      # Vert émeraude
        }
        tech_stack.extend(["Google Maps API", "Weather API"])
        recommendations.extend([
            {
                "title": "Géolocalisation Marine",
                "description": "Carte interactive avec spots de pêche, conditions météo et marées",
                "priority": "high"
            },
            {
                "title": "Design Thématique",
                "description": "Interface avec palette océan, iconographie nautique et animations fluides",
                "priority": "medium"
            },
            {
                "title": "Communauté Sociale",
                "description": "Système de partage de prises, organisation de sorties et forums",
                "priority": "medium"
            }
        ])
    
    # E-commerce
    elif any(word in desc_lower for word in ["boutique", "vente", "e-commerce", "shop", "achat", "produit"]):
        project_type = "Boutique E-commerce"
        tech_stack.extend(["Stripe", "Inventory System", "Payment Gateway"])
        recommendations.extend([
            {
                "title": "Paiement Sécurisé",
                "description": "Intégration Stripe complète avec gestion taxes et expéditions",
                "priority": "high"
            },
            {
                "title": "Gestion Stock",
                "description": "Système d'inventaire automatisé avec alertes de rupture",
                "priority": "high"
            }
        ])
    
    # Blog/CMS
    elif any(word in desc_lower for word in ["blog", "article", "contenu", "cms", "écrire"]):
        project_type = "Plateforme de Contenu"
        tech_stack.extend(["CMS", "SEO Tools", "Rich Text Editor"])
        recommendations.append({
            "title": "SEO Avancé",
            "description": "Optimisation automatique pour moteurs de recherche",
            "priority": "high"
        })
    
    # Dating/Rencontre
    elif any(word in desc_lower for word in ["rencontre", "dating", "match", "profil", "célibataire"]):
        project_type = "Plateforme de Rencontres"
        tech_stack.extend(["Matching Algorithm", "Real-time Chat", "Photo Upload"])
        recommendations.extend([
            {
                "title": "Algorithme de Matching",
                "description": "Système de compatibilité basé sur les intérêts communs",
                "priority": "high"
            },
            {
                "title": "Chat Sécurisé",
                "description": "Messagerie chiffrée avec modération automatique",
                "priority": "high"
            }
        ])
    
    # === AJOUT DES FEATURES SÉLECTIONNÉES ===
    feature_mapping = {
        "realtime": ("Socket.io", "WebSocket Real-time"),
        "payments": ("Stripe Payment", "Payment Processing"),
        "auth": ("JWT Auth", "User Authentication"),
        "database": ("MongoDB", "Data Persistence"),
        "admin": ("Admin Panel", "Content Management"),
        "api": ("REST API", "API Documentation")
    }
    
    for feature in features:
        if feature in feature_mapping:
            tech_name, tech_desc = feature_mapping[feature]
            if tech_name not in tech_stack:
                tech_stack.append(tech_name)
    
    # === CALCUL DE LA COMPLEXITÉ ===
    complexity_score = len(features) + (2 if "realtime" in features else 0)
    
    if complexity_score <= 2:
        complexity = "Simple"
        estimated_time = "1-2 heures"
    elif complexity_score <= 4:
        complexity = "Modéré"
        estimated_time = "2-3 heures"
    else:
        complexity = "Complexe"
        estimated_time = "3-4 heures"
    
    return {
        "project_type": project_type,
        "tech_stack": tech_stack,
        "recommendations": recommendations,
        "complexity": complexity,
        "estimated_time": estimated_time,
        "color_palette": color_palette
    } 