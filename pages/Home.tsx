import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenu } from '../context/MenuContext';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useLoyalty } from '../context/LoyaltyContext';
import { ChevronDown, Globe, Search, Sparkles, ShieldCheck, Clock, Bike, ArrowRight, ChefHat, Gift, Wand2 } from 'lucide-react';
import AddressModal from '../components/AddressModal';
import AIComboAssistantModal from '../components/AIComboAssistantModal';
import HowItWorks from '../components/HowItWorks';
import HelpSupportModal from '../components/HelpSupportModal';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { HelpCircle, PhoneCall, Headphones } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const FALLBACK_CAT_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';

const Home = () => {
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();
  const { currentAddress, setCurrentAddress, orderType, setOrderType, selectedBranch } = useAuth();
  const { products, categories } = useMenu();
  const { bonusBalance } = useLoyalty();
  
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [homeSearch, setHomeSearch] = useState('');
  
  const popularItems = products.filter(i => i.popular);

  useEffect(() => {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "FastFoodRestaurant",
      "name": "Restoran Uzbekistan",
      "image": "https://images.unsplash.com/photo-1513639776629-7b611d22f654",
      "@id": "https://restoran.uz",
      "url": "https://restoran.uz",
      "telephone": "+998711234567",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Amir Temur ko'chasi, 1-uy",
        "addressLocality": "Tashkent",
        "addressCountry": "UZ"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
        ],
        "opens": "09:00",
        "closes": "03:00"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => { 
      try {
        document.head.removeChild(script); 
      } catch (e) {}
    };
  }, []);

  const handleCategoryClick = (id: string) => {
    navigate('/menu', { state: { category: id } });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeSearch.trim()) {
      navigate('/menu', { state: { search: homeSearch.trim() } });
    }
  };

  const cycleLanguage = () => {
    const langs: ('uz' | 'ru' | 'en')[] = ['uz', 'ru', 'en'];
    const currentIndex = langs.indexOf(lang);
    setLang(langs[(currentIndex + 1) % langs.length]);
  };

  const displayLocation = orderType === 'delivery' 
    ? currentAddress 
    : (selectedBranch ? selectedBranch.name : "Filialni tanlang");

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="px-4 md:px-8 py-4 space-y-6 md:space-y-8 max-w-7xl mx-auto"
    >
      
      {/* Top Header */}
      <motion.header variants={itemVariants} className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 px-3 bg-red-600 rounded-xl flex items-center justify-center text-white font-black italic text-sm md:text-base tracking-tighter shadow-md shadow-red-200 shrink-0 lg:hidden">
                REST
            </div>

            <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{orderType === 'delivery' ? t.delivery : t.pickup}</span>
                <button 
                    onClick={() => setIsAddressModalOpen(true)}
                    className="flex items-center space-x-1 text-slate-900 font-black text-sm md:text-xl leading-none mt-0.5 text-left group"
                >
                    <span className="truncate text-slate-900 border-b border-dashed border-slate-300 group-hover:border-red-600 transition-colors">
                        {displayLocation}
                    </span>
                    <ChevronDown size={16} className="text-red-600 flex-shrink-0" />
                </button>
            </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
            {/* Loyalty Bonus Badge */}
            <button
              onClick={() => navigate('/profile')}
              className="h-10 px-3 md:h-11 md:px-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-xl flex items-center gap-1.5 text-amber-800 font-black text-xs shadow-sm active:scale-95 transition-all"
            >
              <Gift size={15} className="text-amber-600" />
              <span>{bonusBalance.toLocaleString()} so'm</span>
            </button>

            {/* Language Switcher */}
            <Button 
                variant="outline"
                onClick={cycleLanguage}
                className="h-10 px-3 md:h-11 md:px-4 rounded-xl flex items-center gap-1 font-black text-xs uppercase shadow-sm active:scale-95 transition-all"
                title="Tilni o'zgartirish"
            >
                <Globe size={15} className="text-red-600" />
                <span>{lang}</span>
            </Button>

            {/* User Profile */}
            <button 
              className="w-10 h-10 md:w-11 md:h-11 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm cursor-pointer shrink-0 hover:border-red-500 transition-colors" 
              onClick={() => navigate('/profile')}
              aria-label="Profilga o'tish"
            >
                <img src="https://ui-avatars.com/api/?name=Restoran+User&background=E4002B&color=fff" alt="User Profile" />
            </button>
        </div>
      </motion.header>

      <AddressModal 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)} 
        onConfirm={(addr) => {
            if (orderType === 'delivery') setCurrentAddress(addr);
            setIsAddressModalOpen(false);
        }}
      />

      {/* Quick Search Bar & Delivery Mode */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-3 items-stretch">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={homeSearch}
            onChange={(e) => setHomeSearch(e.target.value)}
            placeholder="Taom yoki ichimlik nomi bo'yicha qidiring..."
            className="w-full pl-10 pr-24 py-3 bg-white border border-slate-200 rounded-2xl text-xs md:text-sm font-medium outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 shadow-sm transition-all"
          />
          <button 
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Qidirish
          </button>
        </form>

        {/* Delivery Toggle */}
        <div className="bg-white p-1 rounded-2xl flex shadow-sm border border-slate-100 relative md:w-72 shrink-0">
          <button 
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all z-10 ${orderType === 'delivery' ? 'text-white' : 'text-slate-500'}`}
              onClick={() => setOrderType('delivery')}
          >
              {t.delivery}
          </button>
          <button 
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all z-10 ${orderType === 'pickup' ? 'text-white' : 'text-slate-500'}`}
              onClick={() => setOrderType('pickup')}
          >
              {t.pickup}
          </button>
          <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-red-600 rounded-xl transition-all duration-300 shadow-md ${orderType === 'delivery' ? 'left-1' : 'left-[calc(50%+2px)]'}`}
          ></div>
        </div>
      </motion.div>

      {/* Main Promo Banner */}
      <motion.section 
        variants={itemVariants}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => navigate('/menu')}
        className="w-full aspect-[2.2/1] sm:aspect-[2.8/1] md:aspect-[3.5/1] bg-gradient-to-r from-red-700 via-red-600 to-amber-600 rounded-3xl flex items-center justify-between relative overflow-hidden shadow-xl shadow-red-200/50 px-6 md:px-12 group cursor-pointer transition-all border border-red-500/20"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513639776629-7b611d22f654?auto=format&fit=crop&q=80&w=1200')] opacity-25 bg-cover bg-center mix-blend-multiply group-hover:scale-105 transition-transform duration-700"></div>
        <div className="z-10 text-white w-full sm:w-2/3 md:w-1/2 relative py-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white text-red-600 text-[10px] md:text-xs font-black uppercase px-2.5 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                <Sparkles size={12} className="animate-spin" /> PROMO
              </span>
              <span className="bg-red-900/60 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                Kafolatlangan Sifat
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase leading-none italic tracking-tighter mb-2 drop-shadow-md">
              50% CHEGIRMA
            </h2>
            <p className="text-xs md:text-sm font-semibold opacity-95 drop-shadow-sm mb-3">
              150 000 so'mdan oshgan birinchi buyurtmaga 50% gacha chegirma!
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs font-black bg-white text-red-600 px-3.5 py-1.5 rounded-xl shadow-lg group-hover:bg-slate-900 group-hover:text-white transition-colors">
              Menyuni ko'rish <ArrowRight size={13} />
            </div>
        </div>
      </motion.section>

      {/* 🤖 AI Aqlli Oshpaz Combo Builder Banner */}
      <motion.div
        variants={itemVariants}
        onClick={() => setIsAIModalOpen(true)}
        className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white rounded-3xl p-5 md:p-6 shadow-xl border border-slate-700/60 cursor-pointer hover:border-red-500/50 transition-all group relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
              <ChefHat size={30} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-red-600 text-white px-2 py-0.5 rounded-md">
                  Gemini AI
                </span>
                <span className="text-xs font-bold text-amber-400">10% Chegirma bilan</span>
              </div>
              <h3 className="text-lg md:text-xl font-black uppercase tracking-tight mt-1 text-white group-hover:text-red-400 transition-colors">
                AI Aqlli Oshpaz: 1-bosishda tayyor to'plam yig'ing
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Do'stlar, oila yoki kechki ovqat uchun maxsus byudjetingizga mos to'plam
              </p>
            </div>
          </div>

          <button className="h-11 px-5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 shrink-0 active:scale-95 transition-all">
            <Wand2 size={16} />
            <span>Set Yig'ish</span>
          </button>
        </div>
      </motion.div>

      {/* Feature Highlights Badges */}
      <motion.section variants={itemVariants} className="grid grid-cols-3 gap-2 md:gap-4">
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <Bike size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800">30 daqiqa</h4>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Tezkor yetkazish</p>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800">100% Halol</h4>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Sertifikatlangan</p>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800">09:00 - 03:00</h4>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Har kuni faol</p>
          </div>
        </div>
      </motion.section>

      {/* Categories Grid */}
      <motion.section variants={itemVariants}>
        <div className="flex justify-between items-center mb-3 px-1">
             <h3 className="font-black text-slate-900 text-lg md:text-xl uppercase italic tracking-tighter">{t.categories}</h3>
             <button onClick={() => navigate('/menu')} className="text-red-600 text-xs md:text-sm font-black uppercase italic tracking-tighter hover:underline flex items-center gap-0.5">
               {t.seeAll} <ArrowRight size={13} />
             </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
            {categories.map((cat) => (
                <motion.button 
                    key={cat.id}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleCategoryClick(cat.id)}
                    className="flex flex-col items-center bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-center transition-all hover:shadow-md hover:border-red-200 group"
                >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden mb-2 bg-slate-100 p-1">
                      <img 
                        src={cat.image || FALLBACK_CAT_IMG} 
                        alt={cat.name} 
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_CAT_IMG; }}
                        className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-300" 
                      />
                    </div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-tight line-clamp-1 group-hover:text-red-600 transition-colors">
                      {cat.name}
                    </span>
                </motion.button>
            ))}
        </div>
      </motion.section>

      {/* Popular Items Showcase */}
      <motion.section variants={itemVariants} className="pb-12">
        <div className="flex justify-between items-center mb-4 px-1">
             <h3 className="font-black text-slate-900 text-lg md:text-xl uppercase italic tracking-tighter flex items-center gap-2">
               <span>{t.popular}</span>
               <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
             </h3>
             <button onClick={() => navigate('/menu')} className="text-red-600 text-xs md:text-sm font-black uppercase italic tracking-tighter hover:underline flex items-center gap-0.5">
               {t.seeAll} <ArrowRight size={13} />
             </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {popularItems.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
      </motion.section>

      {/* How it works - 3 Simple Steps for Users */}
      <motion.section variants={itemVariants}>
        <HowItWorks onOpenHelp={() => setIsHelpModalOpen(true)} />
      </motion.section>

      {/* Quick Customer Support & Questions Banner */}
      <motion.section variants={itemVariants} className="bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 rounded-3xl p-5 md:p-6 border border-red-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-200 shrink-0">
            <Headphones size={24} />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-sm md:text-base uppercase tracking-tight">
              Savolingiz bormi yoki buyurtma berishga yordam kerakmi?
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Operatorlarimiz har kuni 09:00 dan 03:00 gacha xizmatingizda: <strong className="text-red-600">+998 71 123-45-67</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setIsHelpModalOpen(true)}
            variant="outline"
            className="flex-1 sm:flex-none h-11 bg-white hover:bg-slate-50 border-slate-200 font-black text-xs uppercase tracking-wider rounded-xl shadow-sm"
          >
            <HelpCircle size={15} className="mr-1.5 text-slate-500" />
            <span>Savol-Javoblar</span>
          </Button>

          <Button
            onClick={() => window.location.href = 'tel:+998711234567'}
            className="flex-1 sm:flex-none h-11 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-red-200"
          >
            <PhoneCall size={15} className="mr-1.5" />
            <span>Qo'ng'iroq</span>
          </Button>
        </div>
      </motion.section>

      {/* Footer Powered By TrendoAI */}
      <footer className="text-center py-8 text-xs text-slate-400">
        <p>
          Texnik ta&apos;minot va Sun&apos;iy Intellekt:{" "}
          <a
            href="https://trendoai.uz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 font-bold hover:underline"
          >
            TrendoAI IT Agentligi
          </a>
        </p>
      </footer>

      <AIComboAssistantModal 
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />

      <HelpSupportModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </motion.div>
  );
};

export default Home;
