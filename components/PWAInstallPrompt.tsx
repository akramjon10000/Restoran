import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone, Check, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already running as standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!sessionStorage.getItem('pwa_prompt_dismissed')) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Also auto-show banner on initial visit if not dismissed
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem('pwa_prompt_dismissed') && !isInstalled) {
        setShowPrompt(true);
      }
    }, 1500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast.success("Oshxona.uz ilovasi o'rnatildi!");
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    } else {
      setShowGuideModal(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (isInstalled) return null;

  return (
    <>
      {showPrompt && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[70] bg-slate-900/95 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md border border-slate-800 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shrink-0 text-white font-black shadow-lg shadow-red-600/30">
              <Smartphone size={20} />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs truncate">Oshxona.uz PWA Ilovasi</h4>
              <p className="text-[10px] text-slate-300 truncate">Telefoningizga o'rnating va tezroq buyurtma bering!</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstall}
              className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1 shadow-md active:scale-95"
            >
              <Download size={13} /> O'rnatish
            </button>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Manual Install Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Smartphone size={28} />
              </div>
              <h3 className="font-black text-base text-slate-900">Oshxona.uz ilovasini o'rnatish</h3>
              <p className="text-xs text-slate-500 mt-1">Ilovani ekranga qo'shish yo'riqnomasi</p>
            </div>

            <div className="space-y-3 text-xs text-slate-700 font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                <p>Brauzeringiz menyusini (yuqori o'ngdagi 3 nuqta yoki <b>Ulashish <Share2 size={12} className="inline"/></b>) bosing.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                <p><b>"Ekranga qo'shish"</b> yoki <b>"Install app"</b> tugmasini tanlang.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                <p>Oshxona.uz ilovasi asosiy ekranda paydo bo'ladi!</p>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-colors"
            >
              Tushundim
            </button>
          </div>
        </div>
      )}
    </>
  );
}
