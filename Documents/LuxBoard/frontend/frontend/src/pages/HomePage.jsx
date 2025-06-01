import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Crown, 
  Star, 
  ArrowRight, 
  Building2, 
  Gift, 
  Calendar,
  Users,
  Shield,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';

const HomePage = () => {
  const features = [
    {
      icon: Building2,
      title: 'Prestataires Premium',
      description: 'Accédez à un réseau exclusif de prestataires de luxe soigneusement sélectionnés.',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: Gift,
      title: 'Offres Privilèges',
      description: 'Bénéficiez d\'offres exclusives et de réductions privilégiées réservées aux membres.',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      icon: Calendar,
      title: 'Événements Exclusifs',
      description: 'Participez à des événements privés et des expériences uniques.',
      color: 'bg-green-50 text-green-600'
    },
    {
      icon: Users,
      title: 'Service Personnalisé',
      description: 'Profitez d\'un service de conciergerie personnalisé adapté à vos besoins.',
      color: 'bg-orange-50 text-orange-600'
    },
    {
      icon: Shield,
      title: 'Qualité Garantie',
      description: 'Tous nos partenaires sont vérifiés et certifiés pour garantir l\'excellence.',
      color: 'bg-red-50 text-red-600'
    },
    {
      icon: Sparkles,
      title: 'Expériences Uniques',
      description: 'Découvrez des expériences exceptionnelles et des moments inoubliables.',
      color: 'bg-yellow-50 text-yellow-600'
    }
  ];

  const stats = [
    { number: '500+', label: 'Prestataires Premium' },
    { number: '1000+', label: 'Offres Exclusives' },
    { number: '50+', label: 'Événements par Mois' },
    { number: '10k+', label: 'Membres Satisfaits' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mr-4">
                <Crown className="w-8 h-8 text-black" />
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold">
                LUX<span className="text-yellow-400">BOARD</span>
              </h1>
            </div>
            
            <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Votre conciergerie de luxe personnalisée. Accédez à un monde d'expériences exclusives, 
              de prestataires premium et d'événements privés.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/providers">
                <Button size="lg" className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                  Découvrir nos Prestataires
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/offers">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-semibold"
                >
                  Voir les Offres
                  <Star className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-400/10 rounded-full blur-xl"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-black mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
              Une Expérience de Luxe Complète
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              LuxBoard vous offre un accès privilégié à un écosystème complet de services 
              et d'expériences de luxe, conçu pour répondre à tous vos besoins.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-6`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Rejoignez l'Excellence
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Devenez membre de LuxBoard et accédez dès aujourd'hui à un monde 
            d'expériences exceptionnelles et de services premium.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Devenir Membre
                <Crown className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/events">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-semibold"
              >
                Voir les Événements
                <Calendar className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

