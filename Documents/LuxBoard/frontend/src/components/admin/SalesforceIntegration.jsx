import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Spin,
  Alert,
  Switch,
  Space,
  Typography,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const SalesforceIntegration = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [isTesting, setIsTesting] = useState(false);

  // Requête pour récupérer la configuration Salesforce
  const { data: config, isLoading } = useQuery('salesforceConfig', async () => {
    const response = await axios.get('/api/salesforce/config');
    return response.data;
  });

  // Mutation pour mettre à jour la configuration
  const updateConfigMutation = useMutation(
    async (values) => {
      return axios.put('/api/salesforce/config', values);
    },
    {
      onSuccess: () => {
        message.success('Configuration mise à jour avec succès');
        queryClient.invalidateQueries('salesforceConfig');
      },
      onError: (error) => {
        message.error(
          `Erreur: ${error.response?.data?.error || 'Une erreur est survenue'}`
        );
      },
    }
  );

  // Mutation pour tester la connexion
  const testConnectionMutation = useMutation(
    async () => {
      return axios.post('/api/salesforce/test-connection');
    },
    {
      onSuccess: () => {
        message.success('Connexion testée avec succès');
      },
      onError: (error) => {
        message.error(
          `Erreur: ${error.response?.data?.error || 'Une erreur est survenue'}`
        );
      },
    }
  );

  const handleSubmit = async (values) => {
    await updateConfigMutation.mutateAsync(values);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      await testConnectionMutation.mutateAsync();
    } finally {
      setIsTesting(false);
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
        <Title level={2}>Intégration Salesforce</Title>
        <Text type="secondary" className="mb-6 block">
          Configurez la connexion avec votre instance Salesforce pour synchroniser
          les prestataires et les cas.
        </Text>

        {config?.status === 'connected' ? (
          <Alert
            message="Connexion établie"
            description="La connexion avec Salesforce est active et fonctionnelle."
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            className="mb-6"
          />
        ) : (
          <Alert
            message="Non connecté"
            description="Veuillez configurer la connexion avec Salesforce."
            type="warning"
            showIcon
            icon={<CloseCircleOutlined />}
            className="mb-6"
          />
        )}

        <Form
          form={form}
          layout="vertical"
          initialValues={config}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="instanceUrl"
            label="URL de l'instance"
            rules={[
              {
                required: true,
                message: 'L\'URL de l\'instance est requise',
              },
            ]}
          >
            <Input placeholder="https://votre-instance.salesforce.com" />
          </Form.Item>

          <Form.Item
            name="clientId"
            label="Client ID"
            rules={[
              {
                required: true,
                message: 'Le Client ID est requis',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="clientSecret"
            label="Client Secret"
            rules={[
              {
                required: true,
                message: 'Le Client Secret est requis',
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="username"
            label="Nom d'utilisateur"
            rules={[
              {
                required: true,
                message: 'Le nom d\'utilisateur est requis',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mot de passe"
            rules={[
              {
                required: true,
                message: 'Le mot de passe est requis',
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="securityToken"
            label="Token de sécurité"
            rules={[
              {
                required: true,
                message: 'Le token de sécurité est requis',
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Activer la synchronisation"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateConfigMutation.isLoading}
              >
                Enregistrer
              </Button>
              <Button
                icon={<SyncOutlined spin={isTesting} />}
                onClick={handleTestConnection}
                loading={isTesting}
              >
                Tester la connexion
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SalesforceIntegration; 