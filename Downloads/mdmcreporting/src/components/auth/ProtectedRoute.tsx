import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

// Placeholder pour le composant ProtectedRoute
// Dans une vraie application, il contiendrait la logique d'authentification
const ProtectedRoute = ({ children, requiredRole }: { children: ReactNode, requiredRole?: string }) => {
  const isAuthenticated = true; // Simuler l'authentification
  const userRole = 'admin'; // Simuler le rôle de l'utilisateur

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" />; // ou une page d'accès refusé
  }

  return <>{children}</>;
};

export default ProtectedRoute;