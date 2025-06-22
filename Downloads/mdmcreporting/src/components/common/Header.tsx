import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell, Settings, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AccountSelector from '@/components/dashboard/AccountSelector';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToAdmin = () => {
    navigate('/admin');
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Logo and Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <img 
              src="/assets/MDMC_logo_noir fond transparent.png" 
              alt="MDMC Logo" 
              className="logo-mdmc-large"
            />
            <div>
              <h1 className="text-xl font-bold text-[var(--mdmc-black)]">MDMC Reporting</h1>
              <p className="text-xs text-[var(--mdmc-gray-500)]">Plateforme d'analyse Google Ads avec IA</p>
            </div>
          </div>
        </div>

        {/* Center - Account Selector */}
        <div className="flex-1 flex justify-center max-w-md">
          <AccountSelector />
        </div>

        {/* Right side - User actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-[#E53E3E] text-white text-xs">
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 px-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-[#E53E3E] text-white">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={goToProfile}>
                <User className="mr-2 h-4 w-4" />
                <span>Mon Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              {user?.role === 'admin' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={goToAdmin}>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Administration</span>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}