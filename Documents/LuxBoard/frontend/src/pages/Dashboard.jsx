import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { Search, Plus, Gift, Calendar } from 'react-feather';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');

  const filters = [
    'Tous', 'Restaurants', 'Hôtels', 'Spa & Bien-être',
    'Événements', 'Offres Privilèges', 'Paris', 'Lyon', 'Côte d\'Azur'
  ];

  const providers = [
    {
      category: 'Restaurant ⭐⭐⭐',
      title: 'Le Meurice Alain Ducasse',
      description: 'Expérience gastronomique d\'exception au cœur de Paris, cuisine créative et service impeccable.',
      tags: ['Gastronomique', 'Paris 1er', 'Réservation privilège']
    },
    {
      category: 'Hôtel 5⭐',
      title: 'Hôtel Plaza Athénée',
      description: 'Palace parisien emblématique offrant luxe, élégance et vue sur les Champs-Élysées.',
      tags: ['Palace', 'Avenue Montaigne', 'Spa Dior']
    },
    {
      category: 'Spa & Bien-être',
      title: 'Spa Nuxe Montorgueil',
      description: 'Oasis de détente au cœur de Paris, soins personnalisés et atmosphère zen garantie.',
      tags: ['Détente', 'Soins premium', '7j/7']
    }
  ];

  const privileges = [
    {
      title: 'Dîner privilège',
      description: 'Le Bristol - Menu dégustation -20%',
      status: 'active'
    },
    {
      title: 'Weekend Spa',
      description: 'Four Seasons - Package détente',
      status: 'expires-soon'
    }
  ];

  const events = [
    {
      title: 'Exposition Privée',
      description: 'Galerie Perrotin - Art Contemporain',
      date: '15 Juin 2025'
    },
    {
      title: 'Dégustation Privée',
      description: 'Champagne Krug - Soirée exclusive',
      date: '22 Juin 2025'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Votre Conciergerie de Luxe
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez les meilleurs prestataires, offres privilèges et événements exclusifs pour vos clients les plus exigeants.
          </p>
        </section>

        {/* Search Section */}
        <section className="bg-white rounded-2xl p-8 shadow-sm mb-12 animate-fade-in">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              placeholder="Rechercher un prestataire, une offre ou un événement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  activeFilter === filter
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-500'
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Ajouter un Prestataire</h3>
            <p className="text-gray-600 text-sm">
              Recommandez un nouveau prestataire de qualité à notre équipe éditoriale.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Gift className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Offres Privilèges</h3>
            <p className="text-gray-600 text-sm">
              Consultez les dernières offres exclusives pour vos clients VIP.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Événements Exclusifs</h3>
            <p className="text-gray-600 text-sm">
              Découvrez les événements privés et expériences uniques.
            </p>
          </div>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-semibold mb-8">Prestataires Recommandés</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {providers.map((provider, index) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                    <div className="h-48 bg-gradient-to-r from-gray-100 to-gray-200"></div>
                    <div className="p-6">
                      <div className="text-indigo-600 text-sm font-medium mb-2">{provider.category}</div>
                      <h3 className="text-lg font-semibold mb-2">{provider.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{provider.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {provider.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Offres Privilèges Widget */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Offres Privilèges</h3>
              <div className="space-y-4">
                {privileges.map((privilege, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      privilege.status === 'active'
                        ? 'bg-green-50 border-green-500'
                        : 'bg-orange-50 border-orange-500'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <strong className="text-sm">{privilege.title}</strong>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          privilege.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {privilege.status === 'active' ? 'Actif' : 'Expire bientôt'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{privilege.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Événements Widget */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Événements à Venir</h3>
              <div className="space-y-4">
                {events.map((event, index) => (
                  <div key={index} className="p-4 bg-indigo-50 rounded-lg">
                    <strong className="text-sm text-indigo-600 block mb-1">{event.title}</strong>
                    <p className="text-sm text-gray-600 mb-1">{event.description}</p>
                    <small className="text-gray-500">{event.date}</small>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistiques Widget */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Votre Activité</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">247</div>
                  <small className="text-gray-600">Prestataires</small>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">18</div>
                  <small className="text-gray-600">Offres actives</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 