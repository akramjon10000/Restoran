import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Phone, Package, Navigation, CheckCircle2, Printer, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatDate } from '../../utils/format';
import { printReceipt } from '../../utils/receipt';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import OrderMap from '../../components/OrderMap';

const CourierActive = () => {
    const { orders, updateOrderStatus } = useOrders();
    const { user } = useAuth();
    const [isGpsActive, setIsGpsActive] = useState(false);
    
    // Active orders assigned to this courier that are not completed
    const activeOrders = orders.filter(o => 
        o.courierId && 
        user && 
        (o.courierId === user.phone || o.courierId === user.id) &&
        o.status === 'delivering'
    );

    const toggleGps = () => {
        if (!navigator.geolocation) {
            toast.error("Qurilmangizda geolokatsiya qo'llab-quvvatlanmaydi");
            return;
        }
        if (!isGpsActive) {
            navigator.geolocation.getCurrentPosition(
                () => {
                    setIsGpsActive(true);
                    toast.success("Jonli GPS faollashtirildi! Mijoz xaritada harakatingizni ko'radi.");
                },
                () => {
                    toast.error("Geolokatsiyaga ruxsat berilmadi");
                }
            );
        } else {
            setIsGpsActive(false);
            toast.info("GPS uzatish to'xtatildi");
        }
    };

    const completeOrder = async (orderId: string) => {
        try {
            await updateOrderStatus(orderId, 'completed');
            toast.success("Buyurtma muvaffaqiyatli yetkazildi!");
        } catch (error) {
            console.error(error);
            toast.error("Xatolik yuz berdi");
        }
    };

    const openMap = (address: string) => {
        // Simple mapping url opening
        const encodedAddress = encodeURIComponent(address);
        window.open(`https://yandex.uz/maps/?text=${encodedAddress}`, '_blank');
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Jarayonda</h2>
            
            <AnimatePresence>
                {activeOrders.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-100"
                    >
                        <Navigation size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-black text-slate-700 uppercase">Jarayonda buyurtmalar yo'q</h3>
                        <p className="text-sm font-bold text-slate-400 mt-2">Yangi buyurtmalarni qabul qilishingiz mumkin.</p>
                    </motion.div>
                ) : (
                    activeOrders.map((order, idx) => (
                        <motion.div 
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-3xl p-5 shadow-sm border border-orange-200 overflow-hidden relative shadow-[0_4px_20px_rgba(249,115,22,0.1)]"
                        >
                            <div className="absolute top-0 right-0 bg-orange-100 text-orange-600 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase">
                                YETKAZILMOQDA
                            </div>
                            
                            <div className="flex justify-between items-start mb-4 mt-2">
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDate(order.date)}</span>
                                    <h3 className="font-bold text-slate-800">Buyurtma: <span className="font-black text-orange-600">#{order.id.slice(0, 5).toUpperCase()}</span></h3>
                                </div>
                            </div>
                            
                            <div className="space-y-3 mb-6">
                                <div className="rounded-xl overflow-hidden mb-4 border border-slate-100 shadow-sm">
                                    <OrderMap address={order.address} height="200px" />
                                </div>
                                <div className="flex gap-3 items-start bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <MapPin size={24} className="text-red-500 mt-1 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-700">{order.address}</p>
                                        <button onClick={() => openMap(order.address)} className="text-xs font-bold text-blue-500 mt-1 uppercase flex items-center gap-1">
                                            Xaritada ochish
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <Phone size={24} className="text-green-500 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Mijoz: {order.userName || 'Mehmon'}</p>
                                        <a href={`tel:${order.phone}`} className="text-base font-bold text-slate-700 block">{order.phone}</a>
                                    </div>
                                    <Button onClick={() => window.location.href = `tel:${order.phone}`} className="bg-green-100 hover:bg-green-200 text-green-700 p-3 h-auto rounded-full">
                                        Qo'ng'iroq
                                    </Button>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex justify-between mb-2 pb-2 border-b border-slate-200">
                                        <span className="text-xs font-bold text-slate-500 uppercase">To'lov usuli:</span>
                                        <span className="text-xs font-black text-slate-800">{order.paymentMethod === 'cash' ? 'Naqd pul' : (order.paymentMethod === 'card' ? 'Karta' : 'Payme / Click')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Jami summa:</span>
                                        <span className="text-sm font-black text-red-600">{formatCurrency(order.total)}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start p-2">
                                    <Package size={18} className="text-orange-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Tarkibi</p>
                                        <p className="text-xs font-medium text-slate-600">
                                            {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={toggleGps}
                                        className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                                            isGpsActive 
                                                ? 'bg-red-500 text-white shadow-md shadow-red-200 animate-pulse' 
                                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                        }`}
                                    >
                                        <Radio size={14} />
                                        <span>{isGpsActive ? "GPS Faol (Jonli)" : "GPS Harakatini Yoqish"}</span>
                                    </button>

                                    <button
                                        onClick={() => printReceipt(order, 'customer')}
                                        className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                                        title="Chek chiqarish"
                                    >
                                        <Printer size={14} />
                                        <span>Chek</span>
                                    </button>
                                </div>
                            </div>
                            
                            <Button 
                                onClick={() => completeOrder(order.id)}
                                className="w-full bg-green-500 text-white hover:bg-green-600 rounded-xl font-bold h-14 uppercase tracking-wide flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(34,197,94,0.3)]"
                            >
                                <CheckCircle2 size={24} />
                                Yetkazib berildi
                            </Button>
                        </motion.div>
                    ))
                )}
            </AnimatePresence>
        </div>
    );
};

export default CourierActive;
