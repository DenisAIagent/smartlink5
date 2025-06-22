import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Target, 
  BarChart3, 
  FileText, 
  MessageCircle, 
  Settings,
  Shield,
  Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const mainNavItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      badge: null
    },
    {
      label: 'Campagnes',
      icon: Target,
      path: '/campaigns',
      badge: '24'
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      path: '/analytics',
      badge: null
    },
    {
      label: 'Rapports',
      icon: FileText,
      path: '/reports',
      badge: null
    },
    {
      label: 'Assistant IA',
      icon: MessageCircle,
      path: '/chat',
      badge: 'NEW'
    }
  ];

  const adminNavItems = [
    {
      label: 'Administration',
      icon: Shield,
      path: '/admin',
      badge: null
    },
    {
      label: 'Utilisateurs',
      icon: Users,
      path: '/admin/users',
      badge: null
    }
  ];

  const bottomNavItems = [
    {
      label: 'Paramètres',
      icon: Settings,
      path: '/settings',
      badge: null
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Navigation principale */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Navigation
            </h2>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "secondary" : "ghost"}
                    className={`w-full justify-start mb-1 ${
                      isActive(item.path) 
                        ? 'bg-[#E53E3E] text-white hover:bg-[#C53030]' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge 
                        variant={isActive(item.path) ? "outline" : "secondary"}
                        className={`ml-2 text-xs ${
                          isActive(item.path) 
                            ? 'border-white text-white' 
                            : item.badge === 'NEW' 
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Section Admin (visible seulement pour les admins) */}
          {user?.role === 'admin' && (
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Administration
              </h2>
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive(item.path) ? "secondary" : "ghost"}
                      className={`w-full justify-start mb-1 ${
                        isActive(item.path) 
                          ? 'bg-[#E53E3E] text-white hover:bg-[#C53030]' 
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      <span className="flex-1 text-left">{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Navigation du bas */}
      <div className="px-4 py-4 border-t border-gray-200">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive(item.path) ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  isActive(item.path) 
                    ? 'bg-[#E53E3E] text-white hover:bg-[#C53030]' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="mr-3 h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Footer avec version */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="text-center">
          <p className="text-xs text-gray-500">MDMC Reporting v1.0</p>
          <p className="text-xs text-gray-400">© 2024 MDMC</p>
        </div>
      </div>
    </aside>
  );
}