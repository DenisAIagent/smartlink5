import { 
  UserGroupIcon, 
  ShieldCheckIcon, 
  SparklesIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';

const ValueProps = () => {
  const features = [
    {
      icon: <UserGroupIcon className="w-8 h-8" />,
      title: "Réseau Premium",
      description: "Accédez à un réseau exclusif de prestataires de luxe soigneusement sélectionnés."
    },
    {
      icon: <ShieldCheckIcon className="w-8 h-8" />,
      title: "Sécurité Garantie",
      description: "Protection des données et confidentialité assurées pour vos clients VIP."
    },
    {
      icon: <SparklesIcon className="w-8 h-8" />,
      title: "Service Sur-Mesure",
      description: "Personnalisez chaque demande selon les exigences spécifiques de vos clients."
    },
    {
      icon: <ChartBarIcon className="w-8 h-8" />,
      title: "Suivi en Temps Réel",
      description: "Suivez l'évolution de chaque demande et gérez efficacement vos ressources."
    }
  ];

  return (
    <section className="py-20 bg-[#F8F9FA]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif mb-4">
            Pourquoi Choisir LuxBoard ?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Une solution complète pour les professionnels de la conciergerie de luxe
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-[#D4AF37] mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-serif mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProps; 