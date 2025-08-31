'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PetDiary } from '@/types/pet-diary';

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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white shadow-lg py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl shadow-lg group transition-all duration-300 hover:bg-white/20 hover:scale-105">
                <img
                  src="/images/肉球.svg"
                  alt="肉球"
                  className="w-[24px] h-[24px] object-contain group-hover:animate-pulse"
                />
              </div>
              <span className="text-2xl tracking-tight">ペット日記</span>
            </Link>
            <nav className="hidden md:block">
              <ul className="flex gap-2">
                <li>
                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
                    <div className="p-1.5 rounded-full bg-white/20">
                      <img
                        src="/images/本.svg"
                        alt="本"
                        className="w-[18px] h-[18px] object-contain"
                      />
                    </div>
                    <span className="font-medium">日記一覧</span>
                    <img
                      src="/images/星.svg"
                      alt="星"
                      className="w-[12px] h-[12px] object-contain ml-1 animate-pulse"
                    />
                  </div>
                </li>
                <li>
                  <Link href="/new" className="flex items-center gap-2 px-5 py-2.5 rounded-xl hover:bg-white/10 transition-all duration-300">
                    <span className="font-medium">新しい日記</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
      <div className="flex-1 flex px-[16px]">
        <div className="w-full flex flex-col max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 mt-[40px]">
            <h1 className="text-3xl font-bold flex items-center text-gray-800">
              <img
                src="/images/本2.png"
                alt="本2"
                className="w-[28px] h-[28px] object-contain text-purple-600 mr-2"
              />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                ペット日記一覧
              </span>
            </h1>
            <Link href="/new" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center self-start md:self-auto">
              <div className="w-[18px] h-[18px] text-[17px] text-white font-semibold leading-[18px] mr-2">
                ＋
              </div>
              新しい日記
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[37px]">
                {diaries.map((diary: PetDiary) => (
                  <Link key={diary.id} href={`/${diary.id}`} className="block">
                    <div className="w-full bg-white/90 backdrop-blur rounded-[16px] shadow-lg cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300">
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
