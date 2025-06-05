import api from './api';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

const usersService = {
  async getUsers() {
    const cacheKey = 'users';
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get('/users');
      const data = response.data;

      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },

  async getUserById(id) {
    const cacheKey = `user_${id}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get(`/users/${id}`);
      const data = response.data;

      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error);
      throw error;
    }
  },

  async createUser(userData) {
    try {
      const response = await api.post('/users', userData);
      cache.delete('users');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  },

  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      cache.delete('users');
      cache.delete(`user_${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}:`, error);
      throw error;
    }
  },

  async deleteUser(id) {
    try {
      await api.delete(`/users/${id}`);
      cache.delete('users');
      cache.delete(`user_${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error);
      throw error;
    }
  },

  async getRoles() {
    const cacheKey = 'roles';
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get('/roles');
      const data = response.data;

      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des rôles:', error);
      throw error;
    }
  },

  async createRole(roleData) {
    try {
      const response = await api.post('/roles', roleData);
      cache.delete('roles');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du rôle:', error);
      throw error;
    }
  },

  async updateRole(id, roleData) {
    try {
      const response = await api.put(`/roles/${id}`, roleData);
      cache.delete('roles');
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du rôle ${id}:`, error);
      throw error;
    }
  },

  async deleteRole(id) {
    try {
      await api.delete(`/roles/${id}`);
      cache.delete('roles');
    } catch (error) {
      console.error(`Erreur lors de la suppression du rôle ${id}:`, error);
      throw error;
    }
  },

  async getPermissions() {
    const cacheKey = 'permissions';
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get('/permissions');
      const data = response.data;

      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des permissions:', error);
      throw error;
    }
  },

  async updateUserPermissions(userId, permissions) {
    try {
      const response = await api.put(`/users/${userId}/permissions`, { permissions });
      cache.delete('users');
      cache.delete(`user_${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour des permissions de l'utilisateur ${userId}:`, error);
      throw error;
    }
  },

  async updateRolePermissions(roleId, permissions) {
    try {
      const response = await api.put(`/roles/${roleId}/permissions`, { permissions });
      cache.delete('roles');
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour des permissions du rôle ${roleId}:`, error);
      throw error;
    }
  },

  clearCache() {
    cache.clear();
  },
};

export default usersService; 