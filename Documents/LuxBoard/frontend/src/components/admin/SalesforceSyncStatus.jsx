import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import {
  Card,
  Button,
  Alert,
  Space,
  Typography,
  Timeline,
  Spin,
  message,
} from 'antd';
import {
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const SalesforceSyncStatus = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  // Requête pour récupérer le statut de la synchronisation
  const { data: syncStatus, isLoading } = useQuery(
    'salesforceSyncStatus',
    async () => {
      const response = await axios.get('/api/salesforce/sync/status');
      return response.data;
    },
    {
      refetchInterval: 5000, // Rafraîchir toutes les 5 secondes
    }
  );

  // Mutation pour démarrer la synchronisation
  const startSyncMutation = useMutation(
    async () => {
      return axios.post('/api/salesforce/sync/start');
    },
    {
      onSuccess: () => {
        message.success('Synchronisation démarrée avec succès');
        queryClient.invalidateQueries('salesforceSyncStatus');
      },
      onError: (error) => {
        message.error(
          `Erreur: ${error.response?.data?.error || 'Une erreur est survenue'}`
        );
      },
    }
  );

  const handleStartSync = async () => {
    setIsSyncing(true);
    try {
      await startSyncMutation.mutateAsync();
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <SyncOutlined spin />;
      case 'completed':
        return <CheckCircleOutlined />;
      case 'failed':
        return <CloseCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'processing';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <Title level={2}>Statut de la Synchronisation Salesforce</Title>
        <Text type="secondary" className="mb-6 block">
          Surveillez l'état de la synchronisation des données entre LuxBoard et
          Salesforce.
        </Text>

        {syncStatus && (
          <Alert
            message={`Statut: ${syncStatus.status}`}
            description={
              syncStatus.error
                ? `Erreur: ${syncStatus.error}`
                : `Dernière synchronisation: ${new Date(
                    syncStatus.lastSync
                  ).toLocaleString()}`
            }
            type={getStatusColor(syncStatus.status)}
            showIcon
            icon={getStatusIcon(syncStatus.status)}
            className="mb-6"
          />
        )}

        <Space direction="vertical" size="large" className="w-full">
          <Button
            type="primary"
            icon={<SyncOutlined spin={isSyncing} />}
            onClick={handleStartSync}
            loading={isSyncing}
            disabled={syncStatus?.status === 'running'}
          >
            Démarrer la Synchronisation
          </Button>

          <Timeline>
            <Timeline.Item
              color={getStatusColor(syncStatus?.status)}
              dot={getStatusIcon(syncStatus?.status)}
            >
              <Text strong>Synchronisation des Prestataires</Text>
              <br />
              <Text type="secondary">
                {syncStatus?.status === 'running'
                  ? 'Synchronisation en cours...'
                  : syncStatus?.status === 'completed'
                  ? 'Synchronisation terminée'
                  : 'En attente'}
              </Text>
            </Timeline.Item>

            <Timeline.Item
              color={getStatusColor(syncStatus?.status)}
              dot={getStatusIcon(syncStatus?.status)}
            >
              <Text strong>Synchronisation des Cas</Text>
              <br />
              <Text type="secondary">
                {syncStatus?.status === 'running'
                  ? 'Synchronisation en cours...'
                  : syncStatus?.status === 'completed'
                  ? 'Synchronisation terminée'
                  : 'En attente'}
              </Text>
            </Timeline.Item>
          </Timeline>
        </Space>
      </Card>
    </div>
  );
};

export default SalesforceSyncStatus; 