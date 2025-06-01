import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ApiProvider } from './contexts/ApiContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import ProvidersPage from './pages/ProvidersPage';
import ProviderDetailPage from './pages/ProviderDetailPage';
import OffersPage from './pages/OffersPage';
import OfferDetailPage from './pages/OfferDetailPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import NotFoundPage from './pages/NotFoundPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/auth/ProfilePage';

// Dashboard
import DashboardPage from './pages/dashboard/DashboardPage';

function App() {
  return (
    <ApiProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="pt-20">
              <Routes>
                {/* Landing Page - Page d'accueil principale */}
                <Route path="/" element={<LandingPage />} />
                
                {/* Pages publiques */}
                <Route path="/home" element={<HomePage />} />
                <Route path="/providers" element={<ProvidersPage />} />
                <Route path="/providers/:id" element={<ProviderDetailPage />} />
                <Route path="/offers" element={<OffersPage />} />
                <Route path="/offers/:id" element={<OfferDetailPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                
                {/* Pages d'authentification */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Pages protégées */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                
                {/* Page 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ApiProvider>
  );
}

export default App;

