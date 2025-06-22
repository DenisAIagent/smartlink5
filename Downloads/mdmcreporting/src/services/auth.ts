// src/services/auth.ts
import { apiService } from './api';
import { DEMO_USERS } from '@/data/demo-users';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'analyst' | 'viewer';
  assignedAccounts: string[];
  isActive: boolean;
  createdAt: Date;
  lastLogin: Date | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

class AuthService {
  private readonly TOKEN_KEY = 'mdmc_auth_token';
  private readonly USER_KEY = 'mdmc_user';

  getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getStoredUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    if (!userData) return null;

    try {
      const user = JSON.parse(userData);
      // Convert date strings back to Date objects
      return {
        ...user,
        createdAt: new Date(user.createdAt),
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
      };
    } catch {
      return null;
    }
  }

  private setStoredToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    apiService.setToken(token);
  }

  private setStoredUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private clearStoredAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    apiService.setToken('');
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    // Vérification avec les identifiants de démonstration
    const demoUser = DEMO_USERS.find(u => u.email === credentials.email && u.password === credentials.password);
    
    if (demoUser) {
      // Conversion vers le format User attendu
      const user: User = {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role,
        assignedAccounts: demoUser.role === 'admin' ? ['123-456-7890', '098-765-4321'] : 
                         demoUser.role === 'analyst' ? ['123-456-7890'] : ['123-456-7890'],
        isActive: demoUser.is_active,
        createdAt: new Date(demoUser.created_at),
        lastLogin: new Date(demoUser.last_login),
      };
      
      const token = `demo_token_${user.id}_${Date.now()}`;
      
      this.setStoredToken(token);
      this.setStoredUser(user);
      
      // Simulation d'un délai API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { user, token };
    }
    
    throw new Error('Email ou mot de passe incorrect');
  }

  async logout(): Promise<void> {
    try {
      await apiService.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      this.clearStoredAuth();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const token = this.getStoredToken();
    if (!token) return null;

    apiService.setToken(token);
    const response = await apiService.getCurrentUser();

    if (!response.success || !response.data) {
      // Token might be expired
      this.clearStoredAuth();
      return null;
    }

    const user: User = {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      lastLogin: response.data.lastLogin ? new Date(response.data.lastLogin) : null,
    };

    this.setStoredUser(user);
    return user;
  }

  async refreshAuth(): Promise<User | null> {
    const storedToken = this.getStoredToken();
    if (!storedToken) return null;

    try {
      return await this.getCurrentUser();
    } catch (error) {
      console.error('Auth refresh failed:', error);
      this.clearStoredAuth();
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  hasRole(requiredRole: 'admin' | 'analyst' | 'viewer'): boolean {
    const user = this.getStoredUser();
    if (!user) return false;

    // Admin has access to everything
    if (user.role === 'admin') return true;

    // Check specific role
    return user.role === requiredRole;
  }

  hasAccountAccess(customerId: string): boolean {
    const user = this.getStoredUser();
    if (!user) return false;

    // Admin has access to all accounts
    if (user.role === 'admin') return true;

    // Check if user has access to specific account
    return user.assignedAccounts.includes(customerId);
  }

  // Mock login for development
  async loginMock(role: 'admin' | 'analyst' | 'viewer' = 'admin'): Promise<{ user: User; token: string }> {
    const mockUsers = {
      admin: {
        id: '1',
        email: 'admin@mdmc.com',
        name: 'Admin MDMC',
        role: 'admin' as const,
        assignedAccounts: [],
        isActive: true,
        createdAt: new Date('2024-01-15'),
        lastLogin: new Date(),
      },
      analyst: {
        id: '2',
        email: 'analyst@mdmc.com',
        name: 'John Analyst',
        role: 'analyst' as const,
        assignedAccounts: ['123-456-7890', '098-765-4321'],
        isActive: true,
        createdAt: new Date('2024-01-16'),
        lastLogin: new Date(),
      },
      viewer: {
        id: '3',
        email: 'viewer@mdmc.com',
        name: 'Jane Viewer',
        role: 'viewer' as const,
        assignedAccounts: ['123-456-7890'],
        isActive: true,
        createdAt: new Date('2024-01-17'),
        lastLogin: new Date(),
      },
    };

    const user = mockUsers[role];
    const token = `mock_token_${user.id}_${Date.now()}`;

    this.setStoredToken(token);
    this.setStoredUser(user);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { user, token };
  }
}

export const authService = new AuthService();