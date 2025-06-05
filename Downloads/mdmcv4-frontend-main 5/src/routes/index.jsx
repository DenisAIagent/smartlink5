import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Layout from '../components/layout/Layout';
import SettingsPage from '../admin/features/settings/SettingsPage';
import ReportsPage from '../admin/features/reports/ReportsPage';
import IntegrationsPage from '../admin/features/integrations/IntegrationsPage';
import Hero from '../components/landing/Hero';
import Services from '../components/landing/Services';
import Reviews from '../components/landing/Reviews';
import CaseStudySection from '../components/CaseStudySection';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <Hero />
        <Services />
        <Reviews />
        <CaseStudySection />
      </>
    ),
  },
  {
    path: '/login',
    element: <LoginForm />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'integrations',
        element: <IntegrationsPage />,
      },
    ],
  },
]);

export default router; 