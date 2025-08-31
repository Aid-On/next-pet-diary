'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface GlassTagProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  iconSize?: number;
  variant?: 'gradient' | 'gray';
  className?: string;
}

export default function GlassTag({
  children,
  icon: Icon,
  iconSize = 18,
  variant = 'gradient',
  className = ''
}: GlassTagProps) {
  const baseClasses = "relative backdrop-blur-[15px] rounded-[12px] px-[16px] flex items-center";
  
  const variantClasses = {
    gradient: "bg-white/20 border border-white/30 shadow-[0_4px_16px_0_rgba(31,38,135,0.15)] before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/15 before:to-transparent before:rounded-[12px] before:pointer-events-none",
    gray: "bg-gray-200/70 border border-gray-300/50 shadow-[0_4px_16px_0_rgba(0,0,0,0.08)]"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <div className="w-full h-[26px] flex items-center relative z-10">
        {Icon && (
          <div className="w-[18px] h-[18px] flex justify-center items-center">
            <Icon size={iconSize} className="text-gray-600" />
          </div>
        )}
        <div className="w-auto h-[17px] text-gray-700 leading-[18px] text-[14px] font-sans flex ml-[6px]">
          {children}
        </div>
      </div>
    </div>
  );
}