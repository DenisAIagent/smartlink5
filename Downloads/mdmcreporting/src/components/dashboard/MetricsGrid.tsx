import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Target, DollarSign, MousePointer, Eye, ShoppingCart } from 'lucide-react';
import { useAccount } from '@/contexts/AccountContext';

export default function MetricsGrid() {
  const { activeAccount } = useAccount();

  // Mock metrics data - replace with real API data
  const metrics = [
    {
      title: 'Campagnes Actives',
      value: '24',
      change: '+12%',
      trend: 'up',
      icon: Target,
      color: 'text-blue-600'
    },
    {
      title: 'Budget Total',
      value: activeAccount ? `${activeAccount.currency === 'EUR' ? '€' : '$'}${activeAccount.totalBudget.toLocaleString()}` : '€0',
      change: '-3%',
      trend: 'down',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Impressions',
      value: '458.2K',
      change: '+24%',
      trend: 'up',
      icon: Eye,
      color: 'text-purple-600'
    },
    {
      title: 'Clics',
      value: '12.4K',
      change: '+8%',
      trend: 'up',
      icon: MousePointer,
      color: 'text-orange-600'
    },
    {
      title: 'Conversions',
      value: activeAccount ? activeAccount.conversions.toString() : '0',
      change: '+18%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-red-600'
    },
    {
      title: 'ROAS Moyen',
      value: '4.2x',
      change: '+8%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-indigo-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
        
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {metric.value}
                  </p>
                  <div className="flex items-center space-x-1">
                    <TrendIcon className={`h-3 w-3 ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`} />
                    <span className={`text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change}
                    </span>
                    <span className="text-sm text-gray-500">vs mois dernier</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className={`p-3 rounded-lg bg-gray-50`}>
                    <Icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}