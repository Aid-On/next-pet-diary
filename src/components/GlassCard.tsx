'use client';

import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'gradient' | 'gray';
  className?: string;
}

export default function GlassCard({
  children,
  variant = 'gradient',
  className = ''
}: GlassCardProps) {
  const baseClasses = "relative backdrop-blur-[20px] rounded-[20px] overflow-hidden";
  
  const variantClasses = {
    gradient: "bg-white/20 border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:rounded-[20px] before:pointer-events-none",
    gray: "bg-gray-100/90 border border-gray-200/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}