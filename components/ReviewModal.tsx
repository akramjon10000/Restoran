import React, { useState } from 'react';
import { Star, X, Sparkles, ThumbsUp, Heart, CheckCircle2, MessageSquare } from 'lucide-react';
import { dbService } from '../lib/db';
import { useLoyalty } from '../context/LoyaltyContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  userName?: string;
  productId?: string;
  productName?: string;
}

const QUICK_TAGS = [
  'Juda mazali 😋',
  'Issiq yetib keldi ♨️',
  'Tezkor yetkazish ⚡',
  'Xushmuomala kuryer 🛵',
  'Sifatli qadoqlangan 📦',
  'Yana buyurtma beraman ❤️'
];

export default function ReviewModal({ isOpen, onClose, orderId, userName, productId, productName }: Props) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { addBonusReward } = useLoyalty();

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fullComment = [
        selectedTags.join(', '),
        comment.trim()
      ].filter(Boolean).join('. ');

      const newReview = {
        id: Math.random().toString(36).substr(2, 9),
        orderId,
        userName: userName || 'Mijoz',
        productId: productId || '',
        productName: productName || '',
        rating,
        comment: fullComment || "A'lo darajada!",
        date: new Date().toISOString()
      };

      await dbService.saveItem('reviews', newReview);
      
      // Reward user with 2000 points for honest review!
      addBonusReward(2000, "Fikr bildirganingiz uchun");
      
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error("Sharhni saqlashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Rahmat! Fikringiz qabul qilindi</h3>
            <p className="text-xs text-slate-500">
              Sizga <span className="font-black text-amber-600">+2 000 so'm bonus</span> ball taqdim etildi!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center pt-2">
              <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
                <Sparkles size={13} className="text-amber-500" /> +2 000 bonus ball oling
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                {productName ? `${productName} qanday edi?` : 'Buyurtmani baholang'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Fikringiz biz uchun va boshqa mijozlar uchun juda muhim!
              </p>
            </div>

            {/* Star Rating Selector */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star 
                    size={36} 
                    className={`${
                      (hoverRating || rating) >= star 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-slate-200'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>

            <div className="text-center">
              <span className="text-xs font-black text-amber-600 uppercase tracking-wider">
                {rating === 5 ? "A'lo darajada! 😍" : rating === 4 ? "Yaxshi 👍" : rating === 3 ? "O'rtacha 🙂" : "Kamchiliklar bor 🙁"}
              </span>
            </div>

            {/* Quick tags */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Tezkor taassurot:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all ${
                        isSelected 
                          ? 'bg-red-50 border-red-500 text-red-600 shadow-sm' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment text */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Batafsil fikringiz (ixtiyoriy):
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Taom mazasi, kuryer tezligi yoki boshqa takliflaringiz..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-all resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-red-200 active:scale-95 transition-all"
            >
              {loading ? 'Yuborilmoqda...' : 'Sharhni yuborish'}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
