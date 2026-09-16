import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Coffee, ClipboardList, LogOut, Home, Brain, Share2, Layers, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const AdminLayout = () => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/profile');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  const navClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center space-x-3 p-3 rounded-xl transition-all font-bold ${
      isActive ? 'bg-red-600 text-white shadow-md shadow-red-200' : 'text-slate-500 hover:bg-red-50 hover:text-red-600'
    }`;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar for Desktop */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-40 hidden lg:flex"
      >
         <div className="p-6">
            <h1 className="text-2xl font-black text-red-600 tracking-tighter hidden lg:block italic">RESTORAN ADMIN</h1>
            <h1 className="text-xl font-black text-red-600 tracking-tighter lg:hidden">REST</h1>
         </div>
         <nav className="flex-grow px-4 space-y-2">
            <NavLink to="/admin/dashboard" className={navClass}>
               <LayoutDashboard size={20} /> <span className="hidden lg:block text-sm">Dashboard</span>
            </NavLink>
            <NavLink to="/admin/categories" className={navClass}>
               <Layers size={20} /> <span className="hidden lg:block text-sm">Kategoriyalar</span>
            </NavLink>
            <NavLink to="/admin/menu" className={navClass}>
               <Coffee size={20} /> <span className="hidden lg:block text-sm">Menyu</span>
            </NavLink>
            <NavLink to="/admin/orders" className={navClass}>
               <ClipboardList size={20} /> <span className="hidden lg:block text-sm">Buyurtmalar</span>
            </NavLink>
            <NavLink to="/admin/promocodes" className={navClass}>
               <Share2 size={20} /> <span className="hidden lg:block text-sm">Promokodlar</span>
            </NavLink>
            <NavLink to="/admin/reviews" className={navClass}>
               <Star size={20} /> <span className="hidden lg:block text-sm">Sharhlar</span>
            </NavLink>
            <NavLink to="/admin/knowledge-base" className={navClass}>
               <Brain size={20} /> <span className="hidden lg:block text-sm">Bilimlar bazasi</span>
            </NavLink>
            <NavLink to="/admin/feed" className={navClass}>
               <Share2 size={20} /> <span className="hidden lg:block text-sm">Ads Feed (FB)</span>
            </NavLink>
         </nav>
         <div className="p-4 border-t border-slate-100">
            <button onClick={() => navigate('/')} className="flex items-center space-x-3 text-slate-500 hover:text-slate-900 p-2 w-full text-sm font-bold">
               <Home size={20} /> <span className="hidden lg:block">Ilovaga qaytish</span>
            </button>
            <button onClick={logout} className="flex items-center space-x-3 text-red-600 hover:text-red-800 p-2 w-full mt-2 text-sm font-bold">
               <LogOut size={20} /> <span className="hidden lg:block">Chiqish</span>
            </button>
         </div>
      </motion.div>

      {/* Mobile/Tablet Admin Nav */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around p-2 pb-safe"
      >
         <NavLink to="/admin/dashboard" className={({isActive}) => `p-2 rounded-lg ${isActive ? 'text-red-600' : 'text-slate-400'}`}><LayoutDashboard /></NavLink>
         <NavLink to="/admin/categories" className={({isActive}) => `p-2 rounded-lg ${isActive ? 'text-red-600' : 'text-slate-400'}`}><Layers /></NavLink>
         <NavLink to="/admin/menu" className={({isActive}) => `p-2 rounded-lg ${isActive ? 'text-red-600' : 'text-slate-400'}`}><Coffee /></NavLink>
         <NavLink to="/admin/orders" className={({isActive}) => `p-2 rounded-lg ${isActive ? 'text-red-600' : 'text-slate-400'}`}><ClipboardList /></NavLink>
         <button onClick={() => navigate('/')} className="p-2 text-slate-400"><Home /></button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-grow lg:ml-64 p-4 md:p-10 overflow-y-auto pb-24 lg:pb-10"
      >
        <Outlet />
      </motion.div>
    </div>
  );
};

export default AdminLayout;