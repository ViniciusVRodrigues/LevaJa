import { format, isAfter, isBefore, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Format date for display
 */
export const formatDate = (date: Date | string, pattern: string = 'dd/MM/yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, pattern, { locale: ptBR });
};

/**
 * Format date and time for display
 */
export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

/**
 * Format relative time (e.g., "2 dias", "1 hora")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diffInDays = differenceInDays(dateObj, now);
  
  if (diffInDays === 0) {
    const diffInHours = Math.floor((dateObj.getTime() - now.getTime()) / (1000 * 60 * 60));
    if (diffInHours <= 0) return 'Hoje';
    return `${diffInHours}h`;
  }
  
  if (diffInDays === 1) return 'Amanhã';
  if (diffInDays > 0) return `${diffInDays} dias`;
  
  if (diffInDays === -1) return 'Ontem';
  return `${Math.abs(diffInDays)} dias atrás`;
};

/**
 * Check if a date is within a range
 */
export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return !isBefore(date, startDate) && !isAfter(date, endDate);
};

/**
 * Get days until expiry
 */
export const getDaysUntilExpiry = (expiryDate: Date): number => {
  return differenceInDays(expiryDate, new Date());
};

/**
 * Check if product is near expiry (within 7 days)
 */
export const isNearExpiry = (expiryDate: Date): boolean => {
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
  return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
};

/**
 * Check if product is expired
 */
export const isExpired = (expiryDate: Date): boolean => {
  return getDaysUntilExpiry(expiryDate) < 0;
};

/**
 * Format currency
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format number with thousands separator
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

/**
 * Format weight (kg)
 */
export const formatWeight = (value: number): string => {
  if (value < 1) {
    return `${(value * 1000).toFixed(0)}g`;
  }
  return `${value.toFixed(1)}kg`;
};

/**
 * Format distance
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

/**
 * Calculate discount percentage
 */
export const calculateDiscount = (originalPrice: number, currentPrice: number): number => {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

/**
 * Get expiry status color and label
 */
export const getExpiryStatus = (expiryDate: Date) => {
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
  
  if (daysUntilExpiry < 0) {
    return { color: 'error', label: 'Vencido', priority: 'high' };
  }
  
  if (daysUntilExpiry === 0) {
    return { color: 'error', label: 'Vence hoje', priority: 'high' };
  }
  
  if (daysUntilExpiry === 1) {
    return { color: 'warning', label: 'Vence amanhã', priority: 'high' };
  }
  
  if (daysUntilExpiry <= 3) {
    return { color: 'warning', label: `${daysUntilExpiry} dias`, priority: 'medium' };
  }
  
  if (daysUntilExpiry <= 7) {
    return { color: 'info', label: `${daysUntilExpiry} dias`, priority: 'low' };
  }
  
  return { color: 'success', label: `${daysUntilExpiry} dias`, priority: 'low' };
};

/**
 * Get discount badge color
 */
export const getDiscountColor = (percentage: number): string => {
  if (percentage >= 50) return 'error';
  if (percentage >= 30) return 'warning';
  if (percentage >= 15) return 'info';
  return 'success';
};

/**
 * Get sustainability level info
 */
export const getSustainabilityLevel = (score: number) => {
  if (score >= 90) return { level: 'Expert', color: 'success', icon: '🌟' };
  if (score >= 75) return { level: 'Avançado', color: 'info', icon: '🌱' };
  if (score >= 50) return { level: 'Intermediário', color: 'warning', icon: '🌿' };
  if (score >= 25) return { level: 'Iniciante', color: 'default', icon: '🌱' };
  return { level: 'Novato', color: 'default', icon: '🌱' };
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: number;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Validate email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Senha deve ter pelo menos 8 caracteres' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Senha deve conter pelo menos uma letra minúscula' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Senha deve conter pelo menos uma letra maiúscula' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Senha deve conter pelo menos um número' };
  }
  
  return { isValid: true, message: 'Senha válida' };
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

/**
 * Calculate estimated delivery time
 */
export const calculateEstimatedDelivery = (baseTime: number, distance: number): Date => {
  const additionalTime = distance * 5; // 5 minutes per km
  const totalMinutes = baseTime + additionalTime;
  return new Date(Date.now() + totalMinutes * 60 * 1000);
};

/**
 * Get location coordinates
 */
export const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não suportada'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};

/**
 * Calculate distance between two coordinates
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Check if device is mobile
 */
export const isMobile = (): boolean => {
  return window.innerWidth <= 768;
};

/**
 * Check if app is running as PWA
 */
export const isPWA = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};

/**
 * Share content using Web Share API
 */
export const shareContent = async (data: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<void> => {
  if (navigator.share) {
    await navigator.share(data);
  } else {
    // Fallback: copy URL to clipboard
    if (data.url) {
      await copyToClipboard(data.url);
      // You might want to show a toast notification here
    }
  }
};

/**
 * Format sustainability impact for display
 */
export const formatSustainabilityImpact = (impact: {
  foodWastePrevented: number;
  co2Saved: number;
  waterSaved: number;
  moneySaved: number;
  itemsRescued: number;
}) => {
  return {
    foodWaste: formatWeight(impact.foodWastePrevented),
    co2: formatWeight(impact.co2Saved),
    water: `${formatNumber(impact.waterSaved)}L`,
    money: formatCurrency(impact.moneySaved),
    items: formatNumber(impact.itemsRescued),
  };
};