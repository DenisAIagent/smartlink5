import React, { useState } from 'react';
import { Star, Check, Shield, Clock, Award, Search, Zap, Users, Brain, Calendar, MapPin, Crown, ArrowRight, PlayCircle, ChevronDown } from 'lucide-react';

export default function LuxBoardLanding() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: ''
  });

  const [activeTab, setActiveTab] = useState('search');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Merci pour votre demande d\'essai gratuit !');
  };

  const features = [
    {
      id: 'search',
      icon: Search,
      title: 'Recherche Instantanée',
      description: 'Base de données évolutive de prestataires premium triés sur le volet',
      details: 'Hôtels, restaurants, artisans d\'exception, services à la personne - tous vérifiés selon nos standards Michelin.'
    },
    {
      id: 'privileges',
      icon: Crown,
      title: 'Privilèges Confidentiels',
      description: 'Tarifs négociés, fast-pass et invitations privées réservés aux membres',
      details: 'Accédez à des conditions exclusives négociées spécialement pour notre communauté de professionnels.'
    },
    {
      id: 'events',
      icon: Calendar,
      title: 'Événements Exclusifs',
      description: 'Dashboard élégant des galas, dîners privés et vernissages du mois',
      details: 'Découvrez les événements les plus prisés et offrez à vos clients des expériences inoubliables.'
    },
    {
      id: 'ai',
      icon: Brain,
      title: 'IA Intégrée',
      description: 'Suggestions intelligentes de professionnels en temps réel',
      details: 'Notre IA connectée à Perplexity détecte automatiquement des contacts pertinents selon vos besoins.'
    }
  ];

  const testimonials = [
    {
      name: "Marie-Claire Dubois",
      role: "Concierge Hôtel Plaza Athénée",
      text: "LuxBoard a révolutionné ma façon de travailler. Je trouve en 2 minutes ce qui me prenait 2 heures avant.",
      rating: 5
    },
    {
      name: "Antoine Moreau",
      role: "Assistant Personnel Privé",
      text: "Les privilèges négociés nous permettent d'offrir l'impossible à nos clients. Un vrai game-changer.",
      rating: 5
    },
    {
      name: "Sophie Landry",
      role: "Directrice Agence Luxury Services",
      text: "L'interface est d'une élégance rare. Nos équipes l'ont adoptée immédiatement.",
      rating: 5
    }
  ];

  const stats = [
    { number: "500+", label: "Prestataires Vérifiés" },
    { number: "150+", label: "Privilèges Exclusifs" },
    { number: "98%", label: "Satisfaction Client" },
    { number: "2h", label: "Économisées par Jour" }
  ];

  return (
    <div className="min-h-screen bg-white">{/* ...tout le code... */}</div>
  );
} 