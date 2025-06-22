import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, Settings, BarChart3 } from 'lucide-react';
import UserManagement from './UserManagement';
import AccountManagement from './AccountManagement';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');

  const adminStats = [
    {
      title: 'Utilisateurs Actifs',
      value: '24',
      change: '+3 ce mois',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Comptes Google Ads',
      value: '47',
      change: '+5 ce mois',
      icon: Building2,
      color: 'text-green-600'
    },
    {
      title: 'Requêtes API',
      value: '15.2K',
      change: '+12% cette semaine',
      icon: BarChart3,
      color: 'text-purple-600'
    },
    {
      title: 'Taux d\'utilisation',
      value: '78%',
      change: 'Stable',
      icon: Settings,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
          <p className="text-gray-600">Gestion des utilisateurs et des comptes Google Ads</p>
        </div>
        <Badge variant="secondary" className="bg-[#E53E3E] text-white">
          Administrateur
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.change}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Admin Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Panneau de Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users">👥 Utilisateurs</TabsTrigger>
              <TabsTrigger value="accounts">🏢 Comptes Google Ads</TabsTrigger>
              <TabsTrigger value="permissions">🔐 Permissions</TabsTrigger>
              <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="mt-6">
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="accounts" className="mt-6">
              <AccountManagement />
            </TabsContent>
            
            <TabsContent value="permissions" className="mt-6">
              <div className="text-center py-12">
                <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestion des Permissions</h3>
                <p className="text-gray-600">Configuration des rôles et permissions utilisateur</p>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-6">
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Plateforme</h3>
                <p className="text-gray-600">Statistiques d'utilisation et de performance</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}