import React from 'react';
import { Sparkles, Plus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import { triggerHaptic } from '../utils/telegram';

export default function AIRecommendations() {
  const { items, addToCart } = useCart();
  const { products } = useMenu();

  if (items.length === 0) return null;

  // AI Recommendation logic based on current cart items
  const cartProductIds = items.map(i => i.id);
  const cartCategories = items.map(i => i.categoryId);

  // Recommend side dishes / drinks / desserts if main dish is present
  const recommendations = products.filter(p => {
    if (cartProductIds.includes(p.id)) return false;
    
    // If user bought main dishes (like Osh, Somsa, Shaslik), suggest drinks or salads
    const hasMainDish = cartCategories.some(cat => ['mains', 'national', 'kebab'].includes(cat?.toLowerCase() || ''));
    if (hasMainDish) {
      return ['drinks', 'salads', 'bread'].includes(p.categoryId?.toLowerCase() || '');
    }
    
    return true;
  }).slice(0, 3);

  if (recommendations.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-xl border border-slate-700/50 my-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-600/30 text-red-400 flex items-center justify-center border border-red-500/30">
            <Sparkles size={18} className="animate-pulse text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">AI Tavsiyalar</h3>
            <p className="text-[11px] text-slate-400 font-medium">Tanlovingizga mos ajoyib qo'shimchalar</p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest bg-red-600/20 text-red-400 px-2.5 py-1 rounded-full border border-red-500/30">
          Aqlli Moslik
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {recommendations.map((product) => {
          const inCart = items.some(i => i.id === product.id);

          return (
            <div key={product.id} className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700 flex items-center justify-between gap-3 hover:border-slate-600 transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-700" 
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-xs truncate text-slate-100">{product.name}</h4>
                  <p className="text-[11px] font-black text-red-400">
                    {product.price.toLocaleString()} so'm
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  addToCart(product);
                  triggerHaptic('light');
                }}
                disabled={inCart}
                className={`p-2 rounded-xl transition-all shrink-0 ${
                  inCart 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-md active:scale-90'
                }`}
              >
                {inCart ? <Check size={16} /> : <Plus size={16} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
