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
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format number with thousands separator
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Get user role label
 */
export const getUserRoleLabel = (role: string): string => {
  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    manager: 'Gerente',
    employee: 'Funcionário',
    viewer: 'Visualizador',
  };
  return roleLabels[role] || role;
};

/**
 * Get product status label and color
 */
export const getProductStatusInfo = (status: string) => {
  const statusInfo: Record<string, { label: string; color: string }> = {
    active: { label: 'Ativo', color: 'success' },
    near_expiry: { label: 'Próximo ao Vencimento', color: 'warning' },
    expired: { label: 'Vencido', color: 'error' },
    low_stock: { label: 'Estoque Baixo', color: 'info' },
    out_of_stock: { label: 'Sem Estoque', color: 'error' },
  };
  return statusInfo[status] || { label: status, color: 'default' };
};

/**
 * Get priority color for alerts
 */
export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    high: 'error',
    medium: 'warning',
    low: 'info',
  };
  return colors[priority] || 'default';
};

/**
 * Sort array by property
 */
export const sortBy = <T>(array: T[], property: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[property];
    const bVal = b[property];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Filter array by search term
 */
export const searchFilter = <T>(
  array: T[], 
  searchTerm: string, 
  searchProperties: (keyof T)[]
): T[] => {
  if (!searchTerm.trim()) return array;
  
  const term = searchTerm.toLowerCase();
  return array.filter(item =>
    searchProperties.some(prop => {
      const value = item[prop];
      return value && value.toString().toLowerCase().includes(term);
    })
  );
};

/**
 * Group array by property
 */
export const groupBy = <T>(array: T[], property: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const key = String(item[property]);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate barcode format (simple check for 13 digits)
 */
export const isValidBarcode = (barcode: string): boolean => {
  return /^\d{13}$/.test(barcode);
};

/**
 * Download file from blob
 */
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
};

/**
 * Get random color for charts
 */
export const getRandomColor = (): string => {
  const colors = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#FF6384',
    '#C9CBCF',
    '#4BC0C0',
    '#FF6384'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Check if user has permission for action
 */
export const hasPermission = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy: Record<string, number> = {
    viewer: 1,
    employee: 2,
    manager: 3,
    admin: 4,
  };
  
  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
};