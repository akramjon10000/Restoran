import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Mic, MicOff, Loader2, Volume2, AlertCircle } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import { useAuth } from '../context/AuthContext';
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
  description: 'Navigate the user to the cart/checkout page. MUST ONLY BE CALLED AFTER reading the cart contents to the user and getting their final confirmation.',
  parameters: { type: Type.OBJECT, properties: {} }
};

const LiveAgent: React.FC = () => {
  const [active, setActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { addToCart, removeFromCart, items, total } = useCart();
  const { products } = useMenu();
  const navigate = useNavigate();
  const location = useLocation();

  const addToCartRef = useRef(addToCart);
  const removeFromCartRef = useRef(removeFromCart);
  const productsRef = useRef(products);
  const itemsRef = useRef(items);
  const totalRef = useRef(total);
  const navigateRef = useRef(navigate);
  const locationRef = useRef(location);
  const speakingRef = useRef(false);

  useEffect(() => {
    addToCartRef.current = addToCart;
    removeFromCartRef.current = removeFromCart;
    productsRef.current = products;
    itemsRef.current = items;
    totalRef.current = total;
    navigateRef.current = navigate;
    locationRef.current = location;
  }, [addToCart, removeFromCart, products, items, total, navigate, location]);

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

      const dynamicInstruction = `
        ${savedInstruction}
        
        MENYU RO'YXATI:
        ${menuList}

        JORIY HOLAT: 
        Hozirgi sahifa: ${locationRef.current.pathname}
        Savatdagi mahsulotlar: ${cartContentsText}
        Savatning umumiy summasi: ${totalRef.current} so'm.
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
            tools: [{ functionDeclarations: [addToCartDecl, removeFromCartDecl, getCartStatusDecl, confirmCheckoutDecl] }],
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