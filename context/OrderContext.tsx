import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Order, CartItem } from '../types';
import { formatCurrency } from '../utils/format';
import { dbService } from '../lib/db';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// XAVFSIZLIK: Token va ID'lar endi muhit o'zgaruvchilaridan olinadi
const TG_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || ''; 
const TG_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || '';     

interface OrderContextType {
  orders: Order[];
  placeOrder: (
    items: CartItem[], 
    clientTotal: number, 
    discount: number, 
    address: string, 
    phone: string, 
    userName: string, 
    paymentMethod: string, 
    deliveryFee?: number,
    options?: {
      deliveryTimeType?: 'asap' | 'scheduled';
      scheduledTime?: string;
      bonusUsed?: number;
      bonusEarned?: number;
      orderNote?: string;
      cutleryCount?: number;
    }
  ) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  assignCourier: (orderId: string, courierId: string, courierName?: string, courierPhone?: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const playNotificationSound = () => {
    try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio play failed due to browser policies', e));
    } catch (err) {
        console.error(err);
    }
};

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user, isAdmin } = useAuth();
  const prevOrdersRef = useRef<Order[]>([]);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const unsub = dbService.subscribe('orders', (data) => {
        const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        if (!isInitialMount.current) {
            const prevOrders = prevOrdersRef.current;
            
            // Check for new orders
            const newOrders = sorted.filter(newOrder => !prevOrders.find(o => o.id === newOrder.id));
            if (newOrders.length > 0 && typeof window !== 'undefined') {
                if (isAdmin || window.location.hash.includes('/courier')) {
                    newOrders.forEach(order => {
                         toast.info(`🔔 Yangi buyurtma keldi: #${order.id.slice(0, 5).toUpperCase()}`, {
                             duration: 8000,
                             description: `${order.userName || 'Mijoz'} - ${formatCurrency(order.total)}`
                         });
                    });
                    playNotificationSound();
                }
            }

            // Check for status changes (for current user)
            if (user) {
                const updatedOrders = sorted.filter(newOrder => {
                    const oldOrder = prevOrders.find(o => o.id === newOrder.id);
                    return oldOrder && oldOrder.status !== newOrder.status && (newOrder.phone === user.phone || newOrder.id === user.id);
                });

                if (updatedOrders.length > 0) {
                     updatedOrders.forEach(order => {
                          const statusMap = {
                              'new': 'Yangi',
                              'cooking': 'Oshxonada tayyorlanmoqda 👨‍🍳',
                              'delivering': 'Kuryer yo\'lda 🛵',
                              'completed': 'Yetkazildi ✅'
                          };
                          const message = `Yangi holat: ${statusMap[order.status] || order.status}`;
                          const title = `🚚 Buyurtma #${order.id.slice(0, 5).toUpperCase()}`;
                          
                          toast.success(`${title} holati o'zgardi!`, {
                              duration: 5000,
                              description: message
                          });

                          // Browser native push notification
                          if ('Notification' in window && Notification.permission === 'granted') {
                              try {
                                  new Notification(title, {
                                      body: message,
                                      icon: '/pwa-192x192.png'
                                  });
                              } catch (err) {
                                  navigator.serviceWorker?.ready.then(registration => {
                                      registration.showNotification(title, {
                                          body: message,
                                          icon: '/pwa-192x192.png'
                                      });
                                  }).catch(console.error);
                              }
                          }
                     });
                     playNotificationSound();
                }
            }
        }
        
        prevOrdersRef.current = sorted;
        isInitialMount.current = false;
        setOrders(sorted);
    });
    return () => unsub();
  }, [user, isAdmin]);

  const sendTelegramNotification = async (order: Order) => {
    const itemsList = order.items
      .map(i => `- ${i.name} (${i.quantity} x ${formatCurrency(i.price)})`)
      .join('\n');

    const scheduledInfo = order.deliveryTimeType === 'scheduled' && order.scheduledTime 
      ? `\n⏰ <b>Rejalashtirilgan vaqt:</b> ${order.scheduledTime}` 
      : `\n⚡ <b>Yetkazish:</b> Tezkor (30-40 daqiqa)`;

    const message = `
🍗 <b>Yangi Buyurtma!</b> #${order.id}
👤 <b>Mijoz:</b> ${order.userName || 'Mehmon'}
📞 <b>Tel:</b> ${order.phone}
📍 <b>Manzil:</b> ${order.address}${scheduledInfo}
💳 <b>To'lov:</b> ${order.paymentMethod}
${order.orderNote ? `📝 <b>Izoh:</b> ${order.orderNote}\n` : ''}
🛒 <b>Tarkibi:</b>\n${itemsList}

💰 <b>Jami:</b> ${formatCurrency(order.total)}
    `;

    const baseUrl = window.location.origin + window.location.pathname;
    const adminUrl = `${baseUrl}#/admin/orders`;
    const inlineKeyboard = [
      [
        { text: "🍳 Pishirilmoqda", url: `${adminUrl}?orderId=${order.id}&setStatus=cooking` },
        { text: "🚚 Yetkazish", url: `${adminUrl}?orderId=${order.id}&setStatus=delivering` }
      ],
      [
        { text: "✅ Yakunlash", url: `${adminUrl}?orderId=${order.id}&setStatus=completed` }
      ]
    ];

    // 1. Try Serverless API first (secure token on server)
    try {
      const serverlessRes = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order, messageText: message, inlineKeyboard })
      });
      if (serverlessRes.ok) {
        return;
      }
    } catch (err) {
      // Fall through to client-side fallback if serverless endpoint is not hosted
    }

    // 2. Client-side fallback if token provided in env
    if (!TG_BOT_TOKEN) {
      return;
    }

    try {
      const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`;
      await fetch(url, { 
          method: 'POST', 
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              chat_id: TG_CHAT_ID,
              text: message,
              parse_mode: 'HTML',
              reply_markup: {
                  inline_keyboard: inlineKeyboard
              }
          })
      });
    } catch (e) {
      console.error("Telegram xabarnoma yuborishda xatolik yuz berdi", e);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                toast.success("Bildirishnomalar yoqildi! Buyurtma holati o'zgarganda xabar olasiz.");
            }
        } catch (e) {}
    }
  };

  const placeOrder = async (
    items: CartItem[], 
    clientTotal: number, 
    discount: number, 
    address: string, 
    phone: string, 
    userName: string, 
    paymentMethod: string, 
    deliveryFee: number = 0,
    options?: {
      deliveryTimeType?: 'asap' | 'scheduled';
      scheduledTime?: string;
      bonusUsed?: number;
      bonusEarned?: number;
      orderNote?: string;
      cutleryCount?: number;
    }
  ): Promise<Order> => {
    requestNotificationPermission();

    const dbMenu = await dbService.getCollection('menu');
    
    let secureTotal = 0;
    const verifiedItems = items.map(clientItem => {
        const realItem = dbMenu.find((m: any) => m.id === clientItem.id);
        if (realItem) {
            secureTotal += realItem.price * clientItem.quantity;
            return { ...clientItem, price: realItem.price };
        }
        return clientItem;
    });

    const bonusUsedAmount = options?.bonusUsed || 0;
    const finalSecureTotal = Math.max(0, secureTotal - discount - bonusUsedAmount) + deliveryFee;

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      items: verifiedItems,
      total: finalSecureTotal,
      discount,
      bonusUsed: bonusUsedAmount,
      bonusEarned: options?.bonusEarned,
      deliveryFee,
      deliveryTimeType: options?.deliveryTimeType || 'asap',
      scheduledTime: options?.scheduledTime,
      orderNote: options?.orderNote,
      cutleryCount: options?.cutleryCount,
      status: 'new',
      date: new Date().toISOString(),
      address,
      phone,
      paymentMethod,
      userName,
      courierName: 'Jasur Shodiyev',
      courierPhone: '+998 (90) 876-54-32'
    }; 

    await dbService.saveItem('orders', newOrder);
    await sendTelegramNotification(newOrder);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        dbService.saveItem('orders', { ...order, status });
    }
  };

  const assignCourier = (orderId: string, courierId: string, courierName?: string, courierPhone?: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        dbService.saveItem('orders', { 
          ...order, 
          courierId, 
          status: 'delivering',
          courierName: courierName || 'Jasur Shodiyev',
          courierPhone: courierPhone || '+998 (90) 876-54-32'
        });
    }
  };

  return (
    <OrderContext.Provider value={{ orders, placeOrder, updateOrderStatus, assignCourier }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within OrderProvider');
  return context;
};
