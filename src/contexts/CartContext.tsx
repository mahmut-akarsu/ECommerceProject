// src/contexts/CartContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Cart, AddToCartData, UpdateCartItemData } from '../types';
import {
  getCart as apiGetCart,
  addItemToCart as apiAddItemToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearCart as apiClearCart
} from '../api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (itemData: AddToCartData) => Promise<void>;
  updateItemQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearClientCart: () => void; // Sadece client tarafında sepeti null yapar
  clearServerCart: () => Promise<void>; // Sunucudaki sepeti temizler
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setCart(null); // Kullanıcı yoksa sepeti temizle
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const currentCart = await apiGetCart();
      setCart(currentCart);
    } catch (err: any) {
      console.error('Failed to fetch cart', err);
      setError(err.response?.data?.detail || 'Sepet yüklenemedi.');
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]); // isAuthenticated veya user değişince fetchCart referansı değişir ve tetiklenir.

  const addItem = async (itemData: AddToCartData) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const updatedCart = await apiAddItemToCart(itemData);
      setCart(updatedCart);
    } catch (err: any) {
      console.error('Failed to add item to cart', err);
      setError(err.response?.data?.detail || 'Ürün sepete eklenemedi.');
      throw err; // Component'in de haberi olsun
    } finally {
      setIsLoading(false);
    }
  };

  const updateItemQuantity = async (cartItemId: number, quantity: number) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const itemData: UpdateCartItemData = { quantity };
      const updatedCart = await apiUpdateCartItem(cartItemId, itemData);
      setCart(updatedCart);
    } catch (err: any) {
      console.error('Failed to update item quantity', err);
      setError(err.response?.data?.detail || 'Ürün miktarı güncellenemedi.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (cartItemId: number) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const updatedCart = await apiRemoveCartItem(cartItemId);
      setCart(updatedCart);
    } catch (err: any) {
      console.error('Failed to remove item from cart', err);
      setError(err.response?.data?.detail || 'Ürün sepetten çıkarılamadı.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearClientCart = () => {
    setCart(null);
  };

  const clearServerCart = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const emptyCart = await apiClearCart(); // API boş sepet dönebilir veya sadece 200 OK
      setCart(emptyCart); // veya setCart(null) eğer API spesifik bir şey dönmüyorsa
    } catch (err: any) {
      console.error('Failed to clear cart on server', err);
      setError(err.response?.data?.detail || 'Sepet temizlenemedi.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <CartContext.Provider value={{ cart, isLoading, error, fetchCart, addItem, updateItemQuantity, removeItem, clearClientCart, clearServerCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};