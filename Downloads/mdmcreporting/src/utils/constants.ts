// src/utils/constants.ts
export const MDMC_COLORS = {
  primary: '#E53E3E',
  primaryDark: '#C53030',
  primaryLight: '#FEB2B2',
  secondary: '#6B7280',
  secondaryDark: '#374151',
  secondaryLight: '#F9FAFB',
  white: '#FFFFFF',
  black: '#1F2937',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6'
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  ANALYST: 'analyst',
  VIEWER: 'viewer'
} as const;

export const CAMPAIGN_STATUSES = {
  ENABLED: 'enabled',
  PAUSED: 'paused',
  REMOVED: 'removed'
} as const;

export const CAMPAIGN_TYPES = {
  SEARCH: 'search',
  DISPLAY: 'display',
  SHOPPING: 'shopping',
  VIDEO: 'video',
  APP: 'app'
} as const;

export const ACCOUNT_STATUSES = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  SUSPENDED: 'suspended'
} as const;

export const ALERT_TYPES = {
  BUDGET: 'budget',
  PERFORMANCE: 'performance',
  STATUS: 'status',
  CUSTOM: 'custom'
} as const;

export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  SLACK: 'slack',
  DASHBOARD: 'dashboard',
  WEBHOOK: 'webhook'
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh'
  },
  GOOGLE_ADS: {
    ACCOUNTS: '/google-ads/accounts',
    CAMPAIGNS: '/google-ads/campaigns',
    METRICS: '/google-ads/metrics',
    SUMMARY: '/google-ads/summary'
  },
  ADMIN: {
    USERS: '/admin/users',
    ACCOUNTS: '/admin/google-ads-accounts',
    ASSIGN_ACCOUNT: '/admin/assign-account',
    AUDIT_LOGS: '/admin/audit-logs'
  },
  AI: {
    CHAT: '/ai/chat',
    ANALYZE: '/ai/analyze'
  },
  ALERTS: '/alerts',
  REPORTS: '/reports'
} as const;

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'mdmc_auth_token',
  USER_DATA: 'mdmc_user',
  ACTIVE_ACCOUNT: 'mdmc_active_account',
  DASHBOARD_LAYOUT: 'mdmc_dashboard_layout',
  CHAT_HISTORY: 'mdmc_chat_history'
} as const;

export const SESSION_STORAGE_KEYS = {
  FILTERS: 'mdmc_filters',
  SEARCH_QUERY: 'mdmc_search_query',
  SELECTED_CAMPAIGNS: 'mdmc_selected_campaigns'
} as const;

export const METRICS_CONFIG = {
  REFRESH_INTERVALS: {
    REAL_TIME: 30000, // 30 seconds
    DASHBOARD: 300000, // 5 minutes
    REPORTS: 3600000 // 1 hour
  },
  BATCH_SIZES: {
    CAMPAIGNS: 50,
    ACCOUNTS: 20,
    METRICS: 100
  },
  CACHE_DURATION: {
    CAMPAIGNS: 300000, // 5 minutes
    METRICS: 180000, // 3 minutes
    ACCOUNTS: 600000 // 10 minutes
  }
} as const;

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false
  },
  GOOGLE_ADS_CUSTOMER_ID: /^\d{3}-\d{3}-\d{4}$/,
  BUDGET: {
    MIN: 0.01,
    MAX: 1000000
  }
} as const;

export const DATE_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_QUARTER: 'this_quarter',
  LAST_QUARTER: 'last_quarter',
  THIS_YEAR: 'this_year',
  LAST_YEAR: 'last_year',
  CUSTOM: 'custom'
} as const;

export const CHART_COLORS = [
  '#E53E3E', // MDMC Red
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899'  // Pink
] as const;

export const WEBSOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  MESSAGE: 'message',
  CHAT_MESSAGE: 'chat_message',
  METRICS_UPDATE: 'metrics_update',
  ALERT_TRIGGERED: 'alert_triggered',
  ACCOUNT_SWITCHED: 'account_switched'
} as const;

export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
    TOKEN_EXPIRED: 'Votre session a expiré, veuillez vous reconnecter',
    ACCESS_DENIED: 'Accès non autorisé',
    ACCOUNT_INACTIVE: 'Votre compte est inactif'
  },
  GOOGLE_ADS: {
    API_ERROR: 'Erreur lors de la récupération des données Google Ads',
    INVALID_CUSTOMER_ID: 'ID client Google Ads invalide',
    NO_ACCESS: 'Vous n\'avez pas accès à ce compte Google Ads',
    QUOTA_EXCEEDED: 'Quota API Google Ads dépassé'
  },
  GENERAL: {
    NETWORK_ERROR: 'Erreur de connexion réseau',
    SERVER_ERROR: 'Erreur serveur, veuillez réessayer',
    VALIDATION_ERROR: 'Données invalides',
    NOT_FOUND: 'Ressource non trouvée'
  }
} as const;

export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Connexion réussie',
    LOGOUT_SUCCESS: 'Déconnexion réussie'
  },
  ADMIN: {
    USER_CREATED: 'Utilisateur créé avec succès',
    USER_UPDATED: 'Utilisateur mis à jour avec succès',
    USER_DELETED: 'Utilisateur supprimé avec succès',
    ACCOUNT_ASSIGNED: 'Compte assigné avec succès'
  },
  ALERTS: {
    CREATED: 'Alerte créée avec succès',
    UPDATED: 'Alerte mise à jour avec succès',
    DELETED: 'Alerte supprimée avec succès'
  }
} as const;

export const PERMISSIONS = {
  ADMIN: {
    MANAGE_USERS: 'manage_users',
    MANAGE_ACCOUNTS: 'manage_accounts',
    VIEW_AUDIT_LOGS: 'view_audit_logs',
    SYSTEM_SETTINGS: 'system_settings'
  },
  ANALYST: {
    VIEW_CAMPAIGNS: 'view_campaigns',
    ANALYZE_DATA: 'analyze_data',
    CREATE_REPORTS: 'create_reports',
    MANAGE_ALERTS: 'manage_alerts'
  },
  VIEWER: {
    VIEW_DASHBOARD: 'view_dashboard',
    VIEW_CAMPAIGNS: 'view_campaigns'
  }
} as const;