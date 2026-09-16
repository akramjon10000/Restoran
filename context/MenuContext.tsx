
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { MENU_ITEMS } from '../constants';
import { dbService } from '../lib/db';
import { toast } from 'sonner';

const INITIAL_CATEGORIES: Category[] = [
  { id: 'buckets', name: 'Buckets', image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&q=80&w=400' },
  { id: 'burgers', name: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400' },
  { id: 'chicken', name: 'Chicken', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=400' },
  { id: 'snacks', name: 'Snacks', image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&q=80&w=400' },
  { id: 'drinks', name: 'Drinks', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400' },
  { id: 'desserts', name: 'Desserts', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400' }
];

interface MenuContextType {
  products: Product[];
  categories: Category[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Real-vaqtda bazani kuzatish
  useEffect(() => {
    // Agar baza bo'sh bo'lsa, default ma'lumotlarni yuklab qo'yamiz (faqat birinchi marta)
    const init = async () => {
        const cloudProducts = await dbService.getCollection('menu');
        const cloudCats = await dbService.getCollection('categories');

        if (cloudProducts.length === 0) {
            MENU_ITEMS.forEach(item => dbService.saveItem('menu', item));
        }
        if (cloudCats.length === 0) {
            INITIAL_CATEGORIES.forEach(cat => dbService.saveItem('categories', cat));
        }
    };
    init();

    // Kuzatishni boshlash
    const unsubMenu = dbService.subscribe('menu', (data) => setProducts(data));
    const unsubCats = dbService.subscribe('categories', (data) => setCategories(data));

    return () => {
        unsubMenu();
        unsubCats();
    };
  }, []);

  const addProduct = (product: Product) => dbService.saveItem('menu', product);
  const updateProduct = (product: Product) => dbService.saveItem('menu', product);
  const deleteProduct = (id: string) => dbService.deleteItem('menu', id);
  const getProduct = (id: string) => products.find(p => p.id === id);

  const addCategory = (category: Category) => dbService.saveItem('categories', category);
  const updateCategory = (category: Category) => dbService.saveItem('categories', category);
  const deleteCategory = (id: string) => {
    if (products.some(p => p.category === id)) {
      toast.error("Bu kategoriyada mahsulotlar bor. Avval ularni o'chiring.");
      return;
    }
    dbService.deleteItem('categories', id);
  };

  return (
    <MenuContext.Provider value={{ 
      products, categories, addProduct, updateProduct, deleteProduct, getProduct,
      addCategory, updateCategory, deleteCategory 
    }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenu must be used within MenuProvider');
  return context;
};
