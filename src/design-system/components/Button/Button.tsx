import React from 'react';
import { useAnimation } from '../../hooks/useAnimation';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  hasGlow?: boolean;
  hasSparkle?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  hasGlow = false,
  hasSparkle = false,
  className,
  ...props
}) => {
  const { ref, isVisible } = useAnimation({
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    delay: 0
  });

  const buttonClasses = [
    styles.button,
    isVisible && styles.buttonVisible,
    styles[`button-${variant}`],
    styles[`button-${size}`],
    hasGlow && styles.buttonGlow,
    hasSparkle && styles.buttonSparkle,
    isLoading && styles.buttonLoading,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className={styles.loader} />
      ) : (
        <>
          {children}
          {hasSparkle && <div className={styles.sparkle} />}
        </>
      )}
    </button>
  );
};