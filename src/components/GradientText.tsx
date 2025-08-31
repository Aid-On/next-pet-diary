// src/components/GradientText.tsx
'use client';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export default function GradientText({ 
  children, 
  className = ''
}: GradientTextProps) {
  return (
    <span className={`text-gray-800 font-semibold ${className}`}>
      {children}
    </span>
  );
}