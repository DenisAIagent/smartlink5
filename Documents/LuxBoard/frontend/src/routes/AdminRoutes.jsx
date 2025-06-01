import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import AdminSidebar from '../components/admin/AdminSidebar';
import Dashboard from '../components/admin/Dashboard';
import SalesforceVendors from '../components/admin/SalesforceVendors';
import VendorDetails from '../components/admin/VendorDetails';
import VendorStats from '../components/admin/VendorStats';
import SalesforceIntegration from '../components/admin/SalesforceIntegration';
import SalesforceSyncStatus from '../components/admin/SalesforceSyncStatus';
import { useAuth } from '../hooks/useAuth';

const { Content } = Layout;

const AdminRoutes = () => {
  const { user, isAdmin } = useAuth();

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSidebar />
      <Layout>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vendors" element={<SalesforceVendors />} />
            <Route path="/vendors/:vendorId" element={<VendorDetails />} />
            <Route path="/stats" element={<VendorStats />} />
            <Route path="/salesforce" element={<SalesforceIntegration />} />
            <Route path="/salesforce/sync" element={<SalesforceSyncStatus />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminRoutes; 