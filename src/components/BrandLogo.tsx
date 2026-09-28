import React from 'react';

interface BrandLogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  className = "h-12 w-auto", 
  variant = 'light' 
}) => {
  const isDark = variant === 'dark';
  const src = isDark 
    ? '/assets/mantrakshata-full-logo-dark.png' 
    : '/assets/mantrakshata-full-logo.png';

  return (
    <img 
      src={src} 
      alt="Mantrakshata Logo" 
      className={`object-contain transition-all duration-300 ${className}`} 
      loading="eager"
    />
  );
};
