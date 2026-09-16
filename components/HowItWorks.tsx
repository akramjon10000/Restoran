import React from 'react';
import { Utensils, MapPin, Bike, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

interface HowItWorksProps {
  onOpenHelp?: () => void;
}

const STEPS = [
  {
    step: '01',
    title: '1. Taomni Tanlang',
    desc: 'Menyudagi mazali fast-food, burger yoki ichimliklarni savatga qo\'shing.',
    icon: Utensils,
    color: 'from-red-500 to-rose-600',
    iconBg: 'bg-red-50 text-red-600'
  },
  {
    step: '02',
    title: '2. Manzilni Belgilang',
    desc: 'Xaritadan yoki geolokatsiya orqali yetkazish manzilini oson ko\'rsating.',
    icon: MapPin,
    color: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-50 text-amber-600'
  },
  {
    step: '03',
    title: '3. Qabul Qilib Oling',
    desc: 'Kuryer 30-40 daqiqada yetkazadi. To\'lovni qabulda yoki kartada qiling!',
    icon: Bike,
    color: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-50 text-emerald-600'
  }
];

export const HowItWorks: React.FC<HowItWorksProps> = ({ onOpenHelp }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-5 md:p-7 shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-red-600/30 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles size={11} /> Oddiy & Tezkor
            </span>
            <span className="text-xs text-slate-400 font-medium">Barchasi oson tushunarli</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mt-1 text-white">
            Qanday Buyurtma Beriladi?
          </h3>
        </div>

        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 self-start sm:self-auto uppercase tracking-wider"
          >
            <span>Savollaringiz bormi?</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>

      {/* 3 Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.step}
              whileHover={{ y: -3 }}
              className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/60 relative flex flex-col justify-between group hover:border-slate-600 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center shadow-sm`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-2xl font-black text-slate-700 group-hover:text-slate-500 transition-colors font-mono">
                    {s.step}
                  </span>
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">
                  {s.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>

              {idx === 0 && (
                <button
                  onClick={() => navigate('/menu')}
                  className="mt-4 pt-3 border-t border-slate-700 text-xs font-black text-red-400 hover:text-red-300 flex items-center gap-1 uppercase tracking-wider transition-colors"
                >
                  <span>Menyuni ko'rish</span>
                  <ArrowRight size={12} />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default HowItWorks;
