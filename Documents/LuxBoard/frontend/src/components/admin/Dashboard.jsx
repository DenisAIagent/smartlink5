import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Spin,
  Alert,
} from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  // Requête pour récupérer les statistiques globales
  const { data: stats, isLoading: isLoadingStats } = useQuery(
    'dashboardStats',
    async () => {
      const response = await axios.get('/api/admin/stats');
      return response.data;
    }
  );

  // Requête pour récupérer les cas récents
  const { data: recentCases, isLoading: isLoadingCases } = useQuery(
    'recentCases',
    async () => {
      const response = await axios.get('/api/admin/recent-cases');
      return response.data;
    }
  );

  // Configuration des colonnes pour le tableau des cas récents
  const columns = [
    {
      title: 'Référence',
      dataIndex: 'reference',
      key: 'reference',
    },
    {
      title: 'Prestataire',
      dataIndex: 'vendorName',
      key: 'vendorName',
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
        <Tag
          color={
            status === 'open'
              ? 'blue'
              : status === 'in_progress'
              ? 'orange'
              : status === 'resolved'
              ? 'green'
              : 'gray'
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  if (isLoadingStats || isLoadingCases) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Prestataires"
              value={stats.totalVendors}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Cas Ouverts"
              value={stats.openCases}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Cas Résolus"
              value={stats.resolvedCases}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Cas en Retard"
              value={stats.overdueCases}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        <Col span={16}>
          <Card title="Évolution des Cas">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.caseTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="open"
                    stroke="#1890ff"
                    name="Cas Ouverts"
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke="#52c41a"
                    name="Cas Résolus"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Alertes">
            {stats.alerts.map((alert, index) => (
              <Alert
                key={index}
                message={alert.title}
                description={alert.message}
                type={alert.type}
                showIcon
                className="mb-4"
              />
            ))}
          </Card>
        </Col>
      </Row>

      <Card title="Cas Récents" className="mt-6">
        <Table
          columns={columns}
          dataSource={recentCases}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default Dashboard; 