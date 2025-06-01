import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="header-luxury">
      <div className="container mx-auto px-8">
        <nav className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
            <div className="logo-icon">
              L
            </div>
            LUXBOARD
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center gap-8">
            <Link 
              to="/providers" 
              className={`nav-link ${isActive('/providers') ? 'text-gray-900' : ''}`}
            >
              Prestataires
            </Link>
            <Link 
              to="/offers" 
              className={`nav-link ${isActive('/offers') ? 'text-gray-900' : ''}`}
            >
              Offres Privilèges
            </Link>
            <Link 
              to="/events" 
              className={`nav-link ${isActive('/events') ? 'text-gray-900' : ''}`}
            >
              Événements
            </Link>
            {user && (
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'text-gray-900' : ''}`}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* User Menu - Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <span className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                  <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                          <Crown className="w-3 h-3" />
                          {user.membershipLevel || 'Standard'}
                        </span>
                      </div>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Mon Profil
                    </Link>
                    
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Paramètres
                    </Link>
                    
                    <hr className="my-2 border-gray-100" />
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Se Déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Se Connecter
                </Link>
                <Link
                  to="/register"
                  className="btn-luxury text-sm px-6 py-2"
                >
                  <Crown className="w-4 h-4" />
                  Devenir Membre
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                to="/providers"
                className={`nav-link ${isActive('/providers') ? 'text-gray-900' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Prestataires
              </Link>
              <Link
                to="/offers"
                className={`nav-link ${isActive('/offers') ? 'text-gray-900' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Offres Privilèges
              </Link>
              <Link
                to="/events"
                className={`nav-link ${isActive('/events') ? 'text-gray-900' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Événements
              </Link>
              {user && (
                <Link
                  to="/dashboard"
                  className={`nav-link ${isActive('/dashboard') ? 'text-gray-900' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}

              {/* Mobile User Section */}
              <hr className="border-gray-200" />
              
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 py-2 text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    Mon Profil
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 py-2 text-red-600 w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Se Déconnecter
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="block py-2 text-gray-700 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Se Connecter
                  </Link>
                  <Link
                    to="/register"
                    className="btn-luxury text-sm justify-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Crown className="w-4 h-4" />
                    Devenir Membre
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay for user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Navbar;

