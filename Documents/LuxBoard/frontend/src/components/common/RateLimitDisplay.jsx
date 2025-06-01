import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'react-feather';
import { apiService } from '../../services/apiService';

const RateLimitDisplay = ({ endpoint }) => {
  const [stats, setStats] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      const currentStats = apiService.getRateLimitStats(endpoint);
      setStats(currentStats);
      setIsVisible(currentStats?.remaining < 20);
    };

    // Mettre à jour les stats toutes les secondes
    const interval = setInterval(updateStats, 1000);
    updateStats();

    return () => clearInterval(interval);
  }, [endpoint]);

  if (!isVisible || !stats) return null;

  const remainingPercentage = (stats.remaining / 100) * 100;
  const timeUntilReset = Math.ceil((stats.resetTime - Date.now()) / 1000);

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-start space-x-3">
        <AlertCircle className="text-yellow-500 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900">
            Limite de requêtes
          </h4>
          <div className="mt-2">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-gray-600">
                    Requêtes restantes
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-gray-600">
                    {stats.remaining} / 100
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div
                  style={{ width: `${remainingPercentage}%` }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    remainingPercentage < 20
                      ? 'bg-red-500'
                      : remainingPercentage < 50
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Réinitialisation dans {timeUntilReset} secondes
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-500"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default RateLimitDisplay; 