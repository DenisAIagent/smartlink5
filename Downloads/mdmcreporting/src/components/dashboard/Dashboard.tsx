import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import MetricsGrid from './MetricsGrid';
import AccountSelector from './AccountSelector';
import { useAccount } from '@/contexts/AccountContext';
import GoogleAdsSimpleConnector from './GoogleAdsSimpleConnector';

export default function Dashboard() {
  const { activeAccount } = useAccount();

  const recentAlerts = [
    {
      id: '1',
      type: 'warning',
      message: 'Campagne "Black Friday Sale" proche du budget limite',
      time: '5 min'
    },
    {
      id: '2',
      type: 'success',
      message: 'ROAS de la campagne "Retargeting" a augmenté de 15%',
      time: '1h'
    },
    {
      id: '3',
      type: 'error',
      message: 'Campagne "Display Network" en pause automatique',
      time: '2h'
    }
  ];

  const topCampaigns = [
    {
      name: 'Black Friday Sale',
      spend: 2450,
      conversions: 89,
      roas: 4.2,
      change: '+12%'
    },
    {
      name: 'Retargeting Premium',
      spend: 1890,
      conversions: 67,
      roas: 3.8,
      change: '+8%'
    },
    {
      name: 'Search Brand',
      spend: 1230,
      conversions: 45,
      roas: 5.1,
      change: '-2%'
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Vue d'ensemble de vos campagnes Google Ads</p>
        </div>
        <div className="flex items-center space-x-4">
          <AccountSelector />
          <Badge variant="outline" className="text-green-600 border-green-600">
            Données synchronisées il y a 5 min
          </Badge>
        </div>
      </div>

      {/* Account Status */}
      {activeAccount && (
        <Card className="border-l-4 border-l-[#E53E3E]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Compte actif : {activeAccount.name}</h3>
                <p className="text-sm text-gray-600">ID: {activeAccount.customerId}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Budget total</p>
                <p className="text-lg font-bold text-gray-900">
                  {activeAccount.currency === 'EUR' ? '€' : '$'}{activeAccount.totalBudget.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Grid */}
      <MetricsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-[#E53E3E]" />
              Alertes Récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500">Il y a {alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Voir toutes les alertes
            </Button>
          </CardContent>
        </Card>

        {/* Top Performing Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Top Campagnes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCampaigns.map((campaign, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{campaign.name}</p>
                    <p className="text-sm text-gray-600">
                      €{campaign.spend.toLocaleString()} • {campaign.conversions} conv.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">ROAS {campaign.roas}x</p>
                    <div className="flex items-center">
                      {campaign.change.startsWith('+') ? (
                        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                      )}
                      <span className={`text-xs ${
                        campaign.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {campaign.change}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Voir toutes les campagnes
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <TrendingUp className="h-6 w-6 text-[#E53E3E]" />
              <span>Analyser Performance</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <AlertTriangle className="h-6 w-6 text-[#E53E3E]" />
              <span>Configurer Alertes</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <CheckCircle className="h-6 w-6 text-[#E53E3E]" />
              <span>Exporter Rapport</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
