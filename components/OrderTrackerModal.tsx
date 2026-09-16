import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { X, CheckCircle2, ChefHat, Bike, Home, Phone, Clock, MapPin, Sparkles, Star, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import ReviewModal from './ReviewModal';

interface Props {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderTrackerModal({ order, isOpen, onClose }: Props) {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(25);

  useEffect(() => {
    if (!order) return;
    
    // Simulate remaining time based on status
    if (order.status === 'new') setRemainingMinutes(35);
    else if (order.status === 'cooking') setRemainingMinutes(20);
    else if (order.status === 'delivering') setRemainingMinutes(10);
    else if (order.status === 'completed') setRemainingMinutes(0);
  }, [order?.status]);

  if (!isOpen || !order) return null;

  const steps = [
    { key: 'new', label: 'Qabul qilindi', desc: 'Buyurtma oshxonaga uzatildi', icon: CheckCircle2, time: '00:00' },
    { key: 'cooking', label: 'Tayyorlanmoqda', desc: 'Oshpazlarimiz taomni pishirmoqda', icon: ChefHat, time: '10:00' },
    { key: 'delivering', label: 'Kuryer yo\'lda', desc: 'Issiq holda siz tomonga yo\'l oldi', icon: Bike, time: '20:00' },
    { key: 'completed', label: 'Yetkazildi', desc: 'Yoqimli ishtaha!', icon: Home, time: '35:00' }
  ];

  const statusIndexes: Record<string, number> = {
    new: 0,
    cooking: 1,
    delivering: 2,
    completed: 3
  };

  const currentStepIdx = statusIndexes[order.status] ?? 0;
  const progressPercent = ((currentStepIdx) / (steps.length - 1)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
              Buyurtma #{order.id}
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              Buyurtma Holati
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Timer / ETA Banner */}
        <div className="mt-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500/30 flex items-center justify-center text-red-400">
              <Clock size={20} className="animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {order.status === 'completed' ? 'Yetkazilgan vaqt' : 'Taxminiy yetib kelish vaqti'}
              </p>
              <h3 className="text-lg font-black tracking-tight">
                {order.status === 'completed' 
                  ? 'Buyurtma yetkazildi 🎉' 
                  : `~${remainingMinutes} daqiqada`}
              </h3>
            </div>
          </div>
          <span className="text-xs font-black bg-red-600 text-white px-3 py-1.5 rounded-xl uppercase tracking-wider">
            {order.deliveryTimeType === 'scheduled' && order.scheduledTime 
              ? order.scheduledTime 
              : 'Tezkor'}
          </span>
        </div>

        {/* Step-by-Step Tracker */}
        <div className="my-6 space-y-6 relative pl-2">
          {/* Vertical progress bar */}
          <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-slate-200 -z-0">
            <div 
              className="w-full bg-red-600 transition-all duration-700"
              style={{ height: `${progressPercent}%` }}
            />
          </div>

          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div key={step.key} className="flex items-start gap-4 relative z-10">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all shadow-md ${
                  isCurrent 
                    ? 'bg-red-600 scale-110 ring-4 ring-red-100' 
                    : isCompleted 
                      ? 'bg-emerald-600' 
                      : 'bg-slate-200 text-slate-400'
                }`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-black uppercase tracking-tight ${
                      isCurrent ? 'text-red-600' : isCompleted ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {step.label}
                    </h4>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md animate-pulse">
                        Jarayonda
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Courier Details Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-black text-sm shrink-0">
              JS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black text-slate-900">{order.courierName || 'Jasur Shodiyev'}</h4>
                <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded">4.9 ★</span>
              </div>
              <p className="text-[11px] text-slate-500">Matiz oq • 01 A 777 AA</p>
            </div>
          </div>

          <a 
            href={`tel:${order.courierPhone || '+998908765432'}`}
            className="w-10 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md shadow-red-200 active:scale-95 transition-all"
            title="Kuryerga qo'ng'iroq qilish"
          >
            <Phone size={18} />
          </a>
        </div>

        {/* Delivery Address & Note */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-xs space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <MapPin size={15} className="text-red-600 shrink-0" />
            <span className="truncate">{order.address}</span>
          </div>
          {order.orderNote && (
            <p className="text-[11px] text-slate-500 italic pl-5">
              Izoh: "{order.orderNote}"
            </p>
          )}
        </div>

        {/* Ordered items preview */}
        <div className="space-y-1.5 mb-4 border-t border-slate-100 pt-3">
          <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
            <span>Tarkibi</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
          <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs text-slate-600">
                <span>{item.quantity}x {item.name}</span>
                <span className="font-bold text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {order.status === 'completed' ? (
            <Button
              onClick={() => setIsReviewOpen(true)}
              className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-amber-200"
            >
              <Star size={16} className="fill-white" />
              <span>Taomni baholash (+2 000 bonus)</span>
            </Button>
          ) : (
            <Button
              onClick={onClose}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider"
            >
              Tushundim
            </Button>
          )}
        </div>
      </motion.div>

      <ReviewModal 
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        orderId={order.id}
        userName={order.userName}
      />
    </div>
  );
}
