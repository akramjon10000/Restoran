import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Mic, MicOff, Loader2, Volume2, AlertCircle } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useLoyalty } from '../context/LoyaltyContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { DEFAULT_SYSTEM_INSTRUCTION, DEFAULT_LIVE_MODEL, LIVE_FALLBACK_MODELS } from '../constants';
import { createBlob, decode, decodeAudioData, encode } from '../utils/audio';
import { toast } from 'sonner';
import { sound } from '../utils/sound';

const addToCartDecl: FunctionDeclaration = {
  name: 'addToCart',
  description: 'Add an item to the cart only after user confirmation and quantity is specified.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      itemName: { type: Type.STRING, description: 'The exact name of the product from the menu.' },
      quantity: { type: Type.NUMBER, description: 'The number of items to add. Must be confirmed by user.' }
    },
    required: ['itemName', 'quantity']
  }
};

const removeFromCartDecl: FunctionDeclaration = {
  name: 'removeFromCart',
  description: 'Remove a specific item completely from the cart.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      itemName: { type: Type.STRING, description: 'The exact name of the product to remove from the cart.' }
    },
    required: ['itemName']
  }
};

const getCartStatusDecl: FunctionDeclaration = {
  name: 'getCartStatus',
  description: 'Get detailed current cart items, their exact quantities, and the total order price.',
  parameters: { type: Type.OBJECT, properties: {} }
};

const confirmCheckoutDecl: FunctionDeclaration = {
  name: 'confirmCheckout',
  description: 'Navigate the user to the cart/checkout page.',
  parameters: { type: Type.OBJECT, properties: {} }
};

const setDeliveryAddressDecl: FunctionDeclaration = {
  name: 'setDeliveryAddress',
  description: 'Set or update the customer delivery address when the user mentions their address, street, house, or landmark in Uzbekistan (e.g., "Yunusobod 4-mavze 12-uy", "Nurafshon ko\'chasi").',
  parameters: {
    type: Type.OBJECT,
    properties: {
      address: {
        type: Type.STRING,
        description: 'The full delivery address stated by the customer.'
      }
    },
    required: ['address']
  }
};

const setCustomerInfoDecl: FunctionDeclaration = {
  name: 'setCustomerInfo',
  description: 'Save customer recipient contact info: full name and phone number.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: 'Customer first or full name (e.g., "Akramjon", "Alisher").' },
      phone: { type: Type.STRING, description: 'Customer phone number (e.g., "+998901234567" or "90 123 45 67").' }
    },
    required: ['phone']
  }
};

const completeOrderDecl: FunctionDeclaration = {
  name: 'completeOrder',
  description: 'SUBMIT AND FINALIZE the order to the kitchen. Call this after customer confirms their order, products, delivery address, name, and phone number.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      customerName: { type: Type.STRING, description: 'Customer name (optional if already provided).' },
      phoneNumber: { type: Type.STRING, description: 'Customer phone number (optional if already provided).' },
      paymentMethod: { type: Type.STRING, description: 'Payment method: "cash" (naqd pul), "click", or "payme". Default is "cash".' },
      orderNote: { type: Type.STRING, description: 'Special delivery or kitchen instructions.' }
    }
  }
};

const LiveAgent: React.FC = () => {
  const [active, setActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { addToCart, removeFromCart, clearCart, items, total } = useCart();
  const { products } = useMenu();
  const { user, login, currentAddress, setCurrentAddress, orderType, setOrderType, selectedBranch, deliveryFee } = useAuth();
  const { placeOrder } = useOrders();
  const { earnPoints } = useLoyalty();
  const navigate = useNavigate();
  const location = useLocation();

  const addToCartRef = useRef(addToCart);
  const removeFromCartRef = useRef(removeFromCart);
  const clearCartRef = useRef(clearCart);
  const productsRef = useRef(products);
  const itemsRef = useRef(items);
  const totalRef = useRef(total);
  const userRef = useRef(user);
  const loginRef = useRef(login);
  const currentAddressRef = useRef(currentAddress);
  const setCurrentAddressRef = useRef(setCurrentAddress);
  const orderTypeRef = useRef(orderType);
  const setOrderTypeRef = useRef(setOrderType);
  const selectedBranchRef = useRef(selectedBranch);
  const deliveryFeeRef = useRef(deliveryFee);
  const placeOrderRef = useRef(placeOrder);
  const earnPointsRef = useRef(earnPoints);
  const navigateRef = useRef(navigate);
  const locationRef = useRef(location);
  const speakingRef = useRef(false);

  useEffect(() => {
    addToCartRef.current = addToCart;
    removeFromCartRef.current = removeFromCart;
    clearCartRef.current = clearCart;
    productsRef.current = products;
    itemsRef.current = items;
    totalRef.current = total;
    userRef.current = user;
    loginRef.current = login;
    currentAddressRef.current = currentAddress;
    setCurrentAddressRef.current = setCurrentAddress;
    orderTypeRef.current = orderType;
    setOrderTypeRef.current = setOrderType;
    selectedBranchRef.current = selectedBranch;
    deliveryFeeRef.current = deliveryFee;
    placeOrderRef.current = placeOrder;
    earnPointsRef.current = earnPoints;
    navigateRef.current = navigate;
    locationRef.current = location;
  }, [addToCart, removeFromCart, clearCart, products, items, total, user, login, currentAddress, setCurrentAddress, orderType, setOrderType, selectedBranch, deliveryFee, placeOrder, earnPoints, navigate, location]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const findProduct = (name: string) => {
    if (!name) return null;
    const list = productsRef.current;
    const cleanSearch = name.toLowerCase().trim()
        .replace(/(ni|dan|ga|da|lar|cha|ni|ning|da|ga|ni)$/, '') // Suffixes
        .trim();

    let found = list.find(p => p.name.toLowerCase() === cleanSearch);
    if (!found) found = list.find(p => p.name.toLowerCase().includes(cleanSearch) || cleanSearch.includes(p.name.toLowerCase()));
    return found || null;
  };

  const stopAudio = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.suspend();
    }
    sourcesRef.current.forEach(source => { try { source.stop(); } catch(e) {} });
    sourcesRef.current.clear();
    setSpeaking(false);
    speakingRef.current = false;
  }, []);

  const liveSessionRef = useRef<any>(null);
  const activeRef = useRef(false);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const disconnect = useCallback(() => {
    activeRef.current = false;
    if (liveSessionRef.current) {
      try { liveSessionRef.current.close(); } catch(e) {}
      liveSessionRef.current = null;
    }
    sessionRef.current = null;
    if (scriptProcessorRef.current) {
      try { scriptProcessorRef.current.disconnect(); } catch(e) {}
      scriptProcessorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (inputContextRef.current) { 
      try { inputContextRef.current.close(); } catch(e) {}
      inputContextRef.current = null; 
    }
    if (audioContextRef.current) { 
      try { audioContextRef.current.close(); } catch(e) {}
      audioContextRef.current = null; 
    }
    setActive(false);
    setConnecting(false);
    setSpeaking(false);
    speakingRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const connect = useCallback(async () => {
    sound.playMicActivate();
    if (!process.env.API_KEY) {
      toast.error("API Key missing.");
      return;
    }

    try {
      setError(null);
      setConnecting(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputContextRef.current = inputContext;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = audioContext;
      nextStartTimeRef.current = 0;

      const menuList = productsRef.current.map(p => `- ${p.name}: ${p.price} so'm`).join('\n');
      const savedInstruction = localStorage.getItem('ai_system_instruction') || DEFAULT_SYSTEM_INSTRUCTION;
      
      const cartContentsText = itemsRef.current.length > 0 
        ? itemsRef.current.map(i => `${i.quantity} ta ${i.name}`).join(', ') 
        : "Savat bo'm-bo'sh";

      const currentUserName = userRef.current?.name || localStorage.getItem('restoran_guest_name') || '';
      const currentUserPhone = userRef.current?.phone || localStorage.getItem('restoran_guest_phone') || '';

      const dynamicInstruction = `
        ${savedInstruction}
        
        MENYU RO'YXATI:
        ${menuList}

        JORIY HOLAT: 
        Hozirgi sahifa: ${locationRef.current.pathname}
        Savatdagi mahsulotlar: ${cartContentsText}
        Savatning umumiy summasi: ${totalRef.current} so'm.
        Yetkazib berish manzili: ${currentAddressRef.current || "Hali belgilanmagan"}
        Yetkazish turi: ${orderTypeRef.current === 'delivery' ? 'Yetkazib berish' : 'Filialdan olib ketish'}
        Mijoz ismi: ${currentUserName || "Hali aytilmagan"}
        Mijoz telefoni: ${currentUserPhone || "Hali aytilmagan"}
      `;

      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        toast.error("API Key ko'rsatilmagan.");
        setConnecting(false);
        return;
      }

      const preferredModel = localStorage.getItem('ai_live_model') || (process.env as any).GEMINI_LIVE_MODEL || DEFAULT_LIVE_MODEL;
      const modelsToTry = Array.from(new Set([preferredModel, ...LIVE_FALLBACK_MODELS]));

      const ai = new GoogleGenAI({ apiKey });
      let hasOpened = false;

      const attemptConnection = (modelIndex: number) => {
        if (!activeRef.current && modelIndex > 0) return;
        if (modelIndex >= modelsToTry.length) {
          setError("Ovozli AI ga ulanib bo'lmadi. Barcha modellar sinab ko'rildi.");
          setConnecting(false);
          disconnect();
          return;
        }

        const currentModel = modelsToTry[modelIndex];
        console.log(`[LiveAgent] Ulanish boshlanmoqda: ${currentModel}`);

        const sessionPromise = ai.live.connect({
          model: currentModel,
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: dynamicInstruction,
            tools: [{ functionDeclarations: [addToCartDecl, removeFromCartDecl, getCartStatusDecl, confirmCheckoutDecl, setDeliveryAddressDecl, setCustomerInfoDecl, completeOrderDecl] }],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
          },
          callbacks: {
            onopen: () => {
              hasOpened = true;
              setConnecting(false);
              setActive(true);
              if (currentModel !== preferredModel) {
                toast.info(`'${currentModel}' modeli orqali ulandi.`, { id: 'voice-status' });
              } else {
                toast.success("Ovozli yordamchi ulondi!", { id: 'voice-status' });
              }

              if (inputContextRef.current && streamRef.current && !scriptProcessorRef.current) {
                const source = inputContextRef.current.createMediaStreamSource(streamRef.current);
                const scriptProcessor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
                scriptProcessor.onaudioprocess = (e) => {
                  if (!activeRef.current) return;
                  const inputData = e.inputBuffer.getChannelData(0);
                  if (liveSessionRef.current) {
                    try {
                      liveSessionRef.current.sendRealtimeInput({ audio: createBlob(inputData) });
                    } catch (err) {
                      console.warn("Failed sending realtime audio input:", err);
                    }
                  }
                };
                source.connect(scriptProcessor);
                scriptProcessor.connect(inputContextRef.current.destination);
                scriptProcessorRef.current = scriptProcessor;
              }
            },
            onmessage: async (msg: LiveServerMessage) => {
              if ((msg as any).goAway || (msg as any).goaway) {
                console.log("Received GoAway signal from Gemini Live server. Closing session gracefully.");
                toast.info("Sessiya vaqti tugadi. Aloqa uzildi.");
                disconnect();
                return;
              }

              const parts = msg.serverContent?.modelTurn?.parts;
              if (parts && parts.length > 0) {
                for (const part of parts) {
                  if (part.inlineData?.data) {
                    const audioData = part.inlineData.data;
                    setSpeaking(true);
                    speakingRef.current = true;
                    const ctx = audioContextRef.current;
                    if (ctx) {
                      if (ctx.state === 'suspended') await ctx.resume();
                      
                      const now = ctx.currentTime;
                      if (nextStartTimeRef.current < now) nextStartTimeRef.current = now + 0.08;
                      
                      try {
                        const audioBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
                        const source = ctx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(ctx.destination);
                        source.onended = () => {
                            sourcesRef.current.delete(source);
                            if(sourcesRef.current.size === 0) {
                                setSpeaking(false);
                                speakingRef.current = false;
                            }
                        };
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        sourcesRef.current.add(source);
                      } catch (decodeErr) {
                        console.error("Audio decode error:", decodeErr);
                      }
                    }
                  } else if (part.text && 'speechSynthesis' in window) {
                    // Fallback TTS if text part is returned
                    try {
                      const utterance = new SpeechSynthesisUtterance(part.text);
                      utterance.lang = 'uz-UZ';
                      utterance.onstart = () => setSpeaking(true);
                      utterance.onend = () => setSpeaking(false);
                      window.speechSynthesis.speak(utterance);
                    } catch (e) {}
                  }
                }
              }

              if (msg.serverContent?.interrupted) stopAudio();

              if (msg.toolCall) {
                  const responses = [];
                  for (const fc of msg.toolCall.functionCalls) {
                      let result: any = { status: 'ok' };
                      
                      if (fc.name === 'addToCart' || fc.name === 'addToOrder') {
                          const { itemName, quantity } = fc.args as any;
                          const product = findProduct(itemName);
                          if (product) {
                              addToCartRef.current(product, Number(quantity) || 1);
                              result = { success: true, message: `${quantity} ta ${product.name} savatga qo'shildi.` };
                          } else {
                              result = { error: 'product_not_found', message: "Kechirasiz, menyuda bunday mahsulot topilmadi." };
                          }
                      } else if (fc.name === 'removeFromCart') {
                          const { itemName } = fc.args as any;
                          const cleanSearch = String(itemName).toLowerCase().trim();
                          const foundItem = itemsRef.current.find(i => i.name.toLowerCase().includes(cleanSearch) || cleanSearch.includes(i.name.toLowerCase()));
                          
                          if (foundItem) {
                              removeFromCartRef.current(foundItem.id);
                              result = { success: true, message: `${foundItem.name} savatdan olib tashlandi.` };
                          } else {
                              result = { error: 'not_in_cart', message: "Bu mahsulot savatda yo'q." };
                          }
                      } else if (fc.name === 'getCartStatus') {
                          const detailedItems = itemsRef.current.map(i => ({ name: i.name, quantity: i.quantity, price: i.price }));
                          result = { total: totalRef.current, count: itemsRef.current.reduce((a,b)=>a+b.quantity,0), items: detailedItems };
                      } else if (fc.name === 'setDeliveryAddress') {
                          const { address } = fc.args as any;
                          if (address && String(address).trim()) {
                              const cleanAddr = String(address).trim();
                              setCurrentAddressRef.current(cleanAddr);
                              setOrderTypeRef.current('delivery');
                              try {
                                  localStorage.setItem('restoran_address', cleanAddr);
                                  localStorage.setItem('restoran_order_type', 'delivery');
                              } catch (err) {}
                              sound.playAddToCart();
                              toast.success(`Yetkazib berish manzili: ${cleanAddr}`, { id: 'voice-address' });
                              result = { success: true, message: `Yetkazib berish manzili qabul qilindi: ${cleanAddr}` };
                          } else {
                              result = { error: 'invalid_address', message: "Manzil aniqlanmadi, iltimos qayta ayting." };
                          }
                      } else if (fc.name === 'setCustomerInfo') {
                          const { name, phone } = fc.args as any;
                          const cleanName = String(name || '').trim();
                          const cleanPhone = String(phone || '').replace(/[^\d+]/g, '').trim();
                          if (cleanPhone && cleanPhone.length >= 7) {
                              loginRef.current(cleanPhone, cleanName || 'Mijoz');
                              try {
                                  localStorage.setItem('restoran_guest_name', cleanName || 'Mijoz');
                                  localStorage.setItem('restoran_guest_phone', cleanPhone);
                                  window.dispatchEvent(new CustomEvent('customer-info-updated'));
                              } catch(e) {}
                              sound.playAddToCart();
                              toast.success(`Qabul qiluvchi: ${cleanName || 'Mijoz'} (${cleanPhone})`, { id: 'voice-customer' });
                              result = { success: true, message: `Ma'lumotlaringiz saqlandi: ${cleanName || 'Mijoz'}, ${cleanPhone}` };
                          } else {
                              result = { error: 'invalid_phone', message: "Telefon raqam aniqlanmadi. Iltimos telefon raqamingizni ayting." };
                          }
                      } else if (fc.name === 'completeOrder') {
                          const { customerName, phoneNumber, paymentMethod, orderNote } = (fc.args as any) || {};
                          if (itemsRef.current.length === 0) {
                              result = { error: 'empty_cart', message: "Savatingiz bo'sh. Iltimos taom tanlang." };
                          } else {
                              let finalName = customerName || userRef.current?.name || localStorage.getItem('restoran_guest_name') || '';
                              let finalPhone = phoneNumber || userRef.current?.phone || localStorage.getItem('restoran_guest_phone') || '';
                              finalName = String(finalName).trim();
                              finalPhone = String(finalPhone).trim();

                              if (!finalPhone || finalPhone.replace(/[^\d]/g, '').length < 7) {
                                  navigateRef.current('/cart');
                                  result = { 
                                      error: 'missing_phone', 
                                      message: "Buyurtmani yakunlash uchun telefon raqamingiz kerak. Iltimos telefon raqamingizni ayting." 
                                  };
                              } else {
                                  if (!finalName) finalName = 'Mijoz';
                                  loginRef.current(finalPhone, finalName);
                                  try {
                                      localStorage.setItem('restoran_guest_name', finalName);
                                      localStorage.setItem('restoran_guest_phone', finalPhone);
                                      window.dispatchEvent(new CustomEvent('customer-info-updated'));
                                  } catch(e) {}

                                  const FREE_THRESHOLD = 150000;
                                  const activeDeliveryFee = totalRef.current >= FREE_THRESHOLD ? 0 : (orderTypeRef.current === 'delivery' ? (deliveryFeeRef.current || 15000) : 0);
                                  const finalTotal = totalRef.current + activeDeliveryFee;
                                  const finalAddress = orderTypeRef.current === 'delivery' 
                                      ? (currentAddressRef.current || "Toshkent shahar") 
                                      : (selectedBranchRef.current?.name || "Filialdan olib ketish");

                                  const paymentMethodNorm = String(paymentMethod || 'cash').toLowerCase();
                                  const paymentLabel = paymentMethodNorm.includes('click') 
                                      ? 'Click Online' 
                                      : (paymentMethodNorm.includes('payme') ? 'Payme Online' : 'Naqd pul (Yetkazilganda)');

                                  try {
                                      const createdOrder = await placeOrderRef.current(
                                          itemsRef.current,
                                          finalTotal,
                                          0,
                                          finalAddress,
                                          finalPhone,
                                          finalName,
                                          paymentLabel,
                                          activeDeliveryFee,
                                          {
                                              deliveryTimeType: 'asap',
                                              orderNote: orderNote || 'Ovozli yordamchi orqali rasmiylashtirildi'
                                          }
                                      );

                                      earnPointsRef.current(finalTotal);
                                      clearCartRef.current();
                                      sound.playOrderSuccess();
                                      toast.success(`Buyurtma #${createdOrder.id.slice(0, 5).toUpperCase()} qabul qilindi! 🎉`, { duration: 6000 });

                                      navigateRef.current('/profile');
                                      result = { 
                                          success: true, 
                                          orderId: createdOrder.id, 
                                          message: `Buyurtmangiz #${createdOrder.id.slice(0, 5).toUpperCase()} raqami bilan qabul qilindi va oshxonaga yuborildi! Tez orada yetkazib beramiz.` 
                                      };
                                  } catch (orderErr) {
                                      console.error("Voice order error:", orderErr);
                                      result = { error: 'order_failed', message: "Buyurtmani rasmiylashtirishda xatolik yuz berdi. Qayta urinib ko'ring." };
                                  }
                              }
                          }
                      } else if (fc.name === 'confirmCheckout' || fc.name === 'confirmOrder') {
                          navigateRef.current('/cart');
                          result = { success: true };
                      }

                      responses.push({ id: fc.id, name: fc.name, response: { result } });
                  }
                  if (liveSessionRef.current) {
                      try {
                          liveSessionRef.current.sendToolResponse({ functionResponses: responses });
                      } catch (e) {
                          console.error("Failed sending tool response:", e);
                      }
                  }
              }
            },
            onclose: () => {
              console.log(`Live session closed (${currentModel})`);
              if (hasOpened) {
                disconnect();
              }
            },
            onerror: (e) => {
              console.error(`AI Session error for ${currentModel}:`, e);
              if (!hasOpened) {
                console.warn(`[LiveAgent] '${currentModel}' ishlamadi, keyingi model tekshirilmoqda...`);
                attemptConnection(modelIndex + 1);
              } else {
                setError("Aloqa uzildi. Qayta urinib ko'ring.");
                disconnect();
              }
            }
          }
        });

        sessionRef.current = sessionPromise;
        sessionPromise.then(session => {
          liveSessionRef.current = session;
        }).catch(err => {
          console.error(`Connection attempt failed for ${currentModel}:`, err);
          if (!hasOpened) {
            attemptConnection(modelIndex + 1);
          } else {
            disconnect();
          }
        });
      };

      attemptConnection(0);
    } catch (e) { 
      setConnecting(false); 
      setError("Mikrofon xatosi.");
    }
  }, [stopAudio, disconnect]);

  return (
    <div className="fixed bottom-24 lg:bottom-10 right-4 lg:right-10 z-[60] flex flex-col items-end">
      {error && (
          <div className="mb-4 bg-white p-3 rounded-2xl shadow-xl border border-red-100 flex items-center gap-2 text-red-600 text-[10px] font-black uppercase">
              <AlertCircle size={14} /> {error}
          </div>
      )}

      {active && (
        <div className="mb-3 flex flex-col items-end gap-1.5 max-w-[260px] animate-in fade-in slide-in-from-bottom-3 duration-300">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-200 shadow-sm">Ovozli buyruqlar:</span>
          {["💡 Osh va somsa savatga qo'sh", "💡 Savatda nima bor?", "💡 Buyurtma holatini ko'rsat"].map((chip, idx) => (
            <div key={idx} className="bg-slate-900/95 text-white text-[11px] font-medium px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md border border-slate-700">
              {chip}
            </div>
          ))}
        </div>
      )}

      <div className="relative flex flex-col items-center">
        {active && (
          <div className="absolute -inset-4 z-[-1]">
            <div className={`absolute inset-0 bg-red-500/20 rounded-full animate-ping ${!speaking && 'hidden'}`}></div>
            <div className={`absolute inset-0 bg-red-400/30 rounded-full animate-pulse ${!active && 'hidden'}`}></div>
          </div>
        )}

        <button
          onClick={active ? disconnect : connect}
          className={`w-16 h-16 md:w-20 md:h-20 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 active:scale-90 ${
            active ? 'bg-white text-red-600 border-4 border-red-600' : 'bg-red-600 text-white hover:scale-110'
          }`}
        >
          {connecting ? <Loader2 className="animate-spin w-8 h-8" /> : active ? <Volume2 className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </button>

        {active && (
          <div className="mt-3 bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-xl uppercase tracking-widest animate-bounce">
            {speaking ? 'AI gapirmoqda...' : 'Eshityapman...'}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveAgent;