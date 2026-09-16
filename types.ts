export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface ProductReview {
  id: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[]; // Up to 3 images gallery
  category: string; // Dynamic category ID
  popular?: boolean;
  calories?: string;
  weight?: string;
  ingredients?: string[];
  rating?: number;
  reviewsCount?: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSauces?: string[];
  spicyLevel?: string;
}

export interface User {
  phone?: string;
  name?: string;
  email?: string;
  addresses?: Address[];
  telegramId?: number;
  bonusPoints?: number;
  totalSpent?: number;
}

export interface Address {
  label: string; 
  lat: number;
  lng: number;
  details: string; 
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercentage: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  productId?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  discount?: number;
  bonusUsed?: number;
  bonusEarned?: number;
  deliveryFee?: number;
  deliveryTimeType?: 'asap' | 'scheduled';
  scheduledTime?: string;
  status: 'new' | 'cooking' | 'delivering' | 'completed';
  date: string;
  address: string;
  phone: string;
  paymentMethod: string;
  userName?: string;
  courierId?: string;
  courierName?: string;
  courierPhone?: string;
  isReviewed?: boolean;
  orderNote?: string;
  cutleryCount?: number;
}

export type ToolFn = (args: any) => any;

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        platform: string;
        initData: string;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
        };
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
      };
    };
  }
}
