// src/data/demo-users.ts
// Identifiants de démonstration pour la première connexion

export const DEMO_USERS = [
  {
    id: '1',
    email: 'admin@mdmc.com',
    password: 'admin123',
    name: 'Administrateur MDMC',
    role: 'admin',
    permissions: ['read', 'write', 'admin'],
    created_at: new Date('2024-01-01').toISOString(),
    last_login: new Date().toISOString(),
    is_active: true
  },
  {
    id: '2', 
    email: 'analyste@mdmc.com',
    password: 'analyste123',
    name: 'Analyste Marketing',
    role: 'analyst',
    permissions: ['read', 'write'],
    created_at: new Date('2024-01-01').toISOString(),
    last_login: new Date().toISOString(),
    is_active: true
  },
  {
    id: '3',
    email: 'viewer@mdmc.com', 
    password: 'viewer123',
    name: 'Lecteur',
    role: 'viewer',
    permissions: ['read'],
    created_at: new Date('2024-01-01').toISOString(),
    last_login: new Date().toISOString(),
    is_active: true
  }
];

// Comptes Google Ads de démonstration
export const DEMO_GOOGLE_ADS_ACCOUNTS = [
  {
    id: '123-456-7890',
    name: 'MDMC - Campagne Principale',
    currency: 'EUR',
    timezone: 'Europe/Paris',
    status: 'ENABLED',
    manager: false,
    test_account: false
  },
  {
    id: '098-765-4321', 
    name: 'MDMC - Campagne Saisonnière',
    currency: 'EUR',
    timezone: 'Europe/Paris', 
    status: 'ENABLED',
    manager: false,
    test_account: false
  }
];

// Attribution des comptes aux utilisateurs
export const USER_ACCOUNT_ASSIGNMENTS = [
  {
    user_id: '1',
    customer_id: '123-456-7890',
    permissions: ['read', 'write', 'admin']
  },
  {
    user_id: '1', 
    customer_id: '098-765-4321',
    permissions: ['read', 'write', 'admin']
  },
  {
    user_id: '2',
    customer_id: '123-456-7890', 
    permissions: ['read', 'write']
  },
  {
    user_id: '3',
    customer_id: '123-456-7890',
    permissions: ['read']
  }
];
