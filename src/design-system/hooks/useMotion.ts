import { useEffect, useRef } from 'react';

interface UseParallaxOptions {
  speed?: number;
  direction?: 'vertical' | 'horizontal';
  reverse?: boolean;
}

export const useParallax = ({
  speed = 0.5,
  direction = 'vertical',
  reverse = false,
}: UseParallaxOptions = {}) => {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * speed * (reverse ? -1 : 1);
      
      const transform = direction === 'vertical'
        ? `translateY(${rate}px)`
        : `translateX(${rate}px)`;
      
      element.style.transform = transform;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, direction, reverse]);

  return elementRef;
};

interface UseMagneticOptions {
  strength?: number;
  ease?: number;
}

export const useMagnetic = ({
  strength = 50,
  ease = 0.1,
}: UseMagneticOptions = {}) => {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let animationFrameId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      
      targetX = distanceX * strength;
      targetY = distanceY * strength;
    };

    const handlePointerLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const animate = () => {
      const deltaX = targetX - currentX;
      const deltaY = targetY - currentY;

      currentX += deltaX * ease;
      currentY += deltaY * ease;

      element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      animationFrameId = requestAnimationFrame(animate);
    };

    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerleave', handlePointerLeave);
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerleave', handlePointerLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [strength, ease]);

  return elementRef;
};