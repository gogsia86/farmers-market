import React from 'react';
import { useAnimation } from '../hooks/useAnimation';
import styles from './Card.module.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'cosmic';
  hasGlow?: boolean;
  hasTilt?: boolean;
  isAnimated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hasGlow = false,
  hasTilt = false,
  isAnimated = true,
  className,
  ...props
}) => {
  const { ref, style } = useAnimation({
    duration: 600,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  });

  const cardClasses = [
    styles.card,
    styles[`card-${variant}`],
    hasGlow && styles.cardGlow,
    hasTilt && styles.cardTilt,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasTilt) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasTilt) return;
    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
  };

  return (
    <div
      ref={ref}
      className={cardClasses}
      style={isAnimated ? style : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  );
};