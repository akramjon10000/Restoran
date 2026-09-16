import React from 'react';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { Clock, MapPin, Package, Phone, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatDate } from '../../utils/format';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

const CourierOrders = () => {
    const { orders, assignCourier } = useOrders();
    const { user } = useAuth();
    
    // Available orders are 'new' or 'cooking' and don't have a courier yet, AND they are delivery
    const availableOrders = orders.filter(o => 
        (o.status === 'new' || o.status === 'cooking') && 
        !o.courierId && 
        o.address !== 'Filialdan olib ketish' // Quick check if it is delivery
    );

    const acceptOrder = async (orderId: string) => {
        if (!user) {
            toast.error("Tizimga kirmagansiz!");
            return;
        }

        try {
            await assignCourier(orderId, user.phone || user.id || 'courier_unknown');
            toast.success("Buyurtma qabul qilindi!");
        } catch (error) {
            console.error(error);
            toast.error("Xatolik yuz berdi");
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Yangi Buyurtmalar</h2>
            
            <AnimatePresence>
                {availableOrders.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-100"
                    >
                        <Package size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-black text-slate-700 uppercase">Bo'sh!</h3>
                        <p className="text-sm font-bold text-slate-400 mt-2">Hozircha yetkazib berish uchun yangi buyurtmalar yo'q.</p>
                    </motion.div>
                ) : (
                    availableOrders.map((order, idx) => (
                        <motion.div 
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase">
                                {formatCurrency(order.total)}
                            </div>
                            
                            <div className="flex justify-between items-start mb-4 mt-2">
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDate(order.date)}</span>
                                    <h3 className="font-bold text-slate-800">Buyurtma: <span className="font-black text-red-600">#{order.id.slice(0, 5).toUpperCase()}</span></h3>
                                </div>
                            </div>
                            
                            <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex gap-3 items-start">
                                    <MapPin size={18} className="text-red-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Manzil</p>
                                        <p className="text-sm font-bold text-slate-700 leading-tight">{order.address}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <Phone size={18} className="text-blue-500 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Mijoz</p>
                                        <p className="text-sm font-bold text-slate-700">{order.userName || 'Mijoz'} - {order.phone}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <Package size={18} className="text-orange-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Tarkibi</p>
                                        <p className="text-xs font-medium text-slate-600 line-clamp-2">
                                            {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <Button 
                                onClick={() => acceptOrder(order.id)}
                                className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold h-12 uppercase tracking-wide flex items-center justify-center gap-2"
                            >
                                <CheckSquare size={18} />
                                Qabul qilish
                            </Button>
                        </motion.div>
                    ))
                )}
            </AnimatePresence>
        </div>
    );
};

export default CourierOrders;
