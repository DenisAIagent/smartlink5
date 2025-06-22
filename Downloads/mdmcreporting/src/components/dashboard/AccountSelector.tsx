import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, Building2 } from 'lucide-react';
import { useAccount } from '@/contexts/AccountContext';

export default function AccountSelector() {
  const { availableAccounts, activeAccount, switchAccount, refreshAccounts, isLoading } = useAccount();

  const handleAccountChange = (accountId: string) => {
    // Ignore la valeur spéciale pour "aucun compte"
    if (accountId === 'no-accounts') return;
    
    const account = availableAccounts.find(acc => acc.id === accountId);
    if (account) {
      switchAccount(account);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <Building2 className="h-4 w-4 text-gray-600" />
        <label className="text-sm font-medium text-gray-700">Compte actif :</label>
      </div>
      
      <Select
        value={activeAccount?.id || ''}
        onValueChange={handleAccountChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-64">
          <SelectValue placeholder="-- Sélectionner un compte --" />
        </SelectTrigger>
        <SelectContent>
          {availableAccounts.length === 0 ? (
            <SelectItem value="no-accounts" disabled>
              Aucun compte disponible
            </SelectItem>
          ) : (
            availableAccounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{account.name}</span>
                  <span className="text-xs text-gray-500">{account.customerId}</span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={refreshAccounts}
        disabled={isLoading}
        className="flex items-center space-x-1"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">Actualiser</span>
      </Button>
    </div>
  );
}
