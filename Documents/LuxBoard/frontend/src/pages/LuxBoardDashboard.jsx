import React, { useState } from 'react';
import { Search, Plus, Gift, Calendar, Star, MapPin, Phone, Mail, Crown, ChevronRight, Users, Clock, Award, Filter } from 'lucide-react';

export default function LuxBoardDashboard() {
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = [
    'Tous', 'Restaurants', 'Hôtels', 'Spa & Bien-être', 'Événements', 'Offres Privilèges', 'Paris', 'Lyon', 'Côte d\'Azur'
  ];

  const privilegeOffers = [
    {
      title: "Dîner Michelin Privilégié",
      restaurant: "Le Meurice Alain Ducasse",
      discount: "-30%",
      location: "Paris 1er",
      rating: 5,
      category: "Restaurant",
      validUntil: "31 Déc 2025"
    },
    {
      title: "Suite Upgrade Garanti",
      restaurant: "Hôtel Plaza Athénée",
      discount: "Gratuit",
      location: "Paris 8ème",
      rating: 5,
      category: "Hôtel",
      validUntil: "30 Juin 2025"
    },
    {
      title: "Spa Package VIP",
      restaurant: "Four Seasons George V",
      discount: "-40%",
      location: "Paris 8ème",
      rating: 5,
      category: "Spa",
      validUntil: "15 Mars 2025"
    },
    {
      title: "Table Privée Exclusive",
      restaurant: "L'Ambroisie",
      discount: "Réservé",
      location: "Paris 4ème",
      rating: 5,
      category: "Restaurant",
      validUntil: "Permanent"
    }
  ];

  const quickActions = [
    {
      title: "Ajouter un Prestataire",
      description: "Recommandez un nouveau prestataire de qualité à notre équipe éditoriale.",
      icon: Plus,
      color: "bg-blue-500",
      action: "recommend"
    },
    {
      title: "Offres Privilèges",
      description: "Consultez les dernières offres exclusives pour vos clients VIP.",
      icon: Gift,
      color: "bg-pink-500",
      action: "privileges"
    },
    {
      title: "Événements Exclusifs",
      description: "Découvrez les événements privés et expériences uniques.",
      icon: Calendar,
      color: "bg-blue-400",
      action: "events"
    }
  ];

  const recentActivity = [
    {
      type: "reservation",
      text: "Nouvelle réservation chez Le Bristol confirmée",
      time: "Il y a 2h",
      client: "M. Dubois"
    },
    {
      type: "privilege",
      text: "Nouveau privilège disponible : Spa Shangri-La",
      time: "Il y a 4h",
      client: null
    },
    {
      type: "event",
      text: "Invitation gala privé Cartier ajoutée",
      time: "Hier",
      client: null
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">{/* ...tout le code fourni par l'utilisateur... */}</div>
  );
} 