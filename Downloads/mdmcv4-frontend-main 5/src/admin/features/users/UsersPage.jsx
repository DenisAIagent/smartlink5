import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Form, Modal, Tabs } from '../../components';
import { usersService } from '../../services';
import { useNotificationStore } from '../../stores';

const UsersPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const { showNotification } = useNotificationStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersData, rolesData, permissionsData] = await Promise.all([
        usersService.getUsers(),
        usersService.getRoles(),
        usersService.getPermissions(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (error) {
      showNotification('Erreur lors du chargement des données', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (formData) => {
    try {
      await usersService.createUser(formData);
      setIsCreateModalOpen(false);
      loadData();
      showNotification('Utilisateur créé avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la création de l\'utilisateur', 'error');
    }
  };

  const handleUpdateUser = async (formData) => {
    try {
      await usersService.updateUser(selectedUser.id, formData);
      setIsEditModalOpen(false);
      loadData();
      showNotification('Utilisateur mis à jour avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la mise à jour de l\'utilisateur', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await usersService.deleteUser(userId);
        loadData();
        showNotification('Utilisateur supprimé avec succès', 'success');
      } catch (error) {
        showNotification('Erreur lors de la suppression de l\'utilisateur', 'error');
      }
    }
  };

  const handleCreateRole = async (formData) => {
    try {
      await usersService.createRole(formData);
      setIsRoleModalOpen(false);
      loadData();
      showNotification('Rôle créé avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la création du rôle', 'error');
    }
  };

  const handleUpdateRole = async (roleId, formData) => {
    try {
      await usersService.updateRole(roleId, formData);
      loadData();
      showNotification('Rôle mis à jour avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la mise à jour du rôle', 'error');
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      try {
        await usersService.deleteRole(roleId);
        loadData();
        showNotification('Rôle supprimé avec succès', 'success');
      } catch (error) {
        showNotification('Erreur lors de la suppression du rôle', 'error');
      }
    }
  };

  const handleUpdatePermissions = async (userId, selectedPermissions) => {
    try {
      await usersService.updateUserPermissions(userId, selectedPermissions);
      loadData();
      showNotification('Permissions mises à jour avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la mise à jour des permissions', 'error');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-gray-600">Gérez les utilisateurs, rôles et permissions</p>
        </div>
        <div className="space-x-2">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="primary"
          >
            Nouvel utilisateur
          </Button>
          <Button
            onClick={() => setIsRoleModalOpen(true)}
            variant="outline"
          >
            Nouveau rôle
          </Button>
        </div>
      </div>

      {/* Users List */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-600">
                      Rôle : {roles.find((r) => r.id === user.roleId)?.name || 'Non assigné'}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <Button
                      onClick={() => {
                        setSelectedUser(user);
                        setIsEditModalOpen(true);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Modifier
                    </Button>
                    <Button
                      onClick={() => handleDeleteUser(user.id)}
                      variant="danger"
                      size="sm"
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Roles List */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-medium mb-4">Rôles</h3>
          <div className="space-y-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{role.name}</h4>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                  <div className="space-x-2">
                    <Button
                      onClick={() => handleUpdateRole(role.id, role)}
                      variant="outline"
                      size="sm"
                    >
                      Modifier
                    </Button>
                    <Button
                      onClick={() => handleDeleteRole(role.id)}
                      variant="danger"
                      size="sm"
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nouvel utilisateur"
      >
        <Form onSubmit={handleCreateUser}>
          <div className="space-y-4">
            <Form.Input
              name="name"
              label="Nom"
              required
            />
            <Form.Input
              name="email"
              label="Email"
              type="email"
              required
            />
            <Form.Input
              name="password"
              label="Mot de passe"
              type="password"
              required
            />
            <Form.Select
              name="roleId"
              label="Rôle"
              options={roles.map((role) => ({
                value: role.id,
                label: role.name,
              }))}
              required
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" variant="primary">
                Créer
              </Button>
            </div>
          </div>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier l'utilisateur"
      >
        {selectedUser && (
          <Form onSubmit={handleUpdateUser} initialValues={selectedUser}>
            <div className="space-y-4">
              <Form.Input
                name="name"
                label="Nom"
                required
              />
              <Form.Input
                name="email"
                label="Email"
                type="email"
                required
              />
              <Form.Select
                name="roleId"
                label="Rôle"
                options={roles.map((role) => ({
                  value: role.id,
                  label: role.name,
                }))}
                required
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="primary">
                  Mettre à jour
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Modal>

      {/* Create Role Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Nouveau rôle"
      >
        <Form onSubmit={handleCreateRole}>
          <div className="space-y-4">
            <Form.Input
              name="name"
              label="Nom"
              required
            />
            <Form.Input
              name="description"
              label="Description"
              required
            />
            <Form.Select
              name="permissions"
              label="Permissions"
              multiple
              options={permissions.map((permission) => ({
                value: permission.id,
                label: permission.name,
              }))}
              required
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRoleModalOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" variant="primary">
                Créer
              </Button>
            </div>
          </div>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default UsersPage; 