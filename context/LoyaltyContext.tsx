import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export type LoyaltyTier = 'bronze' | 'silver' | 'gold';

interface TierInfo {
  tier: LoyaltyTier;
  title: string;
  cashbackPercent: number;
  minSpend: number;
  badgeColor: string;
  perks: string[];
}

export const TIERS: Record<LoyaltyTier, TierInfo> = {
  bronze: {
    tier: 'bronze',
    title: 'Bronza Mijoz',
    cashbackPercent: 3,
    minSpend: 0,
    badgeColor: 'from-amber-700 to-amber-900',
    perks: ['Har bir buyurtmadan 3% keshbek', 'Maxsus aksiyalar']
  },
  silver: {
    tier: 'silver',
    title: 'Kumush Mijoz',
    cashbackPercent: 5,
    minSpend: 250000,
    badgeColor: 'from-slate-400 to-slate-600',
    perks: ['Har bir buyurtmadan 5% keshbek', 'Har 3-buyurtmada bepul sous', 'Tezkor tayyorlanish']
  },
  gold: {
    tier: 'gold',
    title: 'Oltin VIP Mijoz',
    cashbackPercent: 8,
    minSpend: 600000,
    badgeColor: 'from-amber-400 via-yellow-500 to-amber-600',
    perks: ['Har bir buyurtmadan 8% keshbek', 'Bepul yetkazib berish (doimiy)', 'VIP kuryer xizmati']
  }
};

interface LoyaltyContextType {
  bonusBalance: number;
  totalSpent: number;
  currentTier: TierInfo;
  nextTier: TierInfo | null;
  progressToNextTier: number;
  earnPoints: (orderTotal: number) => number;
  spendPoints: (points: number) => boolean;
  addBonusReward: (amount: number, reason: string) => void;
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

export const LoyaltyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Bonus balance state
  const [bonusBalance, setBonusBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('restoran_bonus_balance');
      return saved !== null ? Number(saved) : 10000; // 10,000 UZS Welcome bonus!
    } catch {
      return 10000;
    }
  });

  // Total spent state
  const [totalSpent, setTotalSpent] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('restoran_total_spent');
      return saved !== null ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('restoran_bonus_balance', bonusBalance.toString());
      localStorage.setItem('restoran_total_spent', totalSpent.toString());
    } catch (e) {
      console.error(e);
    }
  }, [bonusBalance, totalSpent]);

  // Determine current tier
  let currentTier: TierInfo = TIERS.bronze;
  let nextTier: TierInfo | null = TIERS.silver;
  let progressToNextTier = 0;

  if (totalSpent >= TIERS.gold.minSpend) {
    currentTier = TIERS.gold;
    nextTier = null;
    progressToNextTier = 100;
  } else if (totalSpent >= TIERS.silver.minSpend) {
    currentTier = TIERS.silver;
    nextTier = TIERS.gold;
    const progressRange = TIERS.gold.minSpend - TIERS.silver.minSpend;
    const progressCurrent = totalSpent - TIERS.silver.minSpend;
    progressToNextTier = Math.min(100, Math.round((progressCurrent / progressRange) * 100));
  } else {
    currentTier = TIERS.bronze;
    nextTier = TIERS.silver;
    progressToNextTier = Math.min(100, Math.round((totalSpent / TIERS.silver.minSpend) * 100));
  }

  const earnPoints = (orderTotal: number) => {
    const earned = Math.round(orderTotal * (currentTier.cashbackPercent / 100));
    setBonusBalance(prev => prev + earned);
    setTotalSpent(prev => prev + orderTotal);
    toast.success(`🎉 +${earned.toLocaleString()} so'm keshbek hisobingizga qo'shildi!`);
    return earned;
  };

  const spendPoints = (points: number) => {
    if (points <= 0) return false;
    if (bonusBalance < points) {
      toast.error("Hisobingizda yetarli bonus mavjud emas");
      return false;
    }
    setBonusBalance(prev => Math.max(0, prev - points));
    return true;
  };

  const addBonusReward = (amount: number, reason: string) => {
    setBonusBalance(prev => prev + amount);
    toast.success(`🎁 +${amount.toLocaleString()} so'm bonus: ${reason}`);
  };

  return (
    <LoyaltyContext.Provider value={{
      bonusBalance,
      totalSpent,
      currentTier,
      nextTier,
      progressToNextTier,
      earnPoints,
      spendPoints,
      addBonusReward
    }}>
      {children}
    </LoyaltyContext.Provider>
  );
};

export const useLoyalty = () => {
  const ctx = useContext(LoyaltyContext);
  if (!ctx) throw new Error('useLoyalty must be used within LoyaltyProvider');
  return ctx;
};
