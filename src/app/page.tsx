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
      const response = await fetch('/pet-diaries');
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
    <div className="flex flex-col h-screen">
      <header className="bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F97316] w-full justify-between items-center h-[82px] min-h-[82px] max-h-[82px] shadow-xl flex p-4 box-border">
        <div className="w-[165px] h-[40px] flex justify-between items-center">
          <div className="bg-[#a159d6] w-[40px] h-[40px] flex justify-center items-center rounded-[12px] shadow-lg">
            <img
              src="/images/肉球.svg"
              alt="肉球"
              className="w-[28px] h-[28px] object-contain"
            />
          </div>
          <div className="w-[120px] h-[30px] text-white text-[22px] font-semibold flex items-center">
            ペット日記
          </div>
        </div>
        <div className="w-[281px] h-[50px] flex justify-between items-center">
          <Link href={'/new'}>
            <div className="w-[50px] h-[19px] text-white text-[16px] leading-[20px] font-sans">
              ホーム
            </div>
          </Link>
          <div className="bg-[#e27c63] w-[172px] h-[50px] rounded-[12px] px-[22px] flex justify-between items-center">
            <div className="bg-[#de937c] w-[32px] h-[32px] rounded-[50%] flex justify-center items-center">
              <img
                src="/images/本.svg"
                alt="本"
                className="w-[21px] h-[21px] object-contain"
              />
            </div>
            <Link href={'/'}>
              <div className="w-[64px] h-[19px] text-white text-[16px] leading-[20px] font-sans">
                日記一覧
              </div>
            </Link>
            <div className="bg-[#ff9ca9] w-[14px] h-[14px] flex justify-center items-center">
              <img
                src="/images/星.svg"
                alt="星"
                className="w-[14px] h-[14px] object-contain"
              />
            </div>
          </div>
        </div>
      </header>
      <div className="flex-1 flex px-[16px]">
        <div className="w-full flex flex-col">
          <div className="w-full h-[48px] mt-[40px] flex justify-between items-center">
            <div className=" w-[246px] h-[36px] flex justify-between items-center">
              <div className="w-[30px] h-[30px] flex justify-center items-center">
                <img
                  src="/images/本2.png"
                  alt="本2"
                  className="w-[28px] h-[28px] object-contain"
                />
              </div>
              <Link href={'/'}>
                <div className="bg-gradient-to-r from-[#9333EA] to-[#DB2777] w-[210px] h-[35.5px] flex justify-center items-center text-white text-[27px] font-bold">
                  ペット日記一覧
                </div>
              </Link>
            </div>
            <div className="bg-gradient-to-r from-[#9333EA] to-[#DB2777] w-[146px] h-[48px] flex justify-between items-center px-[20px] py-[14.5px] rounded-[12px] cursor-pointer hover:opacity-90 transition-opacity">
              <div className="w-[18px] h-[18px] text-[17px] text-white font-semibold leading-[18px]">
                ＋
              </div>
              <Link href={'/new'}>
                <div className="w-[80px] h-[19px] text-[15px] text-white font-medium leading-[19px]">
                  新しい日記
                </div>
              </Link>
            </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[37px]">
                {diaries.map((diary: PetDiary) => (
                  <Link key={diary.id} href={`/${diary.id}`} className="block">
                    <div className="w-full max-w-[324px] mx-auto bg-white/90 backdrop-blur rounded-[16px] shadow-lg cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300">
                      <div className="w-full  aspect-[324/224] rounded-t-[16px] overflow-hidden relative">
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
