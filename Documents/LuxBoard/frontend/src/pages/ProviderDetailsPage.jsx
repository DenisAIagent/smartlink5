import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { providerService } from '../services/providerService';
import { MapPin, Star, Clock, Phone, Mail, Calendar, Users, CreditCard, ExternalLink, Globe } from 'react-feather';

const ProviderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [guests, setGuests] = useState(1);
  const [googleInfo, setGoogleInfo] = useState(null);

  useEffect(() => {
    loadProviderDetails();
  }, [id]);

  const loadProviderDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [providerData, reviewsData] = await Promise.all([
        providerService.getProviderById(id),
        providerService.getProviderReviews(id)
      ]);
      setProvider(providerData);
      setReviews(reviewsData);

      // Charger les informations Google My Business si un placeId est disponible
      if (providerData.googlePlaceId) {
        const googleData = await providerService.getGoogleMyBusinessInfo(providerData.googlePlaceId);
        setGoogleInfo(googleData);
      }
    } catch (error) {
      setError('Erreur lors du chargement des détails du prestataire');
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailability = async (date) => {
    try {
      const availabilityData = await providerService.getAvailability(id, date);
      setAvailability(availabilityData);
    } catch (error) {
      console.error('Erreur lors du chargement des disponibilités:', error);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedTime('');
    if (date) {
      loadAvailability(date);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      const bookingData = {
        date: selectedDate,
        time: selectedTime,
        guests,
      };
      await providerService.bookProvider(id, bookingData);
      navigate(`/bookings/confirmation`);
    } catch (error) {
      setError('Erreur lors de la réservation');
      console.error('Erreur:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* En-tête du prestataire */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="relative h-96">
            <img
              src={provider.image}
              alt={provider.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
              <h1 className="text-3xl font-bold text-white mb-2">{provider.name}</h1>
              <div className="flex items-center text-white">
                <MapPin size={20} className="mr-2" />
                <span>{provider.location}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations principales */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">À propos</h2>
              <p className="text-gray-600 mb-6">{provider.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Phone size={20} className="text-gray-400 mr-2" />
                  <span>{provider.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail size={20} className="text-gray-400 mr-2" />
                  <span>{provider.email}</span>
                </div>
              </div>

              {/* Informations Google My Business */}
              {googleInfo && (
                <div className="border-t pt-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Informations Google</h3>
                    <a
                      href={googleInfo.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary hover:text-primary-dark"
                    >
                      <Globe size={20} className="mr-2" />
                      Voir sur Google Maps
                      <ExternalLink size={16} className="ml-1" />
                    </a>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Horaires d'ouverture</h4>
                      <div className="space-y-1">
                        {googleInfo.openingHours?.map((hours, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{hours.day}</span>
                            <span>{hours.hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Informations supplémentaires</h4>
                      <div className="space-y-2">
                        {googleInfo.website && (
                          <a
                            href={googleInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-primary hover:text-primary-dark"
                          >
                            <Globe size={16} className="mr-2" />
                            Site web
                            <ExternalLink size={14} className="ml-1" />
                          </a>
                        )}
                        {googleInfo.rating && (
                          <div className="flex items-center">
                            <Star size={16} className="text-yellow-400 mr-1" />
                            <span>{googleInfo.rating}</span>
                            <span className="text-gray-500 ml-1">
                              ({googleInfo.userRatingsTotal} avis)
                            </span>
                          </div>
                        )}
                        {googleInfo.priceLevel && (
                          <div className="text-gray-600">
                            Niveau de prix: {'€'.repeat(googleInfo.priceLevel)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Horaires d'ouverture (si pas d'infos Google) */}
              {!googleInfo && (
                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold mb-4">Horaires d'ouverture</h3>
                  <div className="space-y-2">
                    {provider.openingHours?.map((hours, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="font-medium">{hours.day}</span>
                        <span>{hours.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Avis */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Avis</h2>
                <div className="flex items-center">
                  <Star size={20} className="text-yellow-400 mr-1" />
                  <span className="font-medium">{provider.rating}</span>
                  <span className="text-gray-500 ml-1">({provider.reviews} avis)</span>
                </div>
              </div>

              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <img
                          src={review.user.avatar}
                          alt={review.user.name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <h4 className="font-medium">{review.user.name}</h4>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Star size={16} className="text-yellow-400 mr-1" />
                        <span>{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formulaire de réservation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-2xl font-semibold mb-6">Réserver</h2>
              
              <form onSubmit={handleBooking} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                </div>

                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    >
                      <option value="">Sélectionner une heure</option>
                      {availability.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de personnes
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      min="1"
                      max={provider.maxGuests}
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Prix par personne</span>
                    <span className="font-medium">{provider.pricePerPerson}€</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Total</span>
                    <span className="text-xl font-bold">
                      {provider.pricePerPerson * guests}€
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <CreditCard size={20} />
                  Réserver maintenant
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProviderDetailsPage; 