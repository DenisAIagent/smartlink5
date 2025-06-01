import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import {
  Card,
  Descriptions,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Spin,
  Timeline,
  Space,
} from 'antd';
import {
  EditOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { Option } = Select;

const VendorDetails = ({ vendorId, onClose }) => {
  const [isCaseModalVisible, setIsCaseModalVisible] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Requête pour récupérer les détails du prestataire
  const { data: vendor, isLoading: isLoadingVendor } = useQuery(
    ['vendor', vendorId],
    async () => {
      const response = await axios.get(`/api/vendors/${vendorId}`);
      return response.data;
    }
  );

  // Requête pour récupérer les cas du prestataire
  const { data: cases, isLoading: isLoadingCases } = useQuery(
    ['vendorCases', vendorId],
    async () => {
      const response = await axios.get(`/api/vendors/${vendorId}/cases`);
      return response.data;
    }
  );

  // Mutation pour créer un nouveau cas
  const caseMutation = useMutation(
    async (caseData) => {
      return axios.post('/api/cases', {
        ...caseData,
        vendorId,
      });
    },
    {
      onSuccess: () => {
        message.success('Cas créé avec succès');
        queryClient.invalidateQueries(['vendorCases', vendorId]);
        handleCaseModalClose();
      },
      onError: (error) => {
        message.error(
          `Erreur: ${error.response?.data?.error || 'Une erreur est survenue'}`
        );
      },
    }
  );

  // Mutation pour mettre à jour le statut d'un cas
  const updateCaseStatusMutation = useMutation(
    async ({ caseId, status }) => {
      return axios.put(`/api/cases/${caseId}/status`, { status });
    },
    {
      onSuccess: () => {
        message.success('Statut mis à jour avec succès');
        queryClient.invalidateQueries(['vendorCases', vendorId]);
      },
      onError: (error) => {
        message.error(
          `Erreur: ${error.response?.data?.error || 'Une erreur est survenue'}`
        );
      },
    }
  );

  const handleCaseModalOpen = () => {
    setIsCaseModalVisible(true);
  };

  const handleCaseModalClose = () => {
    setIsCaseModalVisible(false);
    form.resetFields();
  };

  const handleCaseSubmit = async (values) => {
    await caseMutation.mutateAsync(values);
  };

  const handleStatusUpdate = async (caseId, status) => {
    await updateCaseStatusMutation.mutateAsync({ caseId, status });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'blue';
      case 'in_progress':
        return 'orange';
      case 'resolved':
        return 'green';
      case 'closed':
        return 'gray';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <ClockCircleOutlined />;
      case 'in_progress':
        return <ClockCircleOutlined />;
      case 'resolved':
        return <CheckCircleOutlined />;
      case 'closed':
        return <CloseCircleOutlined />;
      default:
        return null;
    }
  };

  const columns = [
    {
      title: 'Référence',
      dataIndex: 'reference',
      key: 'reference',
    },
    {
      title: 'Sujet',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Date de création',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status !== 'closed' && (
            <Select
              defaultValue={record.status}
              style={{ width: 120 }}
              onChange={(value) => handleStatusUpdate(record.id, value)}
            >
              <Option value="open">Ouvert</Option>
              <Option value="in_progress">En cours</Option>
              <Option value="resolved">Résolu</Option>
              <Option value="closed">Fermé</Option>
            </Select>
          )}
        </Space>
      ),
    },
  ];

  if (isLoadingVendor || isLoadingCases) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card
        title="Détails du Prestataire"
        extra={
          <Button icon={<EditOutlined />} onClick={() => onClose()}>
            Retour
          </Button>
        }
      >
        <Descriptions bordered>
          <Descriptions.Item label="Nom" span={3}>
            {vendor.name}
          </Descriptions.Item>
          <Descriptions.Item label="Type" span={3}>
            {vendor.type}
          </Descriptions.Item>
          <Descriptions.Item label="Statut" span={3}>
            <Tag color={vendor.status === 'active' ? 'green' : 'red'}>
              {vendor.status === 'active' ? 'Actif' : 'Inactif'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={3}>
            {vendor.description}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title="Cas"
        className="mt-6"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCaseModalOpen}
          >
            Nouveau Cas
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={cases}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Modal
        title="Nouveau Cas"
        visible={isCaseModalVisible}
        onCancel={handleCaseModalClose}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCaseSubmit}
        >
          <Form.Item
            name="subject"
            label="Sujet"
            rules={[{ required: true, message: 'Le sujet est requis' }]}
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

          <Form.Item
            name="priority"
            label="Priorité"
            rules={[{ required: true, message: 'La priorité est requise' }]}
          >
            <Select>
              <Option value="low">Basse</Option>
              <Option value="medium">Moyenne</Option>
              <Option value="high">Haute</Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={handleCaseModalClose}>Annuler</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={caseMutation.isLoading}
              >
                Créer
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VendorDetails; 