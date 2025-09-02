import axios from 'axios';
import type { 
  Product, 
  Market, 
  User, 
  Cart, 
  Order,
  ProductFilter,
  SustainabilityStats,
  ApiResponse,
  PaginatedResponse,
  LoginForm,
  RegisterForm,
  CheckoutForm
} from '../../types';

// API Configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Mock delay for development
const mockDelay = () => new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

// Mock Data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Pão Integral Artesanal',
    barcode: '7891234567890',
    category: 'Padaria',
    brand: 'Vida Verde',
    price: 8.50,
    originalPrice: 12.90,
    discountPercentage: 34,
    quantity: 15,
    expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
    daysToExpiry: 2,
    images: ['/images/pao-integral.jpg'],
    description: 'Pão integral artesanal feito com ingredientes naturais',
    marketId: '1',
    marketName: 'Mercado Verde',
    marketDistance: 0.8,
    rating: 4.5,
    reviewCount: 23,
    isNearExpiry: true,
    isFavorite: false,
    tags: ['integral', 'artesanal', 'sem conservantes'],
  },
  {
    id: '2',
    name: 'Iogurte Natural Orgânico',
    barcode: '7891234567891',
    category: 'Laticínios',
    brand: 'Fazenda Feliz',
    price: 4.20,
    originalPrice: 6.50,
    discountPercentage: 35,
    quantity: 8,
    expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
    daysToExpiry: 1,
    images: ['/images/iogurte-natural.jpg'],
    description: 'Iogurte natural orgânico sem açúcar adicionado',
    marketId: '2',
    marketName: 'Supermercado Economia',
    marketDistance: 1.2,
    rating: 4.8,
    reviewCount: 45,
    isNearExpiry: true,
    isFavorite: true,
    tags: ['orgânico', 'natural', 'sem açúcar'],
  },
  {
    id: '3',
    name: 'Banana Prata Orgânica',
    barcode: '7891234567892',
    category: 'Frutas',
    brand: 'Sítio Bom',
    price: 3.90,
    originalPrice: 5.50,
    discountPercentage: 29,
    quantity: 25,
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    daysToExpiry: 3,
    images: ['/images/banana-prata.jpg'],
    description: 'Bananas orgânicas maduras, ideais para vitaminas',
    marketId: '1',
    marketName: 'Mercado Verde',
    marketDistance: 0.8,
    rating: 4.3,
    reviewCount: 12,
    isNearExpiry: true,
    isFavorite: false,
    tags: ['orgânico', 'frutas', 'vitaminas'],
  },
];

const mockMarkets: Market[] = [
  {
    id: '1',
    name: 'Mercado Verde',
    address: 'Rua das Flores, 123 - Centro',
    coordinates: { lat: -23.5505, lng: -46.6333 },
    distance: 0.8,
    rating: 4.5,
    isOpen: true,
    openingHours: '07:00 - 22:00',
    deliveryAvailable: true,
    pickupAvailable: true,
    estimatedDeliveryTime: 45,
    phone: '(11) 1234-5678',
    image: '/images/mercado-verde.jpg',
  },
  {
    id: '2',
    name: 'Supermercado Economia',
    address: 'Av. Principal, 456 - Bairro Novo',
    coordinates: { lat: -23.5515, lng: -46.6343 },
    distance: 1.2,
    rating: 4.2,
    isOpen: true,
    openingHours: '06:00 - 23:00',
    deliveryAvailable: true,
    pickupAvailable: true,
    estimatedDeliveryTime: 60,
    phone: '(11) 2345-6789',
    image: '/images/supermercado-economia.jpg',
  },
];

// Products API
export const productsApi = {
  async getAll(filter: ProductFilter = {}): Promise<ApiResponse<PaginatedResponse<Product>>> {
    await mockDelay();
    
    let filteredProducts = [...mockProducts];
    
    if (filter.category) {
      filteredProducts = filteredProducts.filter(p => p.category.toLowerCase().includes(filter.category!.toLowerCase()));
    }
    
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    if (filter.maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= filter.maxPrice!);
    }
    
    if (filter.maxDistance) {
      filteredProducts = filteredProducts.filter(p => p.marketDistance <= filter.maxDistance!);
    }
    
    if (filter.onlyNearExpiry) {
      filteredProducts = filteredProducts.filter(p => p.isNearExpiry);
    }
    
    if (filter.onlyFavorites) {
      filteredProducts = filteredProducts.filter(p => p.isFavorite);
    }
    
    // Sort
    if (filter.sortBy) {
      filteredProducts.sort((a, b) => {
        let aVal: number, bVal: number;
        
        switch (filter.sortBy) {
          case 'price':
            aVal = a.price;
            bVal = b.price;
            break;
          case 'discount':
            aVal = a.discountPercentage;
            bVal = b.discountPercentage;
            break;
          case 'expiry':
            aVal = a.daysToExpiry;
            bVal = b.daysToExpiry;
            break;
          case 'distance':
            aVal = a.marketDistance;
            bVal = b.marketDistance;
            break;
          case 'rating':
            aVal = a.rating;
            bVal = b.rating;
            break;
          default:
            return 0;
        }
        
        return filter.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      });
    }
    
    return {
      success: true,
      data: {
        data: filteredProducts,
        total: filteredProducts.length,
        page: 1,
        limit: 20,
        totalPages: Math.ceil(filteredProducts.length / 20),
        hasMore: false,
      },
    };
  },

  async getById(id: string): Promise<ApiResponse<Product>> {
    await mockDelay();
    const product = mockProducts.find(p => p.id === id);
    if (!product) {
      return { success: false, data: {} as Product, message: 'Produto não encontrado' };
    }
    return { success: true, data: product };
  },

  async toggleFavorite(id: string): Promise<ApiResponse<void>> {
    await mockDelay();
    const product = mockProducts.find(p => p.id === id);
    if (product) {
      product.isFavorite = !product.isFavorite;
    }
    return { success: true, data: undefined };
  },
};

// Markets API
export const marketsApi = {
  async getAll(userLocation?: { lat: number; lng: number }): Promise<ApiResponse<Market[]>> {
    await mockDelay();
    let markets = [...mockMarkets];
    
    if (userLocation) {
      // Calculate distances (simplified)
      markets = markets.map(market => ({
        ...market,
        distance: Math.round(
          Math.sqrt(
            Math.pow(market.coordinates.lat - userLocation.lat, 2) +
            Math.pow(market.coordinates.lng - userLocation.lng, 2)
          ) * 111 * 100
        ) / 100
      }));
      
      markets.sort((a, b) => a.distance - b.distance);
    }
    
    return { success: true, data: markets };
  },

  async getById(id: string): Promise<ApiResponse<Market>> {
    await mockDelay();
    const market = mockMarkets.find(m => m.id === id);
    if (!market) {
      return { success: false, data: {} as Market, message: 'Mercado não encontrado' };
    }
    return { success: true, data: market };
  },
};

// Auth API
export const authApi = {
  async login(credentials: LoginForm): Promise<ApiResponse<{ user: User; token: string }>> {
    await mockDelay();
    
    // Mock authentication
    if (credentials.email === 'consumidor@levaja.com' && credentials.password === 'demo123') {
      const user: User = {
        id: '1',
        name: 'Maria Silva',
        email: 'consumidor@levaja.com',
        avatar: '/images/avatar.jpg',
        preferences: {
          categories: ['Frutas', 'Laticínios', 'Padaria'],
          maxDistance: 5,
          notificationsEnabled: true,
          preferredMarkets: ['1', '2'],
          dietaryRestrictions: ['sem glúten'],
        },
        loyaltyPoints: 1250,
        sustainabilityScore: 89,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
      };
      
      const token = 'mock_jwt_token_consumer_' + Date.now();
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      return { success: true, data: { user, token } };
    }
    
    return { success: false, data: {} as any, message: 'Email ou senha inválidos' };
  },

  async register(userData: RegisterForm): Promise<ApiResponse<{ user: User; token: string }>> {
    await mockDelay();
    
    const user: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      preferences: {
        categories: [],
        maxDistance: 5,
        notificationsEnabled: true,
        preferredMarkets: [],
        dietaryRestrictions: [],
      },
      loyaltyPoints: 0,
      sustainabilityScore: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const token = 'mock_jwt_token_consumer_' + Date.now();
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    return { success: true, data: { user, token } };
  },

  async logout(): Promise<ApiResponse<void>> {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    return { success: true, data: undefined };
  },

  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      return { success: true, data: user };
    }
    return { success: true, data: null };
  },
};

// Cart API
export const cartApi = {
  async getCart(): Promise<ApiResponse<Cart>> {
    await mockDelay();
    
    const cartStr = localStorage.getItem('cart');
    if (cartStr) {
      const cart = JSON.parse(cartStr);
      return { success: true, data: cart };
    }
    
    const emptyCart: Cart = {
      id: '1',
      items: [],
      total: 0,
      originalTotal: 0,
      savings: 0,
      itemCount: 0,
    };
    
    return { success: true, data: emptyCart };
  },

  async addToCart(productId: string, quantity: number): Promise<ApiResponse<Cart>> {
    await mockDelay();
    
    const product = mockProducts.find(p => p.id === productId);
    if (!product) {
      return { success: false, data: {} as Cart, message: 'Produto não encontrado' };
    }
    
    const { data: cart } = await this.getCart();
    const existingItem = cart.items.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.selectedQuantity = Math.min(
        existingItem.selectedQuantity + quantity,
        product.quantity
      );
    } else {
      cart.items.push({
        id: Date.now().toString(),
        productId,
        product,
        quantity: product.quantity,
        selectedQuantity: Math.min(quantity, product.quantity),
        marketId: product.marketId,
      });
    }
    
    // Recalculate totals
    cart.total = cart.items.reduce((sum, item) => sum + (item.product.price * item.selectedQuantity), 0);
    cart.originalTotal = cart.items.reduce((sum, item) => sum + (item.product.originalPrice * item.selectedQuantity), 0);
    cart.savings = cart.originalTotal - cart.total;
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.selectedQuantity, 0);
    
    localStorage.setItem('cart', JSON.stringify(cart));
    return { success: true, data: cart };
  },

  async removeFromCart(itemId: string): Promise<ApiResponse<Cart>> {
    await mockDelay();
    
    const { data: cart } = await this.getCart();
    cart.items = cart.items.filter(item => item.id !== itemId);
    
    // Recalculate totals
    cart.total = cart.items.reduce((sum, item) => sum + (item.product.price * item.selectedQuantity), 0);
    cart.originalTotal = cart.items.reduce((sum, item) => sum + (item.product.originalPrice * item.selectedQuantity), 0);
    cart.savings = cart.originalTotal - cart.total;
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.selectedQuantity, 0);
    
    localStorage.setItem('cart', JSON.stringify(cart));
    return { success: true, data: cart };
  },

  async updateQuantity(itemId: string, quantity: number): Promise<ApiResponse<Cart>> {
    await mockDelay();
    
    const { data: cart } = await this.getCart();
    const item = cart.items.find(i => i.id === itemId);
    
    if (item) {
      item.selectedQuantity = Math.min(Math.max(quantity, 0), item.quantity);
    }
    
    // Remove items with 0 quantity
    cart.items = cart.items.filter(item => item.selectedQuantity > 0);
    
    // Recalculate totals
    cart.total = cart.items.reduce((sum, item) => sum + (item.product.price * item.selectedQuantity), 0);
    cart.originalTotal = cart.items.reduce((sum, item) => sum + (item.product.originalPrice * item.selectedQuantity), 0);
    cart.savings = cart.originalTotal - cart.total;
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.selectedQuantity, 0);
    
    localStorage.setItem('cart', JSON.stringify(cart));
    return { success: true, data: cart };
  },

  async clearCart(): Promise<ApiResponse<void>> {
    localStorage.removeItem('cart');
    return { success: true, data: undefined };
  },
};

// Orders API
export const ordersApi = {
  async createOrder(checkoutData: CheckoutForm): Promise<ApiResponse<Order>> {
    await mockDelay();
    
    const { data: cart } = await cartApi.getCart();
    const { data: user } = await authApi.getCurrentUser();
    
    if (!user) {
      return { success: false, data: {} as Order, message: 'Usuário não autenticado' };
    }
    
    if (cart.items.length === 0) {
      return { success: false, data: {} as Order, message: 'Carrinho vazio' };
    }
    
    const order: Order = {
      id: Date.now().toString(),
      userId: user.id,
      items: cart.items,
      total: cart.total,
      savings: cart.savings,
      status: 'pending',
      deliveryType: checkoutData.deliveryType,
      deliveryAddress: checkoutData.deliveryAddress,
      marketId: cart.items[0].marketId,
      marketName: cart.items[0].product.marketName,
      paymentMethod: checkoutData.paymentMethod,
      createdAt: new Date(),
      estimatedDelivery: new Date(Date.now() + (checkoutData.deliveryType === 'delivery' ? 60 : 30) * 60 * 1000),
      sustainabilityImpact: {
        foodWastePrevented: cart.itemCount * 0.2, // kg
        co2Saved: cart.itemCount * 0.5, // kg
        waterSaved: cart.itemCount * 10, // liters
        moneySaved: cart.savings,
        itemsRescued: cart.itemCount,
      },
    };
    
    // Clear cart after order
    await cartApi.clearCart();
    
    return { success: true, data: order };
  },

  async getOrders(): Promise<ApiResponse<Order[]>> {
    await mockDelay();
    // Mock orders - in a real app, this would come from the server
    return { success: true, data: [] };
  },

  async getOrderById(_id: string): Promise<ApiResponse<Order>> {
    await mockDelay();
    // Mock order - in a real app, this would come from the server
    return { success: false, data: {} as Order, message: 'Pedido não encontrado' };
  },
};

// Sustainability API
export const sustainabilityApi = {
  async getStats(): Promise<ApiResponse<SustainabilityStats>> {
    await mockDelay();
    
    const stats: SustainabilityStats = {
      totalImpact: {
        foodWastePrevented: 45.6,
        co2Saved: 23.2,
        waterSaved: 456,
        moneySaved: 234.50,
        itemsRescued: 89,
      },
      monthlyImpact: {
        foodWastePrevented: 12.3,
        co2Saved: 6.1,
        waterSaved: 123,
        moneySaved: 67.20,
        itemsRescued: 24,
      },
      weeklyImpact: {
        foodWastePrevented: 3.1,
        co2Saved: 1.5,
        waterSaved: 31,
        moneySaved: 18.90,
        itemsRescued: 6,
      },
      badges: [
        {
          id: '1',
          name: 'Eco Warrior',
          description: 'Salvou mais de 40kg de alimentos',
          icon: '🌱',
          earnedAt: new Date('2024-01-15'),
          category: 'waste_reduction',
        },
        {
          id: '2',
          name: 'Money Saver',
          description: 'Economizou mais de R$ 200',
          icon: '💰',
          earnedAt: new Date('2024-01-20'),
          category: 'money_saved',
        },
      ],
      level: 7,
      nextLevelRequirement: 50, // kg of food waste prevented
      globalRanking: 1247,
    };
    
    return { success: true, data: stats };
  },
};

export default api;