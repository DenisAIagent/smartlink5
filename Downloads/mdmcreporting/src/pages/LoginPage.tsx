import React from 'react';
import { Navigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import LoginInstructions from '@/components/auth/LoginInstructions';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#E53E3E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="flex gap-8 w-full max-w-6xl">
        {/* Formulaire de connexion */}
        <div className="flex-1 max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              MDMC Reporting
            </h1>
            <p className="text-gray-600">
              Plateforme d'analyse Google Ads
            </p>
          </div>
          
          <LoginForm />
        </div>
        
        {/* Instructions de démonstration */}
        <div className="flex-1 max-w-md">
          <LoginInstructions />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
