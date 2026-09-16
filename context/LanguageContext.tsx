import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'uz' | 'ru';

interface Translations {
  home: string;
  menu: string;
  cart: string;
  profile: string;
  popular: string;
  categories: string;
  searchPlaceholder: string;
  total: string;
  checkout: string;
  emptyCart: string;
  login: string;
  logout: string;
  settings: string;
  language: string;
  slogan: string;
  freeDelivery: string;
  minOrder: string;
  seeAll: string;
  emptyCartDesc: string;
  goToMenu: string;
  subtotal: string;
  notification: string;
  delivery: string;
  pickup: string;
  reorder: string;
  addressPlaceholder: string;
  confirmLocation: string;
  locating: string;
  moveMap: string;
  locationPermissionDenied: string;
  searchAddress: string;
  entrance: string;
  floor: string;
  apartment: string;
  comment: string;
  save: string;
  nameLabel: string;
  namePlaceholder: string;
  paymentMethod: string;
  cash: string;
  terminal: string;
  paynetQR: string;
  promoCode: string;
  apply: string;
  discount: string;
  personalInfo: string;
  edit: string;
  cancel: string;
  name: string;
  phone: string;
  address: string;
  fullName: string;
  mainAddress: string;
  notEntered: string;
  deliveredOrders: string;
  leaveReview: string;
  installApp: string;
  forEasyOrdering: string;
  install: string;
  driverPanel: string;
  logoutButton: string;
}

const translations: Record<Language, Translations> = {
  en: {
    home: 'Home',
    menu: 'Menu',
    cart: 'Bucket',
    profile: 'Profile',
    popular: 'Top Hits',
    categories: 'Categories',
    searchPlaceholder: 'Search for food...',
    total: 'Total',
    checkout: 'Checkout',
    emptyCart: 'Your cart is empty',
    login: 'Login',
    logout: 'Log Out',
    settings: 'Settings',
    language: 'Language',
    slogan: "DELICIOUS EVERY TIME",
    freeDelivery: "Free Delivery",
    minOrder: "Orders over 150k",
    seeAll: "View All",
    emptyCartDesc: "Hungry? Let's order some food!",
    goToMenu: "Order Now",
    subtotal: "Subtotal",
    notification: "Notifications",
    delivery: "Delivery",
    pickup: "Pickup",
    reorder: "Order Again",
    addressPlaceholder: "Select location",
    confirmLocation: "Confirm Location",
    locating: "Locating...",
    moveMap: "Move map to select location",
    locationPermissionDenied: "Location permission denied",
    searchAddress: "Search address...",
    entrance: "Ent",
    floor: "Floor",
    apartment: "Apt",
    comment: "Comment to courier",
    save: "Save Address",
    nameLabel: "Your Name",
    namePlaceholder: "Enter your name",
    paymentMethod: "Payment Method",
    cash: "Cash",
    terminal: "Terminal (Card)",
    paynetQR: "Paynet QR",
    promoCode: "PROMO CODE",
    apply: "Apply",
    discount: "Discount",
    personalInfo: "Personal Information",
    edit: "Edit",
    cancel: "Cancel",
    name: "Name",
    phone: "Phone Number",
    address: "Address",
    fullName: "Full Name",
    mainAddress: "Main Address",
    notEntered: "Not entered",
    deliveredOrders: "Delivered Orders",
    leaveReview: "Leave Review",
    installApp: "Install App",
    forEasyOrdering: "For easier ordering",
    install: "Install",
    driverPanel: "Driver Panel",
    logoutButton: "Log Out"
  },
  uz: {
    home: 'Asosiy',
    menu: 'Menyu',
    cart: 'Savat',
    profile: 'Profil',
    popular: 'Xitlar',
    categories: 'Kategoriyalar',
    searchPlaceholder: 'Taom, burger izlash...',
    total: 'Jami',
    checkout: 'Rasmiylashtirish',
    emptyCart: 'Savatingiz bo\'sh',
    login: 'Kirish',
    logout: 'Chiqish',
    settings: 'Sozlamalar',
    language: 'Til',
    slogan: "MAZZASI O'ZGACHA",
    freeDelivery: "Yetkazib berish bepul",
    minOrder: "150 000 so'mdan oshsa",
    seeAll: "Barchasi",
    emptyCartDesc: "Qorningiz ochdimi? Keling, buyurtma beramiz!",
    goToMenu: "Menyuga o'tish",
    subtotal: "Mahsulotlar",
    notification: "Xabarnomalar",
    delivery: "Yetkazib berish",
    pickup: "Olib ketish",
    reorder: "Qayta buyurtma",
    addressPlaceholder: "Manzilni tanlang",
    confirmLocation: "Manzilni tasdiqlash",
    locating: "Aniqlanmoqda...",
    moveMap: "Manzilni tanlash uchun xaritani suring",
    locationPermissionDenied: "Geolokatsiyaga ruxsat berilmadi",
    searchAddress: "Manzilni qidiring...",
    entrance: "Yo'lak",
    floor: "Qavat",
    apartment: "Xonadon",
    comment: "Kuryer uchun izoh",
    save: "Saqlash",
    nameLabel: "Ismingiz",
    namePlaceholder: "Ismingizni kiriting",
    paymentMethod: "To'lov usuli",
    cash: "Naqd",
    terminal: "Terminal (Karta)",
    paynetQR: "Paynet QR",
    promoCode: "PROMO-KOD",
    apply: "Qo'llash",
    discount: "Chegirma",
    personalInfo: "Shaxsiy ma'lumotlar",
    edit: "Tahrirlash",
    cancel: "Bekor qilish",
    name: "Ism",
    phone: "Telefon raqam",
    address: "Manzil",
    fullName: "Ism-sharif",
    mainAddress: "Asosiy manzil",
    notEntered: "Kiritilmagan",
    deliveredOrders: "Yetkazilgan Buyurtmalar",
    leaveReview: "Fikr bildirish",
    installApp: "Mobil ilovani o'rnating",
    forEasyOrdering: "Yana ham qulay buyurtma berish uchun",
    install: "O'rnatish",
    driverPanel: "Haydovchi paneli",
    logoutButton: "Hisobdan chiqish"
  },
  ru: {
    home: 'Главная',
    menu: 'Меню',
    cart: 'Корзина',
    profile: 'Профиль',
    popular: 'Хиты',
    categories: 'Категории',
    searchPlaceholder: 'Найти еду...',
    total: 'Итого',
    checkout: 'Оформить',
    emptyCart: 'Корзина пуста',
    login: 'Войти',
    logout: 'Выйти',
    settings: 'Настройки',
    language: 'Язык',
    slogan: "ВКУСНО КАК НИКОГДА",
    freeDelivery: "Бесплатная доставка",
    minOrder: "От 150 000 сум",
    seeAll: "Все",
    emptyCartDesc: "Кажется, вы проголодались. Пора заказать еду!",
    goToMenu: "В меню",
    subtotal: "Подытог",
    notification: "Уведомления",
    delivery: "Доставка",
    pickup: "Самовывоз",
    reorder: "Повторить",
    addressPlaceholder: "Выберите адрес",
    confirmLocation: "Подтвердить адрес",
    locating: "Определение...",
    moveMap: "Двигайте карту для выбора",
    locationPermissionDenied: "Доступ к геолокации заблокирован",
    searchAddress: "Поиск адреса...",
    entrance: "Подъезд",
    floor: "Этаж",
    apartment: "Кв.",
    comment: "Комментарий курьеру",
    save: "Сохранить",
    nameLabel: "Ваше имя",
    namePlaceholder: "Введите имя",
    paymentMethod: "Способ оплаты",
    cash: "Наличные",
    terminal: "Терминал",
    paynetQR: "Paynet QR",
    promoCode: "ПРОМО-КОД",
    apply: "Применить",
    discount: "Скидка",
    personalInfo: "Личные данные",
    edit: "Изменить",
    cancel: "Отмена",
    name: "Имя",
    phone: "Номер телефона",
    address: "Адрес",
    fullName: "Ф.И.О",
    mainAddress: "Основной адрес",
    notEntered: "Не указано",
    deliveredOrders: "Доставленные заказы",
    leaveReview: "Оставить отзыв",
    installApp: "Установите приложение",
    forEasyOrdering: "Для удобного заказа",
    install: "Установить",
    driverPanel: "Панель водителя",
    logoutButton: "Выйти из аккаунта"
  }
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('uz');

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};