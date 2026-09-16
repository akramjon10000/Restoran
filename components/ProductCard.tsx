import React, { useState } from 'react';
import { Plus, Eye, Heart, Flame, Star } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useCartAnimation } from '../context/CartAnimationContext';
import { useFavorites } from '../context/FavoritesContext';
import { formatCurrency } from '../utils/format';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from './ui/button';

interface Props {
  product: Product;
}

const FALLBACK_FOOD_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500';

const ProductCard: React.FC<Props> = ({ product }) => {
  const { addToCart, items } = useCart();
  const { triggerAnimation } = useCartAnimation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [imgSrc, setImgSrc] = useState(product.image || FALLBACK_FOOD_IMG);
  const navigate = useNavigate();

  const inCartItem = items.find(i => i.id === product.id);
  const favorite = isFavorite(product.id);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    triggerAnimation(imgSrc, rect);
    addToCart(product);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-full border border-slate-100 group cursor-pointer transition-all hover:shadow-lg hover:border-red-100 relative"
    >
      {/* Image Area */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img 
          src={imgSrc} 
          alt={product.name} 
          onError={() => setImgSrc(FALLBACK_FOOD_IMG)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          loading="lazy"
        />
        
        {/* Badges top left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.popular && (
            <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-md shadow-red-600/30 flex items-center gap-1">
              <Flame size={11} className="fill-white" /> Hit
            </span>
          )}
          <span className="bg-slate-900/80 backdrop-blur-md text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
            <Star size={10} className="fill-amber-400 text-amber-400" /> {product.rating || '4.9'}
          </span>
          {product.calories && (
            <span className="bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
              {product.calories}
            </span>
          )}
        </div>

        {/* Favorite button top right */}
        <button
          onClick={handleToggleFavorite}
          aria-label="Sevimlilarga qo'shish"
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-slate-400 hover:text-red-600 transition-all hover:scale-110 active:scale-95 z-10"
        >
          <Heart size={16} className={favorite ? 'fill-red-600 text-red-600' : ''} />
        </button>

        {/* Quick hover eye button */}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
           <div className="bg-white/95 text-slate-900 px-3 py-1.5 rounded-full shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1 text-[11px] font-bold">
              <Eye size={14} /> Batafsil
           </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-3.5 flex flex-col flex-grow">
        <h3 className="font-black text-slate-900 text-sm leading-snug mb-1 line-clamp-1 uppercase tracking-tight group-hover:text-red-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-[11px] text-slate-500 mb-3 line-clamp-2 leading-relaxed flex-grow">
          {product.description}
        </p>
        
        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Narx</span>
            <span className="font-black text-slate-900 text-sm md:text-base leading-none">
              {formatCurrency(product.price).split(" ")[0]} <span className="text-[10px] font-semibold text-slate-500">so'm</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {inCartItem && (
              <span className="text-[10px] font-black bg-red-50 text-red-600 px-1.5 py-0.5 rounded-md border border-red-100">
                {inCartItem.quantity}x
              </span>
            )}
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
              <Button 
                size="icon"
                onClick={handleAddToCart}
                className="bg-red-600 text-white w-9 h-9 rounded-xl shadow-md shadow-red-200 hover:bg-red-700 active:scale-95 transition-all"
                aria-label={`${product.name} ni savatga qo'shish`}
              >
                <Plus size={18} strokeWidth={2.5} />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
