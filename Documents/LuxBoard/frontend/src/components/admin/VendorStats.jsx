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
  Progress,
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

const VendorStats = () => {
  // Requête pour récupérer les statistiques des prestataires
  const { data: stats, isLoading } = useQuery('vendorStats', async () => {
    const response = await axios.get('/api/vendors/stats');
    return response.data;
  });

  // Configuration des colonnes pour le tableau des prestataires les plus actifs
  const columns = [
    {
      title: 'Prestataire',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Cas ouverts',
      dataIndex: 'openCases',
      key: 'openCases',
      render: (value) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: 'Cas résolus',
      dataIndex: 'resolvedCases',
      key: 'resolvedCases',
      render: (value) => <Tag color="green">{value}</Tag>,
    },
    {
      title: 'Taux de résolution',
      dataIndex: 'resolutionRate',
      key: 'resolutionRate',
      render: (value) => (
        <Progress
          percent={value}
          size="small"
          status={value >= 80 ? 'success' : value >= 60 ? 'normal' : 'exception'}
        />
      ),
    },
  ];

  if (isLoading) {
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
          <Card title="Répartition par Type">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.typeDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {stats.typeDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={['#1890ff', '#52c41a', '#faad14', '#f5222d'][
                          index % 4
                        ]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Prestataires les Plus Actifs" className="mt-6">
        <Table
          columns={columns}
          dataSource={stats.topVendors}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default VendorStats; 