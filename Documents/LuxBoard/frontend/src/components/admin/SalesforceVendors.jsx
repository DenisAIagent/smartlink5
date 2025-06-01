import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  message,
  Spin,
  Tag,
  Space,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

const SalesforceVendors = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Requête pour récupérer les prestataires
  const { data: vendors, isLoading } = useQuery(
    ['vendors', searchQuery],
    async () => {
      const response = await axios.get(`/api/vendors/search?query=${searchQuery}`);
      return response.data;
    },
    {
      enabled: searchQuery.length >= 2,
    }
  );

  // Mutation pour créer/mettre à jour un prestataire
  const vendorMutation = useMutation(
    async (vendorData) => {
      if (selectedVendor) {
        return axios.put(`/api/vendors/${selectedVendor.id}`, vendorData);
      }
      return axios.post('/api/vendors', vendorData);
    },
    {
      onSuccess: () => {
        message.success(
          selectedVendor
            ? 'Prestataire mis à jour avec succès'
            : 'Prestataire créé avec succès'
        );
        queryClient.invalidateQueries('vendors');
        handleModalClose();
      },
      onError: (error) => {
        message.error(
          `Erreur: ${error.response?.data?.error || 'Une erreur est survenue'}`
        );
      },
    }
  );

  // Gestionnaires d'événements
  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  const handleModalOpen = (vendor = null) => {
    setSelectedVendor(vendor);
    if (vendor) {
      form.setFieldsValue(vendor);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedVendor(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    await vendorMutation.mutateAsync(values);
  };

  // Configuration des colonnes du tableau
  const columns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Actif' : 'Inactif'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Voir les détails">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleModalOpen(record)}
            />
          </Tooltip>
          <Tooltip title="Modifier">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleModalOpen(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Prestataires Salesforce</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleModalOpen()}
        >
          Nouveau Prestataire
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Rechercher un prestataire..."
          prefix={<SearchOutlined />}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={vendors}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      )}

      <Modal
        title={selectedVendor ? 'Modifier le prestataire' : 'Nouveau prestataire'}
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={selectedVendor}
        >
          <Form.Item
            name="name"
            label="Nom"
            rules={[{ required: true, message: 'Le nom est requis' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Le type est requis' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="status"
            label="Statut"
            rules={[{ required: true, message: 'Le statut est requis' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'La description est requise' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={handleModalClose}>Annuler</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={vendorMutation.isLoading}
              >
                {selectedVendor ? 'Mettre à jour' : 'Créer'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SalesforceVendors; 