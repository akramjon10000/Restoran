import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCartAnimation } from '../context/CartAnimationContext';

const AddToCartAnimation = () => {
  const { animation, clearAnimation } = useCartAnimation();
  const [targetPos, setTargetPos] = useState({ top: window.innerHeight - 50, left: window.innerWidth / 2 + 50 });

  useEffect(() => {
    if (animation) {
      // Find the cart icon
      let cartElement = document.getElementById('cart-icon-mobile');
      
      // If mobile icon is not visible or doesn't exist, try desktop sidebar icon
      if (!cartElement || getComputedStyle(cartElement).display === 'none' || cartElement.offsetParent === null) {
          cartElement = document.getElementById('cart-icon-desktop');
      }

      if (cartElement) {
        const rect = cartElement.getBoundingClientRect();
        setTargetPos({
          top: rect.top + rect.height / 2 - 15, // center minus half width
          left: rect.left + rect.width / 2 - 15
        });
      }

      const timer = setTimeout(() => {
        clearAnimation();
      }, 800); // reduced from 1000s for snappier animation
      
      return () => clearTimeout(timer);
    }
  }, [animation, clearAnimation]);

  if (!animation) return null;

  return (
    <AnimatePresence>
      {animation && (
        <motion.img
          src={animation.imageSrc}
          initial={{
            position: 'fixed',
            top: animation.startRect.top,
            left: animation.startRect.left,
            width: animation.startRect.width,
            height: animation.startRect.height,
            zIndex: 9999, // use high zIndex above nav bar
            opacity: 1,
            borderRadius: '12px'
          }}
          animate={{
            top: targetPos.top,
            left: targetPos.left,
            width: 30,
            height: 30,
            opacity: 0,
            scale: 0.2, // scale down
          }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1], opacity: { delay: 0.4 } }}
          className="shadow-2xl object-cover"
        />
      )}
    </AnimatePresence>
  );
};

export default AddToCartAnimation;
