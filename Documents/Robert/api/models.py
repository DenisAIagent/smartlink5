from pydantic import BaseModel, Field, field_validator
from typing import Dict, List, Optional
from datetime import datetime
from enum import Enum

class TemplateType(str, Enum):
    FISHING_PLATFORM = "fishing-platform"
    ECOMMERCE_STRIPE = "ecommerce-stripe"
    BLOG_SEO = "blog-seo"
    REALTIME_CHAT = "realtime-chat"

class ProjectData(BaseModel):
    description: str = Field(..., min_length=10, description="Description détaillée du projet")
    features: List[str] = Field(..., min_length=1, description="Liste des fonctionnalités requises")
    template_type: Optional[TemplateType] = Field(None, description="Type de template à utiliser")
    additional_params: Optional[Dict] = Field(default_factory=dict, description="Paramètres additionnels")

class JobStatus(BaseModel):
    job_id: str = Field(..., description="Identifiant unique du job")
    status: str = Field(..., description="Statut actuel du job")
    progress: float = Field(..., ge=0, le=100, description="Progression en pourcentage")
    message: str = Field(..., description="Message de statut actuel")
    created_at: datetime = Field(..., description="Date de création")
    updated_at: datetime = Field(..., description="Dernière mise à jour")

class AnalysisResult(BaseModel):
    status: str = Field(..., description="Statut de l'analyse")
    suggested_features: List[str] = Field(default_factory=list, description="Fonctionnalités suggérées")
    template_recommendation: Optional[TemplateType] = Field(None, description="Template recommandé")
    confidence_score: float = Field(..., ge=0, le=1, description="Score de confiance de l'analyse")

class ProjectRecommendation(BaseModel):
    title: str
    description: str
    priority: str = Field(default="medium", pattern="^(low|medium|high)$")  # FIX: regex → pattern

class AnalyzeRequest(BaseModel):
    description: str = Field(..., min_length=20, description="Description détaillée du projet")
    features: List[str] = Field(default=[], description="Features sélectionnées")
    
    @field_validator('description')  # FIX: @validator → @field_validator
    @classmethod
    def description_must_be_meaningful(cls, v):
        if len(v.strip()) < 20:
            raise ValueError('La description doit contenir au moins 20 caractères')
        return v.strip()

class AnalysisResponse(BaseModel):
    project_type: str
    tech_stack: List[str]
    recommendations: List[ProjectRecommendation]
    complexity: str
    estimated_time: str
    color_palette: Optional[Dict[str, str]] = None

class GenerateRequest(BaseModel):
    project_name: str = Field(..., pattern="^[a-zA-Z0-9][a-zA-Z0-9-_]{2,49}$")  # FIX: regex → pattern
    description: str = Field(..., min_length=20)
    features: List[str] = Field(default=[])
    template_type: str = "webapp-basic"
    
    @field_validator('project_name')  # FIX: @validator → @field_validator
    @classmethod
    def project_name_valid(cls, v):
        if not v or len(v) < 3:
            raise ValueError('Le nom du projet doit contenir au moins 3 caractères')
        return v.lower().replace(' ', '-')

class GenerateResponse(BaseModel):
    job_id: str
    estimated_duration: str
    message: str
    project_name: str

class StatusResponse(BaseModel):
    job_id: str
    status: str = Field(..., pattern="^(running|completed|error)$")  # FIX: regex → pattern
    progress: int = Field(default=0, ge=0, le=100)
    current_step: Optional[str] = None
    logs_available: bool = True
    estimated_completion: Optional[str] = None

class ErrorResponse(BaseModel):
    error: str
    details: Optional[str] = None
    job_id: Optional[str] = None
