import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AccountProvider } from '@/contexts/AccountContext';
import { PremiumProvider } from '@/contexts/PremiumContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Layouts
import PremiumLayout from '@/components/layouts/PremiumLayout';
import AuthLayout from '@/components/layouts/AuthLayout';

// Pages Existantes
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ChatPage from '@/pages/ChatPage';
import AdminPage from '@/pages/AdminPage';

// Nouvelles Pages Premium
import PremiumDemoPage from '@/pages/PremiumDemoPage';
import ProductionPage from '@/pages/ProductionPage';

// CSS Premium
import './styles/mdmc-premium.css';

function App() {
  return (
    <AuthProvider>
      <AccountProvider>
        <PremiumProvider>
          <Router>
            <Routes>
              {/* Routes d'authentification */}
              <Route path="/login" element={
                <AuthLayout>
                  <LoginPage />
                </AuthLayout>
              } />
              
              {/* Routes protégées avec Layout Premium */}
              <Route path="/" element={
                <ProtectedRoute>
                  <PremiumLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="demo" element={<PremiumDemoPage />} />
                <Route path="production" element={<ProductionPage />} />
                
                {/* Routes Admin */}
                <Route path="admin/*" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPage />
                  </ProtectedRoute>
                } />
              </Route>
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </PremiumProvider>
      </AccountProvider>
    </AuthProvider>
  );
}

export default App;
