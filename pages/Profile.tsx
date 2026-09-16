import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useLanguage } from '../context/LanguageContext';
import { LayoutDashboard, LogOut, LogIn, ChevronRight, Bell, Shield, Loader2, Phone, MapPin, User as UserIcon, Save, Clock, MenuSquare, CheckCircle, ChefHat, Truck, Download, Heart, ArrowRight, Gift, Award, Sparkles, Star, Navigation, Share2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { auth, db } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import AddressModal from '../components/AddressModal';
import ReviewModal from '../components/ReviewModal';
import OrderTrackerModal from '../components/OrderTrackerModal';
import OrderMap from '../components/OrderMap';
import { formatCurrency } from '../utils/format';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useFavorites } from '../context/FavoritesContext';
import { useMenu } from '../context/MenuContext';
import { useLoyalty } from '../context/LoyaltyContext';
import { Order } from '../types';

const Profile = () => {
  const { user, logout, isAdmin, firebaseAuthReady, currentAddress, setCurrentAddress, login, setOrderType } = useAuth();
  const { orders } = useOrders();
  const { t, lang, setLang } = useLanguage();
  const { isInstallable, promptInstall } = usePWAInstall();
  const { favorites } = useFavorites();
  const { products } = useMenu();
  const { bonusBalance, currentTier, nextTier, progressToNextTier, totalSpent, addBonusReward } = useLoyalty();
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginName, setLoginName] = useState('');
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  React.useEffect(() => {
    if (user && !user.phone) {
        setEditName(user.name || '');
    }
  }, [user]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setIsLoginModalOpen(false);
      toast.success("Google orqali muvaffaqiyatli kirdingiz!");
    } catch (error: any) {
      console.error(error);
      if(error.code === 'auth/operation-not-allowed') {
          toast.error("Firebase konsolida Google Auth yoqilmagan!");
      } else {
          toast.error("Xatolik: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim() || loginPhone.trim().length < 9) {
      toast.error("Telefon raqamingizni to'liq kiriting");
      return;
    }
    const name = loginName.trim() || 'Restoran Mijozi';
    login(loginPhone.trim(), name);
    setIsLoginModalOpen(false);
    setLoginPhone('');
    setLoginName('');
    toast.success(`Xush kelibsiz, ${name}!`);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
        toast.error("Ismingizni kiriting");
        return;
    }
    setLoading(true);
    try {
        if (user) {
            login(editPhone || user.phone || '', editName);
            if (user.phone) {
                try {
                    const userRef = doc(db, 'users', user.phone);
                    await updateDoc(userRef, {
                        name: editName,
                        phone: editPhone || user.phone,
                        address: editAddress || currentAddress
                    });
                } catch (e) {
                    console.log("Firebase sync fallback");
                }
            }
        }
        if (editAddress) {
            setCurrentAddress(editAddress);
        }
        setIsEditing(false);
        toast.success("Ma'lumotlar saqlandi");
    } catch (err) {
        toast.error("Xatolik yuz berdi");
    } finally {
        setLoading(false);
    }
  };

  const handleInviteFriend = () => {
    const shareText = "Oshxona.uz da eng mazali taomlarga buyurtma bering va 10 000 so'm xush kelibsiz bonusiga ega bo'ling! 🍗 Promo-kod: OSHXONA20";
    if (navigator.share) {
      navigator.share({
        title: 'Oshxona.uz',
        text: shareText,
        url: window.location.origin
      }).then(() => {
        addBonusReward(5000, "Do'stingiz bilan ulashganingiz uchun");
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareText);
      addBonusReward(5000, "Do'stlarga havola nusxalandi");
      toast.success("Havola nusxalandi va +5,000 bonus hisobingizga qo'shildi!");
    }
  };

  const userOrders = orders.filter(o => 
    (user && user.phone && o.phone === user.phone) || 
    (user && user.id && o.id === user.id) || 
    (!user && orders.length > 0)
  );

  const activeOrders = userOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  const pastOrders = userOrders.filter(o => o.status === 'completed');

  const getStatusDisplay = (status: string) => {
    switch (status) {
        case 'new': 
            return { text: "Qabul qilindi", color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200", icon: <Clock size={16} /> };
        case 'cooking': 
            return { text: "Oshxonada tayyorlanmoqda", color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200", icon: <ChefHat size={16} /> };
        case 'delivering': 
            return { text: "Kuryer yo'lda", color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-200", icon: <Truck size={16} /> };
        case 'completed': 
            return { text: "Yetkazildi", color: "text-green-500", bg: "bg-green-50", border: "border-green-200", icon: <CheckCircle size={16} /> };
        default: 
            return { text: "Qabul qilindi", color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200", icon: <Clock size={16} /> };
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-32">
        {/* User Card */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-center mb-6 relative overflow-hidden"
        >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-red-200 uppercase shrink-0">
                {user && user.name ? user.name.charAt(0) : <UserIcon size={26} />}
            </div>
            <div className="ml-5 overflow-hidden flex-1">
                 <h1 className="text-xl font-black text-slate-900 truncate uppercase italic tracking-tighter">
                   {user ? user.name : 'Mehmon'}
                 </h1>
                 <p className="text-slate-400 text-xs font-bold truncate">
                   {user ? (user.phone || user.email || '+998 (90) 123-45-67') : 'Hisobga kirmagansiz'}
                 </p>
            </div>
            {user ? (
                isAdmin && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="ml-auto">
                        <Button 
                            size="icon"
                            onClick={() => navigate('/admin')}
                            className="bg-slate-900 text-white w-12 h-12 rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-800"
                            title="Boshqaruv paneliga o'tish"
                        >
                            <LayoutDashboard size={20} />
                        </Button>
                    </motion.div>
                )
            ) : (
                <Button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase px-4 h-11 shadow-md shadow-red-200 flex items-center gap-1.5 shrink-0"
                >
                    <LogIn size={15} />
                    <span>Kirish</span>
                </Button>
            )}
        </motion.div>

        {/* 👑 VIP Loyalty & Cashback Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white rounded-[2rem] p-6 shadow-xl border border-slate-700/50 mb-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-gradient-to-r ${currentTier.badgeColor} text-white shadow-md mb-2`}>
                <Award size={13} /> {currentTier.title}
              </span>
              <p className="text-slate-400 text-xs font-medium">To'plangan Bonus Balans</p>
              <h2 className="text-3xl font-black text-amber-400 tracking-tight mt-0.5">
                {bonusBalance.toLocaleString()} <span className="text-sm text-slate-300 font-bold">so'm</span>
              </h2>
            </div>

            <div className="text-right">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-base ml-auto mb-1">
                {currentTier.cashbackPercent}%
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Keshbek stavkasi</span>
            </div>
          </div>

          {/* Progress to next tier */}
          {nextTier && (
            <div className="mt-5 pt-4 border-t border-slate-800 relative z-10">
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1">
                  Keyingi bosqich: <strong className="text-amber-400">{nextTier.title} ({nextTier.cashbackPercent}%)</strong>
                </span>
                <span>{progressToNextTier}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-700"
                  style={{ width: `${progressToNextTier}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Yana {formatCurrency(Math.max(0, nextTier.minSpend - totalSpent))} lik buyurtma bering va {nextTier.title} maqomiga erishing!
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 relative z-10">
            <button
              onClick={handleInviteFriend}
              className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <Share2 size={14} />
              <span>Do'stni taklif qilish (+5 000 bonus)</span>
            </button>
          </div>
        </motion.div>
        
        {/* Active tracking visualizer */}
        {activeOrders.length > 0 && (
            <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between ml-2">
                  <h2 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Faol Buyurtmalar ({activeOrders.length})</h2>
                  <span className="text-xs font-bold text-red-600 animate-pulse">● Jonli kuzatuv</span>
                </div>
                {activeOrders.map(order => {
                    const statusInfo = getStatusDisplay(order.status);
                    
                    return (
                        <motion.div 
                            key={order.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-white rounded-[2rem] p-5 shadow-md border-2 ${statusInfo.border} overflow-hidden relative`}
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 ${statusInfo.bg} rounded-bl-full -mr-4 -mt-4 opacity-50 pointer-events-none`} />
                            
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Buyurtma #{order.id}</span>
                                        <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 bg-slate-100 rounded-full">{new Date(order.date).toLocaleTimeString('uz-UZ', {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <p className="font-bold text-lg text-slate-900">{formatCurrency(order.total)}</p>
                                </div>
                                <div className={`flex flex-col items-center ${statusInfo.color}`}>
                                    {statusInfo.icon}
                                    <span className="text-[10px] font-black uppercase tracking-widest">{statusInfo.text}</span>
                                </div>
                            </div>
                            
                            {/* Tracking Button */}
                            <Button
                              onClick={() => setTrackingOrder(order)}
                              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md mb-3 relative z-10"
                            >
                              <Navigation size={15} className="text-red-500 animate-bounce" />
                              <span>Xaritada & Jonli Kuzatish</span>
                            </Button>

                            {/* Tracking Path */}
                            <div className="mt-4 mb-4 relative z-10 px-2">
                                <div className="absolute top-1.5 left-4 right-4 h-0.5 bg-slate-100 -z-10 rounded-full"></div>
                                <div className={`absolute top-1.5 left-4 h-0.5 bg-slate-900 -z-10 transition-all duration-1000`} 
                                    style={{
                                        width: order.status === 'new' ? '10%' : 
                                               order.status === 'cooking' ? '50%' : 
                                               order.status === 'delivering' ? '100%' : '100%'
                                    }}
                                ></div>

                                <div className="flex flex-row justify-between relative text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    <div className={`flex flex-col items-center ${['new', 'cooking', 'delivering', 'completed'].includes(order.status) ? 'text-slate-900' : ''}`}>
                                        <div className={`w-3.5 h-3.5 rounded-full mb-2 ${['new', 'cooking', 'delivering', 'completed'].includes(order.status) ? 'bg-slate-900' : 'bg-slate-200'}`}></div>
                                        Qabul
                                    </div>
                                    <div className={`flex flex-col items-center ${['cooking', 'delivering', 'completed'].includes(order.status) ? 'text-slate-900' : ''}`}>
                                        <div className={`w-3.5 h-3.5 rounded-full mb-2 ${['cooking', 'delivering', 'completed'].includes(order.status) ? 'bg-slate-900' : 'bg-slate-200'}`}></div>
                                        Oshxonada
                                    </div>
                                    <div className={`flex flex-col items-center ${['delivering', 'completed'].includes(order.status) ? 'text-slate-900' : ''}`}>
                                        <div className={`w-3.5 h-3.5 rounded-full mb-2 ${['delivering', 'completed'].includes(order.status) ? 'bg-slate-900' : 'bg-slate-200'}`}></div>
                                        Yo'lda
                                    </div>
                                </div>
                            </div>
                            
                            <details className="mt-4 group cursor-pointer z-10 relative">
                                <summary className="text-xs font-bold text-red-600 uppercase tracking-widest hover:underline list-none flex items-center justify-center gap-1 bg-red-50 p-2 rounded-xl">
                                    Tarkibni ko'rish ({order.items.length} taom)
                                </summary>
                                <div className="pt-3 space-y-2 max-h-32 overflow-y-auto">
                                    {order.items.map(item => (
                                        <div key={item.id} className="flex justify-between items-center text-sm">
                                            <div className="flex gap-2 items-center">
                                                <span className="font-bold text-slate-700">{item.quantity} x</span>
                                                <span className="text-slate-600 line-clamp-1">{item.name}</span>
                                            </div>
                                            <span className="font-medium text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        </motion.div>
                    )
                })}
            </div>
        )}

        {/* Favorites section */}
        {favoriteProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
                <Heart size={14} className="text-red-600 fill-red-600" /> Sevimli Taomlar ({favoriteProducts.length})
              </h2>
              <button 
                onClick={() => navigate('/menu')}
                className="text-xs font-bold text-red-600 uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                Menyu <ArrowRight size={12} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {favoriteProducts.slice(0, 3).map(fav => (
                <div 
                  key={fav.id}
                  onClick={() => navigate(`/product/${fav.id}`)}
                  className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 cursor-pointer hover:border-red-200 transition-all group"
                >
                  <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-slate-200">
                    <img src={fav.image} alt={fav.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <h4 className="font-black text-slate-800 text-xs truncate group-hover:text-red-600 transition-colors">{fav.name}</h4>
                  <p className="text-[11px] font-bold text-red-600 mt-0.5">{formatCurrency(fav.price)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Profile Info Form */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-6 relative overflow-hidden"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">{t.personalInfo}</h2>
                <button 
                    onClick={() => {
                        setIsEditing(!isEditing);
                        if (!isEditing && user) {
                            setEditName(user.name || '');
                            setEditPhone(user.phone || '');
                            setEditAddress(currentAddress || '');
                        }
                    }} 
                    className="text-xs font-black text-red-600 uppercase tracking-widest hover:underline"
                >
                    {isEditing ? t.cancel : t.edit}
                </button>
            </div>

            {isEditing ? (
                <div className="space-y-4 relative z-10">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block tracking-widest">{t.fullName}</label>
                        <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Ismingiz" className="bg-slate-50 h-12 rounded-xl border-slate-100 font-bold" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block tracking-widest">{t.phone}</label>
                        <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+998..." className="bg-slate-50 h-12 rounded-xl border-slate-100 font-bold" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block tracking-widest">{t.address}</label>
                        <div className="relative">
                            <Input value={editAddress} onChange={e => setEditAddress(e.target.value)} className="bg-slate-50 h-12 rounded-xl border-slate-100 font-bold pr-12" />
                            <button 
                                onClick={() => { setOrderType('delivery'); setIsAddressModalOpen(true); }}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-lg flex items-center justify-center text-red-600 shadow-sm border border-slate-100 hover:bg-slate-50"
                            >
                                <MapPin size={18} />
                            </button>
                        </div>
                    </div>
                    <Button onClick={handleSaveProfile} disabled={loading} className="w-full mt-2 h-14 rounded-xl bg-red-600 font-black italic tracking-tighter uppercase">
                        {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} className="mr-2" /> {t.save}</>}
                    </Button>
                </div>
            ) : (
                <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><UserIcon size={18} /></div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">{t.fullName}</p>
                            <p className="font-bold text-slate-800 text-sm">{user ? user.name : t.notEntered}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Phone size={18} /></div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">{t.phone}</p>
                            <p className="font-bold text-slate-800 text-sm">{user ? user.phone : t.notEntered}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><MapPin size={18} /></div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">{t.mainAddress}</p>
                            <p className="font-bold text-slate-800 text-sm line-clamp-1">{currentAddress || t.notEntered}</p>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>

        {/* Past Orders with Review Action */}
        {pastOrders.length > 0 && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-[2rem] p-2 shadow-sm border border-slate-100 mb-6 overflow-hidden"
            >
                <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">{t.deliveredOrders}</h2>
                    <span className="text-xs font-bold text-slate-400">{pastOrders.length} ta</span>
                </div>
                
                <div className="flex flex-col max-h-60 overflow-y-auto">
                    {pastOrders.slice(0, 5).map(order => (
                        <div key={order.id} className="flex flex-col p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 relative gap-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-800 flex items-center gap-2">
                                        Buyurtma #{order.id.slice(0, 5).toUpperCase()} 
                                        <CheckCircle size={14} className="text-green-500" />
                                    </p>
                                    <p className="text-xs text-slate-400 font-medium">{new Date(order.date).toLocaleDateString()}</p>
                                </div>
                                <span className="font-black text-slate-900">{formatCurrency(order.total)}</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                  onClick={() => setTrackingOrder(order)}
                                  className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-2 rounded-xl transition-colors flex-1 uppercase tracking-wider"
                              >
                                  Batafsil
                              </button>
                              {!order.isReviewed && (
                                  <button
                                      onClick={() => setReviewOrderId(order.id)}
                                      className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 py-2 rounded-xl transition-colors flex-1 uppercase tracking-wider flex items-center justify-center gap-1"
                                  >
                                      <Star size={13} className="fill-amber-500 text-amber-500" />
                                      {t.leaveReview}
                                  </button>
                              )}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        )}

        {/* Language Switcher */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-6 relative overflow-hidden"
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">{t.language} / Язык</h2>
            </div>
            
            <div className="flex gap-4">
                <button 
                    onClick={() => setLang('uz')}
                    className={`flex-1 flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all ${lang === 'uz' ? 'border-red-600 bg-red-50 text-red-600' : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                    <span className="text-2xl mb-1">🇺🇿</span>
                    <span className="text-xs font-black uppercase tracking-widest">O'zbek</span>
                </button>
                <button 
                    onClick={() => setLang('ru')}
                    className={`flex-1 flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all ${lang === 'ru' ? 'border-red-600 bg-red-50 text-red-600' : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                    <span className="text-2xl mb-1">🇷🇺</span>
                    <span className="text-xs font-black uppercase tracking-widest">Русский</span>
                </button>
            </div>
        </motion.div>

        {isInstallable && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-red-600 to-orange-600 rounded-[2rem] p-6 shadow-md mb-6 relative overflow-hidden"
            >
                <div className="absolute right-0 top-0 w-32 h-32 bg-white rounded-full opacity-10 -mr-10 -mt-10 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-white">
                        <h3 className="font-black text-lg uppercase italic tracking-tighter mb-1">{t.installApp}</h3>
                        <p className="text-red-100 text-sm font-medium">{t.forEasyOrdering}</p>
                    </div>
                    <Button 
                        onClick={promptInstall}
                        className="bg-white text-red-600 hover:bg-red-50 font-black rounded-xl h-12 px-6 w-full md:w-auto shadow-sm"
                    >
                        <Download size={18} className="mr-2" />
                        {t.install}
                    </Button>
                </div>
            </motion.div>
        )}

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mb-4">
            <Button 
                variant="outline"
                onClick={() => navigate('/courier')} 
                className="w-full h-16 text-slate-700 font-black border-slate-200 bg-white rounded-[2rem] hover:bg-slate-50 transition-all uppercase italic tracking-tighter flex items-center justify-center gap-2"
            >
                <Truck size={20} />
                {t.driverPanel}
            </Button>
        </motion.div>

        {user ? (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                    variant="ghost"
                    onClick={logout} 
                    className="w-full h-16 text-red-600 font-black bg-red-50 rounded-[2rem] hover:bg-red-100 hover:text-red-700 transition-all uppercase italic tracking-tighter mb-4"
                >
                    <div className="flex items-center justify-center gap-2">
                        <LogOut size={20} />
                        <span>{t.logoutButton}</span>
                    </div>
                </Button>
            </motion.div>
        ) : (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                    onClick={() => setIsLoginModalOpen(true)}
                    className="w-full h-16 text-white font-black bg-red-600 rounded-[2rem] hover:bg-red-700 shadow-lg shadow-red-200 transition-all uppercase italic tracking-tighter mb-4 flex items-center justify-center gap-2"
                >
                    <LogIn size={20} />
                    <span>Hisobga Kirish / Ro'yxatdan o'tish</span>
                </Button>
            </motion.div>
        )}

        <AddressModal 
            isOpen={isAddressModalOpen} 
            onClose={() => setIsAddressModalOpen(false)} 
            onConfirm={(addr) => { setEditAddress(addr); setCurrentAddress(addr); setIsAddressModalOpen(false); }} 
        />

        <ReviewModal 
            isOpen={Boolean(reviewOrderId)} 
            onClose={() => setReviewOrderId(null)} 
            orderId={reviewOrderId || ''}
            userName={user?.name}
        />

        <OrderTrackerModal 
            isOpen={Boolean(trackingOrder)}
            onClose={() => setTrackingOrder(null)}
            order={trackingOrder}
        />

        {/* Login / Register Modal */}
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-200">
                    <LogIn size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base uppercase tracking-tight">Hisobga Kirish</h3>
                    <p className="text-[11px] text-slate-400">Keshbeklar va buyurtmalar tarixini ko'rish</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsLoginModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Phone login form */}
              <form onSubmit={handlePhoneLogin} className="space-y-4 mb-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                    Ismingiz
                  </label>
                  <Input
                    type="text"
                    placeholder="Masalan: Sardor"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    className="bg-slate-50 h-12 rounded-xl border-slate-200 font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                    Telefon raqamingiz *
                  </label>
                  <Input
                    type="tel"
                    placeholder="+998 (90) 123-45-67"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    className="bg-slate-50 h-12 rounded-xl border-slate-200 font-bold text-sm"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-red-200"
                >
                  Kirish / Davom etish
                </Button>
              </form>

              {/* Google Sign-in Alternative */}
              <div className="pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full h-12 rounded-xl border-slate-200 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google orqali kirish</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
    </div>
  );
};

export default Profile;
