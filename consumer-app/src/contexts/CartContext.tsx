import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Cart, Product } from '../types';
import { cartApi } from '../services/api';

// Cart State
interface CartState {
  cart: Cart;
  isLoading: boolean;
  error: string | null;
}

// Cart Actions
type CartAction =
  | { type: 'LOAD_CART_START' }
  | { type: 'LOAD_CART_SUCCESS'; payload: Cart }
  | { type: 'LOAD_CART_FAILURE'; payload: string }
  | { type: 'ADD_TO_CART_START' }
  | { type: 'ADD_TO_CART_SUCCESS'; payload: Cart }
  | { type: 'ADD_TO_CART_FAILURE'; payload: string }
  | { type: 'UPDATE_QUANTITY_SUCCESS'; payload: Cart }
  | { type: 'REMOVE_ITEM_SUCCESS'; payload: Cart }
  | { type: 'CLEAR_CART_SUCCESS' }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: CartState = {
  cart: {
    id: '1',
    items: [],
    total: 0,
    originalTotal: 0,
    savings: 0,
    itemCount: 0,
  },
  isLoading: false,
  error: null,
};

// Cart reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'LOAD_CART_START':
    case 'ADD_TO_CART_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case 'LOAD_CART_SUCCESS':
    case 'ADD_TO_CART_SUCCESS':
    case 'UPDATE_QUANTITY_SUCCESS':
    case 'REMOVE_ITEM_SUCCESS':
      return {
        ...state,
        cart: action.payload,
        isLoading: false,
        error: null,
      };
    
    case 'LOAD_CART_FAILURE':
    case 'ADD_TO_CART_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    
    case 'CLEAR_CART_SUCCESS':
      return {
        ...state,
        cart: initialState.cart,
        isLoading: false,
        error: null,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

// Cart Context
interface CartContextType extends CartState {
  loadCart: () => Promise<void>;
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  clearError: () => void;
  isInCart: (productId: string) => boolean;
  getCartItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider
interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart on component mount
  useEffect(() => {
    loadCart();
  }, []);

  // Load cart function
  const loadCart = async (): Promise<void> => {
    dispatch({ type: 'LOAD_CART_START' });
    
    try {
      const response = await cartApi.getCart();
      
      if (response.success) {
        dispatch({ type: 'LOAD_CART_SUCCESS', payload: response.data });
      } else {
        dispatch({ type: 'LOAD_CART_FAILURE', payload: response.message || 'Erro ao carregar carrinho' });
      }
    } catch (error) {
      dispatch({ type: 'LOAD_CART_FAILURE', payload: 'Erro de conexão ao carregar carrinho' });
    }
  };

  // Add to cart function
  const addToCart = async (product: Product, quantity: number): Promise<void> => {
    dispatch({ type: 'ADD_TO_CART_START' });
    
    try {
      const response = await cartApi.addToCart(product.id, quantity);
      
      if (response.success) {
        dispatch({ type: 'ADD_TO_CART_SUCCESS', payload: response.data });
      } else {
        dispatch({ type: 'ADD_TO_CART_FAILURE', payload: response.message || 'Erro ao adicionar produto' });
      }
    } catch (error) {
      dispatch({ type: 'ADD_TO_CART_FAILURE', payload: 'Erro de conexão ao adicionar produto' });
    }
  };

  // Remove from cart function
  const removeFromCart = async (itemId: string): Promise<void> => {
    try {
      const response = await cartApi.removeFromCart(itemId);
      
      if (response.success) {
        dispatch({ type: 'REMOVE_ITEM_SUCCESS', payload: response.data });
      }
    } catch (error) {
      // Handle error silently or show notification
    }
  };

  // Update quantity function
  const updateQuantity = async (itemId: string, quantity: number): Promise<void> => {
    try {
      const response = await cartApi.updateQuantity(itemId, quantity);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_QUANTITY_SUCCESS', payload: response.data });
      }
    } catch (error) {
      // Handle error silently or show notification
    }
  };

  // Clear cart function
  const clearCart = async (): Promise<void> => {
    try {
      await cartApi.clearCart();
      dispatch({ type: 'CLEAR_CART_SUCCESS' });
    } catch (error) {
      // Handle error silently or show notification
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Check if product is in cart
  const isInCart = (productId: string): boolean => {
    return state.cart.items.some(item => item.productId === productId);
  };

  // Get cart item quantity
  const getCartItemQuantity = (productId: string): number => {
    const item = state.cart.items.find(item => item.productId === productId);
    return item ? item.selectedQuantity : 0;
  };

  const value: CartContextType = {
    ...state,
    loadCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearError,
    isInCart,
    getCartItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};

export default CartContext;