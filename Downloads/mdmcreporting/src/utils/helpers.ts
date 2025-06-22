// src/utils/helpers.ts
import { VALIDATION_RULES, DATE_RANGES, MDMC_COLORS } from './constants';
import { Campaign, CampaignMetrics, User, GoogleAdsAccount } from '@/types';

/**
 * Format currency values with proper locale and currency symbol
 */
export function formatCurrency(amount: number, currency: string = 'EUR', locale: string = 'fr-FR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format large numbers with appropriate suffixes (K, M, B)
 */
export function formatNumber(num: number, decimals: number = 1): string {
  if (num === 0) return '0';
  
  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['', 'K', 'M', 'B', 'T'];
  
  const i = Math.floor(Math.log(Math.abs(num)) / Math.log(k));
  
  if (i === 0) return num.toString();
  
  return parseFloat((num / Math.pow(k, i)).toFixed(dm)) + sizes[i];
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format date for display
 */
export function formatDate(date: Date, format: 'short' | 'long' | 'time' = 'short'): string {
  const options: Intl.DateTimeFormatOptions = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    time: { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }
  };
  
  return date.toLocaleDateString('fr-FR', options[format]);
}

/**
 * Format relative time (e.g., "il y a 5 minutes")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInMinutes < 1) return 'À l\'instant';
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
  if (diffInHours < 24) return `Il y a ${diffInHours}h`;
  if (diffInDays < 7) return `Il y a ${diffInDays}j`;
  
  return formatDate(date);
}

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  return VALIDATION_RULES.EMAIL.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const rules = VALIDATION_RULES.PASSWORD;
  
  if (password.length < rules.MIN_LENGTH) {
    errors.push(`Le mot de passe doit contenir au moins ${rules.MIN_LENGTH} caractères`);
  }
  
  if (rules.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (rules.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  
  if (rules.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  if (rules.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validate Google Ads Customer ID format
 */
export function validateCustomerId(customerId: string): boolean {
  return VALIDATION_RULES.GOOGLE_ADS_CUSTOMER_ID.test(customerId);
}

/**
 * Calculate ROAS (Return on Ad Spend)
 */
export function calculateRoas(conversionValue: number, cost: number): number {
  if (cost === 0) return 0;
  return conversionValue / cost;
}

/**
 * Calculate CTR (Click-Through Rate)
 */
export function calculateCtr(clicks: number, impressions: number): number {
  if (impressions === 0) return 0;
  return clicks / impressions;
}

/**
 * Calculate conversion rate
 */
export function calculateConversionRate(conversions: number, clicks: number): number {
  if (clicks === 0) return 0;
  return conversions / clicks;
}

/**
 * Calculate cost per conversion
 */
export function calculateCostPerConversion(cost: number, conversions: number): number {
  if (conversions === 0) return 0;
  return cost / conversions;
}

/**
 * Get color for metric change (positive/negative)
 */
export function getChangeColor(value: number): string {
  if (value > 0) return MDMC_COLORS.success;
  if (value < 0) return MDMC_COLORS.error;
  return MDMC_COLORS.secondary;
}

/**
 * Get date range for predefined periods
 */
export function getDateRange(range: string): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (range) {
    case DATE_RANGES.TODAY:
      return { start: today, end: now };
      
    case DATE_RANGES.YESTERDAY: {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: yesterday, end: yesterday };
    }
      
    case DATE_RANGES.LAST_7_DAYS: {
      const last7Days = new Date(today);
      last7Days.setDate(last7Days.getDate() - 7);
      return { start: last7Days, end: today };
    }
      
    case DATE_RANGES.LAST_30_DAYS: {
      const last30Days = new Date(today);
      last30Days.setDate(last30Days.getDate() - 30);
      return { start: last30Days, end: today };
    }
      
    case DATE_RANGES.THIS_MONTH: {
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: thisMonthStart, end: now };
    }
      
    case DATE_RANGES.LAST_MONTH: {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: lastMonthStart, end: lastMonthEnd };
    }
      
    default:
      return { start: today, end: now };
  }
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as unknown as T;
  
  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Generate random ID
 */
export function generateId(length: number = 8): string {
  return Math.random().toString(36).substring(2, length + 2);
}

/**
 * Check if user has permission to access account
 */
export function hasAccountAccess(user: User, account: GoogleAdsAccount): boolean {
  if (user.role === 'admin') return true;
  return user.assignedAccounts.includes(account.customerId);
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    admin: 'Administrateur',
    analyst: 'Analyste',
    viewer: 'Lecteur'
  };
  return roleNames[role] || role;
}

/**
 * Get campaign status color
 */
export function getCampaignStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    enabled: MDMC_COLORS.success,
    paused: MDMC_COLORS.warning,
    removed: MDMC_COLORS.error
  };
  return statusColors[status] || MDMC_COLORS.secondary;
}

/**
 * Sort campaigns by performance metric
 */
export function sortCampaignsByMetric(
  campaigns: Campaign[],
  metric: keyof CampaignMetrics,
  direction: 'asc' | 'desc' = 'desc'
): Campaign[] {
  return [...campaigns].sort((a, b) => {
    const aValue = a.metrics[metric];
    const bValue = b.metrics[metric];
    
    if (direction === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });
}

/**
 * Filter campaigns by search query
 */
export function filterCampaigns(campaigns: Campaign[], query: string): Campaign[] {
  if (!query.trim()) return campaigns;
  
  const lowerQuery = query.toLowerCase();
  return campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(lowerQuery) ||
    campaign.type.toLowerCase().includes(lowerQuery) ||
    campaign.status.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Calculate budget utilization percentage
 */
export function calculateBudgetUtilization(spent: number, budget: number): number {
  if (budget === 0) return 0;
  return Math.min((spent / budget) * 100, 100);
}

/**
 * Get budget utilization color
 */
export function getBudgetUtilizationColor(utilization: number): string {
  if (utilization >= 90) return MDMC_COLORS.error;
  if (utilization >= 70) return MDMC_COLORS.warning;
  return MDMC_COLORS.success;
}

/**
 * Format Google Ads Customer ID with dashes
 */
export function formatCustomerId(customerId: string): string {
  const cleaned = customerId.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }
  return customerId;
}

/**
 * Export data to CSV
 */
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Check if value is between two numbers
 */
export function isBetween(value: number, min: number, max: number, inclusive: boolean = true): boolean {
  return inclusive ? value >= min && value <= max : value > min && value < max;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}