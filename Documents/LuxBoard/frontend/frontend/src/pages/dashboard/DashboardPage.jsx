import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  Gift, 
  Calendar, 
  Star,
  MapPin,
  Clock,
  TrendingUp,
  Users,
  Award,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [isLoading, setIsLoading] = useState(true);

  const filters = [
    'Tous', 'Restaurants', 'Hôtels', 'Spa & Bien-être', 
    'Événements', 'Offres Privilèges', 'Paris', 'Lyon', 'Côte d\'Azur'
  ];

  const quickActions = [
    {
      title: 'Ajouter un Prestataire',
      description: 'Recommandez un nouveau prestataire de qualité à notre équipe éditoriale.',
      icon: Plus,
      gradient: 'from-blue-500 to-purple-600',
      link: '/providers/add'
    },
    {
      title: 'Offres Privilèges',
      description: 'Consultez les dernières offres exclusives pour vos clients VIP.',
      icon: Gift,
      gradient: 'from-pink-500 to-rose-600',
      link: '/offers'
    },
    {
      title: 'Événements Exclusifs',
      description: 'Découvrez les événements privés et expériences uniques.',
      icon: Calendar,
      gradient: 'from-cyan-500 to-blue-600',
      link: '/events'
    }
  ];

  const providers = [
    {
      id: 1,
      name: 'Le Meurice Alain Ducasse',
      category: 'Restaurant ⭐⭐⭐',
      description: 'Expérience gastronomique d\'exception au cœur de Paris, cuisine créative et service impeccable.',
      location: 'Paris 1er',
      tags: ['Gastronomique', 'Réservation privilège'],
      rating: 4.9,
      image: 'restaurant',
      status: 'active'
    },
    {
      id: 2,
      name: 'Hôtel Plaza Athénée',
      category: 'Hôtel 5⭐',
      description: 'Palace parisien emblématique offrant luxe, élégance et vue sur les Champs-Élysées.',
      location: 'Avenue Montaigne',
      tags: ['Palace', 'Spa Dior'],
      rating: 4.8,
      image: 'hotel',
      status: 'active'
    },
    {
      id: 3,
      name: 'Spa Guerlain',
      category: 'Spa & Bien-être',
      description: 'Sanctuaire de bien-être avec soins signature et rituels personnalisés.',
      location: 'Champs-Élysées',
      tags: ['Soins premium', 'Détente'],
      rating: 4.7,
      image: 'spa',
      status: 'expires-soon'
    },
    {
      id: 4,
      name: 'Yacht Club Monaco',
      category: 'Nautique ⭐⭐⭐',
      description: 'Expériences nautiques exclusives en Méditerranée avec service de conciergerie.',
      location: 'Monaco',
      tags: ['Yacht', 'Méditerranée'],
      rating: 4.9,
      image: 'yacht',
      status: 'active'
    }
  ];

  const stats = [
    { label: 'Prestataires Actifs', value: '127', icon: Award, color: 'text-blue-600' },
    { label: 'Offres Disponibles', value: '43', icon: Gift, color: 'text-green-600' },
    { label: 'Événements ce Mois', value: '12', icon: Calendar, color: 'text-purple-600' },
    { label: 'Membres Connectés', value: '2.4k', icon: Users, color: 'text-orange-600' }
  ];

  useEffect(() => {
    // Simulation du chargement
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const getImageGradient = (type) => {
    const gradients = {
      restaurant: 'from-yellow-100 to-yellow-200',
      hotel: 'from-blue-100 to-blue-200',
      spa: 'from-green-100 to-green-200',
      yacht: 'from-purple-100 to-purple-200'
    };
    return gradients[type] || 'from-gray-100 to-gray-200';
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
          ACTIF
        </span>
      );
    }
    if (status === 'expires-soon') {
      return (
        <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
          EXPIRE BIENTÔT
        </span>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-8 py-8">
        {/* Hero Section */}
        <section className="mb-12 animate-fade-in-up">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-4">
              Votre Conciergerie de Luxe
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez les meilleurs prestataires, offres privilèges et événements exclusifs 
              pour vos clients les plus exigeants.
            </p>
          </div>
        </section>

        {/* Search Section */}
        <section className="bg-white rounded-2xl p-8 shadow-lg mb-8 animate-fade-in-up">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un prestataire, une offre ou un événement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl text-lg focus:outline-none focus:border-yellow-400 focus:bg-white transition-all"
            />
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeFilter === filter
                    ? 'bg-yellow-500 text-white shadow-lg'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-yellow-50 hover:border-yellow-300'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-12 animate-fade-in-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions Rapides</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="card-luxury group"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{action.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-lg animate-fade-in-up">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Prestataires Recommandés</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <TrendingUp className="w-4 h-4" />
                  Mis à jour il y a 2h
                </div>
              </div>
              
              <div className="grid gap-6">
                {providers.map((provider) => (
                  <div key={provider.id} className="card-provider">
                    <div className="flex">
                      {/* Image */}
                      <div className={`w-32 h-32 bg-gradient-to-br ${getImageGradient(provider.image)} flex-shrink-0 flex items-center justify-center`}>
                        <div className="text-4xl opacity-50">
                          {provider.image === 'restaurant' && '🍽️'}
                          {provider.image === 'hotel' && '🏨'}
                          {provider.image === 'spa' && '🧘'}
                          {provider.image === 'yacht' && '⛵'}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-sm font-semibold text-blue-600 mb-1">
                              {provider.category}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {provider.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {provider.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                {provider.rating}
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(provider.status)}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                          {provider.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {provider.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Widget */}
            <div className="bg-white rounded-2xl p-6 shadow-lg animate-fade-in-up">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Statistiques
              </h3>
              <div className="space-y-4">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <span className="text-sm text-gray-600">{stat.label}</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-lg animate-fade-in-up">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Activité Récente
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900 font-medium">Nouveau prestataire ajouté</p>
                    <p className="text-xs text-gray-500">Le Bristol Paris - il y a 2h</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900 font-medium">Offre privilège activée</p>
                    <p className="text-xs text-gray-500">Spa Guerlain -20% - il y a 4h</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900 font-medium">Événement programmé</p>
                    <p className="text-xs text-gray-500">Dégustation privée - demain</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl p-6 shadow-lg animate-fade-in-up">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Liens Rapides</h3>
              <div className="space-y-3">
                <Link to="/providers" className="block text-sm text-blue-600 hover:text-blue-800 transition-colors">
                  → Tous les prestataires
                </Link>
                <Link to="/offers" className="block text-sm text-blue-600 hover:text-blue-800 transition-colors">
                  → Offres privilèges
                </Link>
                <Link to="/events" className="block text-sm text-blue-600 hover:text-blue-800 transition-colors">
                  → Événements exclusifs
                </Link>
                <Link to="/profile" className="block text-sm text-blue-600 hover:text-blue-800 transition-colors">
                  → Mon profil
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

