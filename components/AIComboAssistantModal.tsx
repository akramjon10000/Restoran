import React, { useState } from 'react';
import { useMenu } from '../context/MenuContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { Sparkles, X, Check, ShoppingBag, Flame, ChefHat, ArrowRight, Wand2, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface ComboPreset {
  id: string;
  title: string;
  emoji: string;
  desc: string;
  targetBudget: number;
  peopleCount: number;
}

const PRESETS: ComboPreset[] = [
  { id: 'friends4', title: "4 kishilik do'stlar yig'ini", emoji: '👥', desc: 'Qanotchalar, burgerlar va ichimliklar to\'plami', targetBudget: 150000, peopleCount: 4 },
  { id: 'couple2', title: 'Romantik kechki ovqat', emoji: '💑', desc: '2 kishi uchun mazali burgerlar, desert va ichimlik', targetBudget: 90000, peopleCount: 2 },
  { id: 'quick_lunch', title: 'Tez va to\'yimli tushlik', emoji: '⚡', desc: '1 kishilik baquvvat to\'plam', targetBudget: 50000, peopleCount: 1 },
  { id: 'kids', title: 'Bolalar uchun to\'plam', emoji: '👶', desc: 'Yengil qarsildoq tovuq, fri va desert', targetBudget: 45000, peopleCount: 1 },
  { id: 'spicy_party', title: 'Super Achchiq Set', emoji: '🌶️', desc: 'Achchiq qanotchalar, qarsildoq strips va muzdek ichimlik', targetBudget: 110000, peopleCount: 3 }
];

export default function AIComboAssistantModal({ isOpen, onClose }: Props) {
  const { products } = useMenu();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [activePreset, setActivePreset] = useState<ComboPreset>(PRESETS[0]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCombo, setGeneratedCombo] = useState<{
    name: string;
    description: string;
    items: { product: Product; quantity: number }[];
    totalOriginal: number;
    totalDiscounted: number;
    savings: number;
  } | null>(null);

  if (!isOpen) return null;

  const generateCombo = (preset?: ComboPreset, userQuery?: string) => {
    setIsGenerating(true);
    const target = preset || activePreset;

    setTimeout(() => {
      let selectedItems: { product: Product; quantity: number }[] = [];
      let comboName = target.title;
      let comboDesc = target.desc;

      const buckets = products.filter(p => p.category === 'buckets');
      const burgers = products.filter(p => p.category === 'burgers');
      const chicken = products.filter(p => p.category === 'chicken');
      const snacks = products.filter(p => p.category === 'snacks');
      const drinks = products.filter(p => p.category === 'drinks');
      const desserts = products.filter(p => p.category === 'desserts');

      if (userQuery && userQuery.toLowerCase().includes('achchiq')) {
        comboName = "🌶️ AI Super Achchiq To'plam";
        comboDesc = "Maxsus achchiq qanotlar, burger va tetiklantiruvchi ichimliklar";
        if (chicken.length) selectedItems.push({ product: chicken[0], quantity: 2 });
        if (burgers.length) selectedItems.push({ product: burgers[0], quantity: 1 });
        if (snacks.length) selectedItems.push({ product: snacks[0], quantity: 2 });
        if (drinks.length) selectedItems.push({ product: drinks[0], quantity: 2 });
      } else if (target.id === 'friends4') {
        comboName = "🎉 Do'stlar Mega Siti (4 kishilik)";
        comboDesc = "Katta qanotchalar savati, 2 ta burger, 2 ta kartoshka fri va 4 ta ichimlik";
        if (buckets.length) selectedItems.push({ product: buckets[0], quantity: 1 });
        if (burgers.length) selectedItems.push({ product: burgers[0], quantity: 2 });
        if (snacks.length) selectedItems.push({ product: snacks[0], quantity: 2 });
        if (drinks.length) selectedItems.push({ product: drinks[0], quantity: 4 });
      } else if (target.id === 'couple2') {
        comboName = "💑 Juftliklar Seti";
        comboDesc = "2 ta shirali burger, qarsildoq pishloqli tayoqchalar, 2 ta ichimlik va desert";
        if (burgers.length) selectedItems.push({ product: burgers[0], quantity: 2 });
        if (snacks.length > 1) selectedItems.push({ product: snacks[1], quantity: 1 });
        if (drinks.length) selectedItems.push({ product: drinks[0], quantity: 2 });
        if (desserts.length) selectedItems.push({ product: desserts[0], quantity: 1 });
      } else if (target.id === 'kids') {
        comboName = "👶 Bolalar uchun Quvnoq Set";
        comboDesc = "Tovuq oyoqchalari, pishloqli tayoqchalar, donat va muzdek ichimlik";
        if (chicken.length > 1) selectedItems.push({ product: chicken[1] || chicken[0], quantity: 1 });
        if (snacks.length > 1) selectedItems.push({ product: snacks[1], quantity: 1 });
        if (desserts.length > 1) selectedItems.push({ product: desserts[1], quantity: 1 });
        if (drinks.length > 1) selectedItems.push({ product: drinks[1], quantity: 1 });
      } else {
        // Quick lunch or default
        comboName = "⚡ Tezkor & To'yimli Tushlik";
        comboDesc = "Katta shirali burger, kartoshka fri va muzdek ichimlik";
        if (burgers.length) selectedItems.push({ product: burgers[0], quantity: 1 });
        if (snacks.length) selectedItems.push({ product: snacks[0], quantity: 1 });
        if (drinks.length) selectedItems.push({ product: drinks[0], quantity: 1 });
      }

      // Calculate prices with 10% AI combo discount
      const totalOriginal = selectedItems.reduce((acc, i) => acc + (i.product.price * i.quantity), 0);
      const savings = Math.round(totalOriginal * 0.1);
      const totalDiscounted = totalOriginal - savings;

      setGeneratedCombo({
        name: comboName,
        description: comboDesc,
        items: selectedItems,
        totalOriginal,
        totalDiscounted,
        savings
      });

      setIsGenerating(false);
    }, 600);
  };

  const handleSelectPreset = (preset: ComboPreset) => {
    setActivePreset(preset);
    generateCombo(preset);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPrompt.trim()) {
      generateCombo(undefined, customPrompt);
    }
  };

  const handleAddAllToCart = () => {
    if (!generatedCombo) return;
    
    generatedCombo.items.forEach(item => {
      addToCart(item.product, item.quantity);
    });

    toast.success(`${generatedCombo.items.length} ta taom savatga qo'shildi! (-10% AI Chegirma)`);
    onClose();
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative overflow-hidden max-h-[92vh] overflow-y-auto"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-200">
              <ChefHat size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">AI Aqlli Oshpaz</h2>
                <span className="text-[10px] bg-red-100 text-red-700 font-black px-1.5 py-0.5 rounded">Gemini</span>
              </div>
              <p className="text-[11px] text-slate-500">Kompaniya yoki byudjetingizga mos tayyor set yig'ing</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Presets List */}
        <div className="my-4 space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Tayyor To'plam Shablonlari:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`p-2.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                  activePreset.id === p.id 
                    ? 'border-red-600 bg-red-50/70 shadow-sm' 
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="text-xl mb-1">{p.emoji}</div>
                <div className="font-black text-xs text-slate-900 line-clamp-1">{p.title}</div>
                <div className="text-[10px] font-bold text-red-600 mt-1">~{formatCurrency(p.targetBudget)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom prompt input */}
        <form onSubmit={handleCustomSubmit} className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Yoki o'z xohishingizni yozing (masalan: '100 mingga achchiq set')..."
              className="w-full pl-3.5 pr-20 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-all font-medium"
            />
            <button
              type="submit"
              disabled={isGenerating || !customPrompt.trim()}
              className="absolute right-1 top-1 bottom-1 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              Yig'ish
            </button>
          </div>
        </form>

        {/* Generated Result Card */}
        {isGenerating ? (
          <div className="py-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-100">
            <Wand2 size={28} className="text-red-600 animate-spin mx-auto" />
            <p className="text-xs font-black text-slate-700">Oshpaz eng yaxshi taomlarni saralamoqda...</p>
          </div>
        ) : generatedCombo ? (
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-red-600 text-white px-2 py-0.5 rounded-md">
                  10% AI Chegirma
                </span>
                <h3 className="text-base font-black uppercase tracking-tight mt-1.5 text-white">
                  {generatedCombo.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{generatedCombo.description}</p>
              </div>
              <button 
                onClick={() => generateCombo()}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                title="Qayta generatsiya qilish"
              >
                <RefreshCw size={15} />
              </button>
            </div>

            {/* Dishes in Combo */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {generatedCombo.items.map((item, idx) => (
                <div key={idx} className="bg-slate-800/80 rounded-2xl p-2.5 flex items-center justify-between border border-slate-700">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-700" 
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold truncate text-slate-100">{item.product.name}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">{item.quantity} dona</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-red-400 shrink-0">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase line-through block">
                  {formatCurrency(generatedCombo.totalOriginal)}
                </span>
                <div className="text-xl font-black text-red-400">
                  {formatCurrency(generatedCombo.totalDiscounted)}
                </div>
              </div>

              <Button
                onClick={handleAddAllToCart}
                className="bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider px-5 h-12 shadow-lg shadow-red-600/30 flex items-center gap-2 active:scale-95 transition-all"
              >
                <ShoppingBag size={16} />
                <span>Savatga qo'shish</span>
              </Button>
            </div>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
