// src/components/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import GradientText from './GradientText';

export default function Header() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path === '/new' && pathname === '/new') return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-2xl border-b border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.1)] py-6">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="group">
            <div className="bg-white/30 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-2xl px-4 py-3 group-hover:bg-white/40 group-hover:shadow-3xl group-hover:scale-[1.02] transition-all duration-500">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-cyan-400 rounded-xl opacity-20 blur-sm"></div>
                  <div className="relative bg-white/60 backdrop-blur-md p-2.5 rounded-xl border border-white/60 shadow-lg">
                    <img
                      src="/images/肉球.svg"
                      alt="肉球"
                      className="w-[20px] h-[20px] object-contain"
                      style={{filter: 'brightness(0.7) saturate(1.2)'}}
                    />
                  </div>
                </div>
                <span 
                  className="text-2xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-transparent bg-clip-text tracking-tight"
                  style={{
                    backgroundSize: '300% 300%',
                    animation: 'gradientShift 12s ease-in-out infinite',
                    filter: 'drop-shadow(0 2px 8px rgba(168, 85, 247, 0.3))'
                  }}
                >
                  ペット日記
                </span>
              </div>
            </div>
          </Link>
          
          <nav className="hidden md:block">
            <div className="bg-white/25 backdrop-blur-2xl border border-white/30 rounded-full shadow-2xl px-3 py-2">
              <ul className="flex gap-2 items-center">
                <li className="flex">
                  {isActive('/') ? (
                    <div className="relative flex">
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-cyan-400 rounded-full opacity-25 blur-md"></div>
                      <div className="relative bg-white/50 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg border border-white/60 transition-all duration-300 flex items-center justify-center min-w-[80px] h-[36px]">
                        <span className="text-gray-800 font-bold text-sm whitespace-nowrap">日記一覧</span>
                      </div>
                    </div>
                  ) : (
                    <Link 
                      href="/" 
                      className="bg-white/20 backdrop-blur-lg px-4 py-2 rounded-full border border-white/30 hover:bg-white/35 hover:border-white/50 transition-all duration-300 flex items-center justify-center min-w-[80px] h-[36px]"
                    >
                      <span className="text-gray-700 font-medium text-sm whitespace-nowrap">日記一覧</span>
                    </Link>
                  )}
                </li>
                <li className="flex">
                  {isActive('/new') ? (
                    <div className="relative flex">
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-cyan-400 rounded-full opacity-25 blur-md"></div>
                      <div className="relative bg-white/50 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg border border-white/60 transition-all duration-300 flex items-center justify-center min-w-[80px] h-[36px]">
                        <span className="text-gray-800 font-bold text-sm whitespace-nowrap">新しい日記</span>
                      </div>
                    </div>
                  ) : (
                    <Link 
                      href="/new" 
                      className="bg-white/20 backdrop-blur-lg px-4 py-2 rounded-full border border-white/30 hover:bg-white/35 hover:border-white/50 transition-all duration-300 flex items-center justify-center min-w-[80px] h-[36px]"
                    >
                      <span className="text-gray-700 font-medium text-sm whitespace-nowrap">新しい日記</span>
                    </Link>
                  )}
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>
      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </header>
  );
}