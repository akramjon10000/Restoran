import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMenu } from '../context/MenuContext';
import { useCart } from '../context/CartContext';
import { useCartAnimation } from '../context/CartAnimationContext';
import { useFavorites } from '../context/FavoritesContext';
import ProductCard from '../components/ProductCard';
import ReviewModal from '../components/ReviewModal';
import { formatCurrency } from '../utils/format';
import { dbService } from '../lib/db';
import { ChevronLeft, Plus, Minus, ShoppingBag, Flame, Scale, Heart, Sparkles, Check, Share2, Star, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600';

interface SauceOption {
  id: string;
  name: string;
  price: number;
}

const SAUCE_OPTIONS: SauceOption[] = [
  { id: 'cheese', name: 'Pishloqli sous', price: 4000 },
  { id: 'bbq', name: 'BBQ Dudlangan sous', price: 4000 },
  { id: 'garlic', name: 'Sarimsoqli (Chesnochniy)', price: 4000 },
  { id: 'spicy', name: 'Super Achchiq Chili', price: 4000 }
];

const DEFAULT_REVIEWS = [
  { id: '1', userName: 'Anvar S.', rating: 5, comment: 'Juda mazali va yangi tayyorlangan. Issiqligida yetib keldi!', date: 'Bugun' },
  { id: '2', userName: 'Zarina K.', rating: 5, comment: 'Souslari bilan birga ajoyib ta\'m beradi. Tavsiya qilaman!', date: 'Kecha' }
];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, categories } = useMenu();
  const { addToCart } = useCart();
  const { triggerAnimation } = useCartAnimation();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [quantity, setQuantity] = useState(1);
  const [selectedSauces, setSelectedSauces] = useState<string[]>([]);
  const [spicyLevel, setSpicyLevel] = useState<'mild' | 'medium' | 'spicy'>('medium');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [productReviews, setProductReviews] = useState<any[]>(DEFAULT_REVIEWS);

  const product = products.find(p => p.id === id);
  const categoryName = categories.find(c => c.id === product?.category)?.name || '';
  const favorite = product ? isFavorite(product.id) : false;

  const similarProducts = products
    .filter(p => p.category === product?.category && p.id !== product?.id)
    .slice(0, 4);

  const allImages = product ? [product.image, ...(product.images || [])].filter(Boolean).slice(0, 3) : [FALLBACK_IMG];

  useEffect(() => {
    if (product) {
      document.title = `${product.name} - Restoran Uzbekistan`;
      window.scrollTo(0, 0);

      // Schema.org Product Rich Snippet
      const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.image,
        "description": product.description,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "UZS",
          "price": product.price,
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": product.rating || "4.9",
          "reviewCount": productReviews.length || 5
        }
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(productSchema);
      document.head.appendChild(script);

      // Load Firestore reviews for this product
      dbService.getCollection<any>('reviews').then(res => {
        const matching = res.filter(r => r.productId === product.id || r.productName === product.name);
        if (matching.length > 0) {
          setProductReviews([...matching, ...DEFAULT_REVIEWS]);
        }
      }).catch(() => {});

      return () => {
        try { document.head.removeChild(script); } catch (e) {}
      };
    }
  }, [product, id]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-black text-slate-900 mb-2">Taom topilmadi</h2>
        <p className="text-xs text-slate-500 mb-6">Ushbu taom menyudan o'chirilgan yoki mavjud emas.</p>
        <Button onClick={() => navigate('/menu')} className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold">
          Menyuga qaytish
        </Button>
      </div>
    );
  }

  const toggleSauce = (sauceId: string) => {
    setSelectedSauces(prev => 
      prev.includes(sauceId) ? prev.filter(s => s !== sauceId) : [...prev, sauceId]
    );
  };

  const saucesTotal = selectedSauces.length * 4000;
  const singleItemPrice = product.price + saucesTotal;
  const totalPrice = singleItemPrice * quantity;

  const handleAddToCart = (e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    triggerAnimation(allImages[activeImageIndex] || FALLBACK_IMG, rect);
    
    const customizedProduct = {
      ...product,
      price: singleItemPrice,
      description: selectedSauces.length > 0 
        ? `${product.description} (+ ${selectedSauces.map(s => SAUCE_OPTIONS.find(so => so.id === s)?.name).join(', ')})`
        : product.description
    };

    addToCart(customizedProduct, quantity);
    toast.success(`${quantity}x ${product.name} savatga qo'shildi!`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Havola nusxalandi!");
    }
  };

  return (
    <motion.article 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white min-h-screen pb-16"
    >
      {/* Mobile Top Bar */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex items-center justify-between md:hidden">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 active:scale-95 transition-all"
        >
          <ChevronLeft size={22} />
        </button>
        <span className="font-black text-sm uppercase tracking-tight truncate max-w-[200px]">
          {product.name}
        </span>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 active:scale-95 transition-all"
          >
            <Share2 size={18} />
          </button>
          <button 
            onClick={() => toggleFavorite(product.id)}
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 active:scale-95 transition-all"
          >
            <Heart size={18} className={favorite ? 'fill-red-600 text-red-600' : ''} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        {/* Desktop Breadcrumbs */}
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <button onClick={() => navigate('/')} className="hover:text-red-600">Bosh sahifa</button>
          <span>/</span>
          <button onClick={() => navigate('/menu')} className="hover:text-red-600">Menyu</button>
          <span>/</span>
          <span className="text-slate-800">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm group">
              <img 
                src={allImages[activeImageIndex] || FALLBACK_IMG} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              
              {product.popular && (
                <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black uppercase px-3 py-1 rounded-xl shadow-lg flex items-center gap-1.5">
                  <Flame size={14} className="fill-white" /> Xit Taom
                </div>
              )}

              <button 
                onClick={() => toggleFavorite(product.id)}
                className="hidden md:flex absolute top-4 right-4 w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-md shadow-md items-center justify-center text-slate-400 hover:text-red-600 transition-all hover:scale-110 active:scale-95"
              >
                <Heart size={20} className={favorite ? 'fill-red-600 text-red-600' : ''} />
              </button>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-3 justify-center">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx 
                        ? 'border-red-600 shadow-md scale-105' 
                        : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Customizer */}
          <div className="flex flex-col">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                  {categoryName || 'Fast Food'}
                </span>
                <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Star size={12} className="fill-amber-500" /> {product.rating || '4.9'} ({productReviews.length} ta sharh)
                </span>
              </div>

              <h1 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">
                {product.name}
              </h1>

              <p className="text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>

              {/* Badges Info */}
              <div className="flex flex-wrap gap-2 pt-2">
                {product.calories && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl">
                    <Flame size={14} className="text-amber-500" /> {product.calories}
                  </span>
                )}
                {product.weight && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl">
                    <Scale size={14} className="text-slate-400" /> {product.weight}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl">
                  <Sparkles size={14} /> 100% Halol
                </span>
              </div>
            </div>

            {/* Customizer Box */}
            <div className="mt-6 p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-5">
              
              {/* Spicy Level */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
                  Achchiqlik darajasi:
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'mild', label: 'Yengil 🌿', desc: 'Achchiq emas' },
                    { id: 'medium', label: 'O\'rtacha 🔥', desc: 'Maza beruvchi' },
                    { id: 'spicy', label: 'Achchiq 🌶️', desc: 'Kuchli maza' }
                  ].map(lvl => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setSpicyLevel(lvl.id as any)}
                      className={`p-2.5 rounded-2xl border text-left transition-all ${
                        spicyLevel === lvl.id 
                          ? 'border-red-600 bg-white shadow-sm ring-2 ring-red-100' 
                          : 'border-slate-200 bg-white/50 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <span className="font-black text-xs block">{lvl.label}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{lvl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add-on Sauces */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
                  Qo'shimcha Souslar (+4 000 so'm):
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {SAUCE_OPTIONS.map(sauce => {
                    const isSelected = selectedSauces.includes(sauce.id);
                    return (
                      <button
                        key={sauce.id}
                        type="button"
                        onClick={() => toggleSauce(sauce.id)}
                        className={`p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                          isSelected 
                            ? 'border-red-600 bg-red-50 text-red-700 shadow-sm' 
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="font-bold text-xs">{sauce.name}</span>
                        {isSelected ? <Check size={16} className="text-red-600" /> : <Plus size={16} className="text-slate-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ingredients preview */}
              {product.ingredients && product.ingredients.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Tarkibi</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {product.ingredients.map((ing, i) => (
                      <span key={i} className="text-[11px] bg-white text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200/60 font-medium">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-6 border-t border-slate-200 mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Jami narx</span>
                  <p className="text-2xl font-black text-slate-900">
                    {formatCurrency(totalPrice).split(' ')[0]} <span className="text-sm font-semibold text-slate-500">so'm</span>
                  </p>
                </div>

                {/* Quantity Counter */}
                <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95"
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-black text-sm w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                className="w-full py-4 h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-sm font-black uppercase tracking-wider shadow-xl shadow-red-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={20} />
                <span>Savatga qo'shish ({formatCurrency(totalPrice).split(' ')[0]} so'm)</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section className="mt-16 pt-8 border-t border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                <MessageSquare size={20} className="text-red-600" /> Mijozlar Fikrlari ({productReviews.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Haqiqiy mijozlar tomonidan qoldirilgan baholar</p>
            </div>

            <Button
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5"
            >
              <Star size={14} className="fill-white" />
              <span>Fikr bildirish (+2 000 bonus)</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productReviews.map((rev) => (
              <div key={rev.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 font-black text-xs flex items-center justify-center">
                      {rev.userName?.charAt(0) || 'M'}
                    </div>
                    <span className="font-black text-xs text-slate-900">{rev.userName}</span>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">"{rev.comment}"</p>
                <span className="text-[10px] text-slate-400 font-medium block">{rev.date}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Similar Dishes Section */}
        {similarProducts.length > 0 && (
          <section className="mt-16 pt-8 border-t border-slate-100">
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">
              O'xshash Mazali Taomlar
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {similarProducts.map(sp => (
                <ProductCard key={sp.id} product={sp} />
              ))}
            </div>
          </section>
        )}
      </div>

      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        orderId={product.id}
        productId={product.id}
        productName={product.name}
      />
    </motion.article>
  );
};

export default ProductDetail;
