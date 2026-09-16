import React, { createContext, useContext, useState } from 'react';

interface CartAnimationContextType {
  triggerAnimation: (imageSrc: string, startRect: DOMRect) => void;
  animation: { imageSrc: string; startRect: DOMRect } | null;
  clearAnimation: () => void;
}

const CartAnimationContext = createContext<CartAnimationContextType | undefined>(undefined);

export const CartAnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [animation, setAnimation] = useState<{ imageSrc: string; startRect: DOMRect } | null>(null);

  const triggerAnimation = (imageSrc: string, startRect: DOMRect) => {
    setAnimation({ imageSrc, startRect });
  };

  const clearAnimation = () => {
    setAnimation(null);
  };

  return (
    <CartAnimationContext.Provider value={{ triggerAnimation, animation, clearAnimation }}>
      {children}
    </CartAnimationContext.Provider>
  );
};

export const useCartAnimation = () => {
  const context = useContext(CartAnimationContext);
  if (!context) throw new Error('useCartAnimation must be used within CartAnimationProvider');
  return context;
};
