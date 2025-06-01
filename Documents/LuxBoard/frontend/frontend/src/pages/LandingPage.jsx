import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  Users, 
  Calendar, 
  Gift, 
  ArrowRight, 
  Play,
  Shield,
  Crown,
  Sparkles,
  Search,
  Filter,
  Plus
} from 'lucide-react';

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-bg min-h-screen flex items-center relative">
        <div className="container mx-auto px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <div className={`space-y-8 ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
              <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold border border-yellow-200">
                <Sparkles className="w-4 h-4" />
                Conciergerie de Luxe Premium
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight gradient-text">
                Votre Conciergerie de Luxe Personnalisée
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Accédez à un monde d'expériences exclusives, de prestataires premium et d'événements privés. 
                LuxBoard transforme vos désirs en réalité.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login" className="btn-luxury">
                  <Crown className="w-5 h-5" />
                  Accéder à mon espace
                  <ArrowRight className="w-5 h-5" />
                </Link>
                
                <button className="btn-secondary">
                  <Play className="w-5 h-5" />
                  Découvrir LuxBoard
                </button>
              </div>
              
              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Prestataires Premium</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">1000+</div>
                  <div className="text-sm text-gray-600">Offres Exclusives</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">10k+</div>
                  <div className="text-sm text-gray-600">Membres Satisfaits</div>
                </div>
              </div>
            </div>
            
            {/* Dashboard Preview */}
            <div className={`relative ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
              <div className="dashboard-preview">
                {/* Dashboard Header */}
                <div className="gradient-primary p-6 text-white">
                  <div className="flex gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Dashboard LuxBoard</h3>
                  <p className="opacity-90 text-sm">Votre conciergerie personnalisée</p>
                </div>
                
                {/* Dashboard Body */}
                <div className="p-6 bg-white">
                  {/* Search Bar */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center gap-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <div className="flex-1 text-gray-500 text-sm">Rechercher un prestataire...</div>
                    <Filter className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  {/* Provider Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-gray-100 rounded-lg p-3">
                      <div className="w-full h-16 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg mb-3"></div>
                      <div className="text-xs font-semibold text-yellow-600 mb-1">Restaurant ⭐⭐⭐</div>
                      <div className="text-sm font-bold text-gray-900 mb-1">Le Meurice</div>
                      <div className="text-xs text-gray-500">Gastronomique • Paris</div>
                    </div>
                    
                    <div className="border border-gray-100 rounded-lg p-3">
                      <div className="w-full h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg mb-3"></div>
                      <div className="text-xs font-semibold text-blue-600 mb-1">Hôtel 5⭐</div>
                      <div className="text-sm font-bold text-gray-900 mb-1">Plaza Athénée</div>
                      <div className="text-xs text-gray-500">Palace • Champs-Élysées</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-yellow-200">
              Fonctionnalités Premium
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Une Expérience de Luxe Complète
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              LuxBoard vous offre un accès privilégié à un écosystème complet de services et d'expériences de luxe, 
              conçu pour répondre à tous vos besoins les plus exigeants.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card-luxury group">
              <div className="w-16 h-16 gradient-luxury rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Prestataires Premium</h3>
              <p className="text-gray-600 leading-relaxed">
                Accédez à un réseau exclusif de prestataires de luxe soigneusement sélectionnés dans tous les secteurs.
              </p>
            </div>
            
            <div className="card-luxury group">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Offres Privilèges</h3>
              <p className="text-gray-600 leading-relaxed">
                Bénéficiez d'offres exclusives et de réductions privilégiées réservées aux membres LuxBoard.
              </p>
            </div>
            
            <div className="card-luxury group">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Événements Exclusifs</h3>
              <p className="text-gray-600 leading-relaxed">
                Participez à des événements privés et des expériences uniques organisés spécialement pour nos membres.
              </p>
            </div>
            
            <div className="card-luxury group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Service Personnalisé</h3>
              <p className="text-gray-600 leading-relaxed">
                Profitez d'un service de conciergerie personnalisé adapté à vos besoins et disponible 24h/7j.
              </p>
            </div>
            
            <div className="card-luxury group">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Qualité Garantie</h3>
              <p className="text-gray-600 leading-relaxed">
                Tous nos partenaires sont vérifiés et certifiés pour garantir l'excellence et votre satisfaction.
              </p>
            </div>
            
            <div className="card-luxury group">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Expériences Uniques</h3>
              <p className="text-gray-600 leading-relaxed">
                Découvrez des expériences exceptionnelles et des moments inoubliables créés sur mesure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-bg py-20">
        <div className="container mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div className="animate-fade-in-up">
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-lg opacity-90">Prestataires Premium</div>
            </div>
            <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="text-5xl font-bold mb-2">1000+</div>
              <div className="text-lg opacity-90">Offres Exclusives</div>
            </div>
            <div className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-lg opacity-90">Événements par Mois</div>
            </div>
            <div className="animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <div className="text-5xl font-bold mb-2">10k+</div>
              <div className="text-lg opacity-90">Membres Satisfaits</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Prêt à Découvrir le Luxe Autrement ?
            </h2>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Rejoignez l'élite des connaisseurs et accédez dès aujourd'hui à un monde d'expériences exclusives. 
              Votre voyage vers l'excellence commence ici.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/register" className="btn-luxury text-lg px-8 py-4">
                <Crown className="w-6 h-6" />
                Devenir Membre Premium
                <ArrowRight className="w-6 h-6" />
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                Se Connecter
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

