import React, { useState, useEffect, useMemo } from 'react';
import { useMenu } from '../context/MenuContext';
import { useFavorites } from '../context/FavoritesContext';
import ProductCard from '../components/ProductCard';
import AIComboAssistantModal from '../components/AIComboAssistantModal';
import { Search, X, Heart, ArrowUpDown, Flame, Sparkles, Filter, Wand2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

type SortOption = 'popular' | 'price_asc' | 'price_desc' | 'name_asc';

const Menu = () => {
  const { products, categories } = useMenu();
  const { isFavorite, favoritesCount } = useFavorites();
  const location = useLocation();
  const { t } = useLanguage();
  
  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showOnlyHits, setShowOnlyHits] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Handle incoming navigation state (e.g. from Home categories or search)
  useEffect(() => {
    if (location.state) {
      if (location.state.category) {
        setActiveCat(location.state.category);
        setShowOnlyFavorites(false);
      }
      if (location.state.search) {
        setSearch(location.state.search);
      }
    }
  }, [location]);

  const filteredProducts = useMemo(() => {
    return products.filter(item => {
      // Category filter
      if (showOnlyFavorites) {
        if (!isFavorite(item.id)) return false;
      } else if (activeCat !== 'All') {
        if (item.category !== activeCat) return false;
      }

      // Hit filter
      if (showOnlyHits && !item.popular) return false;

      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesIngredients = item.ingredients?.some(i => i.toLowerCase().includes(query));
        if (!matchesName && !matchesDesc && !matchesIngredients) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      // popular
      return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
    });
  }, [products, activeCat, search, sortBy, showOnlyFavorites, showOnlyHits, isFavorite]);

  const handleResetFilters = () => {
    setActiveCat('All');
    setSearch('');
    setShowOnlyFavorites(false);
    setShowOnlyHits(false);
    setSortBy('popular');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="min-h-screen flex flex-col bg-slate-50"
    >
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md z-30 px-4 md:px-8 py-4 border-b border-slate-200 shadow-sm space-y-3">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-2">
                <span>{t.menu}</span>
                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
                  {filteredProducts.length} ta taom
                </span>
              </h1>

              {/* AI Combo launcher button */}
              <button
                onClick={() => setIsAIModalOpen(true)}
                className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md shadow-red-200 flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Wand2 size={14} className="animate-spin" />
                <span>AI Set Yig'ish</span>
              </button>
            </div>
            
            {/* Search & Sort Area */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-grow md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <Input 
                  type="text" 
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border-slate-200 rounded-xl text-xs md:text-sm outline-none focus-visible:ring-1 focus-visible:ring-red-600 transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button 
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none hover:border-slate-300 cursor-pointer transition-colors appearance-none pr-8"
                  aria-label="Saralash"
                >
                  <option value="popular">🔥 Ommabop</option>
                  <option value="price_asc">📉 Narx: Arzondan</option>
                  <option value="price_desc">📈 Narx: Qimmatdan</option>
                  <option value="name_asc">🔤 Nomi (A-Z)</option>
                </select>
                <ArrowUpDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Filter Chips Horizontal Bar */}
          <div className="flex items-center space-x-2 overflow-x-auto hide-scrollbar pb-1 pt-1">
            <Button
              variant={activeCat === 'All' && !showOnlyFavorites && !showOnlyHits ? 'default' : 'outline'}
              onClick={handleResetFilters}
              className={`rounded-xl text-xs font-black uppercase tracking-wide whitespace-nowrap transition-all ${
                activeCat === 'All' && !showOnlyFavorites && !showOnlyHits
                  ? 'bg-slate-900 text-white shadow-md hover:bg-slate-800' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-red-200 hover:text-red-600'
              }`}
            >
              Barchasi
            </Button>

            {/* Favorites Filter Chip */}
            <Button
              variant={showOnlyFavorites ? 'default' : 'outline'}
              onClick={() => {
                setShowOnlyFavorites(!showOnlyFavorites);
                setActiveCat('All');
                setShowOnlyHits(false);
              }}
              className={`rounded-xl text-xs font-black uppercase tracking-wide whitespace-nowrap transition-all flex items-center gap-1.5 ${
                showOnlyFavorites 
                  ? 'bg-red-600 text-white shadow-md shadow-red-200 hover:bg-red-700' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-red-200 hover:text-red-600'
              }`}
            >
              <Heart size={14} className={showOnlyFavorites ? 'fill-white' : 'text-red-500'} />
              Sevimlilar {favoritesCount > 0 && `(${favoritesCount})`}
            </Button>

            {/* Hit Filter Chip */}
            <Button
              variant={showOnlyHits ? 'default' : 'outline'}
              onClick={() => {
                setShowOnlyHits(!showOnlyHits);
                setShowOnlyFavorites(false);
              }}
              className={`rounded-xl text-xs font-black uppercase tracking-wide whitespace-nowrap transition-all flex items-center gap-1.5 ${
                showOnlyHits 
                  ? 'bg-amber-500 text-white shadow-md hover:bg-amber-600' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-amber-200 hover:text-amber-600'
              }`}
            >
              <Flame size={14} className={showOnlyHits ? 'fill-white' : 'text-amber-500'} />
              Hitlar
            </Button>

            {/* Dynamic Categories */}
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={activeCat === cat.id && !showOnlyFavorites ? 'default' : 'outline'}
                onClick={() => {
                  setActiveCat(cat.id);
                  setShowOnlyFavorites(false);
                }}
                className={`rounded-xl text-xs font-black uppercase tracking-wide whitespace-nowrap transition-all ${
                  activeCat === cat.id && !showOnlyFavorites
                    ? 'bg-slate-900 text-white shadow-md hover:bg-slate-800' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-red-200 hover:text-red-600'
                }`}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-6 flex-1">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-md mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Filter size={28} />
            </div>
            <h3 className="font-black text-slate-900 text-base mb-1">Mos keluvchi taomlar topilmadi</h3>
            <p className="text-xs text-slate-500 mb-6">
              Qidiruv so'zini o'zgartirib ko'ring yoki filtrlarni tozalang.
            </p>
            <Button 
              onClick={handleResetFilters}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider px-6 shadow-md shadow-red-200"
            >
              Filtrlarni tozalash
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <AIComboAssistantModal 
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </motion.div>
  );
};

export default Menu;
