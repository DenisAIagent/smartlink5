import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function LuxBoardLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleLogin = () => {
    console.log('Connexion:', formData);
    alert('Connexion en cours...');
  };

  const handleDiscoveryAccess = () => {
    console.log('Accès découverte');
    alert('Redirection vers l\'accès découverte...');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Main Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 relative">
          {/* Access Badge */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-2 rounded-full text-sm font-bold tracking-wide">
              ACCÈS PRIVILÉGIÉ
            </div>
          </div>

          {/* Logo Section */}
          <div className="text-center mt-8 mb-8">
            <div className="flex justify-center mb-6">
              <img 
                src="https://i.postimg.cc/FHNQXBwp/Chat-GPT-Image-1-juin-2025-15-02-02.png" 
                alt="LuxBoard Logo" 
                className="w-16 h-16"
              />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Bienvenue sur votre espace exclusif
            </h1>
            <p className="text-gray-600">
              Connectez-vous pour accéder à vos privilèges
            </p>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Adresse e-mail
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="votre@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-gray-900 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
                />
                <label className="ml-2 text-sm text-gray-600">
                  Se souvenir de moi
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              className="w-full bg-black text-white py-3 rounded-lg font-bold text-lg hover:bg-gray-800 transition-colors"
            >
              SE CONNECTER
            </button>
          </div>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="px-4 text-gray-500 text-sm">ou</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Discovery Access Button */}
          <button
            onClick={handleDiscoveryAccess}
            className="w-full border-2 border-yellow-500 text-yellow-600 py-3 rounded-lg font-medium text-lg hover:bg-yellow-50 transition-colors"
          >
            Accès Découverte
          </button>

          {/* Terms & Privacy */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              En vous connectant, vous acceptez nos{' '}
              <button className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors">
                Conditions d'utilisation
              </button>
              {' '}et{' '}
              <button className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors">
                Politique de confidentialité
              </button>
            </p>
          </div>
        </div>

        {/* Bottom branding */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center">
            <img 
              src="https://i.postimg.cc/FHNQXBwp/Chat-GPT-Image-1-juin-2025-15-02-02.png" 
              alt="LuxBoard Logo" 
              className="w-6 h-6 mr-2"
            />
            <span className="text-gray-600 font-medium">LUXBOARD</span>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            La première plateforme de conciergerie augmentée
          </p>
        </div>
      </div>
    </div>
  );
} 