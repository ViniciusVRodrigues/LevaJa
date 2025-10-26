import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  userApi, 
  sectorApi, 
  productApi, 
  promotionApi, 
  dashboardApi, 
  notificationApi,
  authApi 
} from '../services/api';
import type { 
  User, 
  UserFormData,
  ProductFormData,
  SectorFormData,
  PromotionFormData 
} from '../types';

// Auth Hook
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    if (response.success) {
      setUser(response.data.user);
      return { success: true };
    }
    return { success: false, message: response.message };
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
};

// Local Storage Hook
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
};

// Search Hook
export const useSearch = <T>(data: T[], searchFields: (keyof T)[], initialSearchTerm = '') => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  const filteredData = data.filter(item => {
    if (!searchTerm.trim()) return true;
    
    const term = searchTerm.toLowerCase();
    return searchFields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(term);
    });
  });

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
  };
};

// Pagination Hook
export const usePagination = <T>(data: T[], itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  return {
    currentPage,
    totalPages,
    currentData,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
};

// Dashboard Data Hook
export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await dashboardApi.getMetrics();
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Users Hook
export const useUsers = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userApi.getAll();
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (userData: UserFormData) => userApi.create(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: Partial<UserFormData> }) =>
      userApi.update(id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    ...query,
    createUser: createMutation.mutate,
    updateUser: updateMutation.mutate,
    deleteUser: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

// Products Hook
export const useProducts = (filter?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['products', filter],
    queryFn: async () => {
      const response = await productApi.getAll(filter);
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (productData: ProductFormData) => productApi.create(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, productData }: { id: string; productData: Partial<ProductFormData> }) =>
      productApi.update(id, productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    ...query,
    createProduct: createMutation.mutate,
    updateProduct: updateMutation.mutate,
    deleteProduct: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

// Sectors Hook
export const useSectors = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['sectors'],
    queryFn: async () => {
      const response = await sectorApi.getAll();
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (sectorData: SectorFormData) => sectorApi.create(sectorData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectors'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, sectorData }: { id: string; sectorData: Partial<SectorFormData> }) =>
      sectorApi.update(id, sectorData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectors'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sectorApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectors'] });
    },
  });

  return {
    ...query,
    createSector: createMutation.mutate,
    updateSector: updateMutation.mutate,
    deleteSector: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

// Promotions Hook
export const usePromotions = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      const response = await promotionApi.getAll();
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (promotionData: PromotionFormData) => promotionApi.create(promotionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, promotionData }: { id: string; promotionData: Partial<PromotionFormData> }) =>
      promotionApi.update(id, promotionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => promotionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const suggestionsMutation = useMutation({
    mutationFn: () => promotionApi.generateSuggestions(),
  });

  return {
    ...query,
    createPromotion: createMutation.mutate,
    updatePromotion: updateMutation.mutate,
    deletePromotion: deleteMutation.mutate,
    generateSuggestions: suggestionsMutation.mutate,
    suggestions: suggestionsMutation.data?.data || [],
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isGeneratingSuggestions: suggestionsMutation.isPending,
  };
};

// Notifications Hook
export const useNotifications = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await notificationApi.getAll();
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time notifications
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = query.data?.filter(n => !n.isRead).length || 0;

  return {
    ...query,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    unreadCount,
  };
};

// Expiry Alerts Hook
export const useExpiryAlerts = () => {
  return useQuery({
    queryKey: ['expiry-alerts'],
    queryFn: async () => {
      const response = await dashboardApi.getExpiryAlerts();
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    refetchInterval: 60000, // Refetch every minute
  });
};

// Window Size Hook
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Debounced Value Hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};