import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { Search, MapPin, Star, Calendar, CreditCard, Clock, Save, Filter, ArrowUp, ArrowDown, X, Heart, Grid, List, Download, Share2 } from 'react-feather';
import { providerService } from '../services/providerService';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RateLimitDisplay from '../components/common/RateLimitDisplay';

const ProvidersPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [favorites, setFavorites] = useState([]);
  const [filterSuggestions, setFilterSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minRating, setMinRating] = useState('');
  const [availability, setAvailability] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');
  const [savedFilters, setSavedFilters] = useState([]);
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCategories();
    loadSavedFilters();
    loadFavorites();
    loadFilterSuggestions();
  }, []);

  useEffect(() => {
    loadProviders();
  }, [selectedCategory, searchQuery, selectedBudget, startDate, endDate, minRating, availability, sortBy, sortOrder, pagination.currentPage]);

  const loadCategories = async () => {
    try {
      const categoriesData = await providerService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const loadSavedFilters = () => {
    const saved = localStorage.getItem('savedFilters');
    if (saved) {
      setSavedFilters(JSON.parse(saved));
    }
  };

  const loadFavorites = async () => {
    try {
      const favoritesData = await providerService.getFavorites();
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
    }
  };

  const loadFilterSuggestions = async () => {
    try {
      const suggestions = await providerService.getFilterSuggestions();
      setFilterSuggestions(suggestions);
    } catch (error) {
      console.error('Erreur lors du chargement des suggestions:', error);
    }
  };

  const loadProviders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters = {
        category: selectedCategory,
        search: searchQuery,
        budget: selectedBudget,
        startDate,
        endDate,
        minRating,
        availability,
        sortBy,
        sortOrder
      };
      const result = await providerService.getProviders(
        filters,
        pagination.currentPage,
        pagination.pageSize
      );
      setProviders(result.providers);
      setPagination(result.pagination);
    } catch (error) {
      setError('Erreur lors du chargement des prestataires');
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBudget('');
    setStartDate('');
    setEndDate('');
    setMinRating('');
    setAvailability('');
    setSortBy('rating');
    setSortOrder('desc');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSaveFilter = () => {
    const newFilter = {
      id: Date.now(),
      name: filterName,
      filters: {
        category: selectedCategory,
        budget: selectedBudget,
        minRating,
        availability
      }
    };
    const updatedFilters = [...savedFilters, newFilter];
    setSavedFilters(updatedFilters);
    localStorage.setItem('savedFilters', JSON.stringify(updatedFilters));
    setShowSaveFilterModal(false);
    setFilterName('');
  };

  const applySavedFilter = (filter) => {
    setSelectedCategory(filter.filters.category);
    setSelectedBudget(filter.filters.budget);
    setMinRating(filter.filters.minRating);
    setAvailability(filter.filters.availability);
  };

  const deleteSavedFilter = (filterId) => {
    const updatedFilters = savedFilters.filter(f => f.id !== filterId);
    setSavedFilters(updatedFilters);
    localStorage.setItem('savedFilters', JSON.stringify(updatedFilters));
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleBudgetChange = (e) => {
    setSelectedBudget(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === 'startDate') {
      setStartDate(value);
      if (endDate && value > endDate) {
        setEndDate(value);
      }
    } else {
      setEndDate(value);
    }
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleRatingChange = (e) => {
    setMinRating(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleAvailabilityChange = (e) => {
    setAvailability(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const getBudgetLabel = (budget) => {
    switch (budget) {
      case 'low':
        return 'Économique (0-50€)';
      case 'medium':
        return 'Moyen (50-150€)';
      case 'high':
        return 'Premium (150€+)';
      default:
        return 'Tous les budgets';
    }
  };

  const getRatingLabel = (rating) => {
    switch (rating) {
      case '4':
        return '4 étoiles et plus';
      case '3':
        return '3 étoiles et plus';
      case '2':
        return '2 étoiles et plus';
      default:
        return 'Toutes les notes';
    }
  };

  const getAvailabilityLabel = (availability) => {
    switch (availability) {
      case 'today':
        return 'Disponible aujourd\'hui';
      case 'tomorrow':
        return 'Disponible demain';
      case 'this_week':
        return 'Disponible cette semaine';
      case 'this_weekend':
        return 'Disponible ce weekend';
      default:
        return 'Toutes les disponibilités';
    }
  };

  const handleExportPDF = async () => {
    try {
      const doc = await providerService.exportToPDF(providers);
      doc.save('prestataires.pdf');
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
    }
  };

  const toggleFavorite = async (providerId) => {
    try {
      if (favorites.includes(providerId)) {
        await providerService.removeFromFavorites(providerId);
        setFavorites(favorites.filter(id => id !== providerId));
      } else {
        await providerService.addToFavorites(providerId);
        setFavorites([...favorites, providerId]);
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
    }
  };

  const applySuggestion = (suggestion) => {
    setSelectedCategory(suggestion.category);
    setSelectedBudget(suggestion.budget);
    setMinRating(suggestion.minRating);
    setAvailability(suggestion.availability);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Barre d'outils */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100'}`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-100'}`}
            >
              <List size={20} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark"
            >
              <Download size={16} />
              Exporter en PDF
            </button>
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark"
            >
              <Share2 size={16} />
              Suggestions
            </button>
          </div>
        </div>

        {/* Filtres de recherche */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Filtres de recherche</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSaveFilterModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark"
              >
                <Save size={16} />
                Sauvegarder les filtres
              </button>
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                <X size={16} />
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Filtres existants */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un prestataire..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Filtre de budget */}
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedBudget}
                onChange={handleBudgetChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Tous les budgets</option>
                <option value="low">Économique (0-50€)</option>
                <option value="medium">Moyen (50-150€)</option>
                <option value="high">Premium (150€+)</option>
              </select>
            </div>

            {/* Filtre de note minimale */}
            <div className="relative">
              <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={minRating}
                onChange={handleRatingChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Toutes les notes</option>
                <option value="4">4 étoiles et plus</option>
                <option value="3">3 étoiles et plus</option>
                <option value="2">2 étoiles et plus</option>
              </select>
            </div>

            {/* Filtre de disponibilité */}
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={availability}
                onChange={handleAvailabilityChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Toutes les disponibilités</option>
                <option value="today">Disponible aujourd'hui</option>
                <option value="tomorrow">Disponible demain</option>
                <option value="this_week">Disponible cette semaine</option>
                <option value="this_weekend">Disponible ce weekend</option>
              </select>
            </div>
          </div>

          {/* Période */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                name="startDate"
                value={startDate}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
                placeholder="Date de début"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                name="endDate"
                value={endDate}
                onChange={handleDateChange}
                min={startDate || new Date().toISOString().split('T')[0]}
                placeholder="Date de fin"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Catégories */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Catégories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tri des résultats */}
          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Trier par :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="rating">Note</option>
              <option value="price">Prix</option>
              <option value="popularity">Popularité</option>
              <option value="distance">Distance</option>
            </select>
            <button
              onClick={toggleSortOrder}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {sortOrder === 'asc' ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
            </button>
          </div>

          {/* Filtres sauvegardés */}
          {savedFilters.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Filtres sauvegardés</h3>
              <div className="flex flex-wrap gap-2">
                {savedFilters.map((filter) => (
                  <div
                    key={filter.id}
                    className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                  >
                    <button
                      onClick={() => applySavedFilter(filter)}
                      className="hover:text-primary"
                    >
                      {filter.name}
                    </button>
                    <button
                      onClick={() => deleteSavedFilter(filter.id)}
                      className="ml-2 text-gray-500 hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filtres actifs */}
          {(selectedBudget || minRating || availability || startDate || endDate) && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Filtres actifs</h3>
              <div className="flex flex-wrap gap-2">
                {selectedBudget && (
                  <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                    <span>{getBudgetLabel(selectedBudget)}</span>
                    <button
                      onClick={() => setSelectedBudget('')}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                )}
                {minRating && (
                  <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                    <span>{getRatingLabel(minRating)}</span>
                    <button
                      onClick={() => setMinRating('')}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                )}
                {availability && (
                  <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                    <span>{getAvailabilityLabel(availability)}</span>
                    <button
                      onClick={() => setAvailability('')}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                )}
                {startDate && (
                  <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                    <span>Du {new Date(startDate).toLocaleDateString()}</span>
                    <button
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Suggestions de filtres */}
          {showSuggestions && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Suggestions de filtres</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => applySuggestion(suggestion)}
                    className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  >
                    <h4 className="font-medium mb-2">{suggestion.name}</h4>
                    <p className="text-sm text-gray-600">
                      {suggestion.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Liste des prestataires */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" text="Chargement des prestataires..." />
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  <div className={`relative ${viewMode === 'list' ? 'w-1/3' : 'h-48'}`}>
                    <img
                      src={provider.image}
                      alt={provider.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(provider.id);
                      }}
                      className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                    >
                      <Heart
                        size={20}
                        className={favorites.includes(provider.id) ? 'text-red-500 fill-current' : 'text-gray-400'}
                      />
                    </button>
                    <div className="absolute top-4 left-4 bg-white px-2 py-1 rounded-full text-sm font-medium">
                      {getBudgetLabel(provider.budget)}
                    </div>
                  </div>
                  <div className={`p-6 ${viewMode === 'list' ? 'w-2/3' : ''}`}>
                    <h3 className="text-xl font-semibold mb-2">{provider.name}</h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin size={16} className="mr-1" />
                      <span>{provider.location}</span>
                    </div>
                    <div className="flex items-center mb-4">
                      <Star size={16} className="text-yellow-400 mr-1" />
                      <span className="font-medium">{provider.rating}</span>
                      <span className="text-gray-500 ml-1">({provider.reviews} avis)</span>
                    </div>
                    <p className="text-gray-600 line-clamp-2">{provider.description}</p>
                    {viewMode === 'list' && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => navigate(`/providers/${provider.id}`)}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                        >
                          Voir les détails
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
                isLoading={isLoading}
              />
            </div>
          </>
        )}
      </main>

      {/* Modal de sauvegarde des filtres */}
      {showSaveFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Sauvegarder les filtres</h3>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Nom des filtres"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveFilterModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveFilter}
                disabled={!filterName.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Affichage de la limitation de taux */}
      <RateLimitDisplay endpoint="/providers" />
    </div>
  );
};

export default ProvidersPage; 