// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, User } from '@/services/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  hasRole: (role: 'admin' | 'analyst' | 'viewer') => boolean;
  hasAccountAccess: (customerId: string) => boolean;
}

// Placeholder pour le contexte d'authentification
const AuthContext = createContext<any>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setIsLoading(true);
    
    try {
      // Check if user is already authenticated
      const storedUser = authService.getStoredUser();
      const storedToken = authService.getStoredToken();

      if (storedUser && storedToken) {
        // Try to refresh user data from server
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser || storedUser);
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      // Clear invalid auth data
      await authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // For development, use mock login
      if (process.env.NODE_ENV === 'development') {
        const role = email.includes('admin') ? 'admin' : 
                    email.includes('analyst') ? 'analyst' : 'viewer';
        const { user: loggedInUser } = await authService.loginMock(role);
        setUser(loggedInUser);
      } else {
        // Production login
        const { user: loggedInUser } = await authService.login({ email, password });
        setUser(loggedInUser);
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout locally even if server call fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    try {
      const refreshedUser = await authService.refreshAuth();
      setUser(refreshedUser);
    } catch (error) {
      console.error('Auth refresh failed:', error);
      setUser(null);
    }
  };

  const hasRole = (role: 'admin' | 'analyst' | 'viewer'): boolean => {
    return authService.hasRole(role);
  };

  const hasAccountAccess = (customerId: string): boolean => {
    return authService.hasAccountAccess(customerId);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshAuth,
    hasRole,
    hasAccountAccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}