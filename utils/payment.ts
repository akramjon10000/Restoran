// To'lov tizimlari (Click, Payme, Uzum Pay) integratsiya utility

export interface PaymentConfig {
  clickServiceId?: string;
  clickMerchantId?: string;
  paymeMerchantId?: string;
  uzumServiceId?: string;
}

const CLICK_SERVICE_ID = import.meta.env.VITE_CLICK_SERVICE_ID || '32541';
const CLICK_MERCHANT_ID = import.meta.env.VITE_CLICK_MERCHANT_ID || '24185';
const PAYME_MERCHANT_ID = import.meta.env.VITE_PAYME_MERCHANT_ID || '64a7c8d9e1f23456789abcde';
const UZUM_SERVICE_ID = import.meta.env.VITE_UZUM_SERVICE_ID || 'restoran_uz';

/**
 * Click to'lov havolasini yaratish
 * URL formati: https://my.click.uz/services/pay?service_id=...&merchant_id=...&amount=...&transaction_param=...&return_url=...
 */
export const getClickPaymentUrl = (orderId: string, amount: number, returnUrl?: string): string => {
  const base = 'https://my.click.uz/services/pay';
  const retUrl = returnUrl || window.location.href;
  const params = new URLSearchParams({
    service_id: CLICK_SERVICE_ID,
    merchant_id: CLICK_MERCHANT_ID,
    amount: amount.toString(),
    transaction_param: orderId,
    return_url: retUrl
  });
  return `${base}?${params.toString()}`;
};

/**
 * Payme to'lov havolasini yaratish (Base64 encoding)
 * URL formati: https://checkout.paycom.uz/BASE64_PARAMS
 * Params: m=MERCHANT_ID;ac.order_id=ORDER_ID;a=AMOUNT_IN_TIYIN;c=RETURN_URL
 */
export const getPaymePaymentUrl = (orderId: string, amount: number, returnUrl?: string): string => {
  const retUrl = returnUrl || window.location.href;
  const amountInTiyin = Math.round(amount * 100);
  
  const rawParams = `m=${PAYME_MERCHANT_ID};ac.order_id=${orderId};a=${amountInTiyin};c=${encodeURIComponent(retUrl)}`;
  
  // Safe Base64 encoding for browser
  const base64Params = typeof window !== 'undefined' 
    ? window.btoa(unescape(encodeURIComponent(rawParams)))
    : Buffer.from(rawParams).toString('base64');
    
  return `https://checkout.paycom.uz/${base64Params}`;
};

/**
 * Uzum Pay to'lov havolasi
 */
export const getUzumPaymentUrl = (orderId: string, amount: number): string => {
  return `https://www.uzumbank.uz/pay?serviceId=${UZUM_SERVICE_ID}&orderId=${orderId}&amount=${amount}`;
};

/**
 * To'lov havolasidan QR-kod generatsiya qilish URL
 */
export const generatePaymentQrCodeUrl = (paymentUrl: string, size: number = 220): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(paymentUrl)}&margin=10`;
};
