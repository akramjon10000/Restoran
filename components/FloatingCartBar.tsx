import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { motion, AnimatePresence } from 'motion/react';

export const FloatingCartBar: React.FC = () => {
  const { items, total } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Do not show on Cart, Profile, Admin, Courier pages
  const shouldHide = 
    location.pathname.startsWith('/cart') || 
    location.pathname.startsWith('/admin') || 
    location.pathname.startsWith('/courier') ||
    location.pathname.startsWith('/profile');

  if (totalCount === 0 || shouldHide) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="fixed bottom-20 lg:bottom-6 left-4 right-4 max-w-xl mx-auto z-40"
      >
        <button
          onClick={() => navigate('/cart')}
          className="w-full bg-slate-950/95 hover:bg-black text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl shadow-black/40 border border-slate-700/80 backdrop-blur-xl flex items-center justify-between group active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/40 relative">
              <ShoppingBag size={20} />
              <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-900 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950">
                {totalCount}
              </span>
            </div>
            <div className="text-left">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                Savatda {totalCount} ta taom
              </span>
              <span className="text-base font-black text-white tracking-tight">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md group-hover:translate-x-0.5 transition-all">
            <span>Buyurtmaga o'tish</span>
            <ArrowRight size={15} />
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingCartBar;
