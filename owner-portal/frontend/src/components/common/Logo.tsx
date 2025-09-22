import React from 'react';
import logoImage from '../../assets/Real-logo.jpg';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <img
      src={logoImage}
      alt="Logo"
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

export default Logo;