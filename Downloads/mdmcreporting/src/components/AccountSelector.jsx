import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  Check, 
  Building2, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { useAdsDataStore } from '@/stores/adsData';
import ApiService from '@/services/ApiService';

const AccountSelector = () => {
  const { 
    data: accounts, 
    isLoading, 
    error 
  } = useQuery('googleAdsAccounts', ApiService.getAccounts);

  const [isOpen, setIsOpen] = useState(false);
  const selectedAccountId = useAdsDataStore((state) => state.selectedAccountId);
  const setSelectedAccountId = useAdsDataStore((state) => state.setSelectedAccountId);

  const handleAccountSelect = (accountId) => {
    setSelectedAccountId(accountId);
    setIsOpen(false);
  };

  const selectedAccount = accounts?.find(acc => acc.id === selectedAccountId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Chargement des comptes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle className="w-4 h-4" />
        Erreur: impossible de charger les comptes.
      </div>
    );
  }
  
  // Auto-select first account if none is selected
  if (!selectedAccountId && accounts && accounts.length > 0) {
    setSelectedAccountId(accounts[0].id);
  }

  return (
    <div className="relative w-full max-w-xs">
      <Button 
        variant="outline" 
        className="w-full justify-between" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          <span>{selectedAccount?.name || 'Sélectionner un compte'}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50">
          <CardContent className="p-2 max-h-60 overflow-y-auto">
            {accounts?.map((account) => (
              <div
                key={account.id}
                onClick={() => handleAccountSelect(account.id)}
                className="flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{account.name}</span>
                  <span className="text-xs text-muted-foreground">{account.formattedId}</span>
                </div>
                {selectedAccountId === account.id && <Check className="w-4 h-4 text-primary" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccountSelector; 