import React from 'react';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Calendar, Hash } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';

const CourierHistory = () => {
    const { orders } = useOrders();
    const { user } = useAuth();
    
    // Completed orders assigned to this courier
    const historyOrders = orders.filter(o => 
        o.courierId && 
        user && 
        (o.courierId === user.phone || o.courierId === user.id) &&
        o.status === 'completed'
    );

    const today = new Date().toISOString().split('T')[0];
    const todayOrders = historyOrders.filter(o => o.date.startsWith(today));
    
    // As a simple stat
    const totalToday = todayOrders.length;
    // Just assuming 15000 is delivery fee, we could sum it if we stored it per order, but we didn't add deliveryFee to the Order schema.
    // So let's just show count.

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Yetkazilganlar</h2>
            
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-200">
                <p className="text-sm font-bold opacity-90 uppercase tracking-widest mb-1">Bugungi ko'rsatkich</p>
                <div className="flex items-end gap-2">
                    <span className="text-4xl font-black">{totalToday}</span>
                    <span className="text-sm font-bold mb-1 opacity-90">ta buyurtma</span>
                </div>
            </div>

            <div className="space-y-4">
                {historyOrders.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <CheckCircle size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="font-bold">Hozircha tarix bo'sh</p>
                    </div>
                ) : (
                    historyOrders.map(order => (
                        <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex gap-4 items-center">
                            <div className="bg-green-50 p-3 rounded-full text-green-500 shrink-0">
                                <CheckCircle size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Hash size={14} className="text-slate-400" />
                                    <span className="font-black text-slate-700">{order.id.slice(0, 5).toUpperCase()}</span>
                                </div>
                                <p className="text-sm font-bold text-slate-600 truncate">{order.address}</p>
                                <div className="flex items-center gap-1 mt-1 text-slate-400">
                                    <Calendar size={12} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{formatDate(order.date)}</span>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <span className="block font-black text-slate-800">{formatCurrency(order.total)}</span>
                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold uppercase">Yakunlandi</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CourierHistory;
