import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Building2, Users, TrendingUp } from 'lucide-react';
import { GoogleAdsAccount } from '@/types';

export default function AccountManagement() {
  const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    customerId: '',
    name: '',
    currency: 'EUR',
    assignedUsers: [] as string[]
  });

  useEffect(() => {
    // Mock data - replace with API call
    setAccounts([
      {
        id: '1',
        customerId: '123-456-7890',
        name: 'Client A - E-commerce',
        currency: 'EUR',
        status: 'active',
        assignedUsers: ['2', '3'],
        totalBudget: 15420,
        spent: 12350,
        conversions: 247,
        lastSync: new Date('2024-01-20T10:30:00')
      },
      {
        id: '2',
        customerId: '098-765-4321',
        name: 'Client B - SaaS',
        currency: 'USD',
        status: 'active',
        assignedUsers: ['2'],
        totalBudget: 25000,
        spent: 18750,
        conversions: 189,
        lastSync: new Date('2024-01-20T09:15:00')
      },
      {
        id: '3',
        customerId: '555-123-9999',
        name: 'Client C - Retail',
        currency: 'EUR',
        status: 'paused',
        assignedUsers: [],
        totalBudget: 8500,
        spent: 7200,
        conversions: 156,
        lastSync: new Date('2024-01-19T16:45:00')
      }
    ]);
  }, []);

  const handleCreateAccount = () => {
    const account: GoogleAdsAccount = {
      id: Date.now().toString(),
      customerId: newAccount.customerId,
      name: newAccount.name,
      currency: newAccount.currency,
      status: 'active',
      assignedUsers: newAccount.assignedUsers,
      totalBudget: 0,
      spent: 0,
      conversions: 0,
      lastSync: new Date()
    };
    
    setAccounts([...accounts, account]);
    setNewAccount({ customerId: '', name: '', currency: 'EUR', assignedUsers: [] });
    setIsDialogOpen(false);
  };

  const toggleAccountStatus = (accountId: string) => {
    setAccounts(accounts.map(account => 
      account.id === accountId 
        ? { ...account, status: account.status === 'active' ? 'paused' : 'active' }
        : account
    ));
  };

  const deleteAccount = (accountId: string) => {
    setAccounts(accounts.filter(account => account.id !== accountId));
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestion des Comptes Google Ads</h2>
          <p className="text-sm text-gray-600">Configurer et assigner les comptes clients</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#E53E3E] hover:bg-[#C53030]">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau compte
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un compte Google Ads</DialogTitle>
              <DialogDescription>
                Connectez un nouveau compte Google Ads à la plateforme.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerId">ID Client Google Ads</Label>
                <Input
                  id="customerId"
                  value={newAccount.customerId}
                  onChange={(e) => setNewAccount({ ...newAccount, customerId: e.target.value })}
                  placeholder="123-456-7890"
                />
              </div>
              <div>
                <Label htmlFor="accountName">Nom du compte</Label>
                <Input
                  id="accountName"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  placeholder="Client A - E-commerce"
                />
              </div>
              <div>
                <Label htmlFor="currency">Devise</Label>
                <Select value={newAccount.currency} onValueChange={(value) => setNewAccount({ ...newAccount, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateAccount} className="bg-[#E53E3E] hover:bg-[#C53030]">
                Ajouter le compte
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Comptes Actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {accounts.filter(a => a.status === 'active').length}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilisateurs Assignés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(accounts.flatMap(a => a.assignedUsers)).size}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  €{accounts.reduce((sum, a) => sum + a.totalBudget, 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Compte</TableHead>
                <TableHead>ID Client</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Budget/Dépensé</TableHead>
                <TableHead>Conversions</TableHead>
                <TableHead>Utilisateurs</TableHead>
                <TableHead>Dernière sync</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{account.name}</div>
                      <div className="text-sm text-gray-500">{account.currency}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {account.customerId}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(account.status)}>
                      {account.status === 'active' ? 'Actif' : 
                       account.status === 'paused' ? 'En pause' : 'Suspendu'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {account.currency === 'EUR' ? '€' : '$'}{account.totalBudget.toLocaleString()}
                      </div>
                      <div className="text-gray-500">
                        Dépensé: {account.currency === 'EUR' ? '€' : '$'}{account.spent.toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{account.conversions}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {account.assignedUsers.length} utilisateur(s)
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {account.lastSync.toLocaleString('fr-FR')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAccountStatus(account.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAccount(account.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}