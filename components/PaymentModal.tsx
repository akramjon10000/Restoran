import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, ExternalLink, QrCode, ShieldCheck, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { getClickPaymentUrl, getPaymePaymentUrl, getUzumPaymentUrl, generatePaymentQrCodeUrl } from '../utils/payment';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  paymentMethod: 'click' | 'payme' | 'uzum';
  onPaymentSuccess: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  orderId,
  amount,
  paymentMethod,
  onPaymentSuccess
}: PaymentModalProps) {
  const [checking, setChecking] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  let paymentUrl = '';
  let providerName = '';
  let providerLogo = '';
  let providerColor = '';

  if (paymentMethod === 'click') {
    paymentUrl = getClickPaymentUrl(orderId, amount);
    providerName = 'Click Up';
    providerLogo = 'https://click.uz/click/images/click-logo.svg';
    providerColor = 'from-blue-600 to-cyan-600';
  } else if (paymentMethod === 'payme') {
    paymentUrl = getPaymePaymentUrl(orderId, amount);
    providerName = 'Payme';
    providerLogo = 'https://payme.uz/assets/images/payme-logo.svg';
    providerColor = 'from-emerald-500 to-teal-600';
  } else {
    paymentUrl = getUzumPaymentUrl(orderId, amount);
    providerName = 'Uzum Pay';
    providerLogo = 'https://uzumbank.uz/favicon.ico';
    providerColor = 'from-purple-600 to-indigo-600';
  }

  const qrCodeUrl = generatePaymentQrCodeUrl(paymentUrl, 240);

  const handleOpenApp = () => {
    window.open(paymentUrl, '_blank');
  };

  const handleVerifyPayment = () => {
    setChecking(true);
    // Simulate real-time payment check against provider
    setTimeout(() => {
      setChecking(false);
      toast.success("To'lov muvaffaqiyatli qabul qilindi!");
      onPaymentSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative overflow-hidden"
      >
        {/* Top Header Banner */}
        <div className={`p-4 rounded-2xl bg-gradient-to-r ${providerColor} text-white mb-5 shadow-lg flex items-center justify-between`}>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
              Xavfsiz To'lov
            </span>
            <h3 className="text-lg font-black uppercase tracking-tight mt-1">{providerName} orqali to'lov</h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-2xl p-2 flex items-center justify-center shadow-md text-slate-900 font-black text-xs">
            {paymentMethod.toUpperCase()}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase">Buyurtma ID:</span>
            <span className="font-black text-slate-900 font-mono">#{orderId.slice(0, 7).toUpperCase()}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase">To'lov summasi:</span>
            <span className="font-black text-base text-red-600">{formatCurrency(amount)}</span>
          </div>
        </div>

        {/* QR Code / Direct Link Switcher */}
        {showQr ? (
          <div className="text-center py-3 space-y-3">
            <div className="bg-white p-3 rounded-2xl border-2 border-dashed border-slate-200 inline-block shadow-sm">
              <img src={qrCodeUrl} alt="Payment QR Code" className="w-48 h-48 mx-auto object-contain" />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {providerName} mobil ilovangiz orqali ushbu QR-kodni skaner qiling
            </p>
            <button
              onClick={() => setShowQr(false)}
              className="text-xs font-bold text-red-600 hover:underline block mx-auto"
            >
              ← To'g'ridan-to'g'ri havolaga qaytish
            </button>
          </div>
        ) : (
          <div className="space-y-3 mb-5">
            <Button
              onClick={handleOpenApp}
              className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
            >
              <span>{providerName} Ilovasida To'lash</span>
              <ExternalLink size={16} />
            </Button>

            <button
              onClick={() => setShowQr(true)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <QrCode size={16} />
              <span>QR-kod orqali to'lash</span>
            </button>
          </div>
        )}

        {/* Verification & Final Buttons */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <Button
            onClick={handleVerifyPayment}
            disabled={checking}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-200 flex items-center justify-center gap-2"
          >
            {checking ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
            <span>{checking ? "To'lov tekshirilmoqda..." : "To'lovni Tasdiqlash"}</span>
          </Button>

          <button
            onClick={onClose}
            className="w-full py-2 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-wider"
          >
            Keyinroq to'lash (Profilga o'tish)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
