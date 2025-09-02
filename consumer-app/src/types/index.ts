// Consumer App Types - Based on existing LevaJa webapp types

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
  loyaltyPoints: number;
  sustainabilityScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  categories: string[];
  maxDistance: number; // km
  notificationsEnabled: boolean;
  preferredMarkets: string[];
  dietaryRestrictions: string[];
}

// Product Types
export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  brand: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  quantity: number;
  expiryDate: Date;
  daysToExpiry: number;
  images: string[];
  description: string;
  nutritionalInfo?: NutritionalInfo;
  marketId: string;
  marketName: string;
  marketDistance: number;
  rating: number;
  reviewCount: number;
  isNearExpiry: boolean;
  isFavorite: boolean;
  tags: string[];
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

// Market Types
export interface Market {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distance: number;
  rating: number;
  isOpen: boolean;
  openingHours: string;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  estimatedDeliveryTime: number; // minutes
  phone: string;
  image: string;
}

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedQuantity: number;
  marketId: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  originalTotal: number;
  savings: number;
  itemCount: number;
}

// Order Types
export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  savings: number;
  status: OrderStatus;
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  marketId: string;
  marketName: string;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  sustainabilityImpact: SustainabilityImpact;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type DeliveryType = 'pickup' | 'delivery';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'pix' | 'cash';

// Sustainability Types
export interface SustainabilityImpact {
  foodWastePrevented: number; // kg
  co2Saved: number; // kg
  waterSaved: number; // liters
  moneySaved: number;
  itemsRescued: number;
}

export interface SustainabilityStats {
  totalImpact: SustainabilityImpact;
  monthlyImpact: SustainabilityImpact;
  weeklyImpact: SustainabilityImpact;
  badges: Badge[];
  level: number;
  nextLevelRequirement: number;
  globalRanking: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: 'waste_reduction' | 'money_saved' | 'environmental' | 'social';
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
  hasMore: boolean;
}

// Filter Types
export interface ProductFilter {
  category?: string;
  maxPrice?: number;
  maxDistance?: number;
  marketId?: string;
  searchTerm?: string;
  sortBy?: 'price' | 'discount' | 'expiry' | 'distance' | 'rating';
  sortOrder?: 'asc' | 'desc';
  onlyNearExpiry?: boolean;
  onlyFavorites?: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  productId?: string;
  marketId?: string;
}

export type NotificationType = 
  | 'new_offer' 
  | 'price_drop' 
  | 'expiry_reminder' 
  | 'order_update' 
  | 'market_nearby' 
  | 'achievement';

// Location Types
export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface ProfileForm {
  name: string;
  email: string;
  preferences: UserPreferences;
}

export interface CheckoutForm {
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

// App State Types
export interface AppState {
  user: User | null;
  cart: Cart;
  location: Location | null;
  isLoading: boolean;
  error: string | null;
}

// Search Types
export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'market';
  count?: number;
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: Date;
  results: number;
}