import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { User } from '@/types';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'viewer' as const,
    assignedAccounts: [] as string[]
  });

  useEffect(() => {
    // Mock data - replace with API call
    setUsers([
      {
        id: '1',
        email: 'admin@mdmc.com',
        name: 'Admin MDMC',
        role: 'admin',
        assignedAccounts: [],
        isActive: true,
        createdAt: new Date('2024-01-15'),
        lastLogin: new Date('2024-01-20')
      },
      {
        id: '2',
        email: 'analyst@mdmc.com',
        name: 'John Analyst',
        role: 'analyst',
        assignedAccounts: ['123-456-7890', '098-765-4321'],
        isActive: true,
        createdAt: new Date('2024-01-16'),
        lastLogin: new Date('2024-01-19')
      },
      {
        id: '3',
        email: 'viewer@mdmc.com',
        name: 'Jane Viewer',
        role: 'viewer',
        assignedAccounts: ['123-456-7890'],
        isActive: false,
        createdAt: new Date('2024-01-17'),
        lastLogin: new Date('2024-01-18')
      }
    ]);
  }, []);

  const handleCreateUser = () => {
    const user: User = {
      id: Date.now().toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      assignedAccounts: newUser.assignedAccounts,
      isActive: true,
      createdAt: new Date(),
      lastLogin: null
    };
    
    setUsers([...users, user]);
    setNewUser({ email: '', name: '', role: 'viewer', assignedAccounts: [] });
    setIsDialogOpen(false);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
  };

  const deleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'analyst': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestion des Utilisateurs</h2>
          <p className="text-sm text-gray-600">Créer et gérer les comptes utilisateur</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#E53E3E] hover:bg-[#C53030]">
              <Plus className="h-4 w-4 mr-2" />
              Nouvel utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
              <DialogDescription>
                Ajoutez un nouvel utilisateur à la plateforme MDMC Reporting.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="role">Rôle</Label>
                <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="analyst">Analyste</SelectItem>
                    <SelectItem value="viewer">Lecteur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateUser} className="bg-[#E53E3E] hover:bg-[#C53030]">
                Créer l'utilisateur
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Comptes assignés</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role === 'admin' ? 'Administrateur' : 
                       user.role === 'analyst' ? 'Analyste' : 'Lecteur'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {user.assignedAccounts.length} compte(s)
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {user.lastLogin ? user.lastLogin.toLocaleDateString('fr-FR') : 'Jamais'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUserStatus(user.id)}
                      >
                        {user.isActive ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}