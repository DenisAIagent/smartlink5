import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login', {
        email: formData.email,
        password: formData.password
      });

      // Stocker le token JWT
      localStorage.setItem('token', response.data.token);
      
      // Rediriger vers le dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('Email ou mot de passe incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] p-6">
      <div className="bg-white rounded-lg shadow-sm w-full max-w-[420px] p-10 relative overflow-hidden">
        <div className="absolute top-0 right-6 bg-[#D4AF37] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-b">
          Accès Privilège
        </div>
        
        <div className="text-center mb-10">
          <div className="mb-4">
            <img 
              src="https://i.postimg.cc/FHNQXBwp/Chat-GPT-Image-1-juin-2025-15-02-02.png" 
              alt="LuxBoard Logo" 
              className="w-16 h-16 mx-auto"
            />
          </div>
          <div className="text-gray-600 mb-2">Bienvenue sur votre espace exclusif</div>
          <div className="text-sm text-gray-600">Connectez-vous pour accéder à vos privilèges</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse e-mail
            </label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="password" 
                name="password" 
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                placeholder="••••••••"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input 
                type="checkbox" 
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="w-4 h-4 accent-[#D4AF37]"
              />
              <span>Se souvenir de moi</span>
            </label>
            <a href="#" className="text-sm text-[#D4AF37] hover:text-[#B8941F]">
              Mot de passe oublié ?
            </a>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className={`w-full py-4 bg-black text-white rounded font-bold hover:bg-[#D4AF37] transition-colors ${
              isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Connexion en cours...
              </div>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ou</span>
          </div>
        </div>

        <div className="text-center">
          <a 
            href="#" 
            className="inline-block px-6 py-3 border border-[#D4AF37] text-[#D4AF37] rounded hover:bg-[#D4AF37] hover:text-white transition-colors"
          >
            Accès Découverte
          </a>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          En vous connectant, vous acceptez nos{' '}
          <a href="#" className="text-[#D4AF37] hover:underline">Conditions d'utilisation</a>
          {' '}et{' '}
          <a href="#" className="text-[#D4AF37] hover:underline">Politique de confidentialité</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 