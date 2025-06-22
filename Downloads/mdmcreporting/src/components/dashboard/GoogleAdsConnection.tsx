// src/components/dashboard/GoogleAdsConnection.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GoogleIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { googleAdsApi } from '@/services/google-ads-api';

interface GoogleAdsConnectionProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

export default function GoogleAdsConnection({ onConnectionChange }: GoogleAdsConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'error'>(
    googleAdsApi.isAuthenticated() ? 'connected' : 'disconnected'
  );
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      // Vérifier si les identifiants OAuth2 sont configurés
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        throw new Error('Configuration OAuth2 manquante. Veuillez définir VITE_GOOGLE_CLIENT_ID.');
      }

      // Lancer le processus d'authentification OAuth2
      googleAdsApi.initiateOAuthFlow();
    } catch (err) {
      console.error('Erreur de connexion Google Ads:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setConnectionStatus('error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('google_ads_access_token');
    localStorage.removeItem('google_ads_refresh_token');
    setConnectionStatus('disconnected');
    onConnectionChange?.(false);
  };

  // Vérifier le token au chargement
  React.useEffect(() => {
    const hasToken = googleAdsApi.restoreAccessToken();
    if (hasToken) {
      setConnectionStatus('connected');
      onConnectionChange?.(true);
    }
  }, [onConnectionChange]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GoogleIcon className="h-5 w-5" />
          Connexion Google Ads
        </CardTitle>
        <CardDescription>
          Connectez votre compte Google Ads pour accéder aux données réelles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statut de connexion */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Statut :</span>
          {connectionStatus === 'connected' && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connecté
            </Badge>
          )}
          {connectionStatus === 'disconnected' && (
            <Badge variant="secondary">
              <AlertCircle className="h-3 w-3 mr-1" />
              Non connecté
            </Badge>
          )}
          {connectionStatus === 'error' && (
            <Badge variant="destructive">
              <AlertCircle className="h-3 w-3 mr-1" />
              Erreur
            </Badge>
          )}
        </div>

        {/* Messages d'erreur */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-2">
          {connectionStatus === 'connected' ? (
            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="flex-1"
            >
              Déconnecter
            </Button>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex-1"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <GoogleIcon className="h-4 w-4 mr-2" />
                  Connecter
                </>
              )}
            </Button>
          )}
        </div>

        {/* Informations */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Accès aux comptes Google Ads autorisés</p>
          <p>• Métriques de campagnes en temps réel</p>
          <p>• Données de performance actualisées</p>
        </div>

        {/* Configuration requise */}
        {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Configuration requise : Définissez VITE_GOOGLE_CLIENT_ID dans votre fichier .env
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// Icône Google personnalisée
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
