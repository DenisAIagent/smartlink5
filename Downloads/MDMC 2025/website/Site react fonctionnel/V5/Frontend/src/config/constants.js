export const DRAWER_WIDTH = 240;
export const SCROLL_THRESHOLD = 50;

export const NAV_ITEMS = [
  { label: 'Accueil', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Portfolio', path: '/portfolio' },
  { label: 'À propos', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export const ADMIN_MENU_ITEMS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'DashboardIcon' },
  { label: 'Artistes', path: '/admin/artists', icon: 'PeopleIcon' },
  { label: 'SmartLinks', path: '/admin/smartlinks', icon: 'LinkIcon' },
  { label: 'Landing Pages', path: '/admin/landing-pages', icon: 'DashboardIcon' },
  { label: 'WordPress', path: '/admin/wordpress', icon: 'LinkIcon' },
  { label: 'Avis Clients', path: '/admin/reviews', icon: 'PeopleIcon' },
  { label: 'Statistiques', path: '/admin/stats', icon: 'DashboardIcon' },
];

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  THEME: 'theme',
  LANGUAGE: 'language',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
};

export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
}; 