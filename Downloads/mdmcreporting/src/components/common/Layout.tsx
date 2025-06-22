import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export default function Layout({ children, showSidebar = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        {showSidebar && <Sidebar />}
        <main className={`flex-1 ${showSidebar ? '' : 'w-full'}`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}