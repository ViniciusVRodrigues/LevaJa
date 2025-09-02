// Core Types for LevaJá Administrative Panel

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  sectorId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'manager' | 'employee' | 'viewer';

export interface Sector {
  id: string;
  name: string;
  description: string;
  managerId?: string;
  employeeIds: string[];
  productCategories: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  sectorId: string;
  price: number;
  quantity: number;
  expiryDate: Date;
  entryDate: Date;
  minQuantity: number;
  supplier: string;
  status: ProductStatus;
  promotionId?: string;
}

export type ProductStatus = 'active' | 'expired' | 'near_expiry' | 'low_stock' | 'out_of_stock';

export interface Promotion {
  id: string;
  productId: string;
  title: string;
  description: string;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  reason: PromotionReason;
  effectiveness?: PromotionEffectiveness;
  createdAt: Date;
}

export type PromotionReason = 'near_expiry' | 'excess_stock' | 'seasonal' | 'manual';

export interface PromotionEffectiveness {
  salesIncrease: number;
  productsSold: number;
  revenue: number;
  wasteReduction: number;
}

export interface WastageRecord {
  id: string;
  productId: string;
  quantity: number;
  reason: WastageReason;
  cost: number;
  reportedBy: string;
  reportedAt: Date;
}

export type WastageReason = 'expired' | 'damaged' | 'stolen' | 'returned' | 'other';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export type NotificationType = 'warning' | 'info' | 'success' | 'error';

export interface DashboardMetrics {
  totalProducts: number;
  nearExpiryProducts: number;
  lowStockProducts: number;
  activePromotions: number;
  monthlyRevenue: number;
  wastageValue: number;
  topSellingProducts: Product[];
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  sectorId?: string;
  productCategory?: string;
  userId?: string;
}

export interface SalesReport {
  period: string;
  totalSales: number;
  totalRevenue: number;
  promotionalSales: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    unitsSold: number;
    revenue: number;
  }>;
}

export interface ExpiryAlert {
  productId: string;
  productName: string;
  expiryDate: Date;
  daysToExpiry: number;
  quantity: number;
  sectorId: string;
  priority: 'high' | 'medium' | 'low';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface ProductFormData {
  name: string;
  barcode: string;
  category: string;
  sectorId: string;
  price: number;
  quantity: number;
  expiryDate: string;
  minQuantity: number;
  supplier: string;
}

export interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  sectorId?: string;
}

export interface SectorFormData {
  name: string;
  description: string;
  managerId?: string;
  productCategories: string[];
}

export interface PromotionFormData {
  productId: string;
  title: string;
  description: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  reason: PromotionReason;
}