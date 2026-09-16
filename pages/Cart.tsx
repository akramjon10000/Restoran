import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useLoyalty } from '../context/LoyaltyContext';
import { Minus, Plus, CheckCircle, ShoppingBag, Phone, ChevronDown, User as UserIcon, Wallet, Ticket, Loader2, Sparkles, Utensils, MessageSquare, ShieldCheck, Clock, Award, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/format';
import { dbService } from '../lib/db';
import AddressModal from '../components/AddressModal';
import PaymentModal from '../components/PaymentModal';
import AIRecommendations from '../components/AIRecommendations';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const FALLBACK_FOOD = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500';

type PaymentType = 'cash' | 'click' | 'payme' | 'uzum' | 'terminal';

const POPULAR_PROMOS = [
  { code: 'OSHXONA20', discount: 20, desc: '20% chegirma' },
  { code: 'MAZZALI10', discount: 10, desc: '10% chegirma' },
  { code: 'BAHOR', discount: 15, desc: '15% chegirma' }
];

const SCHEDULE_TIMES = [
  'Bugun 13:00',
  'Bugun 14:30',
  'Bugun 16:00',
  'Bugun 18:00',
  'Bugun 19:30',
  'Bugun 21:00',
  'Ertaga 12:30',
  'Ertaga 18:00'
];

const FREE_DELIVERY_THRESHOLD = 150000;

const Cart = () => {
  const { items, updateQuantity, total, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { user, login, currentAddress, setCurrentAddress, orderType, setOrderType, selectedBranch, deliveryFee } = useAuth();
  const { bonusBalance, currentTier, spendPoints, earnPoints } = useLoyalty();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [guestPhone, setGuestPhone] = useState(() => {
    try { return localStorage.getItem('restoran_guest_phone') || ''; } catch { return ''; }
  });
  const [guestName, setGuestName] = useState(() => {
    try { return localStorage.getItem('restoran_guest_name') || ''; } catch { return ''; }
  });

  useEffect(() => {
    if (user?.phone) setGuestPhone(user.phone);
    if (user?.name) setGuestName(user.name);
  }, [user]);

  useEffect(() => {
    const handleVoiceCustomerInfo = () => {
      const savedPhone = localStorage.getItem('restoran_guest_phone') || '';
      const savedName = localStorage.getItem('restoran_guest_name') || '';
      if (savedPhone) setGuestPhone(savedPhone);
      if (savedName) setGuestName(savedName);
    };
    window.addEventListener('customer-info-updated', handleVoiceCustomerInfo);
    window.addEventListener('storage', handleVoiceCustomerInfo);
    return () => {
      window.removeEventListener('customer-info-updated', handleVoiceCustomerInfo);
      window.removeEventListener('storage', handleVoiceCustomerInfo);
    };
  }, []);

  const handleNameChange = (val: string) => {
    setGuestName(val);
    setError('');
    try { localStorage.setItem('restoran_guest_name', val); } catch (e) {}
  };

  const handlePhoneChange = (val: string) => {
    setGuestPhone(val);
    setError('');
    try { localStorage.setItem('restoran_guest_phone', val); } catch (e) {}
  };

  const [paymentMethod, setPaymentMethod] = useState<PaymentType>('cash');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [useBonus, setUseBonus] = useState(false);
  const [cutleryCount, setCutleryCount] = useState(1);
  const [orderNote, setOrderNote] = useState('');
  const [error, setError] = useState('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState<{ id: string; total: number; method: 'click' | 'payme' | 'uzum' } | null>(null);

  // Delivery Timing
  const [deliveryTimeType, setDeliveryTimeType] = useState<'asap' | 'scheduled'>('asap');
  const [scheduledTime, setScheduledTime] = useState(SCHEDULE_TIMES[0]);

  const activeDeliveryFee = total >= FREE_DELIVERY_THRESHOLD ? 0 : (orderType === 'delivery' ? deliveryFee : 0);
  
  // Calculate bonus discount
  const maxBonusUsable = Math.min(bonusBalance, Math.max(0, total - discount));
  const bonusDiscount = useBonus ? maxBonusUsable : 0;
  
  // Projected Cashback calculation
  const projectedCashback = Math.round((Math.max(0, total - discount - bonusDiscount)) * (currentTier.cashbackPercent / 100));

  const applyPromoWithCode = async (codeToApply: string) => {
    const code = codeToApply.trim().toUpperCase();
    if (!code) return;
    
    setLoading(true);
    try {
      const matched = POPULAR_PROMOS.find(p => p.code === code);
      if (matched) {
        setDiscount(Math.round(total * (matched.discount / 100)));
        setAppliedPromo(matched.code);
        setPromoCode(matched.code);
        toast.success(`Promo-kod muvaffaqiyatli qo'llandi! ${matched.discount}% chegirma`);
        setError('');
        setLoading(false);
        return;
      }

      const codes = await dbService.getCollection<any>('promocodes');
      const validCode = codes.find(c => c.code === code && c.isActive);
      
      if (validCode) {
        setDiscount(Math.round(total * (validCode.discountPercentage / 100))); 
        setAppliedPromo(validCode.code);
        setPromoCode(validCode.code);
        toast.success(`Promo-kod qabul qilindi! ${validCode.discountPercentage}% chegirma.`);
        setError('');
      } else {
        setDiscount(0);
        setAppliedPromo(null);
        toast.error("Noto'g'ri yoki muddati o'tgan promo-kod");
      }
    } catch (err) {
      console.error(err);
      toast.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!user || !user.phone) {
      if (!user && guestName.trim().length < 2) {
        setError('Iltimos, ismingizni kiriting');
        return;
      }
      if (guestPhone.length < 9) {
        setError("Iltimos, telefon raqamingizni to'liq kiriting");
        return;
      }
    }

    const finalPhone = user && user.phone ? user.phone : guestPhone;
    const finalName = user ? (user.name || 'Mijoz') : guestName;
    
    const paymentLabels: Record<PaymentType, string> = {
      cash: 'Naqd pul (Yetkazilganda)',
      click: 'Click Online',
      payme: 'Payme Online',
      uzum: 'Uzum Pay',
      terminal: 'Terminal (Karta orqali)'
    };

    if (!user) {
      login(guestPhone, guestName);
    }
    
    setLoading(true);
    try {
      const finalTotal = Math.max(0, total + activeDeliveryFee - discount - bonusDiscount);

      const createdOrder = await placeOrder(
        items, 
        finalTotal,
        discount,
        orderType === 'delivery' ? currentAddress : (selectedBranch ? selectedBranch.name : 'Filialdan olib ketish'), 
        finalPhone,
        finalName,
        paymentLabels[paymentMethod],
        activeDeliveryFee,
        {
          deliveryTimeType,
          scheduledTime: deliveryTimeType === 'scheduled' ? scheduledTime : undefined,
          bonusUsed: bonusDiscount,
          bonusEarned: projectedCashback,
          orderNote,
          cutleryCount
        }
      );

      // Deduct used bonus and credit earned cashback
      if (bonusDiscount > 0) {
        spendPoints(bonusDiscount);
      }
      earnPoints(finalTotal);

      // If online payment method selected (Click, Payme, Uzum), open PaymentModal
      if (paymentMethod === 'click' || paymentMethod === 'payme' || paymentMethod === 'uzum') {
        setPendingPaymentOrder({
          id: createdOrder.id,
          total: finalTotal,
          method: paymentMethod
        });
        clearCart();
      } else {
        clearCart();
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          navigate('/profile');
        }, 2500);
      }
    } catch (err) {
      console.error("Xatolik:", err);
      setError("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  // Telegram WebApp MainButton integration
  const handleCheckoutRef = useRef(handleCheckout);
  useEffect(() => {
    handleCheckoutRef.current = handleCheckout;
  }, [handleCheckout]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg && tg.initData) {
      if (items.length > 0 && !success) {
        const finalTotal = Math.max(0, total + activeDeliveryFee - discount - bonusDiscount);
        tg.MainButton.text = `${t.checkout.toUpperCase()} - ${formatCurrency(finalTotal)}`;
        tg.MainButton.color = '#dc2626';
        tg.MainButton.textColor = '#ffffff';
        
        if (!loading) tg.MainButton.show();
        
        const onClick = () => handleCheckoutRef.current();
        tg.MainButton.onClick(onClick);
        
        if (loading) {
          tg.MainButton.showProgress(false);
        } else {
          tg.MainButton.hideProgress();
        }

        return () => {
          tg.MainButton.offClick(onClick);
          tg.MainButton.hide();
        };
      } else {
        tg.MainButton.hide();
      }
    }
  }, [items.length, total, discount, bonusDiscount, paymentMethod, loading, success, t, orderType, activeDeliveryFee]);

  const displayLocation = orderType === 'delivery' 
    ? currentAddress 
    : (selectedBranch ? selectedBranch.name : "Filialni tanlang");

  const isTelegram = Boolean(window.Telegram?.WebApp?.initData);

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-[80vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-100"
        >
          <CheckCircle className="text-emerald-600 w-14 h-14" />
        </motion.div>
        <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">BUYURTMA QABUL QILINDI!</h1>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-4">
          Buyurtmangiz oshxonaga yuborildi. Sizga <span className="font-black text-amber-600">+{projectedCashback.toLocaleString()} so'm</span> keshbek berildi!
        </p>
        <Button 
          onClick={() => navigate('/profile')}
          className="bg-red-600 text-white px-8 py-4 h-12 rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95"
        >
          Buyurtma holatini ko'rish
        </Button>
      </motion.div>
    );
  }

  if (items.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-[75vh] px-4 text-center"
      >
        <div className="w-24 h-24 rounded-3xl bg-slate-100 text-slate-300 flex items-center justify-center mb-6">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">{t.emptyCart}</h2>
        <p className="text-xs text-slate-500 mb-6 max-w-xs">
          Savatingiz hozircha bo'sh. Menyudan sevimli taomlaringizni tanlang!
        </p>
        <Button 
          onClick={() => navigate('/menu')} 
          className="bg-red-600 text-white px-8 py-3.5 h-12 rounded-xl font-black uppercase tracking-wider hover:bg-red-700 shadow-lg shadow-red-200"
        >
          {t.goToMenu}
        </Button>
      </motion.div>
    );
  }

  const freeDeliveryRemaining = Math.max(0, FREE_DELIVERY_THRESHOLD - total);
  const freeDeliveryProgress = Math.min(100, Math.round((total / FREE_DELIVERY_THRESHOLD) * 100));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 md:px-8 py-6 max-w-6xl mx-auto min-h-screen pb-40 lg:pb-12"
    >
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">
          Savatdagi Buyurtma ({items.length})
        </h1>
        <button 
          onClick={clearCart}
          className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors"
        >
          Savatni tozalash
        </button>
      </div>

      {/* 3-Step Simple Checkout Progress Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm mb-6 flex items-center justify-between gap-2 overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">
            1
          </div>
          <span className="text-xs font-black text-slate-900 uppercase">Taomlar</span>
        </div>
        <div className="h-0.5 w-8 bg-red-200 hidden sm:block"></div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 font-black text-xs flex items-center justify-center">
            2
          </div>
          <span className="text-xs font-black text-slate-700 uppercase">Manzil & Vaqt</span>
        </div>
        <div className="h-0.5 w-8 bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-black text-xs flex items-center justify-center">
            3
          </div>
          <span className="text-xs font-black text-slate-500 uppercase">To'lov</span>
        </div>
      </div>
      
      {/* Free Delivery Progress Bar */}
      {orderType === 'delivery' && (
        <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-100 p-4 rounded-2xl mb-6 shadow-sm">
          <div className="flex items-center justify-between text-xs font-black text-slate-800 mb-2">
            <span>
              {freeDeliveryRemaining > 0 
                ? `Yana ${formatCurrency(freeDeliveryRemaining)} lik taom qo'shing va BEPUL yetkazib berishga ega bo'ling! 🚀`
                : 'Tabriklaymiz! Siz uchun yetkazib berish BEPUL! 🎉'}
            </span>
            <span className="text-red-600">{freeDeliveryProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-red-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-600 rounded-full transition-all duration-500"
              style={{ width: `${freeDeliveryProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Order Items List */}
        <div className="flex-1 space-y-4">
          <AnimatePresence>
            {items.map(item => (
              <motion.div 
                key={item.id} 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className="bg-white p-4 rounded-2xl flex items-center shadow-sm border border-slate-100 group gap-4"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                  <img 
                    src={item.image || FALLBACK_FOOD} 
                    alt={item.name} 
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_FOOD; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>

                <div className="flex-grow min-w-0">
                  <h3 className="font-black text-slate-900 text-sm md:text-base line-clamp-1 uppercase tracking-tight">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                  <p className="text-red-600 font-black text-sm md:text-base mt-1">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1 shrink-0">
                  <button 
                    onClick={() => updateQuantity(item.id, -1)} 
                    className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-slate-600 hover:text-red-600 shadow-sm active:scale-95 transition-all"
                  >
                    <Minus size={14}/>
                  </button>
                  <span className="px-2 font-black text-slate-900 text-sm min-w-[20px] text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 1)} 
                    className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-slate-600 hover:text-red-600 shadow-sm active:scale-95 transition-all"
                  >
                    <Plus size={14}/>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Delivery Timing Options (ASAP vs Scheduled) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-red-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Yetkazish Vaqti</h4>
              </div>
              <span className="text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded">
                {deliveryTimeType === 'asap' ? 'Tezkor' : 'Rejalashtirilgan'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryTimeType('asap')}
                className={`py-2.5 px-3 rounded-xl border text-left text-xs font-bold transition-all ${
                  deliveryTimeType === 'asap'
                    ? 'border-red-600 bg-red-50/60 text-red-700 shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                ⚡ Hozir (30-40 min)
              </button>
              <button
                type="button"
                onClick={() => setDeliveryTimeType('scheduled')}
                className={`py-2.5 px-3 rounded-xl border text-left text-xs font-bold transition-all ${
                  deliveryTimeType === 'scheduled'
                    ? 'border-red-600 bg-red-50/60 text-red-700 shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                🕒 Vaqtni tanlash
              </button>
            </div>

            {deliveryTimeType === 'scheduled' && (
              <div className="pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Qulay vaqtni tanlang:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {SCHEDULE_TIMES.map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setScheduledTime(st)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all ${
                        scheduledTime === st
                          ? 'border-red-600 bg-red-600 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-red-300'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Loyalty Cashback & Points Redemption Card */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-3xl p-5 shadow-lg shadow-amber-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift size={22} className="text-white" />
                <div>
                  <h4 className="font-black text-xs uppercase tracking-wider">Bonus & Keshbek</h4>
                  <p className="text-[11px] text-amber-100 font-medium">Mavjud: {bonusBalance.toLocaleString()} so'm</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase bg-black/20 px-2.5 py-1 rounded-full backdrop-blur-md">
                {currentTier.title} ({currentTier.cashbackPercent}%)
              </span>
            </div>

            {bonusBalance > 0 && (
              <div className="pt-2 border-t border-white/20 flex items-center justify-between">
                <div className="text-xs">
                  <span className="font-bold">Bonusdan foydalanish</span>
                  <p className="text-[10px] text-amber-100">-{formatCurrency(maxBonusUsable)} chegirma</p>
                </div>
                <button
                  type="button"
                  onClick={() => setUseBonus(!useBonus)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    useBonus 
                      ? 'bg-white text-amber-700 shadow-md font-black' 
                      : 'bg-black/20 text-white border border-white/40'
                  }`}
                >
                  {useBonus ? 'Yechildi ✓' : 'Qo\'llash'}
                </button>
              </div>
            )}
          </div>

          {/* Cutlery & Notes */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils size={18} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-700">Priborlar (qoshiq/salfetka)</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setCutleryCount(Math.max(0, cutleryCount - 1))}
                  className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm"
                >
                  -
                </button>
                <span className="text-xs font-black px-1.5">{cutleryCount} ta</span>
                <button 
                  onClick={() => setCutleryCount(cutleryCount + 1)}
                  className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm"
                >
                  +
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <MessageSquare size={18} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="Kuryer yoki oshxona uchun izoh (ixtiyoriy)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          {/* Promo Code Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                <Ticket size={20}/>
              </div>
              <div className="flex-1 relative">
                <Input 
                  type="text" 
                  placeholder="Promo-kodni kiriting" 
                  className="w-full bg-slate-50 font-black text-sm uppercase placeholder:text-slate-400 border-slate-200 rounded-xl uppercase"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                />
              </div>
              <Button 
                onClick={() => applyPromoWithCode(promoCode)}
                disabled={loading || !promoCode.trim()}
                className="bg-slate-900 text-white px-5 h-10 rounded-xl font-bold text-xs uppercase transition-all hover:bg-slate-800 shrink-0"
              >
                {t.apply}
              </Button>
            </div>

            {/* Quick Promo Suggestions */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider my-auto">Tavsiya:</span>
              {POPULAR_PROMOS.map(p => (
                <button
                  key={p.code}
                  onClick={() => applyPromoWithCode(p.code)}
                  className={`text-[11px] font-black px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                    appliedPromo === p.code 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-red-300'
                  }`}
                >
                  <Sparkles size={11} className={appliedPromo === p.code ? 'text-emerald-500' : 'text-amber-500'} />
                  {p.code} ({p.desc})
                </button>
              ))}
            </div>
          </div>

          {/* AI Smart Recommendations */}
          <AIRecommendations />
        </div>

        {/* Sidebar Summary & Payment */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-96"
        >
          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
            
            {/* Delivery / Pickup Address */}
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">
                  {orderType === 'delivery' ? t.delivery : t.pickup}
                </span>
                <button onClick={() => setIsAddressModalOpen(true)} className="flex items-center gap-1 group text-left">
                  <span className="text-base font-black text-slate-900 border-b border-dashed border-slate-300 group-hover:border-red-600 transition-colors">
                    {displayLocation}
                  </span>
                  <ChevronDown size={18} className="text-red-600 shrink-0" />
                </button>
              </div>

              <div className="bg-slate-100 p-1 rounded-xl flex relative h-11">
                <button 
                  onClick={() => setOrderType('delivery')} 
                  className={`flex-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all z-10 ${orderType === 'delivery' ? 'text-white' : 'text-slate-500'}`}
                >
                  {t.delivery}
                </button>
                <button 
                  onClick={() => setOrderType('pickup')} 
                  className={`flex-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all z-10 ${orderType === 'pickup' ? 'text-white' : 'text-slate-500'}`}
                >
                  {t.pickup}
                </button>
                <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-red-600 rounded-lg transition-all duration-300 shadow-md ${orderType === 'delivery' ? 'left-1' : 'left-[calc(50%+1px)]'}`}></div>
              </div>
            </div>

            {/* Payment Method Cards */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-wider flex items-center gap-1.5">
                <Wallet size={15} className="text-red-600" /> {t.paymentMethod}
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'cash', label: '💵 Naqd pul', desc: 'Kuryerga' },
                  { id: 'click', label: '💳 Click', desc: 'Online / karta' },
                  { id: 'payme', label: '🟣 Payme', desc: 'Ilova orqali' },
                  { id: 'uzum', label: '🍇 Uzum Pay', desc: 'Tezkor to\'lov' }
                ].map(method => (
                  <button 
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as PaymentType)} 
                    className={`p-3 rounded-xl flex flex-col text-left border transition-all ${
                      paymentMethod === method.id 
                        ? 'border-red-600 bg-red-50/50 shadow-sm' 
                        : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                    }`}
                  >
                    <span className="font-black text-xs text-slate-900">{method.label}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{method.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Guest / User Contact Inputs */}
            {user ? (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h3 className="font-black text-slate-900 uppercase text-xs tracking-wider flex items-center gap-1.5">
                  <UserIcon size={15} className="text-red-600" /> Qabul qiluvchi ma'lumotlari
                </h3>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                      {user.name ? user.name[0].toUpperCase() : 'M'}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">{user.name || 'Mijoz'}</p>
                      <p className="text-[11px] text-emerald-800 font-bold">{user.phone}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                    Tayyor ✓
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 uppercase text-xs tracking-wider flex items-center gap-1.5">
                    <UserIcon size={15} className="text-red-600" /> Qabul qiluvchi ma'lumotlari
                  </h3>
                  {guestName && guestPhone.length >= 9 && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Ovoz bilan kiritildi ✓
                    </span>
                  )}
                </div>
                <Input 
                  type="text" 
                  placeholder={t.namePlaceholder} 
                  className="w-full h-11 bg-slate-50 rounded-xl border-slate-200 font-bold text-xs"
                  value={guestName}
                  onChange={e => handleNameChange(e.target.value)}
                />
                <Input 
                  type="tel" 
                  placeholder="+998 (90) 123-45-67" 
                  className="w-full h-11 bg-slate-50 rounded-xl border-slate-200 font-bold text-xs"
                  value={guestPhone}
                  onChange={e => handlePhoneChange(e.target.value)}
                />
                {error && <p className="text-[11px] text-red-500 font-bold">{error}</p>}
              </div>
            )}

            {/* Summary Breakdown & Final Checkout */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-500 font-medium">
                  <span>{t.subtotal}:</span>
                  <span className="font-bold text-slate-800">{formatCurrency(total)}</span>
                </div>
                {orderType === 'delivery' && (
                  <div className="flex justify-between items-center text-slate-500 font-medium">
                    <span>Yetkazib berish:</span>
                    <span className={`font-bold ${activeDeliveryFee === 0 ? 'text-emerald-600 uppercase font-black' : 'text-slate-800'}`}>
                      {activeDeliveryFee === 0 ? 'BEPUL' : formatCurrency(activeDeliveryFee)}
                    </span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 font-bold">
                    <span>Chegirma ({appliedPromo}):</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                {bonusDiscount > 0 && (
                  <div className="flex justify-between items-center text-amber-600 font-bold">
                    <span>Bonusdan to'lov:</span>
                    <span>-{formatCurrency(bonusDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl font-bold">
                  <span className="flex items-center gap-1"><Sparkles size={13} /> Keshbek beriladi:</span>
                  <span>+{formatCurrency(projectedCashback)}</span>
                </div>

                <div className="flex justify-between items-end pt-3 border-t border-slate-100">
                  <span className="font-black text-slate-900 uppercase text-xs tracking-wider">{t.total}:</span>
                  <div className="text-right">
                    <span className="font-black text-2xl text-red-600 tracking-tight">
                      {formatCurrency(Math.max(0, total + activeDeliveryFee - discount - bonusDiscount))}
                    </span>
                  </div>
                </div>
              </div>
              
              {!isTelegram && (
                <Button 
                  disabled={loading}
                  onClick={handleCheckout}
                  className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-red-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                  <span>{t.checkout}</span>
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <AddressModal 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)} 
        onConfirm={(addr) => { 
          if (orderType === 'delivery') setCurrentAddress(addr); 
          setIsAddressModalOpen(false); 
        }} 
      />

      {pendingPaymentOrder && (
        <PaymentModal
          isOpen={Boolean(pendingPaymentOrder)}
          onClose={() => {
            setPendingPaymentOrder(null);
            navigate('/profile');
          }}
          orderId={pendingPaymentOrder.id}
          amount={pendingPaymentOrder.total}
          paymentMethod={pendingPaymentOrder.method}
          onPaymentSuccess={() => {
            setPendingPaymentOrder(null);
            setSuccess(true);
            setTimeout(() => {
              setSuccess(false);
              navigate('/profile');
            }, 2000);
          }}
        />
      )}
    </motion.div>
  );
};

export default Cart;
