import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ProvidersPage from './pages/ProvidersPage';
import ProviderDetailsPage from './pages/ProviderDetailsPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import ErrorDisplay from './components/ErrorDisplay';
import { csrfService } from './services/csrfService';
import { errorService } from './services/errorService';
import LuxBoardLanding from './pages/LuxBoardLanding';
import LuxBoardDashboard from './pages/LuxBoardDashboard';
import LuxBoardLogin from './pages/LuxBoardLogin';

const App = () => {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await csrfService.initialize();
      } catch (error) {
        errorService.handleApiError(error);
      }
    };

    initializeApp();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<LuxBoardLanding />} />
            <Route path="/dashboard-luxboard" element={<LuxBoardDashboard />} />
            <Route path="/login-luxboard" element={<LuxBoardLogin />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/providers"
              element={
                <ProtectedRoute>
                  <ProvidersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/providers/:id"
              element={
                <ProtectedRoute>
                  <ProviderDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings/confirmation/:bookingId"
              element={
                <ProtectedRoute>
                  <BookingConfirmationPage />
                </ProtectedRoute>
              }
            />
            {/* Autres routes à ajouter */}
          </Routes>
          <ErrorDisplay />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
