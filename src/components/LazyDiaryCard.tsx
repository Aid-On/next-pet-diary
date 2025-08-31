'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PetDiary } from '@/types/pet-diary';

interface LazyDiaryCardProps {
  diary: PetDiary;
  formatDate: (date: Date | string) => string;
  getImageUrl: (url: string) => string;
}

const LazyDiaryCard = memo(function LazyDiaryCard({ 
  diary, 
  formatDate, 
  getImageUrl 
}: LazyDiaryCardProps) {
  return (
    <Link href={`/${diary.id}`} className="block">
      <div className="w-full bg-white/25 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 cursor-pointer hover:shadow-3xl hover:scale-105 hover:bg-white/35 hover:border-white/50 transition-all duration-500">
        <div className="w-full aspect-[324/224] rounded-t-[16px] overflow-hidden relative">
          <Image
            src={getImageUrl(diary.imageUrl)}
            alt={diary.authour}
            fill
            className="object-cover rounded-t-[16px]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyatCNPCNutdBuLe6jiZ0aPaG5bEr5v5EpQKG5aOFVwtrjP84iADNd/gfVZtWZNGh2w9jCcFAu2FS7Y9tWnLiYJ9xFEqnAAQJj4Lve5c2CqVhp0nM9/kgP3qB5dvlckNw76B8XTwSAnJAZqA"
            onError={() => {}}
          />
        </div>
        <div className="p-[24px]">
          <div className="w-full h-[26px] flex items-center">
            <div className="w-[26px] h-[26px] rounded-[50%] flex justify-center items-center">
              <Image
                src="/images/日付.png"
                alt="日付"
                width={15}
                height={15}
                className="object-cover mr-[2px]"
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
              <Image
                src="/images/大なり.png"
                alt="大なり"
                width={16}
                height={16}
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

export default LazyDiaryCard;