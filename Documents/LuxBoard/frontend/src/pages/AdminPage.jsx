import { useState, useEffect } from 'react';
import { Upload, FileText, Database, Users, Activity, Settings, Download, Filter, CheckSquare, BarChart2, Bell, Tag, Calendar, FileText as FileTextIcon, Search, Layout, FileDown } from 'react-feather';
import { providerService } from '../services/providerService';
import { Line, Bar } from 'react-chartjs-2';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import * as XLSX from 'xlsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('import');
  const [importStatus, setImportStatus] = useState(null);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [logFilters, setLogFilters] = useState({
    startDate: '',
    endDate: '',
    action: '',
    user: ''
  });
  const [showLogFilters, setShowLogFilters] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [reportType, setReportType] = useState('');
  const [reportDateRange, setReportDateRange] = useState([new Date(), new Date()]);
  const [calendarView, setCalendarView] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    category: '',
    status: '',
    dateRange: [null, null],
    rating: '',
    tags: []
  });
  const [showSearchFilters, setShowSearchFilters] = useState(false);
  const [dashboardLayout, setDashboardLayout] = useState('default');
  const [customWidgets, setCustomWidgets] = useState([]);
  const [availableWidgets, setAvailableWidgets] = useState([
    { id: 'stats', name: 'Statistiques', icon: BarChart2 },
    { id: 'calendar', name: 'Calendrier', icon: Calendar },
    { id: 'recent', name: 'Activité récente', icon: Activity },
    { id: 'tags', name: 'Tags populaires', icon: Tag }
  ]);
  const [exportFormat, setExportFormat] = useState('pdf');

  useEffect(() => {
    if (activeTab === 'pending') {
      loadPendingProviders();
    } else if (activeTab === 'stats') {
      loadStats();
    } else if (activeTab === 'logs') {
      loadLogs();
    }
    // Charger les tags
    loadTags();
    // Configurer les notifications en temps réel
    setupNotifications();
    // Charger les événements du calendrier
    loadCalendarEvents();
  }, [activeTab]);

  const loadPendingProviders = async () => {
    try {
      const providers = await providerService.getPendingProviders();
      setPendingProviders(providers);
    } catch (error) {
      setError('Erreur lors du chargement des prestataires en attente');
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await providerService.getProviderStats();
      setStats(statsData);
    } catch (error) {
      setError('Erreur lors du chargement des statistiques');
    }
  };

  const loadLogs = async () => {
    try {
      const logsData = await providerService.getActivityLogs();
      setLogs(logsData);
    } catch (error) {
      setError('Erreur lors du chargement des logs');
    }
  };

  const handleSharePointImport = async () => {
    try {
      setImportStatus('loading');
      const providers = await providerService.importFromSharePoint();
      setImportStatus('success');
      setError(null);
    } catch (error) {
      setImportStatus('error');
      setError('Erreur lors de l\'importation depuis SharePoint');
    }
  };

  const handleExcelImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setImportStatus('loading');
      const providers = await providerService.importFromExcel(file);
      setImportStatus('success');
      setError(null);
    } catch (error) {
      setImportStatus('error');
      setError('Erreur lors de l\'importation depuis Excel');
    }
  };

  const handleProviderValidation = async (providerId, action) => {
    try {
      await providerService.validateProvider(providerId, action);
      loadPendingProviders();
    } catch (error) {
      setError('Erreur lors de la validation du prestataire');
    }
  };

  const handleBulkValidation = async (action) => {
    try {
      await Promise.all(
        selectedProviders.map(providerId =>
          providerService.validateProvider(providerId, action)
        )
      );
      loadPendingProviders();
      setSelectedProviders([]);
    } catch (error) {
      setError('Erreur lors de la validation en masse');
    }
  };

  const toggleProviderSelection = (providerId) => {
    setSelectedProviders(prev =>
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const handleLogFilterChange = (e) => {
    const { name, value } = e.target;
    setLogFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyLogFilters = async () => {
    try {
      const filteredLogs = await providerService.getActivityLogs(logFilters);
      setLogs(filteredLogs);
    } catch (error) {
      setError('Erreur lors du filtrage des logs');
    }
  };

  const exportLogs = async () => {
    try {
      const doc = await providerService.exportToPDF(logs.map(log => ({
        action: log.action,
        details: log.details,
        timestamp: new Date(log.timestamp).toLocaleString(),
        user: log.user
      })));
      doc.save('logs.pdf');
    } catch (error) {
      setError('Erreur lors de l\'export des logs');
    }
  };

  const getChartData = () => {
    if (!stats?.monthlyData) return null;

    return {
      labels: stats.monthlyData.map(d => d.month),
      datasets: [
        {
          label: 'Nouveaux prestataires',
          data: stats.monthlyData.map(d => d.count),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };
  };

  const getCategoryData = () => {
    if (!stats?.categoryData) return null;

    return {
      labels: stats.categoryData.map(d => d.category),
      datasets: [
        {
          label: 'Prestataires par catégorie',
          data: stats.categoryData.map(d => d.count),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)'
          ]
        }
      ]
    };
  };

  const loadTags = async () => {
    try {
      const tagsData = await providerService.getTags();
      setTags(tagsData);
    } catch (error) {
      setError('Erreur lors du chargement des tags');
    }
  };

  const setupNotifications = () => {
    // Simuler des notifications en temps réel
    const ws = new WebSocket(process.env.REACT_APP_WS_URL);
    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      setNotifications(prev => [notification, ...prev]);
    };
  };

  const loadCalendarEvents = async () => {
    try {
      const events = await providerService.getValidationEvents();
      setCalendarEvents(events);
    } catch (error) {
      setError('Erreur lors du chargement des événements');
    }
  };

  const handleTagSelection = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const generateReport = async () => {
    try {
      const report = await providerService.generateReport({
        type: reportType,
        startDate: reportDateRange[0],
        endDate: reportDateRange[1],
        tags: selectedTags
      });
      
      // Télécharger le rapport
      const doc = await providerService.exportToPDF(report);
      doc.save(`rapport-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      setError('Erreur lors de la génération du rapport');
    }
  };

  const handleCalendarDateClick = (date) => {
    const events = calendarEvents.filter(event => 
      new Date(event.date).toDateString() === date.toDateString()
    );
    // Afficher les événements du jour
    setSelectedDate(date);
    setSelectedEvents(events);
  };

  const handleSearch = async () => {
    try {
      const results = await providerService.searchProviders({
        query: searchQuery,
        ...searchFilters
      });
      setSearchResults(results);
    } catch (error) {
      setError('Erreur lors de la recherche');
    }
  };

  const handleSearchFilterChange = (name, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addWidget = (widget) => {
    setCustomWidgets(prev => [...prev, widget]);
    setAvailableWidgets(prev => prev.filter(w => w.id !== widget.id));
  };

  const removeWidget = (widgetId) => {
    const widget = customWidgets.find(w => w.id === widgetId);
    setCustomWidgets(prev => prev.filter(w => w.id !== widgetId));
    setAvailableWidgets(prev => [...prev, widget]);
  };

  const exportData = async (format) => {
    try {
      let data;
      switch (format) {
        case 'pdf':
          const doc = await providerService.exportToPDF(searchResults);
          doc.save('export.pdf');
          break;
        case 'excel':
          data = searchResults.map(result => ({
            Nom: result.name,
            Catégorie: result.category,
            Statut: result.status,
            Note: result.rating,
            Tags: result.tags.join(', '),
            Date: new Date(result.createdAt).toLocaleDateString()
          }));
          const ws = XLSX.utils.json_to_sheet(data);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Prestataires');
          XLSX.writeFile(wb, 'export.xlsx');
          break;
        case 'csv':
          data = searchResults.map(result => ({
            name: result.name,
            category: result.category,
            status: result.status,
            rating: result.rating,
            tags: result.tags.join(','),
            date: new Date(result.createdAt).toLocaleDateString()
          }));
          const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(data));
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'export.csv';
          link.click();
          break;
      }
    } catch (error) {
      setError('Erreur lors de l\'export des données');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Administration</h1>
          
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="flex items-center px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50"
            >
              <Bell size={20} className="mr-2" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Notifications</h3>
                  <div className="space-y-2">
                    {notifications.map((notification, index) => (
                      <div key={index} className="p-2 hover:bg-gray-50 rounded">
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-gray-500">{new Date(notification.timestamp).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeTab === 'import' ? 'bg-primary text-white' : 'bg-white'
            }`}
          >
            <Upload size={20} className="mr-2" />
            Import
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeTab === 'pending' ? 'bg-primary text-white' : 'bg-white'
            }`}
          >
            <FileText size={20} className="mr-2" />
            En attente
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeTab === 'stats' ? 'bg-primary text-white' : 'bg-white'
            }`}
          >
            <Activity size={20} className="mr-2" />
            Statistiques
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeTab === 'logs' ? 'bg-primary text-white' : 'bg-white'
            }`}
          >
            <Database size={20} className="mr-2" />
            Logs
          </button>
          <button
            onClick={() => setCalendarView(!calendarView)}
            className={`flex items-center px-4 py-2 rounded-lg ${
              calendarView ? 'bg-primary text-white' : 'bg-white'
            }`}
          >
            <Calendar size={20} className="mr-2" />
            Calendrier
          </button>
        </div>

        {/* Recherche avancée */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-grow">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher des prestataires..."
                  className="w-full px-4 py-2 pl-10 border rounded-lg"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>
            <button
              onClick={() => setShowSearchFilters(!showSearchFilters)}
              className="flex items-center px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50"
            >
              <Filter size={20} className="mr-2" />
              Filtres avancés
            </button>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Rechercher
            </button>
          </div>

          {showSearchFilters && (
            <div className="mt-4 bg-white p-4 rounded-lg shadow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={searchFilters.category}
                    onChange={(e) => handleSearchFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Toutes les catégories</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="hotel">Hôtel</option>
                    <option value="spa">Spa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select
                    value={searchFilters.status}
                    onChange={(e) => handleSearchFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="approved">Approuvé</option>
                    <option value="rejected">Rejeté</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note minimale
                  </label>
                  <select
                    value={searchFilters.rating}
                    onChange={(e) => handleSearchFilterChange('rating', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Toutes les notes</option>
                    <option value="4">4 étoiles et plus</option>
                    <option value="3">3 étoiles et plus</option>
                    <option value="2">2 étoiles et plus</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tableau de bord personnalisable */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Tableau de bord</h2>
            <div className="flex items-center space-x-4">
              <select
                value={dashboardLayout}
                onChange={(e) => setDashboardLayout(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="default">Disposition par défaut</option>
                <option value="compact">Compact</option>
                <option value="wide">Large</option>
              </select>
              <button
                onClick={() => setShowWidgetSelector(!showWidgetSelector)}
                className="flex items-center px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50"
              >
                <Layout size={20} className="mr-2" />
                Personnaliser
              </button>
            </div>
          </div>

          {showWidgetSelector && (
            <div className="mb-4 p-4 bg-white rounded-lg shadow">
              <h3 className="font-medium mb-2">Widgets disponibles</h3>
              <div className="flex flex-wrap gap-2">
                {availableWidgets.map(widget => (
                  <button
                    key={widget.id}
                    onClick={() => addWidget(widget)}
                    className="flex items-center px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <widget.icon size={16} className="mr-2" />
                    {widget.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={`grid gap-4 ${
            dashboardLayout === 'compact' ? 'grid-cols-3' :
            dashboardLayout === 'wide' ? 'grid-cols-2' :
            'grid-cols-4'
          }`}>
            {customWidgets.map(widget => (
              <div key={widget.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">{widget.name}</h3>
                  <button
                    onClick={() => removeWidget(widget.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                {/* Contenu du widget */}
                {widget.id === 'stats' && <StatsWidget />}
                {widget.id === 'calendar' && <CalendarWidget />}
                {widget.id === 'recent' && <RecentActivityWidget />}
                {widget.id === 'tags' && <TagsWidget />}
              </div>
            ))}
          </div>
        </div>

        {/* Export multi-formats */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
            <button
              onClick={() => exportData(exportFormat)}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              <FileDown size={20} className="mr-2" />
              Exporter
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {activeTab === 'import' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Importation des prestataires</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Import SharePoint */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Import depuis SharePoint</h3>
                  <button
                    onClick={handleSharePointImport}
                    disabled={importStatus === 'loading'}
                    className="w-full flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                  >
                    {importStatus === 'loading' ? 'Importation...' : 'Importer depuis SharePoint'}
                  </button>
                </div>

                {/* Import Excel */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Import depuis Excel</h3>
                  <label className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleExcelImport}
                      className="hidden"
                    />
                    Sélectionner un fichier Excel
                  </label>
                </div>
              </div>

              {importStatus === 'success' && (
                <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  Importation réussie
                </div>
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Prestataires en attente</h2>
                {selectedProviders.length > 0 && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleBulkValidation('approve')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Approuver la sélection ({selectedProviders.length})
                    </button>
                    <button
                      onClick={() => handleBulkValidation('reject')}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Rejeter la sélection ({selectedProviders.length})
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {pendingProviders.map((provider) => (
                  <div key={provider.id} className="border rounded-lg p-4">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={selectedProviders.includes(provider.id)}
                        onChange={() => toggleProviderSelection(provider.id)}
                        className="mt-1 mr-4"
                      />
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium">{provider.name}</h3>
                            <p className="text-gray-600">{provider.description}</p>
                            <div className="mt-2 text-sm text-gray-500">
                              <p>Source: {provider.source}</p>
                              <p>Catégorie: {provider.category}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleProviderValidation(provider.id, 'approve')}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                              Approuver
                            </button>
                            <button
                              onClick={() => handleProviderValidation(provider.id, 'reject')}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              Rejeter
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stats' && stats && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Total Prestataires</h3>
                  <p className="text-3xl font-bold">{stats.totalProviders}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">En attente</h3>
                  <p className="text-3xl font-bold">{stats.pendingProviders}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Ajoutés ce mois</h3>
                  <p className="text-3xl font-bold">{stats.newThisMonth}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">Évolution mensuelle</h3>
                  {getChartData() && (
                    <Line
                      data={getChartData()}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                          }
                        }
                      }}
                    />
                  )}
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">Répartition par catégorie</h3>
                  {getCategoryData() && (
                    <Bar
                      data={getCategoryData()}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                          }
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Logs d'activité</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowLogFilters(!showLogFilters)}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <Filter size={16} className="mr-2" />
                    Filtres
                  </button>
                  <button
                    onClick={exportLogs}
                    className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  >
                    <Download size={16} className="mr-2" />
                    Exporter
                  </button>
                </div>
              </div>

              {showLogFilters && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de début
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={logFilters.startDate}
                        onChange={handleLogFilterChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de fin
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={logFilters.endDate}
                        onChange={handleLogFilterChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Action
                      </label>
                      <select
                        name="action"
                        value={logFilters.action}
                        onChange={handleLogFilterChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="">Toutes les actions</option>
                        <option value="import">Import</option>
                        <option value="validation">Validation</option>
                        <option value="update">Mise à jour</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Utilisateur
                      </label>
                      <input
                        type="text"
                        name="user"
                        value={logFilters.user}
                        onChange={handleLogFilterChange}
                        placeholder="Filtrer par utilisateur"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={applyLogFilters}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                    >
                      Appliquer les filtres
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-gray-600">{log.details}</p>
                        <p className="text-sm text-gray-500 mt-1">Utilisateur: {log.user}</p>
                      </div>
                      <p className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleTagSelection(tag)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTags.includes(tag)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Rapports */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Rapports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="">Sélectionner un type de rapport</option>
                <option value="validations">Validations</option>
                <option value="imports">Imports</option>
                <option value="activity">Activité</option>
              </select>
              
              <div className="col-span-2">
                <Calendar
                  onChange={setReportDateRange}
                  value={reportDateRange}
                  selectRange={true}
                  className="w-full"
                />
              </div>
            </div>
            
            <button
              onClick={generateReport}
              disabled={!reportType}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
            >
              Générer le rapport
            </button>
          </div>

          {/* Vue Calendrier */}
          {calendarView && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Calendrier des validations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Calendar
                  onChange={handleCalendarDateClick}
                  value={selectedDate}
                  className="w-full"
                  tileContent={({ date }) => {
                    const events = calendarEvents.filter(event =>
                      new Date(event.date).toDateString() === date.toDateString()
                    );
                    return events.length > 0 ? (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                    ) : null;
                  }}
                />
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">
                    Événements du {selectedDate?.toLocaleDateString()}
                  </h4>
                  <div className="space-y-2">
                    {selectedEvents?.map((event, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-gray-600">{event.description}</p>
                        <p className="text-xs text-gray-500">{new Date(event.date).toLocaleTimeString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composants de widgets
const StatsWidget = () => (
  <div>
    {/* Contenu du widget statistiques */}
  </div>
);

const CalendarWidget = () => (
  <div>
    {/* Contenu du widget calendrier */}
  </div>
);

const RecentActivityWidget = () => (
  <div>
    {/* Contenu du widget activité récente */}
  </div>
);

const TagsWidget = () => (
  <div>
    {/* Contenu du widget tags */}
  </div>
);

export default AdminPage; 