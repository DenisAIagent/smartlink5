import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export const useGoogleAdsData = (customerId, dateRange = 'LAST_30_DAYS') => {
  const [data, setData] = useState({
    metrics: null,
    campaigns: null,
    deviceComparison: null,
    loading: true,
    error: null
  });

  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(async () => {
    if (!customerId) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      const [metricsRes, campaignsRes, deviceRes] = await Promise.all([
        fetch(`${API_BASE_URL}/metrics?customerId=${customerId}&dateRange=${dateRange}`),
        fetch(`${API_BASE_URL}/campaigns?customerId=${customerId}&dateRange=${dateRange}`),
        fetch(`${API_BASE_URL}/device-comparison?customerId=${customerId}&dateRange=${dateRange}`)
      ]);

      const [metricsData, campaignsData, deviceData] = await Promise.all([
        metricsRes.json(),
        campaignsRes.json(),
        deviceRes.json()
      ]);

      if (metricsData.success && campaignsData.success && deviceData.success) {
        setData({
          metrics: metricsData.data,
          campaigns: campaignsData.data,
          deviceComparison: deviceData.data,
          loading: false,
          error: null,
          lastUpdated: new Date()
        });
      } else {
        throw new Error('Erreur lors du chargement des données');
      }
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, [customerId, dateRange, refreshKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return {
    ...data,
    refresh,
    isLoading: data.loading
  };
};

export const useGoogleAdsAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/accounts`);
      const data = await response.json();
      
      if (data.success) {
        setAccounts(data.data);
      } else {
        throw new Error(data.error || 'Erreur lors du chargement des comptes');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const refreshAccounts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/refresh`, { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setAccounts(data.data);
      }
    } catch (err) {
      console.error('Error refreshing accounts:', err);
    }
  }, []);

  return {
    accounts,
    loading,
    error,
    refresh: refreshAccounts,
    refetch: fetchAccounts
  };
}; 