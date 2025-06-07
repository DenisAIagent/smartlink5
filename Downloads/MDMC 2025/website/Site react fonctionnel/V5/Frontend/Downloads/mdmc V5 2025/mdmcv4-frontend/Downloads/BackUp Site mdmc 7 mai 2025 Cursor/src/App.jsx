import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Dashboard from './components/Dashboard';
import SmartLinkManager from './components/SmartLinkManager';
import SmartLinkStats from './components/SmartLinkStats';
import SmartLinkForm from './components/SmartLinkForm';
import ArtistListPage from './components/ArtistListPage';
import ArtistForm from './components/ArtistForm';
import Simulator from './components/Simulator';
import ReviewManager from './components/ReviewManager';
import MediaManager from './components/MediaManager';
import MarketingIntegrations from './components/MarketingIntegrations';
import WordPressConnector from './components/WordPressConnector';
import WordPressSync from './components/WordPressSync';
import LandingPagesManager from './components/LandingPagesManager';
import LandingPageGenerator from './components/LandingPageGenerator';
import Settings from './components/Settings';

const App = () => {
  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="smartlinks" element={<SmartLinkManager />} />
                <Route path="smartlinks/stats/:id" element={<SmartLinkStats />} />
                <Route path="smartlinks/create" element={<SmartLinkForm />} />
                <Route path="smartlinks/edit/:id" element={<SmartLinkForm />} />
                <Route path="artists" element={<ArtistListPage />} />
                <Route path="artists/create" element={<ArtistForm />} />
                <Route path="artists/edit/:id" element={<ArtistForm />} />
                <Route path="simulator" element={<Simulator />} />
                <Route path="reviews" element={<ReviewManager />} />
                <Route path="media" element={<MediaManager />} />
                <Route path="integrations" element={<MarketingIntegrations />} />
                <Route path="wordpress" element={<WordPressConnector />} />
                <Route path="wordpress/sync" element={<WordPressSync />} />
                <Route path="landing-pages" element={<LandingPagesManager />} />
                <Route path="landing-pages/create" element={<LandingPageGenerator />} />
                <Route path="landing-pages/edit/:id" element={<LandingPageGenerator />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App; 