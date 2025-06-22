// src/types/index.ts
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

export interface GoogleAdsAccount {
  id: string;
  customerId: string;
  name: string;
  currency: string;
  status: 'active' | 'paused' | 'suspended';
  assignedUsers: string[];
  totalBudget: number;
  spent: number;
  conversions: number;
  lastSync: Date;
}

export interface Campaign {
  id: string;
  customerId: string;
  name: string;
  status: 'enabled' | 'paused' | 'removed';
  type: 'search' | 'display' | 'shopping' | 'video' | 'app';
  budgetAmount: number;
  budgetType: 'daily' | 'total';
  startDate: Date;
  endDate?: Date;
  metrics: CampaignMetrics;
  lastUpdated: Date;
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversionRate: number;
  roas: number;
  costPerConversion: number;
  impressionShare: number;
  qualityScore: number;
}

export interface Alert {
  id: string;
  customerId: string;
  type: 'budget' | 'performance' | 'status' | 'custom';
  title: string;
  description: string;
  condition: AlertCondition;
  isActive: boolean;
  notificationChannels: NotificationChannel[];
  createdBy: string;
  createdAt: Date;
  lastTriggered?: Date;
}

export interface AlertCondition {
  metric: string;
  operator: 'greater_than' | 'less_than' | 'equals' | 'percentage_change';
  value: number;
  period: 'daily' | 'weekly' | 'monthly';
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'dashboard' | 'webhook';
  target: string;
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  data?: ChatMessageData;
  accountId?: string;
}

export interface ChatMessageData {
  campaigns?: CampaignSummary[];
  metrics?: MetricsSummary;
  recommendations?: string[];
  alerts?: AlertSummary[];
  charts?: ChartData[];
}

export interface CampaignSummary {
  name: string;
  roas: number;
  spend: number;
  conversions: number;
  status: string;
  change?: string;
}

export interface MetricsSummary {
  totalSpend: number;
  totalConversions: number;
  averageRoas: number;
  activeCampaigns: number;
  budgetUtilization: number;
}

export interface AlertSummary {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  campaignName?: string;
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: DataPoint[];
  labels: string[];
}

export interface DataPoint {
  x: string | number;
  y: number;
  label?: string;
}

export interface DashboardMetrics {
  activeCampaigns: number;
  totalBudget: number;
  totalSpend: number;
  totalConversions: number;
  averageRoas: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FilterOptions {
  status?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  campaigns?: string[];
  accounts?: string[];
  metrics?: string[];
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface UserPermissions {
  canViewCampaigns: boolean;
  canEditCampaigns: boolean;
  canCreateReports: boolean;
  canManageAlerts: boolean;
  canAccessAdmin: boolean;
  canManageUsers: boolean;
  canViewAllAccounts: boolean;
  assignedAccounts: string[];
}

export interface SystemSettings {
  maxApiCallsPerDay: number;
  defaultRefreshInterval: number;
  enableRealTimeUpdates: boolean;
  enableSlackIntegration: boolean;
  enableEmailNotifications: boolean;
  defaultTimezone: string;
  defaultCurrency: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, unknown>;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'campaign' | 'account' | 'performance' | 'custom';
  metrics: string[];
  filters: FilterOptions;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    isActive: boolean;
  };
  createdBy: string;
  createdAt: Date;
  lastUsed?: Date;
}

export interface WebSocketMessage {
  type: string;
  data: unknown;
  timestamp: number;
  accountId?: string;
  userId?: string;
}