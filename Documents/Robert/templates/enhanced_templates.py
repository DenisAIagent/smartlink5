from typing import Dict, List, Optional
from enum import Enum
from pydantic import BaseModel
import json
from pathlib import Path

class TemplateType(str, Enum):
    FISHING_PLATFORM = "fishing-platform"
    ECOMMERCE_STRIPE = "ecommerce-stripe"
    BLOG_SEO = "blog-seo"
    REALTIME_CHAT = "realtime-chat"

class TemplateFeature(BaseModel):
    name: str
    description: str
    required_packages: List[str]
    implementation_steps: List[str]

class ProjectTemplate(BaseModel):
    name: str
    description: str
    features: List[TemplateFeature]
    default_config: Dict
    color_scheme: Dict
    dependencies: Dict[str, str]

class TemplateManager:
    def __init__(self):
        self.templates: Dict[str, ProjectTemplate] = self._load_templates()
    
    def _load_templates(self) -> Dict[str, ProjectTemplate]:
        """
        Charge les templates depuis les fichiers JSON
        """
        templates = {}
        template_dir = Path(__file__).parent / "templates"
        
        for template_file in template_dir.glob("*.json"):
            try:
                with open(template_file, "r") as f:
                    data = json.load(f)
                    template = ProjectTemplate(**data)
                    templates[template.name] = template
            except Exception as e:
                print(f"Erreur lors du chargement du template {template_file}: {str(e)}")
        
        return templates
    
    def get_template(self, template_type: str) -> Optional[ProjectTemplate]:
        """
        Récupère un template par son type
        """
        return self.templates.get(template_type)
    
    def get_all_templates(self) -> List[ProjectTemplate]:
        """
        Récupère tous les templates disponibles
        """
        return list(self.templates.values())
    
    def get_template_features(self, template_type: str) -> List[TemplateFeature]:
        """
        Récupère les fonctionnalités d'un template
        """
        template = self.get_template(template_type)
        return template.features if template else []
    
    def get_template_dependencies(self, template_type: str) -> Dict[str, str]:
        """
        Récupère les dépendances d'un template
        """
        template = self.get_template(template_type)
        return template.dependencies if template else {}

# Templates prédéfinis
FISHING_PLATFORM_TEMPLATE = {
    "name": "fishing-platform",
    "description": "Plateforme de pêche avec géolocalisation et suivi des spots",
    "features": [
        {
            "name": "Géolocalisation",
            "description": "Système de géolocalisation des spots de pêche",
            "required_packages": ["leaflet", "react-leaflet"],
            "implementation_steps": [
                "Intégration de Leaflet",
                "Création de la carte interactive",
                "Gestion des marqueurs"
            ]
        },
        {
            "name": "Météo",
            "description": "Intégration des données météorologiques",
            "required_packages": ["axios", "moment"],
            "implementation_steps": [
                "Connexion à l'API météo",
                "Affichage des prévisions",
                "Alertes météo"
            ]
        }
    ],
    "default_config": {
        "map_center": [46.603354, 1.888334],
        "zoom_level": 6,
        "weather_api_key": ""
    },
    "color_scheme": {
        "primary": "#1E88E5",
        "secondary": "#4CAF50",
        "accent": "#FFC107"
    },
    "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "leaflet": "^1.9.4",
        "react-leaflet": "^4.2.1",
        "axios": "^1.6.2",
        "moment": "^2.29.4"
    }
}

ECOMMERCE_STRIPE_TEMPLATE = {
    "name": "ecommerce-stripe",
    "description": "Boutique en ligne avec paiement Stripe",
    "features": [
        {
            "name": "Paiement Stripe",
            "description": "Intégration du système de paiement Stripe",
            "required_packages": ["@stripe/stripe-js", "@stripe/react-stripe-js"],
            "implementation_steps": [
                "Configuration de Stripe",
                "Création du panier",
                "Processus de paiement"
            ]
        },
        {
            "name": "Gestion des stocks",
            "description": "Système de gestion des stocks en temps réel",
            "required_packages": ["firebase", "react-firebase-hooks"],
            "implementation_steps": [
                "Configuration Firebase",
                "Création de la base de données",
                "Mise à jour en temps réel"
            ]
        }
    ],
    "default_config": {
        "stripe_public_key": "",
        "currency": "EUR",
        "tax_rate": 0.20
    },
    "color_scheme": {
        "primary": "#2196F3",
        "secondary": "#FF4081",
        "accent": "#FFC107"
    },
    "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "@stripe/stripe-js": "^2.2.0",
        "@stripe/react-stripe-js": "^2.1.0",
        "firebase": "^10.7.0",
        "react-firebase-hooks": "^5.1.1"
    }
}

# Initialisation du gestionnaire de templates
template_manager = TemplateManager()

# Ajout des templates prédéfinis
template_manager.templates.update({
    "fishing-platform": ProjectTemplate(**FISHING_PLATFORM_TEMPLATE),
    "ecommerce-stripe": ProjectTemplate(**ECOMMERCE_STRIPE_TEMPLATE)
}) 