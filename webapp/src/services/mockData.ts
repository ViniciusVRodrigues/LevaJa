import type { 
  User, 
  Sector, 
  Product, 
  Promotion, 
  DashboardMetrics, 
  WastageRecord,
  Notification,
  ExpiryAlert,
  SalesReport
} from '../types';

// Mock Users Data
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@levaja.com',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@levaja.com',
    role: 'manager',
    sectorId: '1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro.costa@levaja.com',
    role: 'employee',
    sectorId: '1',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    name: 'Ana Oliveira',
    email: 'ana.oliveira@levaja.com',
    role: 'employee',
    sectorId: '2',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
  },
];

// Mock Sectors Data
export const mockSectors: Sector[] = [
  {
    id: '1',
    name: 'Frutas e Vegetais',
    description: 'Setor responsável por frutas frescas e vegetais',
    managerId: '2',
    employeeIds: ['2', '3'],
    productCategories: ['frutas', 'vegetais', 'orgânicos'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Laticínios',
    description: 'Setor de produtos lácteos e derivados',
    employeeIds: ['4'],
    productCategories: ['leite', 'queijos', 'iogurtes'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    name: 'Padaria',
    description: 'Setor de pães e produtos de panificação',
    employeeIds: [],
    productCategories: ['pães', 'doces', 'biscoitos'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Mock Products Data
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Maçã Gala',
    barcode: '1234567890123',
    category: 'frutas',
    sectorId: '1',
    price: 4.99,
    quantity: 50,
    expiryDate: new Date('2024-12-10'),
    entryDate: new Date('2024-12-01'),
    minQuantity: 10,
    supplier: 'Fazenda São José',
    status: 'near_expiry',
  },
  {
    id: '2',
    name: 'Leite Integral 1L',
    barcode: '2345678901234',
    category: 'leite',
    sectorId: '2',
    price: 3.49,
    quantity: 30,
    expiryDate: new Date('2024-12-08'),
    entryDate: new Date('2024-12-05'),
    minQuantity: 20,
    supplier: 'Laticínios Bela Vista',
    status: 'near_expiry',
  },
  {
    id: '3',
    name: 'Pão Francês',
    barcode: '3456789012345',
    category: 'pães',
    sectorId: '3',
    price: 0.60,
    quantity: 100,
    expiryDate: new Date('2024-12-06'),
    entryDate: new Date('2024-12-06'),
    minQuantity: 50,
    supplier: 'Panificadora Central',
    status: 'active',
  },
  {
    id: '4',
    name: 'Banana Prata',
    barcode: '4567890123456',
    category: 'frutas',
    sectorId: '1',
    price: 2.99,
    quantity: 5,
    expiryDate: new Date('2024-12-12'),
    entryDate: new Date('2024-12-03'),
    minQuantity: 15,
    supplier: 'Fazenda Tropical',
    status: 'low_stock',
  },
];

// Mock Promotions Data
export const mockPromotions: Promotion[] = [
  {
    id: '1',
    productId: '1',
    title: 'Oferta Especial - Maçã Gala',
    description: 'Maçãs frescas com 30% de desconto',
    discountPercentage: 30,
    startDate: new Date('2024-12-05'),
    endDate: new Date('2024-12-10'),
    isActive: true,
    reason: 'near_expiry',
    effectiveness: {
      salesIncrease: 45,
      productsSold: 25,
      revenue: 87.32,
      wasteReduction: 60,
    },
    createdAt: new Date('2024-12-05'),
  },
  {
    id: '2',
    productId: '2',
    title: 'Promoção Leite Integral',
    description: 'Leve 2 pague 1 - Leite integral 1L',
    discountPercentage: 50,
    startDate: new Date('2024-12-06'),
    endDate: new Date('2024-12-08'),
    isActive: true,
    reason: 'near_expiry',
    createdAt: new Date('2024-12-06'),
  },
];

// Mock Wastage Records
export const mockWastageRecords: WastageRecord[] = [
  {
    id: '1',
    productId: '1',
    quantity: 10,
    reason: 'expired',
    cost: 49.90,
    reportedBy: '2',
    reportedAt: new Date('2024-12-01'),
  },
  {
    id: '2',
    productId: '3',
    quantity: 20,
    reason: 'damaged',
    cost: 12.00,
    reportedBy: '4',
    reportedAt: new Date('2024-12-02'),
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '2',
    title: 'Produtos próximos ao vencimento',
    message: '5 produtos no seu setor vencem em até 3 dias',
    type: 'warning',
    isRead: false,
    createdAt: new Date(),
    actionUrl: '/produtos?filter=near_expiry',
  },
  {
    id: '2',
    userId: '2',
    title: 'Estoque baixo',
    message: 'Banana Prata está com estoque abaixo do mínimo',
    type: 'info',
    isRead: false,
    createdAt: new Date(),
    actionUrl: '/produtos?filter=low_stock',
  },
];

// Mock Dashboard Metrics
export const mockDashboardMetrics: DashboardMetrics = {
  totalProducts: 4,
  nearExpiryProducts: 2,
  lowStockProducts: 1,
  activePromotions: 2,
  monthlyRevenue: 12500.50,
  wastageValue: 325.75,
  topSellingProducts: mockProducts.slice(0, 3),
  recentActivity: [
    {
      id: '1',
      userId: '2',
      action: 'create_promotion',
      description: 'Criou promoção para Maçã Gala',
      timestamp: new Date(),
    },
    {
      id: '2',
      userId: '3',
      action: 'update_stock',
      description: 'Atualizou estoque de Pão Francês',
      timestamp: new Date(Date.now() - 3600000),
    },
  ],
};

// Mock Expiry Alerts
export const mockExpiryAlerts: ExpiryAlert[] = [
  {
    productId: '1',
    productName: 'Maçã Gala',
    expiryDate: new Date('2024-12-10'),
    daysToExpiry: 4,
    quantity: 50,
    sectorId: '1',
    priority: 'high',
  },
  {
    productId: '2',
    productName: 'Leite Integral 1L',
    expiryDate: new Date('2024-12-08'),
    daysToExpiry: 2,
    quantity: 30,
    sectorId: '2',
    priority: 'high',
  },
];

// Mock Sales Report
export const mockSalesReport: SalesReport = {
  period: 'Dezembro 2024',
  totalSales: 245,
  totalRevenue: 1234.56,
  promotionalSales: 75,
  topProducts: [
    {
      productId: '3',
      productName: 'Pão Francês',
      unitsSold: 80,
      revenue: 48.00,
    },
    {
      productId: '1',
      productName: 'Maçã Gala',
      unitsSold: 45,
      revenue: 224.55,
    },
    {
      productId: '2',
      productName: 'Leite Integral 1L',
      unitsSold: 35,
      revenue: 122.15,
    },
  ],
};