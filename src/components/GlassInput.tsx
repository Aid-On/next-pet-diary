'use client';

import React, { forwardRef } from 'react';

interface GlassInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
  type?: 'text' | 'email' | 'password';
  variant?: 'gradient' | 'gray';
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(({
  value,
  onChange,
  placeholder = '',
  disabled = false,
  maxLength,
  className = '',
  type = 'text',
  variant = 'gradient'
}, ref) => {
  const baseClasses = "relative w-full p-3 backdrop-blur-[15px] rounded-[12px] transition-all duration-300 focus:outline-none";
  
  const variantClasses = {
    gradient: "bg-white/15 border border-white/30 text-gray-700 placeholder-gray-500 shadow-[0_2px_8px_0_rgba(31,38,135,0.15)] focus:bg-white/20 focus:border-white/50 focus:shadow-[0_4px_12px_0_rgba(31,38,135,0.25)]",
    gray: "bg-gray-100/60 border border-gray-300/50 text-gray-700 placeholder-gray-500 shadow-[0_2px_8px_0_rgba(0,0,0,0.08)] focus:bg-gray-100/70 focus:border-gray-300/60 focus:shadow-[0_4px_12px_0_rgba(0,0,0,0.12)]"
  };

  return (
    <input
      ref={ref}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    />
  );
});

GlassInput.displayName = 'GlassInput';

export default GlassInput;