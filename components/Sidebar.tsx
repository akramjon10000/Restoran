import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, UtensilsCrossed, ShoppingBag, User, Bike, ShieldCheck, HelpCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import HelpSupportModal from './HelpSupportModal';
import { motion } from 'motion/react';

const Sidebar = () => {
  const { items } = useCart();
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const count = items.reduce((acc, item) => acc + item.quantity, 0);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-4 p-4 rounded-xl transition-all font-bold relative overflow-hidden ${
        isActive ? 'text-red-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`;

  return (
    <div className="hidden lg:flex flex-col w-72 bg-white h-screen sticky top-0 border-r border-slate-200 z-40 flex-shrink-0 shadow-sm">
      <div className="p-8 flex flex-col items-start">
        <h1 className="text-4xl font-black text-red-600 tracking-tighter italic leading-none" style={{ fontFamily: 'Impact, sans-serif' }}>RESTORAN</h1>
        <span className="text-xs font-bold text-slate-400 tracking-widest uppercase ml-1">Uzbekistan</span>
      </div>
      
      <nav className="flex-1 px-6 space-y-2">
        <NavLink to="/" className={navClass}>
          {({ isActive }) => (
            <>
              {isActive && <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-red-50 border-l-4 border-red-600 rounded-xl" />}
              <span className="relative z-10 flex items-center space-x-4">
                <Home size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span>{t.home}</span>
              </span>
            </>
          )}
        </NavLink>
        <NavLink to="/menu" className={navClass}>
          {({ isActive }) => (
            <>
              {isActive && <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-red-50 border-l-4 border-red-600 rounded-xl" />}
              <span className="relative z-10 flex items-center space-x-4">
                <UtensilsCrossed size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span>{t.menu}</span>
              </span>
            </>
          )}
        </NavLink>
        <NavLink to="/cart" className={navClass}>
          {({ isActive }) => (
            <>
              {isActive && <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-red-50 border-l-4 border-red-600 rounded-xl" />}
              <span className="relative z-10 flex items-center space-x-4" id="cart-icon-desktop">
                <div className="relative">
                  <ShoppingBag size={24} strokeWidth={isActive ? 2.5 : 2} />
                  {count > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white shadow-sm"
                    >
                      {count}
                    </motion.span>
                  )}
                </div>
                <span>{t.cart}</span>
              </span>
            </>
          )}
        </NavLink>
        <NavLink to="/profile" className={navClass}>
          {({ isActive }) => (
            <>
              {isActive && <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-red-50 border-l-4 border-red-600 rounded-xl" />}
              <span className="relative z-10 flex items-center space-x-4">
                <User size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span>{t.profile}</span>
              </span>
            </>
          )}
        </NavLink>
      </nav>

      <div className="px-6 py-4 border-t border-slate-100">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 px-2">Yordam & Portallar</p>
        <div className="space-y-1.5">
          <button 
            onClick={() => setIsHelpModalOpen(true)}
            className="w-full flex items-center space-x-3 p-2.5 rounded-xl font-bold text-xs bg-amber-50 text-amber-900 hover:bg-amber-100 transition-colors border border-amber-200/60"
          >
            <HelpCircle size={18} className="text-amber-600" />
            <span>Yordam & FAQ</span>
          </button>
          <NavLink to="/courier" className="flex items-center space-x-3 p-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors">
            <Bike size={18} className="text-red-600" />
            <span>Kuryer Portali</span>
          </NavLink>
          <NavLink to="/admin" className="flex items-center space-x-3 p-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm">
            <ShieldCheck size={18} className="text-emerald-400" />
            <span>Admin Paneli</span>
          </NavLink>
        </div>
      </div>

      <div className="p-8 border-t border-slate-100">
        <div className="flex items-center space-x-2 mb-2">
           <div className="w-2 h-8 bg-red-600 skew-x-[-12deg]"></div>
           <div className="w-2 h-8 bg-red-600 skew-x-[-12deg]"></div>
           <div className="w-2 h-8 bg-red-600 skew-x-[-12deg]"></div>
        </div>
        <p className="text-xs text-slate-400 font-bold leading-relaxed uppercase">
          {t.slogan}
        </p>
      </div>

      <HelpSupportModal 
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};

export default Sidebar;