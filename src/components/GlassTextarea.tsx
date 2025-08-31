'use client';

import React, { forwardRef } from 'react';

interface GlassTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onInput?: (e: React.FormEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
  variant?: 'gradient' | 'gray';
  minHeight?: string;
}

const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(({
  value,
  onChange,
  onInput,
  placeholder = '',
  disabled = false,
  maxLength,
  className = '',
  variant = 'gradient',
  minHeight = 'min-h-[80px]'
}, ref) => {
  const baseClasses = "relative w-full p-3 backdrop-blur-[15px] rounded-[12px] resize-none transition-all duration-300 focus:outline-none";
  
  const variantClasses = {
    gradient: "bg-white/15 border border-white/30 text-gray-700 placeholder-gray-500 shadow-[0_2px_8px_0_rgba(31,38,135,0.15)] focus:bg-white/20 focus:border-white/50 focus:shadow-[0_4px_12px_0_rgba(31,38,135,0.25)]",
    gray: "bg-gray-100/60 border border-gray-300/50 text-gray-700 placeholder-gray-500 shadow-[0_2px_8px_0_rgba(0,0,0,0.08)] focus:bg-gray-100/70 focus:border-gray-300/60 focus:shadow-[0_4px_12px_0_rgba(0,0,0,0.12)]"
  };

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      onInput={onInput}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      className={`${baseClasses} ${variantClasses[variant]} ${minHeight} ${className}`}
    />
  );
});

GlassTextarea.displayName = 'GlassTextarea';

export default GlassTextarea;