import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/admin-login.css'; // Gardez votre chemin de style

const AdminLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState(''); // Ou email si vous préférez utiliser 'email' comme état
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

   const handleSubmit = async (e) => { // Marquer la fonction comme async
    e.preventDefault();
    setLoading(true);
    setError('');

    // URL de l'API définie en dur pour éviter les problèmes de configuration
    const apiUrl = "https://api.mdmcmusicads.com";
    
    // Vérification de sécurité pour l'environnement de développement
    if (import.meta.env.DEV) {
      console.log("Mode développement détecté, utilisation de l'API locale");
      // Utiliser l'API locale en développement si disponible
      const devApiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      apiUrl = devApiUrl;
    }
    // --- Début de l'appel API réel ---
    // Adaptez l'URL si votre endpoint de login est différent
    const loginUrl = `${apiUrl}/api/auth/login`;
    // Adaptez { email: username } si votre backend attend 'username' au lieu de 'email'
    const body = JSON.stringify({ email: username, password: password });
    const headers = { 'Content-Type': 'application/json' };

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: headers,
        body: body
      });

      const data = await response.json(); // Essayer de parser la réponse JSON dans tous les cas

      if (!response.ok) {
        // Gérer les erreurs HTTP (ex: 401 Mauvais identifiants, 400 Requête invalide, 500 Erreur serveur)
        // Utiliser le message d'erreur du backend si disponible, sinon un message générique
        setError(data.error || data.message || `${t('admin.login_error')} (${response.status})`);
        setLoading(false); // Ne pas oublier de réinitialiser le loading
        return; // Arrêter le traitement ici
      }

      // --- Connexion réussie (response.ok est true) ---
      // Vérifier si le token est bien présent dans la réponse (adaptez 'data.token' si nécessaire)
      if (data && data.token) {
        // Stocker le VRAI token JWT dans localStorage
        localStorage.setItem('mdmc_admin_auth', data.token);

        // Redirection vers le tableau de bord admin
        navigate('/admin/dashboard');
        // Pas besoin de setLoading(false) ici car la page va changer
      } else {
        // Cas où la réponse est OK mais le token manque (problème API ou logique backend)
        console.error("Connexion réussie mais token manquant dans la réponse:", data);
        setError(t('admin.login_error_no_token')); // Pensez à ajouter cette clé dans i18n
        setLoading(false);
      }

    } catch (err) {
      // Gérer les erreurs réseau ou les erreurs lors du fetch/parsing JSON
      console.error("Erreur réseau ou technique lors de la connexion:", err);
      setError(t('admin.login_error_network')); // Pensez à ajouter cette clé dans i18n
      setLoading(false); // Assurer que le loading s'arrête
    }
    // Pas besoin de finally ici car setLoading(false) est géré dans chaque branche d'erreur
    // et la navigation interrompt le flux en cas de succès.
  };

  // --- Le reste du JSX reste identique ---
  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>{t('admin.login')}</h1>
          <p>{t('admin.login_subtitle')}</p>
        </div>

        {error && <div className="admin-login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="username">{t('admin.username')}</label>
            <input
              type="text" // Changez en type="email" si votre backend attend un email et que vous voulez la validation navigateur
              id="username" // Peut être renommé 'email' si vous changez le type et l'état
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('admin.password')}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={`admin-login-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? t('admin.logging_in') : t('admin.login_button')}
          </button>
        </form>

        <div className="admin-login-footer">
          <a href="/">{t('footer.nav_home')}</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
