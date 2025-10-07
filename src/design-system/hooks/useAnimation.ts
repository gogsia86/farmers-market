import { useCallback, useEffect, useState } from 'react';

export interface UseAnimationProps {
  duration?: number;
  delay?: number;
  easing?: string;
}

export const useAnimation = ({
  duration = 600,
  delay = 0,
  easing = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
}: UseAnimationProps = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [element, setElement] = useState<HTMLElement | null>(null);

  const callback = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(callback, {
      threshold: 0.1,
    });

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [callback, element]);

  const style = {
    opacity: 0,
    transform: 'translateY(20px)',
    transition: `all ${duration}ms ${easing} ${delay}ms`,
    ...(isVisible && {
      opacity: 1,
      transform: 'translateY(0)',
    }),
  };

  return {
    style,
    ref: setElement,
    isVisible,
  };
};