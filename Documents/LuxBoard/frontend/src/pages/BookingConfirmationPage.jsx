import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import { providerService } from '../services/providerService';
import { Calendar, Clock, Users, CreditCard, MapPin, Phone, Mail, CheckCircle, XCircle } from 'react-feather';

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const bookingData = await providerService.getBookingDetails(bookingId);
      setBooking(bookingData);
    } catch (error) {
      setError('Erreur lors du chargement des détails de la réservation');
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    try {
      await providerService.cancelBooking(bookingId);
      navigate('/bookings');
    } catch (error) {
      setError('Erreur lors de l\'annulation de la réservation');
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
        <div className="max-w-3xl mx-auto">
          {/* En-tête de confirmation */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-500" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Réservation confirmée !
            </h1>
            <p className="text-gray-600">
              Votre réservation a été confirmée. Vous recevrez un email de confirmation avec tous les détails.
            </p>
          </div>

          {/* Détails de la réservation */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="p-8">
              <h2 className="text-2xl font-semibold mb-6">Détails de la réservation</h2>
              
              <div className="space-y-6">
                {/* Informations du prestataire */}
                <div className="flex items-start space-x-4">
                  <img
                    src={booking.provider.image}
                    alt={booking.provider.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-lg">{booking.provider.name}</h3>
                    <div className="flex items-center text-gray-600 mt-1">
                      <MapPin size={16} className="mr-1" />
                      <span>{booking.provider.location}</span>
                    </div>
                  </div>
                </div>

                {/* Détails de la réservation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar size={20} className="text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500">Date</div>
                        <div className="font-medium">{new Date(booking.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock size={20} className="text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500">Heure</div>
                        <div className="font-medium">{booking.time}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Users size={20} className="text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500">Nombre de personnes</div>
                        <div className="font-medium">{booking.guests} personnes</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <CreditCard size={20} className="text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500">Prix total</div>
                        <div className="font-medium">{booking.totalPrice}€</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone size={20} className="text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500">Contact</div>
                        <div className="font-medium">{booking.provider.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Mail size={20} className="text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="font-medium">{booking.provider.email}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statut de la réservation */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        booking.status === 'confirmed' ? 'bg-green-500' :
                        booking.status === 'pending' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      <span className="font-medium capitalize">{booking.status}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Référence: {booking.reference}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 px-8 py-6 flex justify-between items-center">
              <button
                onClick={() => navigate('/bookings')}
                className="text-gray-600 hover:text-gray-900"
              >
                Retour aux réservations
              </button>
              {booking.status === 'confirmed' && (
                <button
                  onClick={handleCancelBooking}
                  className="flex items-center text-red-600 hover:text-red-700"
                >
                  <XCircle size={20} className="mr-2" />
                  Annuler la réservation
                </button>
              )}
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-semibold mb-4">Informations importantes</h3>
            <ul className="space-y-3 text-gray-600">
              <li>• Veuillez arriver 15 minutes avant l'heure de votre réservation</li>
              <li>• En cas d'annulation, merci de nous prévenir au moins 24h à l'avance</li>
              <li>• N'oubliez pas d'apporter votre pièce d'identité</li>
              <li>• Pour toute question, n'hésitez pas à contacter le prestataire</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingConfirmationPage; 