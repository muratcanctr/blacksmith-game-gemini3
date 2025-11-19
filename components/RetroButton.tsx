
import React from 'react';
import { soundManager } from '../services/soundService';

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success' | 'warning';
  fullWidth?: boolean;
}

const RetroButton: React.FC<RetroButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  fullWidth = false,
  disabled,
  onClick,
  ...props 
}) => {
  const baseStyles = "font-mono px-4 py-2 text-sm sm:text-base transition-all active:translate-y-1 relative border-b-4 border-r-4 border-black active:border-b-0 active:border-r-0 active:border-t-2 active:border-l-2 active:mt-1";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-500",
    danger: "bg-red-600 text-white hover:bg-red-500",
    success: "bg-green-600 text-white hover:bg-green-500",
    warning: "bg-yellow-500 text-black hover:bg-yellow-400"
  };

  const disabledStyles = "bg-gray-500 text-gray-300 cursor-not-allowed border-gray-800 hover:bg-gray-500 active:translate-y-0 active:border-b-4 active:border-r-4 active:mt-0";

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
        soundManager.playClick();
        if (onClick) onClick(e);
    }
  };

  return (
    <button 
      className={`
        ${baseStyles} 
        ${disabled ? disabledStyles : variants[variant]} 
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default RetroButton;
