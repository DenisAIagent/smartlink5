import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Votre Conciergerie de Luxe
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Accédez à un réseau exclusif de prestataires de services haut de gamme
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-white text-purple-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-opacity-90 transition-all"
          >
            Commencer
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Nos Services Exclusifs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Services Premium</h3>
              <p className="text-gray-600">
                Accédez à des prestataires de services soigneusement sélectionnés
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Qualité Garantie</h3>
              <p className="text-gray-600">
                Des prestations de qualité vérifiée et certifiée
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Rapidité</h3>
              <p className="text-gray-600">
                Service rapide et efficace pour tous vos besoins
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-purple-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à Découvrir Nos Services ?
          </h2>
          <p className="text-xl mb-8">
            Rejoignez notre communauté exclusive dès aujourd'hui
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-white text-purple-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-opacity-90 transition-all"
          >
            S'inscrire Maintenant
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">LuxBoard</h3>
              <p className="text-gray-400">
                Votre conciergerie de luxe de confiance
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Conciergerie</li>
                <li>Services Premium</li>
                <li>Réservations</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">À Propos</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Notre Histoire</li>
                <li>Équipe</li>
                <li>Carrières</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Support</li>
                <li>FAQ</li>
                <li>Contactez-nous</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 LuxBoard. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 