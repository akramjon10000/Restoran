import { Order } from '../types';
import { formatCurrency } from './format';

/**
 * Termal POS chekni (58mm / 80mm) brauzer orqali to'g'ridan-to'g'ri chop etish
 */
export const printReceipt = (order: Order, type: 'kitchen' | 'customer' = 'customer') => {
  const printWindow = window.open('', '_blank', 'width=380,height=600');
  if (!printWindow) return;

  const dateStr = new Date(order.date).toLocaleString('uz-UZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  const itemsHtml = order.items
    .map(
      (item, idx) => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
        <span><b>${idx + 1}.</b> ${item.name} <span style="color:#555;">x${item.quantity}</span></span>
        <span><b>${formatCurrency(item.price * item.quantity)}</b></span>
      </div>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Chek #${order.id}</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        body {
          font-family: 'Courier New', Courier, monospace;
          width: 76mm;
          margin: 0 auto;
          padding: 8px;
          color: #000;
          background: #fff;
          font-size: 12px;
          line-height: 1.3;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .divider { border-top: 1px dashed #000; margin: 8px 0; }
        .double-divider { border-top: 2px solid #000; margin: 8px 0; }
        .bold { font-weight: bold; }
        .header-title { font-size: 18px; font-weight: 900; letter-spacing: -0.5px; }
        .badge { display: inline-block; padding: 2px 6px; border: 1px solid #000; font-size: 11px; font-weight: bold; border-radius: 4px; }
        @media print {
          body { width: 100%; padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="text-center">
        <div class="header-title">RESTORAN UZBEKISTAN</div>
        <div>Toshkent, Amir Temur 1-uy</div>
        <div>Tel: +998 (71) 123-45-67</div>
        <div class="divider"></div>
        <div class="badge">${type === 'kitchen' ? 'OSHXONA NUSXASI' : 'MIJOZ CHEKI'}</div>
        <div style="font-size: 16px; font-weight: 900; margin-top: 4px;">BUYURTMA #${order.id.slice(0, 7).toUpperCase()}</div>
        <div style="font-size: 11px; color: #333;">${dateStr}</div>
      </div>

      <div class="divider"></div>
      <div><b>Mijoz:</b> ${order.userName || 'Mijoz'}</div>
      <div><b>Tel:</b> ${order.phone}</div>
      <div><b>Manzil:</b> ${order.address}</div>
      <div><b>To'lov turi:</b> ${order.paymentMethod}</div>
      ${order.orderNote ? `<div><b>Izoh:</b> ${order.orderNote}</div>` : ''}

      <div class="double-divider"></div>
      <div style="font-weight: bold; margin-bottom: 4px;">BUYURTMA TARKIBI:</div>
      ${itemsHtml}

      <div class="divider"></div>
      ${order.discount ? `<div style="display: flex; justify-content: space-between;"><span>Chegirma:</span><span>-${formatCurrency(order.discount)}</span></div>` : ''}
      ${order.bonusUsed ? `<div style="display: flex; justify-content: space-between;"><span>Bonusdan:</span><span>-${formatCurrency(order.bonusUsed)}</span></div>` : ''}
      ${order.deliveryFee ? `<div style="display: flex; justify-content: space-between;"><span>Yetkazish:</span><span>${formatCurrency(order.deliveryFee)}</span></div>` : ''}
      
      <div class="double-divider"></div>
      <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 900;">
        <span>JAMI:</span>
        <span>${formatCurrency(order.total)}</span>
      </div>

      <div class="divider"></div>
      <div class="text-center" style="margin-top: 10px; font-size: 11px;">
        <div>Xaridingiz uchun rahmat! Yoqimli ishtaha! 🍗</div>
        <div style="margin-top: 4px; font-size: 9px; color: #555;">restoran.uz</div>
      </div>

      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
