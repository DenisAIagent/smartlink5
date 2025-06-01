import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services/profileService';
import Header from '../components/layout/Header';
import { User, Mail, Phone, MapPin, Lock, Camera } from 'react-feather';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await profileService.getProfile();
      setFormData(prev => ({
        ...prev,
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone || '',
        address: profileData.address || '',
      }));
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erreur lors du chargement du profil',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      if (isEditing) {
        // Mise à jour du profil
        await profileService.updateProfile({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        });

        // Si un nouveau mot de passe est fourni
        if (formData.newPassword) {
          if (formData.newPassword !== formData.confirmPassword) {
            throw new Error('Les mots de passe ne correspondent pas');
          }
          await profileService.changePassword({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          });
        }

        setMessage({
          type: 'success',
          text: 'Profil mis à jour avec succès',
        });
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Une erreur est survenue',
      });
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await profileService.updateAvatar(file);
      setMessage({
        type: 'success',
        text: 'Avatar mis à jour avec succès',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erreur lors de la mise à jour de l\'avatar',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                {isEditing ? 'Annuler' : 'Modifier'}
              </button>
            </div>

            {message.text && (
              <div className={`p-4 mb-6 rounded-lg ${
                message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={user?.avatar || 'https://via.placeholder.com/150'}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer">
                      <Camera size={16} />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{formData.name}</h2>
                  <p className="text-gray-600">{formData.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4">Changer le mot de passe</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmer le mot de passe
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Enregistrer
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage; 