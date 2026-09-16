import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, UtensilsCrossed, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';

const BottomNav = () => {
  const { items } = useCart();
  const { t } = useLanguage();
  const count = items.reduce((acc, item) => acc + item.quantity, 0);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center w-full h-full space-y-1 relative transition-colors ${isActive ? 'text-red-600' : 'text-slate-400 hover:text-slate-600'}`;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-around items-center z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <NavLink to="/" className={navClass}>
        {({ isActive }) => (
          <>
            <motion.div whileTap={{ scale: 0.9 }}>
              <Home size={24} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>
            <span className="text-[10px] font-semibold">{t.home}</span>
            {isActive && <motion.div layoutId="nav-indicator" className="absolute -top-3 w-8 h-1 bg-red-600 rounded-b-full" />}
          </>
        )}
      </NavLink>
      <NavLink to="/menu" className={navClass}>
        {({ isActive }) => (
          <>
            <motion.div whileTap={{ scale: 0.9 }}>
              <UtensilsCrossed size={24} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>
            <span className="text-[10px] font-semibold">{t.menu}</span>
            {isActive && <motion.div layoutId="nav-indicator" className="absolute -top-3 w-8 h-1 bg-red-600 rounded-b-full" />}
          </>
        )}
      </NavLink>
      <NavLink to="/cart" className={navClass}>
        {({ isActive }) => (
          <>
            <motion.div whileTap={{ scale: 0.9 }} className="relative" id="cart-icon-mobile">
              <ShoppingBag size={24} strokeWidth={isActive ? 2.5 : 2} />
              {count > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm"
                >
                  {count}
                </motion.span>
              )}
            </motion.div>
            <span className="text-[10px] font-semibold">{t.cart}</span>
            {isActive && <motion.div layoutId="nav-indicator" className="absolute -top-3 w-8 h-1 bg-red-600 rounded-b-full" />}
          </>
        )}
      </NavLink>
      <NavLink to="/profile" className={navClass}>
        {({ isActive }) => (
          <>
            <motion.div whileTap={{ scale: 0.9 }}>
              <User size={24} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>
            <span className="text-[10px] font-semibold">{t.profile}</span>
            {isActive && <motion.div layoutId="nav-indicator" className="absolute -top-3 w-8 h-1 bg-red-600 rounded-b-full" />}
          </>
        )}
      </NavLink>
    </div>
  );
};

export default BottomNav;