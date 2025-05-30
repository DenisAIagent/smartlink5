import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './assets/styles/admin.css';
import './assets/styles/admin-override.css';

// Import des composants admin uniquement
import AdminLogin from './components/admin/AdminLogin';
import AdminPanel from './components/admin/AdminPanel';

// Contexte d'authentification spécifique à l'admin
export const AdminAuthContext = React.createContext({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {}
});

// Provider d'authentification admin
const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérification du token au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('mdmc_admin_token');
      
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      try {
        // Vérification de l'expiration du token
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const isValid = tokenData.exp * 1000 > Date.now();
        
        if (isValid) {
          // Récupération des informations utilisateur depuis le token
          setUser({
            name: tokenData.name || 'Administrateur',
            email: tokenData.email || '',
            role: tokenData.role || 'admin'
          });
          setIsAuthenticated(true);
        } else {
          // Token expiré
          localStorage.removeItem('mdmc_admin_token');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
        localStorage.removeItem('mdmc_admin_token');
        setIsAuthenticated(false);
        setUser(null);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Fonctions d'authentification
  const login = (token, userData) => {
    localStorage.setItem('mdmc_admin_token', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('mdmc_admin_token');
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/admin';
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// Composant de protection des routes admin
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = React.useContext(AdminAuthContext);
  
  if (isLoading) {
    return <div className="admin-loading">Chargement...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  
  return children;
};

// Application Admin complètement séparée
function AdminApp() {
  const { t, i18n } = useTranslation();
  
  // Mise à jour des balises meta pour l'admin
  useEffect(() => {
    document.title = t('admin.page_title');
    
    // Mise à jour de l'attribut lang de la balise html
    const lang = i18n.language.split('-')[0];
    document.documentElement.setAttribute('lang', lang);
    
    // Ajout de la classe admin-body au body pour supprimer le bandeau bleu
    document.body.classList.add('admin-body');
    
    // Nettoyage lors du démontage du composant
    return () => {
      document.body.classList.remove('admin-body');
    };
  }, [t, i18n.language]);
  
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
          <Route path="/admin" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard/*" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
}

export default AdminApp;
