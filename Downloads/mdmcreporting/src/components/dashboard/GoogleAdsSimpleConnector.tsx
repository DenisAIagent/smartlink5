// src/components/dashboard/GoogleAdsSimpleConnector.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Database,
  Key,
  Building2
} from 'lucide-react';
import { googleAdsSimpleService } from '@/services/google-ads-simple';
import { useAccount } from '@/contexts/AccountContext';

export default function GoogleAdsSimpleConnector() {
  const [mccCustomerId, setMccCustomerId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { refreshAccounts, isLoading } = useAccount();
  
  const configInfo = googleAdsSimpleService.getConfigInfo();
  const isDemoMode = configInfo.isDemoMode;

  const handleConnect = async () => {
    if (!mccCustomerId.trim()) {
      setError('Veuillez saisir votre Customer ID MCC');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      await googleAdsSimpleService.connectToMCC(mccCustomerId);
      await refreshAccounts(); // Recharger les comptes avec les nouvelles données
      setMccCustomerId(''); // Vider le champ après succès
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur de connexion');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    googleAdsSimpleService.disconnect();
    await refreshAccounts(); // Recharger avec les données de démo
  };

  const formatCustomerId = (value: string) => {
    // Supprime tout sauf les chiffres
    const cleaned = value.replace(/\D/g, '');
    
    // Limite à 10 chiffres
    const limited = cleaned.substring(0, 10);
    
    // Ajoute les tirets au bon endroit
    if (limited.length >= 6) {
      return `${limited.substring(0, 3)}-${limited.substring(3, 6)}-${limited.substring(6)}`;
    } else if (limited.length >= 3) {
      return `${limited.substring(0, 3)}-${limited.substring(3)}`;
    }
    return limited;
  };

  const handleCustomerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCustomerId(e.target.value);
    setMccCustomerId(formatted);
  };

  const getStatusBadge = () => {
    if (isConnecting || isLoading) {
      return (
        <Badge variant="secondary" className="animate-pulse">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Connexion...
        </Badge>
      );
    }

    if (error) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Erreur
        </Badge>
      );
    }

    if (!isDemoMode) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Connecté au MCC
        </Badge>
      );
    }

    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <AlertCircle className="h-3 w-3 mr-1" />
        Mode démonstration
      </Badge>
    );
  };

  const getDataSourceIndicator = () => {
    return (
      <div className="flex items-center space-x-2">
        <Database className="h-4 w-4" />
        <span className="text-sm font-medium">Source des données:</span>
        <Badge className={!isDemoMode ? 
          'bg-green-100 text-green-800 border-green-200' : 
          'bg-yellow-100 text-yellow-800 border-yellow-200'
        }>
          {configInfo.dataSource}
        </Badge>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Connexion Google Ads (Simplifié)</span>
            {getStatusBadge()}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Indicateur de source des données */}
        {getDataSourceIndicator()}

        {/* Configuration Info */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center">
            <Key className="h-4 w-4 mr-2" />
            Configuration API
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Developer Token:</span>
              <Badge variant="default">
                ✓ {configInfo.hasDeveloperToken ? 'Configuré' : 'Manquant'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>API Version:</span>
              <Badge variant="outline">
                {configInfo.apiVersion}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Mode:</span>
              <Badge variant={isDemoMode ? "secondary" : "default"}>
                {isDemoMode ? 'Démonstration' : 'MCC Connecté'}
              </Badge>
            </div>

            {!isDemoMode && (
              <div className="flex items-center justify-between">
                <span>MCC ID:</span>
                <Badge variant="outline">
                  {configInfo.mccCustomerId}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Formulaire de connexion */}
        {isDemoMode ? (
          <div className="space-y-3">
            <Label htmlFor="mcc-customer-id">
              Customer ID de votre compte MCC
            </Label>
            <div className="flex space-x-2">
              <Input
                id="mcc-customer-id"
                placeholder="123-456-7890"
                value={mccCustomerId}
                onChange={handleCustomerIdChange}
                disabled={isConnecting}
                className="flex-1"
                maxLength={12} // Format: 123-456-7890
              />
              <Button
                onClick={handleConnect}
                disabled={isConnecting || !mccCustomerId.match(/^\d{3}-\d{3}-\d{4}$/)}
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Connecter'
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Saisissez l'ID de votre compte Manager (MCC) pour charger vos vraies données
            </p>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="flex-1"
            >
              Retour au mode démonstration
            </Button>
          </div>
        )}

        {/* Informations sur la clé API */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            ℹ️ À propos de cette configuration
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Utilise votre clé API Google Ads : CxDKMTI2CrPhkaNgHtwkoA</li>
            <li>• Mode simplifié sans backend requis</li>
            <li>• Données simulées basées sur votre MCC</li>
            <li>• Idéal pour le développement et les tests</li>
          </ul>
        </div>

        {/* Prochaines étapes pour un backend */}
        {!isDemoMode && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-medium text-green-900 mb-2">
              ✅ Connexion simulée réussie !
            </h4>
            <p className="text-xs text-green-800 mb-2">
              Vous utilisez maintenant des données simulées basées sur votre MCC.
            </p>
            <p className="text-xs text-green-700">
              <strong>Pour des données 100% réelles :</strong> Configurez un backend sécurisé 
              pour faire les appels API directement vers Google Ads.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
