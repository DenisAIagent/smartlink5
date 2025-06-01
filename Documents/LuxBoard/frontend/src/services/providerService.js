import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { cacheService } from './cacheService';
import { errorService } from './errorService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const SHAREPOINT_URL = process.env.REACT_APP_SHAREPOINT_URL;
const SHAREPOINT_TOKEN = process.env.REACT_APP_SHAREPOINT_TOKEN;
const PERPLEXITY_API_KEY = process.env.REACT_APP_PERPLEXITY_API_KEY;

// Configuration d'Axios pour l'API principale
const api = axios.create({
  baseURL: API_URL,
});

// Configuration d'Axios pour SharePoint
const sharepointApi = axios.create({
  baseURL: SHAREPOINT_URL,
  headers: {
    'Authorization': `Bearer ${SHAREPOINT_TOKEN}`,
    'Accept': 'application/json;odata=verbose'
  }
});

// Configuration d'Axios pour Perplexity
const perplexityApi = axios.create({
  baseURL: 'https://api.perplexity.ai',
  headers: {
    'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const providerService = {
  // Récupérer la liste des prestataires avec pagination côté client
  getProviders: async (filters = {}, page = 1, pageSize = 10) => {
    try {
      const allProviders = await cacheService.getProviders(filters);
      
      // Appliquer les filtres
      let filteredProviders = allProviders;
      if (filters.category) {
        filteredProviders = filteredProviders.filter(p => p.category === filters.category);
      }
      if (filters.location) {
        filteredProviders = filteredProviders.filter(p => p.location === filters.location);
      }
      if (filters.minRating) {
        filteredProviders = filteredProviders.filter(p => p.rating >= filters.minRating);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProviders = filteredProviders.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
        );
      }

      // Calculer la pagination
      const totalItems = filteredProviders.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProviders = filteredProviders.slice(startIndex, endIndex);

      return {
        providers: paginatedProviders,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          pageSize
        }
      };
    } catch (error) {
      errorService.handleApiError(error);
      throw error;
    }
  },

  // Récupérer les détails d'un prestataire avec cache
  getProviderById: async (id) => {
    try {
      return await cacheService.getProviderDetails(id);
    } catch (error) {
      errorService.handleApiError(error);
      throw error;
    }
  },

  // Récupérer les informations Google My Business d'un prestataire
  getGoogleMyBusinessInfo: async (placeId) => {
    try {
      const response = await api.get(`/providers/google/${placeId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Récupérer les avis d'un prestataire
  getProviderReviews: async (id, page = 1) => {
    try {
      const response = await api.get(`/providers/${id}/reviews`, {
        params: { page },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Ajouter un avis pour un prestataire
  addReview: async (providerId, reviewData) => {
    try {
      const response = await api.post(`/providers/${providerId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Récupérer les disponibilités d'un prestataire
  getAvailability: async (providerId, date) => {
    try {
      const response = await api.get(`/providers/${providerId}/availability`, {
        params: { date },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Réserver un prestataire
  bookProvider: async (providerId, bookingData) => {
    try {
      const response = await api.post(`/providers/${providerId}/book`, bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Récupérer les catégories avec cache
  getCategories: async () => {
    try {
      return await cacheService.getCategories();
    } catch (error) {
      errorService.handleApiError(error);
      throw error;
    }
  },

  // Récupérer les détails d'une réservation
  getBookingDetails: async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Annuler une réservation
  cancelBooking: async (bookingId) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Récupérer l'historique des réservations d'un utilisateur
  getUserBookings: async (page = 1) => {
    try {
      const response = await api.get('/bookings', {
        params: { page },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mettre à jour une réservation
  updateBooking: async (bookingId, bookingData) => {
    try {
      const response = await api.put(`/bookings/${bookingId}`, bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Intégration SharePoint
  async syncWithSharePoint() {
    try {
      const response = await sharepointApi.get('/_api/web/lists/getbytitle(\'Providers\')/items');
      return response.data.d.results;
    } catch (error) {
      throw new Error('Erreur lors de la synchronisation avec SharePoint');
    }
  },

  async updateSharePointProvider(providerId, data) {
    try {
      await sharepointApi.post(`/_api/web/lists/getbytitle('Providers')/items(${providerId})`, {
        ...data,
        __metadata: { type: 'SP.Data.ProvidersListItem' }
      });
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour du prestataire dans SharePoint');
    }
  },

  // Gestion des favoris
  async getFavorites() {
    try {
      const response = await api.get('/api/favorites');
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des favoris');
    }
  },

  async addToFavorites(providerId) {
    try {
      await api.post(`/api/favorites/${providerId}`);
    } catch (error) {
      throw new Error('Erreur lors de l\'ajout aux favoris');
    }
  },

  async removeFromFavorites(providerId) {
    try {
      await api.delete(`/api/favorites/${providerId}`);
    } catch (error) {
      throw new Error('Erreur lors de la suppression des favoris');
    }
  },

  // Export PDF
  async exportToPDF(providers) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // En-tête
    doc.setFontSize(20);
    doc.text('Liste des Prestataires', pageWidth / 2, 20, { align: 'center' });
    
    // Tableau des prestataires
    const tableColumn = ['Nom', 'Catégorie', 'Localisation', 'Note', 'Prix'];
    const tableRows = providers.map(provider => [
      provider.name,
      provider.category,
      provider.location,
      provider.rating,
      `${provider.price}€`
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    // Détails des prestataires
    let yPosition = doc.lastAutoTable.finalY + 20;
    
    providers.forEach((provider, index) => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text(provider.name, 20, yPosition);
      
      doc.setFontSize(10);
      yPosition += 10;
      doc.text(`Description: ${provider.description}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Contact: ${provider.contact}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Site web: ${provider.website}`, 20, yPosition);
      yPosition += 20;

      // Ajouter l'image si disponible
      if (provider.image) {
        try {
          const img = new Image();
          img.src = provider.image;
          doc.addImage(img, 'JPEG', 20, yPosition, 40, 30);
          yPosition += 40;
        } catch (error) {
          console.error('Erreur lors du chargement de l\'image:', error);
        }
      }
    });

    return doc;
  },

  // Suggestions de filtres
  async getFilterSuggestions() {
    try {
      const response = await api.get('/api/filter-suggestions');
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des suggestions de filtres');
    }
  },

  async saveFilterSuggestion(filters) {
    try {
      await api.post('/api/filter-suggestions', filters);
    } catch (error) {
      throw new Error('Erreur lors de la sauvegarde des suggestions de filtres');
    }
  },

  // Importer depuis SharePoint avec gestion d'erreurs
  importFromSharePoint: async () => {
    try {
      const response = await sharepointApi.get('/_api/web/lists/getbytitle(\'Providers\')/items');
      const providers = response.data.d.results.map(item => ({
        name: item.Title,
        description: item.Description,
        category: item.Category,
        location: item.Location,
        contact: item.Contact,
        website: item.Website,
        status: 'pending',
        source: 'sharepoint',
        sourceId: item.Id
      }));
      
      await api.post('/providers/bulk-import', { providers });
      await cacheService.updateCache('providers_imported');
      return providers;
    } catch (error) {
      errorService.handleApiError(error);
      throw new Error('Erreur lors de l\'importation depuis SharePoint');
    }
  },

  // Importer depuis Excel avec gestion d'erreurs
  importFromExcel: async (file) => {
    try {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const providers = jsonData.map(row => ({
              name: row.Nom,
              description: row.Description,
              category: row.Categorie,
              location: row.Localisation,
              contact: row.Contact,
              website: row.SiteWeb,
              status: 'pending',
              source: 'excel',
              sourceId: row.ID
            }));

            await api.post('/providers/bulk-import', { providers });
            await cacheService.updateCache('providers_imported');
            resolve(providers);
          } catch (error) {
            errorService.handleValidationError(error);
            reject(new Error('Erreur lors du traitement du fichier Excel'));
          }
        };
        reader.onerror = () => {
          errorService.handleNetworkError(new Error('Erreur lors de la lecture du fichier'));
          reject(new Error('Erreur lors de la lecture du fichier'));
        };
        reader.readAsArrayBuffer(file);
      });
    } catch (error) {
      errorService.handleApiError(error);
      throw new Error('Erreur lors de l\'importation depuis Excel');
    }
  },

  // Suggestions IA via Perplexity
  async getAISuggestions(query) {
    try {
      const response = await perplexityApi.post('/chat/completions', {
        model: 'pplx-7b-online',
        messages: [{
          role: 'system',
          content: 'Tu es un assistant spécialisé dans la recherche de prestataires de services de luxe. Analyse la requête et suggère des prestataires pertinents avec leurs informations.'
        }, {
          role: 'user',
          content: query
        }]
      });

      // Traitement des suggestions
      const suggestions = response.data.choices[0].message.content
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [name, ...details] = line.split(' - ');
          return {
            name: name.trim(),
            description: details.join(' - ').trim(),
            status: 'suggested',
            source: 'ai'
          };
        });

      return suggestions;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des suggestions IA');
    }
  },

  // Gestion des offres préférentielles
  async getPreferentialOffers() {
    try {
      const response = await api.get('/offers/preferential');
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des offres préférentielles');
    }
  },

  async createPreferentialOffer(offerData) {
    try {
      const response = await api.post('/offers/preferential', offerData);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la création de l\'offre préférentielle');
    }
  },

  // Gestion des événements privés
  async getPrivateEvents(filters = {}) {
    try {
      const response = await api.get('/events/private', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des événements privés');
    }
  },

  async getFeaturedEvents() {
    try {
      const response = await api.get('/events/featured');
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des événements mis en avant');
    }
  },

  // Gestion des soumissions de prestataires
  async submitProvider(providerData) {
    try {
      const response = await api.post('/providers/submit', {
        ...providerData,
        status: 'pending'
      });
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la soumission du prestataire');
    }
  },

  async getPendingProviders() {
    try {
      const response = await api.get('/providers/pending');
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des prestataires en attente');
    }
  },

  async validateProvider(providerId, action, comment = '') {
    try {
      const response = await api.post(`/providers/${providerId}/validate`, {
        action,
        comment
      });
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la validation du prestataire');
    }
  },

  // Récupérer les statistiques avec cache
  getProviderStats: async () => {
    try {
      return await cacheService.getStats();
    } catch (error) {
      errorService.handleApiError(error);
      throw error;
    }
  },

  async getActivityLogs(filters = {}) {
    try {
      const response = await api.get('/logs/activity', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des logs d\'activité');
    }
  },

  // Mettre à jour un prestataire
  updateProvider: async (id, data) => {
    try {
      const response = await api.put(`/providers/${id}`, data);
      await cacheService.updateCache('provider_updated', { id });
      return response.data;
    } catch (error) {
      errorService.handleApiError(error);
      throw error;
    }
  },

  // Supprimer un prestataire
  deleteProvider: async (id) => {
    try {
      await api.delete(`/providers/${id}`);
      await cacheService.updateCache('provider_deleted', { id });
    } catch (error) {
      errorService.handleApiError(error);
      throw error;
    }
  }
}; 