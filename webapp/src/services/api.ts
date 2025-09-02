import axios from 'axios';
import type { 
  User, 
  Sector, 
  Product, 
  Promotion, 
  DashboardMetrics, 
  WastageRecord,
  Notification,
  ExpiryAlert,
  SalesReport,
  ApiResponse,
  UserFormData,
  ProductFormData,
  SectorFormData,
  PromotionFormData,
  ReportFilter,
} from '../types';
import {
  mockUsers,
  mockSectors,
  mockProducts,
  mockPromotions,
  mockWastageRecords,
  mockNotifications,
  mockDashboardMetrics,
  mockExpiryAlerts,
  mockSalesReport,
} from './mockData';

// Configure axios defaults
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock API delay to simulate network requests
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// User API
export const userApi = {
  async getAll(): Promise<ApiResponse<User[]>> {
    await mockDelay();
    return { success: true, data: mockUsers };
  },

  async getById(id: string): Promise<ApiResponse<User>> {
    await mockDelay();
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      return { success: false, data: {} as User, message: 'Usuário não encontrado' };
    }
    return { success: true, data: user };
  },

  async create(userData: UserFormData): Promise<ApiResponse<User>> {
    await mockDelay();
    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUsers.push(newUser);
    return { success: true, data: newUser };
  },

  async update(id: string, userData: Partial<UserFormData>): Promise<ApiResponse<User>> {
    await mockDelay();
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return { success: false, data: {} as User, message: 'Usuário não encontrado' };
    }
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData, updatedAt: new Date() };
    return { success: true, data: mockUsers[userIndex] };
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    await mockDelay();
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return { success: false, data: undefined, message: 'Usuário não encontrado' };
    }
    mockUsers.splice(userIndex, 1);
    return { success: true, data: undefined };
  },
};

// Sector API
export const sectorApi = {
  async getAll(): Promise<ApiResponse<Sector[]>> {
    await mockDelay();
    return { success: true, data: mockSectors };
  },

  async getById(id: string): Promise<ApiResponse<Sector>> {
    await mockDelay();
    const sector = mockSectors.find(s => s.id === id);
    if (!sector) {
      return { success: false, data: {} as Sector, message: 'Setor não encontrado' };
    }
    return { success: true, data: sector };
  },

  async create(sectorData: SectorFormData): Promise<ApiResponse<Sector>> {
    await mockDelay();
    const newSector: Sector = {
      id: Date.now().toString(),
      ...sectorData,
      employeeIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockSectors.push(newSector);
    return { success: true, data: newSector };
  },

  async update(id: string, sectorData: Partial<SectorFormData>): Promise<ApiResponse<Sector>> {
    await mockDelay();
    const sectorIndex = mockSectors.findIndex(s => s.id === id);
    if (sectorIndex === -1) {
      return { success: false, data: {} as Sector, message: 'Setor não encontrado' };
    }
    mockSectors[sectorIndex] = { ...mockSectors[sectorIndex], ...sectorData, updatedAt: new Date() };
    return { success: true, data: mockSectors[sectorIndex] };
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    await mockDelay();
    const sectorIndex = mockSectors.findIndex(s => s.id === id);
    if (sectorIndex === -1) {
      return { success: false, data: undefined, message: 'Setor não encontrado' };
    }
    mockSectors.splice(sectorIndex, 1);
    return { success: true, data: undefined };
  },
};

// Product API
export const productApi = {
  async getAll(filter?: string): Promise<ApiResponse<Product[]>> {
    await mockDelay();
    let filteredProducts = mockProducts;
    
    if (filter) {
      switch (filter) {
        case 'near_expiry':
          filteredProducts = mockProducts.filter(p => p.status === 'near_expiry');
          break;
        case 'low_stock':
          filteredProducts = mockProducts.filter(p => p.status === 'low_stock');
          break;
        case 'expired':
          filteredProducts = mockProducts.filter(p => p.status === 'expired');
          break;
      }
    }
    
    return { success: true, data: filteredProducts };
  },

  async getById(id: string): Promise<ApiResponse<Product>> {
    await mockDelay();
    const product = mockProducts.find(p => p.id === id);
    if (!product) {
      return { success: false, data: {} as Product, message: 'Produto não encontrado' };
    }
    return { success: true, data: product };
  },

  async create(productData: ProductFormData): Promise<ApiResponse<Product>> {
    await mockDelay();
    const newProduct: Product = {
      id: Date.now().toString(),
      ...productData,
      expiryDate: new Date(productData.expiryDate),
      entryDate: new Date(),
      status: 'active',
    };
    mockProducts.push(newProduct);
    return { success: true, data: newProduct };
  },

  async update(id: string, productData: Partial<ProductFormData>): Promise<ApiResponse<Product>> {
    await mockDelay();
    const productIndex = mockProducts.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return { success: false, data: {} as Product, message: 'Produto não encontrado' };
    }
    
    const updatedData: any = { ...productData };
    if (productData.expiryDate) {
      updatedData.expiryDate = new Date(productData.expiryDate);
    }
    
    mockProducts[productIndex] = { ...mockProducts[productIndex], ...updatedData };
    return { success: true, data: mockProducts[productIndex] };
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    await mockDelay();
    const productIndex = mockProducts.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return { success: false, data: undefined, message: 'Produto não encontrado' };
    }
    mockProducts.splice(productIndex, 1);
    return { success: true, data: undefined };
  },

  async scanBarcode(barcode: string): Promise<ApiResponse<Product | null>> {
    await mockDelay();
    const product = mockProducts.find(p => p.barcode === barcode);
    return { success: true, data: product || null };
  },
};

// Promotion API
export const promotionApi = {
  async getAll(): Promise<ApiResponse<Promotion[]>> {
    await mockDelay();
    return { success: true, data: mockPromotions };
  },

  async getById(id: string): Promise<ApiResponse<Promotion>> {
    await mockDelay();
    const promotion = mockPromotions.find(p => p.id === id);
    if (!promotion) {
      return { success: false, data: {} as Promotion, message: 'Promoção não encontrada' };
    }
    return { success: true, data: promotion };
  },

  async create(promotionData: PromotionFormData): Promise<ApiResponse<Promotion>> {
    await mockDelay();
    const newPromotion: Promotion = {
      id: Date.now().toString(),
      ...promotionData,
      startDate: new Date(promotionData.startDate),
      endDate: new Date(promotionData.endDate),
      isActive: true,
      createdAt: new Date(),
    };
    mockPromotions.push(newPromotion);
    return { success: true, data: newPromotion };
  },

  async update(id: string, promotionData: Partial<PromotionFormData>): Promise<ApiResponse<Promotion>> {
    await mockDelay();
    const promotionIndex = mockPromotions.findIndex(p => p.id === id);
    if (promotionIndex === -1) {
      return { success: false, data: {} as Promotion, message: 'Promoção não encontrada' };
    }
    
    const updatedData: any = { ...promotionData };
    if (promotionData.startDate) {
      updatedData.startDate = new Date(promotionData.startDate);
    }
    if (promotionData.endDate) {
      updatedData.endDate = new Date(promotionData.endDate);
    }
    
    mockPromotions[promotionIndex] = { ...mockPromotions[promotionIndex], ...updatedData };
    return { success: true, data: mockPromotions[promotionIndex] };
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    await mockDelay();
    const promotionIndex = mockPromotions.findIndex(p => p.id === id);
    if (promotionIndex === -1) {
      return { success: false, data: undefined, message: 'Promoção não encontrada' };
    }
    mockPromotions.splice(promotionIndex, 1);
    return { success: true, data: undefined };
  },

  async generateSuggestions(): Promise<ApiResponse<Promotion[]>> {
    await mockDelay();
    // Generate automatic promotion suggestions based on expiry dates and stock
    const suggestions: Promotion[] = mockProducts
      .filter(p => p.status === 'near_expiry' || p.status === 'low_stock')
      .map(product => ({
        id: `suggestion_${Date.now()}_${product.id}`,
        productId: product.id,
        title: `Promoção Sugerida - ${product.name}`,
        description: `Desconto automático para ${product.status === 'near_expiry' ? 'produto próximo ao vencimento' : 'produto com estoque baixo'}`,
        discountPercentage: product.status === 'near_expiry' ? 30 : 15,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        isActive: false,
        reason: product.status === 'near_expiry' ? 'near_expiry' : 'excess_stock',
        createdAt: new Date(),
      }));
    
    return { success: true, data: suggestions };
  },
};

// Dashboard API
export const dashboardApi = {
  async getMetrics(): Promise<ApiResponse<DashboardMetrics>> {
    await mockDelay();
    return { success: true, data: mockDashboardMetrics };
  },

  async getExpiryAlerts(): Promise<ApiResponse<ExpiryAlert[]>> {
    await mockDelay();
    return { success: true, data: mockExpiryAlerts };
  },
};

// Notification API
export const notificationApi = {
  async getAll(): Promise<ApiResponse<Notification[]>> {
    await mockDelay();
    return { success: true, data: mockNotifications };
  },

  async markAsRead(id: string): Promise<ApiResponse<void>> {
    await mockDelay();
    const notification = mockNotifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
    }
    return { success: true, data: undefined };
  },

  async markAllAsRead(): Promise<ApiResponse<void>> {
    await mockDelay();
    mockNotifications.forEach(n => n.isRead = true);
    return { success: true, data: undefined };
  },
};

// Report API
export const reportApi = {
  async getSalesReport(_filter: ReportFilter): Promise<ApiResponse<SalesReport>> {
    await mockDelay();
    // In a real implementation, this would filter data based on the provided filter
    return { success: true, data: mockSalesReport };
  },

  async getWastageReport(_filter: ReportFilter): Promise<ApiResponse<WastageRecord[]>> {
    await mockDelay();
    return { success: true, data: mockWastageRecords };
  },

  async exportData(type: 'csv' | 'pdf', _data: any): Promise<ApiResponse<Blob>> {
    await mockDelay();
    // Mock export functionality
    const mockBlob = new Blob(['Mock exported data'], { type: type === 'csv' ? 'text/csv' : 'application/pdf' });
    return { success: true, data: mockBlob };
  },
};

// Auth API (mock implementation)
export const authApi = {
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    await mockDelay();
    // Mock authentication - in production, this would validate credentials
    const user = mockUsers.find(u => u.email === email);
    if (user && password === 'demo123') {
      const token = 'mock_jwt_token_' + Date.now();
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return { success: true, data: { user, token } };
    }
    return { success: false, data: {} as any, message: 'Email ou senha inválidos' };
  },

  async logout(): Promise<ApiResponse<void>> {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    return { success: true, data: undefined };
  },

  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      return { success: true, data: JSON.parse(userStr) };
    }
    return { success: true, data: null };
  },
};