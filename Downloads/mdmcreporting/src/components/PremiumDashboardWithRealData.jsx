import React from 'react';
import { useAdsDataStore } from '@/stores/adsData';
import AccountSelector from './AccountSelector';
import PremiumDashboard from './premium/PremiumDashboard';

const PremiumDashboardWithRealData = () => {
  const selectedAccountId = useAdsDataStore((state) => state.selectedAccountId);

  return (
    <div className="flex flex-col gap-8">
      <AccountSelector />
      
      {selectedAccountId ? (
        <PremiumDashboard key={selectedAccountId} customerId={selectedAccountId} />
      ) : (
        <div className="flex items-center justify-center h-64 border rounded-lg bg-background">
          <p className="text-muted-foreground">Veuillez sélectionner un compte pour afficher les données.</p>
        </div>
      )}
    </div>
  );
};

export default PremiumDashboardWithRealData; 