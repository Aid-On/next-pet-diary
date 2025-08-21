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
      <header className="bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F97316] w-full justify-between items-center h-[60px] sm:h-[70px] md:h-[82px] min-h-[60px] sm:min-h-[70px] md:min-h-[82px] max-h-[60px] sm:max-h-[70px] md:max-h-[82px] shadow-xl flex p-3 sm:p-4 box-border">
        <div className="w-[120px] sm:w-[140px] md:w-[165px] h-[36px] sm:h-[38px] md:h-[40px] flex justify-between items-center">
          <div className="bg-[#a159d6] w-[32px] sm:w-[36px] md:w-[40px] h-[32px] sm:h-[36px] md:h-[40px] flex justify-center items-center rounded-[8px] sm:rounded-[10px] md:rounded-[12px] shadow-lg">
            <img
              src="/images/肉球.svg"
              alt="肉球"
              className="w-[20px] sm:w-[24px] md:w-[28px] h-[20px] sm:h-[24px] md:h-[28px] object-contain"
            />
          </div>
          <div className="w-[80px] sm:w-[100px] md:w-[120px] h-[26px] sm:h-[28px] md:h-[30px] text-white text-[16px] sm:text-[19px] md:text-[22px] font-semibold flex items-center">
            ペット日記
          </div>
        </div>
        <div className="w-auto sm:w-[240px] md:w-[281px] h-[44px] sm:h-[48px] md:h-[50px] flex justify-between items-center">
          <div className="bg-[#e27c63] w-[100px] sm:w-[115px] md:w-[131px] h-[36px] sm:h-[40px] md:h-[44px] flex justify-center items-center rounded-[8px] sm:rounded-[10px] md:rounded-[12px] shadow-2xl">
            <div className="bg-white/20 w-[10px] sm:w-[11px] md:w-[12px] h-[10px] sm:h-[11px] md:h-[12px] rounded-[50%]"></div>
            <div className="w-auto h-[17px] sm:h-[18px] md:h-[19px] text-white text-[11px] sm:text-[12.5px] md:text-[13.6px] leading-[18px] sm:leading-[19px] md:leading-[20px] font-sans ml-[6px] sm:ml-[7px] md:ml-[8px]">
              ホーム
            </div>
            <div className="w-[12px] sm:w-[13px] md:w-[14px] h-[12px] sm:h-[13px] md:h-[14px] flex justify-center items-center ml-[8px] sm:ml-[10px] md:ml-[12px]">
              <img
                src="/images/星.svg"
                alt="星"
                className="w-[12px] sm:w-[13px] md:w-[14px] h-[12px] sm:h-[13px] md:h-[14px] object-contain"
              />
            </div>
          </div>

          <div className="hidden sm:flex w-[115px] md:w-[142px] h-[44px] md:h-[50px] rounded-[10px] md:rounded-[12px] px-[15px] md:px-[20px] justify-between items-center">
            <div className="w-[28px] md:w-[32px] h-[28px] md:h-[32px] rounded-[50%] flex justify-center items-center">
              <img
                src="/images/本.svg"
                alt="本"
                className="w-[18px] md:w-[21px] h-[18px] md:h-[21px] object-contain"
              />
            </div>
            <div className="w-[56px] md:w-[64px] h-[17px] md:h-[19px] text-white text-[12px] md:text-[13.6px] leading-[18px] md:leading-[20px] font-sans">
              日記一覧
            </div>
          </div>
        </div>
      </header>
      <div className="flex-1 flex flex-col py-[20px] sm:py-[30px] md:py-[40px] px-[20px] sm:px-[40px] md:px-[80px] lg:px-[160px] xl:px-[240px] overflow-y-auto">
        <div className="w-full h-auto flex flex-col items-center">
          <div className="bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F97316] w-full h-[36px] sm:h-[42px] md:h-[48px] text-center text-[28px] sm:text-[34px] md:text-[40.8px] font-bold leading-[36px] sm:leading-[42px] md:leading-[48px] flex flex-col">
            ペット日記
          </div>
          <div className="w-full max-w-[672px] h-auto flex flex-col mt-[8px] sm:mt-[9px] md:mt-[10px] text-center text-[#374151] text-[14px] sm:text-[15.5px] md:text-[17px] pt-[2px] leading-[22px] sm:leading-[25px] md:leading-[28px] px-4 sm:px-0">
            写真をアップロードするだけで、ペットの日記を自動生成します。
            <br />
            大切なペットの成長を記録しましょう。
          </div>
        </div>
        <div className="bg-gray-100 w-full h-auto min-h-[280px] sm:min-h-[308px] md:min-h-[336px] flex flex-col items-center shadow-2xl rounded-[12px] sm:rounded-[14px] md:rounded-[16px] mt-[24px] sm:mt-[32px] md:mt-[42px] pt-[24px] sm:pt-[28px] md:pt-[32px] pb-[24px] sm:pb-[28px] md:pb-[32px]">
          <div className="bg-white w-[72px] sm:w-[84px] md:w-[96px] h-[72px] sm:h-[84px] md:h-[96px] rounded-[50%] shadow-[0_8px_32px_0_rgba(255,105,180,0.3)]"></div>
          <div className="w-auto h-[18px] sm:h-[20px] md:h-[21.5px] text-[#1F2937] text-[13px] sm:text-[14px] md:text-[15.3px] font-sans mt-[20px] sm:mt-[24px] md:mt-[27px] px-4 text-center">
            ここに写真をドラッグ＆ドロップ
          </div>
          <div className="w-auto h-[14px] sm:h-[15px] md:h-[16.5px] text-[#4B5563] text-[10px] sm:text-[11px] md:text-[11.9px] mt-[7px] sm:mt-[8px] md:mt-[9px]">
            または
          </div>
          <div className="bg-gradient-to-r from-[#9333EA] to-[#DB2777] w-[112px] sm:w-[120px] md:w-[128px] h-[40px] sm:h-[44px] md:h-[48px] mt-[14px] sm:mt-[16px] md:mt-[18px] rounded-[10px] sm:rounded-[11px] md:rounded-[12px] flex justify-center items-center">
            <div className="w-auto h-auto text-white text-[12px] sm:text-[12.8px] md:text-[13.6px] font-sans">
              写真を選択
            </div>
          </div>
          <div className="w-auto h-[14px] sm:h-[15px] md:h-[16.5px] text-[#4B5563] text-[10px] sm:text-[11px] md:text-[11.9px] mt-[14px] sm:mt-[16px] md:mt-[17.5px]">
            PNG, JPG, GIF 最大 10MB
          </div>
        </div>
        <div className="w-full h-auto flex flex-col lg:flex-row justify-between mt-[32px] sm:mt-[48px] md:mt-[64px] gap-[24px] sm:gap-[32px] lg:gap-[40px]">
          <div className="bg-gray-100 shadow-2xl w-full lg:w-[48%] h-auto min-h-[280px] sm:min-h-[308px] md:min-h-[336px] flex flex-col p-[20px] sm:p-[26px] md:p-[32px] rounded-[12px] sm:rounded-[14px] md:rounded-[16px]">
            <div className="w-full h-[26px] sm:h-[29px] md:h-[32px] flex items-center">
              <div className="w-[20px] sm:w-[22px] md:w-[24px] h-[20px] sm:h-[22px] md:h-[24px]">
                <img
                  src="/images/電球.png"
                  alt="電球"
                  className="w-[20px] sm:w-[22px] md:w-[24px] h-[20px] sm:h-[22px] md:h-[24px] object-contain"
                />
              </div>
              <div className="w-auto h-[24px] sm:h-[26px] md:h-[28px] ml-[6px] sm:ml-[7px] md:ml-[8px] text-[#111827] text-[16px] sm:text-[18px] md:text-[20.4px] font-semibold">
                使い方
              </div>
            </div>
            <div className="w-full h-auto flex items-start mt-[18px] sm:mt-[21px] md:mt-[24px]">
              <div className="bg-white w-[28px] sm:w-[31px] md:w-[34px] h-[28px] sm:h-[31px] md:h-[34px] rounded-[50%] flex justify-center items-center flex-shrink-0">
                <img
                  src="/images/更新.png"
                  alt="更新"
                  className="w-[14px] sm:w-[16px] md:w-[18px] h-[14px] sm:h-[16px] md:h-[18px] object-contain"
                />
              </div>
              <div className="w-auto h-auto ml-[10px] sm:ml-[11px] md:ml-[12px] leading-[20px] sm:leading-[22px] md:leading-[24px] text-[#374151] text-[12px] sm:text-[13px] md:text-[14px]">
                ペットの写真をアップロードします
              </div>
            </div>
            <div className="w-full h-auto flex items-start mt-[12px] sm:mt-[14px] md:mt-[16px]">
              <div className="bg-white w-[28px] sm:w-[31px] md:w-[34px] h-[28px] sm:h-[31px] md:h-[34px] rounded-[50%] flex justify-center items-center flex-shrink-0">
                <img
                  src="/images/えんぴつ.png"
                  alt="えんぴつ"
                  className="w-[14px] sm:w-[16px] md:w-[18px] h-[14px] sm:h-[16px] md:h-[18px] object-contain"
                />
              </div>
              <div className="w-auto h-auto ml-[10px] sm:ml-[11px] md:ml-[12px] leading-[20px] sm:leading-[22px] md:leading-[24px] text-[#374151] text-[12px] sm:text-[13px] md:text-[14px]">
                AIが写真を分析し、ペットの様子を自動で日記にします
              </div>
            </div>
            <div className="w-full h-auto flex items-start mt-[12px] sm:mt-[14px] md:mt-[16px]">
              <div className="bg-white w-[28px] sm:w-[31px] md:w-[34px] h-[28px] sm:h-[31px] md:h-[34px] rounded-[50%] flex justify-center items-center flex-shrink-0">
                <img
                  src="/images/オレンジハート.png"
                  alt="オレンジハート"
                  className="w-[14px] sm:w-[16px] md:w-[18px] h-[14px] sm:h-[16px] md:h-[18px] object-contain"
                />
              </div>
              <div className="w-auto h-auto ml-[10px] sm:ml-[11px] md:ml-[12px] leading-[20px] sm:leading-[22px] md:leading-[24px] text-[#374151] text-[12px] sm:text-[13px] md:text-[14px]">
                必要に応じて日記の内容を編集できます
              </div>
            </div>
            <div className="w-full h-auto flex items-start mt-[12px] sm:mt-[14px] md:mt-[16px]">
              <div className="bg-white w-[28px] sm:w-[31px] md:w-[34px] h-[28px] sm:h-[31px] md:h-[34px] rounded-[50%] flex justify-center items-center flex-shrink-0">
                <img
                  src="/images/赤ハート.png"
                  alt="赤ハート"
                  className="w-[14px] sm:w-[16px] md:w-[18px] h-[14px] sm:h-[16px] md:h-[18px] object-contain"
                />
              </div>
              <div className="w-auto h-auto ml-[10px] sm:ml-[11px] md:ml-[12px] leading-[20px] sm:leading-[22px] md:leading-[24px] text-[#374151] text-[12px] sm:text-[13px] md:text-[14px]">
                日々の記録を振り返って、ペットの成長を楽しみましょう
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#9333EA] to-[#DB2777] w-full lg:w-[48%] h-[280px] sm:h-[308px] md:h-[336px] flex flex-col justify-center items-center rounded-[12px] sm:rounded-[14px] md:rounded-[16px]">
            <div className="bg-white/30 w-[88px] sm:w-[100px] md:w-[112px] h-[82px] sm:h-[93px] md:h-[104px] flex flex-col justify-center items-center rounded-[50%]">
              <img
                src="/images/細い赤ハート.png"
                alt="細い赤ハート"
                className="w-[44px] sm:w-[50px] md:w-[56px] h-[44px] sm:h-[50px] md:h-[56px] object-contain"
              />
            </div>
            <div className="w-auto h-[20px] sm:h-[22px] md:h-[23.5px] text-white text-[14px] sm:text-[15.5px] md:text-[17px] font-sans mt-[20px] sm:mt-[23px] md:mt-[26px] px-4 text-center">
              大切な思い出を残そう
            </div>
            <div className="w-auto h-[17px] sm:h-[18px] md:h-[19px] text-white/90 text-[11px] sm:text-[12.5px] md:text-[13.6px] mt-[10px] sm:mt-[12px] md:mt-[13px] px-4 text-center">
              毎日のかわいい瞬間を逃さず記録しましょう
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
