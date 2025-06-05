import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#18181C] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#232326] border-b border-[#2A2A2E] z-50">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/assets/images/logo.png" alt="MDMC" className="h-8" />
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          <nav className="flex items-center space-x-6">
            <a href="/admin/smartlinks" className="text-gray-300 hover:text-white transition-colors">
              SmartLinks
            </a>
            <a href="/admin/analytics" className="text-gray-300 hover:text-white transition-colors">
              Analytics
            </a>
            <a href="/admin/artists" className="text-gray-300 hover:text-white transition-colors">
              Artistes
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#232326] border-t border-[#2A2A2E] py-4">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} MDMC Music Ads - Tous droits réservés
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout; 