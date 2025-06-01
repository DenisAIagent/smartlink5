import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  SyncOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Tableau de Bord',
    },
    {
      key: '/admin/vendors',
      icon: <TeamOutlined />,
      label: 'Prestataires',
    },
    {
      key: '/admin/stats',
      icon: <BarChartOutlined />,
      label: 'Statistiques',
    },
    {
      key: 'salesforce',
      icon: <SettingOutlined />,
      label: 'Salesforce',
      children: [
        {
          key: '/admin/salesforce',
          label: 'Configuration',
        },
        {
          key: '/admin/salesforce/sync',
          label: 'Synchronisation',
          icon: <SyncOutlined />,
        },
      ],
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Sider
      width={250}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div className="p-4">
        <h1 className="text-white text-xl font-bold">LuxBoard Admin</h1>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  );
};

export default AdminSidebar; 