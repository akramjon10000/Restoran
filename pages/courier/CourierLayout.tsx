import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Truck, CheckCircle, MapPin, List, Home, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const CourierLayout = () => {
  const { user, logout } = useAuth();
  const [courierName, setCourierName] = useState('Haydovchi');
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.name) {
        setCourierName(user.name);
    }
  }, [user]);

  const navClass = ({ isActive }: { isActive: boolean }) => 
    `flex flex-col items-center justify-center p-3 rounded-xl transition-all font-bold text-xs ${
      isActive ? 'text-red-600 bg-red-50' : 'text-slate-400 hover:text-red-500'
    }`;

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      {/* Top Header */}
      <div className="bg-white px-4 py-4 shadow-sm flex justify-between items-center z-10 sticky top-0">
          <div className="flex items-center gap-3">
              <div className="bg-red-600 p-2 rounded-xl text-white">
                 <Truck size={24} />
              </div>
              <div>
                 <h1 className="font-black text-slate-900 tracking-tighter uppercase italic leading-none">Yetkazuvchi</h1>
                 <p className="text-[10px] text-slate-500 font-bold uppercase">{courierName}</p>
              </div>
          </div>
          <button onClick={() => navigate('/')} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200">
              <Home size={20} />
          </button>
      </div>

      {/* Main Content Area */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-grow p-4 md:p-6 pb-24 max-w-3xl mx-auto w-full"
      >
        <Outlet />
      </motion.div>

      {/* Courier Bottom Nav */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around p-2 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
      >
         <NavLink to="/courier/orders" className={navClass}>
             <List size={24} className="mb-1" />
             <span>Buyurtmalar</span>
         </NavLink>
         <NavLink to="/courier/active" className={navClass}>
             <MapPin size={24} className="mb-1" />
             <span>Jarayonda</span>
         </NavLink>
         <NavLink to="/courier/history" className={navClass}>
             <CheckCircle size={24} className="mb-1" />
             <span>Tarix</span>
         </NavLink>
      </motion.div>
    </div>
  );
};

export default CourierLayout;
