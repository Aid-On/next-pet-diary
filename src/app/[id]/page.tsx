'use client';
import { PetDiary } from '@/types/pet-diary';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function PetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [diaryEntry, setDiaryEntry] = useState<PetDiary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  // 画像URLを修正（相対パスを絶対パスに変換）
  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return url;
    return `/${url}`;
  };

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    return `${year}年${month}月${day}日`;
  };

  useEffect(() => {
    if (!id) {
      setError('IDが指定されていません');
      setLoading(false);
      return;
    }

    fetchDiaryEntry();
  }, [id]);

  const fetchDiaryEntry = async () => {
    try {
      const response = await fetch(`/pet-diaries/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('指定された日記が見つかりません');
        }
        throw new Error('日記の取得に失敗しました');
      }
      const data = await response.json();
      const diaryWithDate: PetDiary = {
        ...data,
        createdAt: new Date(data.createdAt),
      };
      setDiaryEntry(diaryWithDate);
      setLoading(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('エラーが発生しました');
      }
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/pet-diaries/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      // 削除成功後、ホームページにリダイレクト
      router.push('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('削除中にエラーが発生しました');
      }
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg text-red-600">エラー: {error}</div>
      </div>
    );
  }

  if (!diaryEntry) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg text-gray-600">
          日記エントリが見つかりません
        </div>
      </div>
    );
  }

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
            <div className="w-[64px] h-[19px] text-white text-[16px] leading-[20px] font-sans">
              日記詳細
            </div>
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
      <div className="flex-1 flex flex-col px-4 sm:px-8 md:px-16 lg:px-[240px] py-[40px] mx-auto w-full">
        <Link
          href="/"
          className="w-full h-[24px] flex items-center cursor-pointer"
        >
          <div className="w-[18px] h-[18px]">
            <img
              src="/images/左矢印.png"
              alt="左矢印"
              className="w-[18px] h-[18px] object-cover"
            />
          </div>
          <div className="w-auto h-[19px] text-[#9333EA] text-[14px] font-sans ml-[4px]">
            一覧に戻る
          </div>
        </Link>

        <div className="w-full h-auto flex flex-col mt-[32px]">
          <div className="bg-gray-100 w-full aspect-[16/9] max-h-[500px] overflow-hidden relative rounded-t-[16px]">
            <img
              src={getImageUrl(diaryEntry.imageUrl)}
              alt={diaryEntry.petName || 'ペット'}
              className="absolute inset-0 w-full h-full object-contain"
              loading="lazy"
              onError={e => {
                e.currentTarget.src = '/images/placeholder.jpg';
              }}
            />
          </div>
          <div className="bg-[#e8e3e8] w-full h-auto flex flex-col rounded-b-[16px] shadow-2xl p-4 sm:p-6 md:p-8">
            <div className="w-full h-[46px] flex justify-between items-center">
              <div className="bg-[#F3E8FF] w-auto h-[40px] rounded-[9px] px-[16px] flex items-center">
                <div className="w-full h-[26px] flex items-center">
                  <div className="w-[18px] h-[18px] flex justify-center items-center">
                    <img
                      src="/images/日付.png"
                      alt="日付"
                      className="w-[18px] h-[18px] object-cover"
                    />
                  </div>
                  <div className="w-auto h-[17px] text-[#6B7280] leading-[18px] text-[14px] font-sans flex ml-[6px]">
                    {formatDate(diaryEntry.createdAt)}
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link
                  href={`/${id}/edit`}
                  className="bg-white w-[82px] h-[46px] border-[#9333EA] border-[1px] rounded-[12px] flex justify-center items-center cursor-pointer hover:bg-[#F3E8FF] transition-colors"
                >
                  <div className="w-auto h-[19px] text-[#9333EA] text-[14px] font-sans">
                    編集
                  </div>
                </Link>
                <div className="w-[96px] h-[46px] py-[13.5px] px-[20px] flex justify-between cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="bg-[#fca5a5] w-[16px] h-[16px]">
                    <img
                      src="/images/ゴミ箱.png"
                      alt="ゴミ箱"
                      className="w-[16px] h-[16px] object-cover"
                    />
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-[32px] h-[19px] text-[13.6px] text-red-600 font-sans leading-[18px]"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>

            {/* ペットの特徴表示（存在する場合） */}
            {diaryEntry.petCharacteristics && (
              <div className="w-full h-auto flex flex-col mt-[24px] mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ペットの特徴・性格
                </label>
                <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  {diaryEntry.petCharacteristics}
                </div>
              </div>
            )}

            {/* 内容表示 - 詳細画面と同じ位置・スタイル */}
            <div className="w-full h-auto flex text-[15.3px] text-[#1F2937] leading-[34px] mt-[24px]">
              <div className="w-full whitespace-pre-wrap">
                {diaryEntry.content}
              </div>
            </div>

            {/* ペット名表示 - 詳細画面と同じ位置・スタイル */}
            <div className="w-full h-auto flex items-center mt-[16px]">
              <div className="text-[14px] text-[#6B7280] font-sans">
                ペット名: {diaryEntry.petName || diaryEntry.authour}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[400px]">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              削除の確認
            </h3>
            <p className="text-gray-600 mb-6">
              この日記を削除してもよろしいですか？この操作は取り消せません。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? '削除中...' : '削除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
