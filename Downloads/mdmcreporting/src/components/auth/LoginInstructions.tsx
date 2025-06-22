// src/components/auth/LoginInstructions.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Eye } from 'lucide-react';

export default function LoginInstructions() {
  const demoAccounts = [
    {
      role: 'Administrateur',
      email: 'admin@mdmc.com',
      password: 'admin123',
      permissions: 'Accès complet - Gestion utilisateurs et comptes',
      icon: <Shield className="h-4 w-4" />,
      color: 'bg-red-100 text-red-800'
    },
    {
      role: 'Analyste',
      email: 'analyste@mdmc.com', 
      password: 'analyste123',
      permissions: 'Lecture et analyse des données',
      icon: <User className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      role: 'Lecteur',
      email: 'viewer@mdmc.com',
      password: 'viewer123', 
      permissions: 'Lecture seule des rapports',
      icon: <Eye className="h-4 w-4" />,
      color: 'bg-gray-100 text-gray-800'
    }
  ];

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-lg font-semibold text-gray-700">
          🔑 Identifiants de Démonstration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 text-center mb-4">
          Utilisez les identifiants suivants pour tester la plateforme :
        </p>
        
        {demoAccounts.map((account, index) => (
          <div key={index} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              {account.icon}
              <span className="font-medium text-sm">{account.role}</span>
              <Badge className={account.color} variant="secondary">
                {account.role.toLowerCase()}
              </Badge>
            </div>
            
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                  {account.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mot de passe:</span>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                  {account.password}
                </span>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 italic">
              {account.permissions}
            </p>
          </div>
        ))}
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            💡 <strong>Astuce:</strong> Commencez avec le compte administrateur pour explorer toutes les fonctionnalités.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
