'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PetDiary } from '@/types/pet-diary';
import Header from '@/components/Header';
import { BookOpen } from 'lucide-react';

export default function Home() {
  const [diaries, setDiaries] = useState<PetDiary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDiaries();
  }, []);

  const fetchDiaries = async () => {
    try {
      // Next.jsのAPIルートを使用（ポート番号不要）
      const response = await fetch('/api/pet-diaries');
      if (!response.ok) {
        throw new Error('Failed to fetch diaries');
      }
      const data = await response.json();
      // createdAtをDate型に変換
      const diariesWithDate: PetDiary[] = data.map((diary: any) => ({
        ...diary,
        createdAt: new Date(diary.createdAt),
      }));
      setDiaries(diariesWithDate);
      setLoading(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    return `${year}年${month}月${day}日`;
  };

  // 画像URLを正規化する関数（詳細画面と同じ処理）
  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return url;
    return `/${url}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-cyan-200 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-purple-300/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      <Header />
      <div className="flex-1 flex px-[16px]">
        <div className="w-full flex flex-col max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 mt-[40px]">
            <h1 className="text-3xl font-bold flex items-center text-gray-800">
              <div className="bg-white/40 backdrop-blur-md p-2 rounded-2xl border border-white/50 mr-3 shadow-lg">
                <BookOpen size={28} className="text-gray-700" />
              </div>
              <div className="relative">
                <span 
                  className="bg-gradient-to-r from-pink-400 via-purple-400 via-indigo-400 to-cyan-400 text-transparent bg-clip-text relative z-10"
                  style={{
                    backgroundSize: '200% 200%',
                    animation: 'gradientShift 8s ease-in-out infinite',
                    filter: 'drop-shadow(0 6px 18px rgba(219, 39, 119, 0.2)) drop-shadow(0 3px 9px rgba(6, 182, 212, 0.15))'
                  }}
                >
                  ペット日記一覧
                </span>
                <span 
                  className="absolute inset-0 bg-gradient-to-r from-pink-300/20 via-purple-300/20 via-indigo-300/20 to-cyan-300/20 text-transparent bg-clip-text blur-sm"
                  style={{
                    backgroundSize: '200% 200%',
                    animation: 'gradientShift 8s ease-in-out infinite reverse'
                  }}
                >
                  ペット日記一覧
                </span>
              </div>
              <style jsx>{`
                @keyframes gradientShift {
                  0%, 100% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                }
              `}</style>
            </h1>
            <Link href="/new" className="bg-white/20 backdrop-blur-xl border border-white/40 px-6 py-3 rounded-2xl font-semibold shadow-2xl hover:shadow-3xl hover:scale-105 hover:bg-white/25 transition-all duration-300 flex items-center self-start md:self-auto">
              <div className="bg-white/30 backdrop-blur-md p-1.5 rounded-full border border-white/40 mr-3 shadow-md">
                <div className="w-[18px] h-[18px] text-[17px] text-gray-800 font-bold leading-[18px] flex items-center justify-center">
                  ＋
                </div>
              </div>
              <span className="text-gray-800 font-semibold">新しい日記</span>
            </Link>
          </div>
          <div className="w-full h-auto mt-[32px] flex">
            {loading ? (
              <div className="w-full flex justify-center items-center h-[200px]">
                <div className="text-[#9333EA] text-xl">読み込み中...</div>
              </div>
            ) : error ? (
              <div className="w-full flex justify-center items-center h-[200px]">
                <div className="text-red-500 text-xl">エラー: {error}</div>
              </div>
            ) : diaries.length === 0 ? (
              <div className="w-full flex justify-center items-center h-[200px]">
                <div className="text-gray-500 text-xl">日記がありません</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[37px] pb-16">
                {diaries.map((diary: PetDiary) => (
                  <Link key={diary.id} href={`/${diary.id}`} className="block">
                    <div className="w-full bg-white/25 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 cursor-pointer hover:shadow-3xl hover:scale-105 hover:bg-white/35 hover:border-white/50 transition-all duration-500">
                      <div className="w-full aspect-[324/224] rounded-t-[16px] overflow-hidden relative">
                        <img
                          src={getImageUrl(diary.imageUrl)}
                          alt={diary.authour}
                          className="absolute inset-0 w-full h-full object-cover rounded-t-[16px]"
                          loading="lazy"
                          onError={e => {
                            e.currentTarget.src = '/images/placeholder.jpg';
                          }}
                        />
                      </div>
                      <div className="p-[24px]">
                        <div className="w-full h-[26px] flex items-center">
                          <div className="w-[26px] h-[26px] rounded-[50%] flex justify-center items-center">
                            <img
                              src="/images/日付.png"
                              alt="日付"
                              className="w-[15px] h-[15px] object-cover mr-[2px]"
                            />
                          </div>
                          <div className="text-[#6B7280] leading-[18px] text-[13px] flex ml-[8px]">
                            {formatDate(diary.createdAt)}
                          </div>
                        </div>
                        <div className="w-full h-[56px] flex text-[#1F2937] items-center mt-[12px] overflow-hidden">
                          <p
                            className="text-ellipsis overflow-hidden"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: '1.4em',
                              maxHeight: '2.8em',
                            }}
                          >
                            {diary.content}
                          </p>
                        </div>
                        <div className="w-full h-[20px] flex justify-end items-center mt-[20px]">
                          <div className="text-[#9333EA] text-[11.9px] font-medium hover:underline">
                            詳細を見る
                          </div>
                          <div className="w-[16px] h-[16px] text-[#9333EA] text-[11.9px] font-medium ml-2">
                            <img
                              src="/images/大なり.png"
                              alt="大なり"
                              className="w-[16px] h-[16px] object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
