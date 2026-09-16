import { Product } from './types';

export interface Branch {
  id: string;
  name: string;
  address: string;
  workTime: string;
}

export const BRANCHES: Branch[] = [
  { id: '1', name: 'Restoran Amir Temur', address: 'Amir Temur ko\'chasi, 1-uy (C-1)', workTime: '09:00 - 03:00' },
  { id: '2', name: 'Restoran Compass', address: 'Compass Mall, 1-qavat', workTime: '10:00 - 22:00' },
  { id: '3', name: 'Restoran Beruniy', address: 'Beruniy ko\'chasi, 47 (Metro Beruniy)', workTime: '24/7' },
  { id: '4', name: 'Restoran Tashkent City', address: 'Tashkent City Mall, Food court', workTime: '10:00 - 23:00' },
  { id: '5', name: 'Restoran Sergeli', address: 'Yangi Sergeli ko\'chasi, 23', workTime: '09:00 - 00:00' },
];

export const MENU_ITEMS: Product[] = [
  {
    id: 'b1',
    name: 'Savat S',
    description: '12 ta achchiq qanotcha (yoki original), 1 ta o\'rtacha kartoshka fri.',
    price: 65000,
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&q=80&w=600', 
    category: 'buckets',
    popular: true,
    calories: '680 kkal',
    weight: '450 g',
    ingredients: ['Tovuq qanotlari', 'Maxsus ziravorlar', 'Kartoshka fri', 'Sous']
  },
  {
    id: 'b2',
    name: 'Savat M',
    description: '20 ta qanotcha, 2 ta o\'rtacha kartoshka fri.',
    price: 105000,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600',
    category: 'buckets',
    popular: true,
    calories: '1150 kkal',
    weight: '800 g',
    ingredients: ['Tovuq qanotlari', 'Maxsus marinad', 'Kartoshka fri (2x)']
  },
  {
    id: 'b3',
    name: 'Savat L (Mega)',
    description: '28 ta qanotcha, 4 ta o\'rtacha kartoshka fri.',
    price: 155000,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=600',
    category: 'buckets',
    calories: '1850 kkal',
    weight: '1200 g',
    ingredients: ['Tovuq qanotlari', 'Oyoqchalar', '4x Kartoshka fri', 'Souslar to\'plami']
  },
  {
    id: 'bu1',
    name: 'Shefburger',
    description: 'Yumshoq bulochka, achchiq yoki original file, pomidor, aysberg salati va "Sezar" sousi.',
    price: 34000,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600',
    category: 'burgers',
    popular: true,
    calories: '520 kkal',
    weight: '280 g',
    ingredients: ['Kunjutli bulochka', 'Tovuq filesi', 'Aysberg', 'Pomidor', 'Sezar sous']
  },
  {
    id: 'bu2',
    name: 'Zinger Burger',
    description: 'Qarsildoq achchiq tovuq filesi, mayonez, aysberg salati, yumshoq kunjutli bulochkada.',
    price: 32000,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=600',
    category: 'burgers',
    calories: '490 kkal',
    weight: '260 g',
    ingredients: ['Qarsildoq achchiq file', 'Aysberg salati', 'Klassik mayonez']
  },
  {
    id: 'bu3',
    name: 'Big Burger Double',
    description: 'Ikki qavatli tovuq filesi, pishloq, maxsus sous, pomidor va salat bargi.',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&q=80&w=600',
    category: 'burgers',
    popular: true,
    calories: '740 kkal',
    weight: '380 g',
    ingredients: ['2x Shirali file', 'Cheddar pishloq', 'Maxsus burger sous', 'Tuzlangan bodring']
  },
  {
    id: 'ch1',
    name: 'Boxmaster Original',
    description: 'Haqiqiy gigant: katta tortilya, file, xashbraun, pishloq, pomidor, salat va sous.',
    price: 42000,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=600', 
    category: 'chicken',
    popular: true,
    calories: '610 kkal',
    weight: '320 g',
    ingredients: ['Lavash tortilya', 'Xashbraun', 'Tovuq filesi', 'Pishloq', 'Yangi pomidor']
  },
  {
    id: 'ch2',
    name: 'Tovuq Qanotchalari (6 dona)',
    description: 'Maxsus ziravorlar bilan marinadlangan va qovurilgan qarsildoq qanotchalar.',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=600',
    category: 'chicken',
    calories: '420 kkal',
    weight: '240 g',
    ingredients: ['Tovuq qanotlari', 'Achchiq marinad']
  },
  {
    id: 'ch3',
    name: 'Tovuq Oyoqlari (3 dona)',
    description: 'Katta, sersuv va qarsildoq tovuq oyoqlari.',
    price: 38000,
    image: 'https://images.unsplash.com/photo-1626082896492-766af4eb6501?auto=format&fit=crop&q=80&w=600',
    category: 'chicken',
    popular: true,
    calories: '550 kkal',
    weight: '330 g',
    ingredients: ['Tovuq oyoqlari', 'Maxsus qarsildoq qoplama']
  },
  {
    id: 's1',
    name: 'Fri Kartoshkasi (Standart)',
    description: 'Oltin tusli qarsildoq kartoshka.',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&q=80&w=600',
    category: 'snacks',
    calories: '310 kkal',
    weight: '150 g',
    ingredients: ['Saralangan kartoshka', 'Dengiz tuzi']
  },
  {
    id: 's2',
    name: 'Pishloqli Tayoqchalar (4 dona)',
    description: 'Eritilgan pishloq bilan to\'ldirilgan qarsildoq tayoqchalar.',
    price: 22000,
    image: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?auto=format&fit=crop&q=80&w=600',
    category: 'snacks',
    popular: true,
    calories: '380 kkal',
    weight: '160 g',
    ingredients: ['Mozzarella pishloq', 'Qarsildoq suxari']
  },
  {
    id: 's3',
    name: 'Piyozli Halqalar (6 dona)',
    description: 'Qarsildoq qovurilgan piyoz halqalari.',
    price: 16000,
    image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&q=80&w=600',
    category: 'snacks',
    calories: '280 kkal',
    weight: '140 g',
    ingredients: ['Piyoz halqalari', 'Maxsus xamir']
  },
  {
    id: 'd1',
    name: 'Pepsi 0.5L',
    description: 'Muzdek tetiklashtiruvchi gazli ichimlik.',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600',
    category: 'drinks',
    calories: '180 kkal',
    weight: '500 ml'
  },
  {
    id: 'd2',
    name: 'Lipton Ko\'k Choy 0.5L',
    description: 'Muzdek tabiiy Lipton ko\'k choyi.',
    price: 10000,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=600',
    category: 'drinks',
    calories: '90 kkal',
    weight: '500 ml'
  },
  {
    id: 'd3',
    name: 'Kofe (Amerikano)',
    description: 'Yangi maydalangan qahva donalaridan issiq amerikano.',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=600',
    category: 'drinks',
    calories: '10 kkal',
    weight: '250 ml'
  },
  {
    id: 'ds1',
    name: 'Muzqaymoq (Shokoladli)',
    description: 'Shirin va qaymoqli shokoladli muzqaymoq.',
    price: 14000,
    image: 'https://images.unsplash.com/photo-1559703248-dcaaec9fab78?auto=format&fit=crop&q=80&w=600',
    category: 'desserts',
    calories: '240 kkal',
    weight: '130 g'
  },
  {
    id: 'ds2',
    name: 'Karamelli Donat',
    description: 'Yumshoq xamirli, karamel va shokolad bilan qoplangan donat.',
    price: 16000,
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=600',
    category: 'desserts',
    popular: true,
    calories: '320 kkal',
    weight: '90 g'
  }
];

export const DEFAULT_SYSTEM_INSTRUCTION = `
Siz Restoran Uzbekistan aqlli ovozli yordamchisiz. Ovoz orqali buyurtma olasiz va buyurtmani oshxonaga to'liq rasmiylashtirib berasiz.

ENG MA'QUL MULOQOT TARTIBI:
1. BOSHLANISH VA MANZIL (Oldin manzil aniqlanadi):
   - Agar yetkazib berish manzili hali noma'lum bo'lsa: "Assalomu alaykum! Xush kelibsiz. Qaysi manzilga yetkazib beramiz?" deb manzilni aniqlang.
   - Agar manzil allaqachon ma'lum bo'lsa: "Assalomu alaykum! Manzil: {Yetkazib berish manzili}. Qanday mazali taomlar yetkazib beraylik?" deb kutib oling.
   - Mijoz manzilini aytishi bilanoq darhol setDeliveryAddress funksiyasini chaqiring.

2. TAOMLARNI TANLASH VA SAVATGA YIG'ISH:
   - Mijoz biror taomni so'rasa, narxini ayting va "Nechta qo'shib qo'yay?" deb so'rang.
   - Miqdor aytilsa yoki "ha" desa, darhol addToCart funksiyasini chaqiring.
   - Bekor qilinsa, removeFromCart ni chaqiring.

3. TELEFON VA ISMNI OLISH (Faqat buyurtma yakunida):
   - Telefon raqamni boshida so'ramang! Faqat mijoz barcha taomlarni tanlab bo'lib, "bo'ldi", "rasmiylashtir", "tasdiqlayman" deganida so'rang:
     "Buyurtmani oshxonaga topshirishimiz uchun ismingiz va telefon raqamingizni aytib yuborsangiz?"
   - Mijoz ism va telefonini aytishi bilanoq darhol setCustomerInfo funksiyasini chaqiring.

4. BUYURTMANI TO'LIQ TOPSHIRISH (OXIRIGACHA YETKAZISH):
   - Manzil, taomlar va telefon ma'lum bo'lgach, darhol completeOrder funksiyasini chaqiring!
   - completeOrder muvaffaqiyatli bajarilgach, quvonch bilan: "Buyurtmangiz qabul qilindi va oshxonaga yuborildi! Tez orada yetkazib beramiz!" deb tasdiqlang.

5. JAVOB USLUBI: Javoblaringiz qisqa (10-15 so'z), o'zbek tilida aniq, ravon va juda xushmuomala bo'lsin.
`;

export const DEFAULT_LIVE_MODEL = 'gemini-3.8-live';

export const SUPPORTED_LIVE_MODELS = [
  { id: 'gemini-3.8-live', label: 'Gemini 3.8 Live (Yangi avlod)' },
  { id: 'gemini-3.8-flash-live-preview', label: 'Gemini 3.8 Flash Live' },
  { id: 'gemini-3.1-flash-live-preview', label: 'Gemini 3.1 Flash Live' },
  { id: 'gemini-3.0-flash-live-preview', label: 'Gemini 3.0 Flash Live' }
];

export const LIVE_FALLBACK_MODELS = [
  'gemini-3.8-live',
  'gemini-3.8-flash-live-preview',
  'gemini-3.1-flash-live-preview',
  'gemini-3.0-flash-live-preview'
];