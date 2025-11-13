/**
 * ⚡ HERO BANNER COMPONENT
 * Divine hero section with agricultural consciousness
 */
import { ReactNode } from "react";

interface HeroBannerProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  overlay?: boolean;
  children?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function HeroBanner({
  title,
  subtitle,
  backgroundImage,
  overlay = true,
  children,
  className = "",
  size = "md",
}: HeroBannerProps) {
  const sizeClasses = {
    sm: "min-h-[300px]",
    md: "min-h-[400px]",
    lg: "min-h-[600px]",
  };

  return (
    <div
      className={`relative ${sizeClasses[size]} flex items-center justify-center ${className}`}
      style={{
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {overlay && <div className="absolute inset-0 bg-black/40" />}

      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl md:text-2xl text-white/90">{subtitle}</p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </div>
  );
}

// Default export for compatibility
export default HeroBanner;
