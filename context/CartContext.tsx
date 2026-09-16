import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Product } from '../types';
import { sound } from '../utils/sound';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('restoran_cart');
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error("Cart parse error", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('restoran_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    if (!product || !product.id) return;
    
    sound.playAddToCart();

    setItems(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + Math.max(1, quantity) } : p);
      }
      return [...prev, { ...product, quantity: Math.max(1, quantity) }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => prev.filter(p => p.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setItems(prev => prev.map(p => {
      if (p.id === productId) {
        const newQty = Math.max(0, p.quantity + delta);
        return { ...p, quantity: newQty };
      }
      return p;
    }).filter(p => p.quantity > 0));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};