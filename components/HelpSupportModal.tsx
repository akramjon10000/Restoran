import React, { useState } from 'react';
import { X, Phone, HelpCircle, MessageCircle, Clock, ShieldCheck, CreditCard, Gift, Truck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
  icon: any;
}

const FAQS: FAQItem[] = [
  {
    question: "Qanday qilib buyurtma berish mumkin?",
    answer: "1. Menyudan kerakli taomlarni 'Savatga qo'shish' tugmasi orqali tanlang. 2. Savatga o'ting va manzilingizni belgilang. 3. To'lov turini (Naqd, Click, Payme) tanlab, 'Rasmiylashtirish' tugmasini bosing. Kuryer 30-40 daqiqada yetkazadi!",
    icon: Truck
  },
  {
    question: "Yetkazib berish narxi qancha?",
    answer: "Buyurtmangiz 150 000 so'mdan oshsa, yetkazib berish MUTLAQO BEPUL! Undan kam buyurtmalar uchun belgilangan minimal yetkazib berish to'lovi (15 000 so'm) hisoblanadi.",
    icon: ShieldCheck
  },
  {
    question: "Qanday to'lov usullari mavjud?",
    answer: "Siz buyurtma kelganda naqd pulda, kuryer terminalida bank kartasi orqali yoki sayt/ilova orqali Click, Payme va Uzum Pay orqali qulay to'lashingiz mumkin.",
    icon: CreditCard
  },
  {
    question: "Bonus va Keshbek qanday ishlaydi?",
    answer: "Har bir buyurtmangiz uchun VIP darajangizga qarab 3% dan 7% gacha keshbek olasiz. Yig'ilgan bonus pullaringizni keyingi buyurtmalarda to'liq chegirma sifatida ishlatishingiz mumkin (1 bonus = 1 so'm)!",
    icon: Gift
  },
  {
    question: "Buyurtma qancha vaqtda yetib keladi?",
    answer: "O'rtacha yetkazish vaqti 30-45 daqiqa. Profilingizdagi 'Jonli kuzatish' tugmasi orqali taomingiz oshxonada tayyorlanishi va kuryer harakatini xaritada ko'rib turishingiz mumkin.",
    icon: Clock
  }
];

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ isOpen, onClose }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  const handleCall = () => {
    window.location.href = 'tel:+998711234567';
  };

  const handleTelegram = () => {
    window.open('https://t.me/oshxona_support', '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white p-5 flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white">
                <HelpCircle size={24} />
              </div>
              <div>
                <h3 className="font-black text-lg uppercase tracking-tight">Yordam va Qo'llab-quvvatlash</h3>
                <p className="text-xs text-red-100 font-medium">Barcha savollaringizga oson javoblar</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Contact Buttons */}
          <div className="p-4 bg-slate-50 border-b border-slate-100 grid grid-cols-2 gap-3">
            <button
              onClick={handleCall}
              className="bg-white p-3 rounded-2xl border border-slate-200 hover:border-red-400 flex items-center gap-3 transition-all shadow-sm group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors shrink-0">
                <Phone size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Qaynoq aloqa</span>
                <span className="text-xs font-black text-slate-900">+998 71 123-45-67</span>
              </div>
            </button>

            <button
              onClick={handleTelegram}
              className="bg-white p-3 rounded-2xl border border-slate-200 hover:border-blue-400 flex items-center gap-3 transition-all shadow-sm group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                <MessageCircle size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Telegram</span>
                <span className="text-xs font-black text-slate-900">@oshxona_support</span>
              </div>
            </button>
          </div>

          {/* FAQ Accordion List */}
          <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1 mb-2">
              Ko'p beriladigan savollar
            </h4>

            {FAQS.map((faq, index) => {
              const isOpen = openIndex === index;
              const Icon = faq.icon;
              return (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen ? 'border-red-200 bg-red-50/40 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full p-3.5 flex items-center justify-between text-left gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isOpen ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <span className="font-bold text-xs text-slate-900">{faq.question}</span>
                    </div>
                    <ChevronRight
                      size={16}
                      className={`text-slate-400 transition-transform ${isOpen ? 'rotate-90 text-red-600' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-3.5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-red-100/60"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] text-slate-500 font-medium">Har kuni 09:00 dan 03:00 gacha xizmatingizdamiz</p>
            <Button
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 h-9 rounded-xl"
            >
              Tushundim
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default HelpSupportModal;
