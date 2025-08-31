// import { memoryStorage, serializePetDiary } from '@/app/pet-diaries/route';
import { generateAIResponse } from '@/lib/ai';
import type { PetDiary } from '@/types/pet-diary';
import { randomUUID } from 'crypto';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
};

export default nextConfig;
