'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconSize?: number;
  className?: string;
  type?: 'button' | 'submit';
}

export default function GlassButton({
  children,
  onClick,
  disabled = false,
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  iconSize = 16,
  className = '',
  type = 'button'
}: GlassButtonProps) {
  const baseClasses = "relative backdrop-blur-[15px] rounded-[12px] flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 font-sans disabled:opacity-50";
  
  const sizeClasses = {
    sm: "px-3 py-1 text-sm h-[32px] min-w-[60px]",
    md: "px-4 py-2 text-[14px] h-[46px] min-w-[82px]",
    lg: "px-6 py-3 text-lg h-[52px] min-w-[96px]"
  };

  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-100/90 to-indigo-100/90 border border-blue-200/70 text-blue-700 shadow-[0_4px_16px_0_rgba(59,130,246,0.15),0_2px_8px_0_rgba(99,102,241,0.1)] hover:from-blue-200/95 hover:to-indigo-200/95 hover:border-blue-300/80 hover:shadow-[0_6px_24px_0_rgba(59,130,246,0.25),0_4px_12px_0_rgba(99,102,241,0.15)] hover:scale-105 active:scale-[0.98]",
    secondary: "bg-gray-200/70 border border-gray-300/50 text-gray-700 shadow-[0_4px_16px_0_rgba(0,0,0,0.08)] hover:bg-gray-200/80 hover:shadow-[0_6px_20px_0_rgba(0,0,0,0.12)] hover:scale-105",
    danger: "bg-gray-200/60 border border-gray-300/40 text-red-600 shadow-[0_4px_16px_0_rgba(0,0,0,0.08)] hover:bg-red-100/80 hover:border-red-300/50 hover:shadow-[0_6px_20px_0_rgba(239,68,68,0.15)]"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className} group overflow-hidden`}
    >
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300/20 via-indigo-300/20 to-blue-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[12px]"></div>
      )}
      {Icon && <Icon size={iconSize} className="relative z-10" />}
      <span className="relative z-10">{children}</span>
    </button>
  );
}