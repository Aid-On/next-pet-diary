'use client';
import { PetDiary } from '@/types/pet-diary';
import GradientText from '@/components/GradientText';
import Header from '@/components/Header';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Calendar } from 'lucide-react';

// フォールバックデータ
const FALLBACK_DIARIES: PetDiary[] = [
  {
    authour: 'kotone',
    petName: 'ピノ',
    id: '7ec6ccc0-e3e5-4ded-a073-2b197393645a',
    imageUrl: '/images/pino.jpg',
    createdAt: new Date('2025-08-07T00:00:00.000Z'),
    content: '今日もウサギは可愛かった',
  },
  {
    authour: 'kotone',
    petName: 'ユキ',
    id: '7ec6ccc0-e3e5-4ded-a073-2b197393645b',
    imageUrl: '/images/yuki.jpg',
    createdAt: new Date('2025-08-07T00:00:00.000Z'),
    content: '今日もウサギは可愛かった',
  },
  {
    authour: 'kotone',
    petName: 'ウィム',
    id: '7ec6ccc0-e3e5-4ded-a073-2b197393645c',
    imageUrl: '/images/wim.jpg',
    createdAt: new Date('2025-08-07T00:00:00.000Z'),
    content: '今日もウサギは可愛かった',
  },
];

export default function PetDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter(); // これで使用されるようになります

  const [diaryEntry, setDiaryEntry] = useState<PetDiary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);

  const formatDate = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return '日付不明';
      }
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth() + 1;
      const day = dateObj.getDate();
      return `${year}年${month}月${day}日`;
    } catch (error) {
      console.error('formatDate - Error:', error);
      return '日付不明';
    }
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
      console.log('fetchDiaryEntry - Starting with ID:', id);
      setLoading(true);
      setError(null);

      // まずフォールバックデータから検索
      const fallbackItem = FALLBACK_DIARIES.find(item => item.id === id);

      // APIを試行
      try {
        const response = await fetch(`/api/pet-diaries/${id}`);

        if (response.ok) {
          const data = await response.json();
          console.log('fetchDiaryEntry - Successfully fetched from API');

          // createdAtをDate型に変換
          const diaryWithDate: PetDiary = {
            ...data,
            createdAt: new Date(data.createdAt),
          };
          setDiaryEntry(diaryWithDate);
          setIsUsingFallback(false);
          setLoading(false);
          return;
        } else if (response.status === 404) {
          throw new Error('指定された日記が見つかりません');
        } else {
          throw new Error(`API Error: ${response.status}`);
        }
      } catch (apiError) {
        console.error('fetchDiaryEntry - API failed:', apiError);

        // APIが失敗した場合、フォールバックデータを使用
        if (fallbackItem) {
          console.log('fetchDiaryEntry - Using fallback data');
          setDiaryEntry(fallbackItem);
          setIsUsingFallback(true);
          setError('サーバーとの通信に失敗しました（サンプルデータを表示）');
        } else {
          throw new Error('指定された日記が見つかりません');
        }
      }
    } catch (err) {
      console.error('fetchDiaryEntry - Final error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('エラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  // router使用部分: 削除機能
  const handleDelete = async () => {
    if (isUsingFallback) {
      setError('サンプルデータは削除できません');
      setShowDeleteConfirm(false);
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/pet-diaries/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      // 削除成功後、router使用してホームページにリダイレクト
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

  // router使用部分: エラー時のナビゲーション
  const handleBackToHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (error && !diaryEntry) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">エラー: {error}</div>
          <div className="space-x-4">
            <button
              onClick={fetchDiaryEntry}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              再試行
            </button>
            <button
              onClick={handleBackToHome}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!diaryEntry) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">
            日記エントリが見つかりません
          </div>
          <button
            onClick={handleBackToHome}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  // 画像URLを修正（相対パスを絶対パスに変換）
  const getImageUrl = (url: string) => {
    if (!url) return '/images/placeholder.jpg';
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
      <div className="flex-1 flex flex-col px-4 sm:px-8 md:px-16 lg:px-[240px] py-[40px] mx-auto w-full">
        <Link
          href="/"
          className="w-full h-[24px] flex items-center cursor-pointer hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={18} className="text-purple-600/80" />
          <div className="w-auto h-[19px] text-purple-600/80 text-[14px] font-sans ml-[4px]">
            日記一覧に戻る
          </div>
        </Link>

        {/* エラー・ステータス表示 */}
        {(error || isUsingFallback) && (
          <div className="w-full mt-[16px] p-4 rounded-lg bg-yellow-50 border border-yellow-200">
            {error && !isUsingFallback && (
              <div className="text-yellow-800 text-sm mb-2">⚠️ {error}</div>
            )}
            {isUsingFallback && (
              <div className="text-yellow-700 text-sm">
                📖 サンプルデータを表示しています
                <button
                  onClick={fetchDiaryEntry}
                  className="ml-2 text-blue-600 hover:text-blue-800 underline"
                >
                  再試行
                </button>
              </div>
            )}
          </div>
        )}

        <div className="w-full h-auto flex flex-col mt-[32px] relative z-10">
          <div className="relative bg-white/20 backdrop-blur-[20px] border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-[20px] overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:rounded-[20px] before:pointer-events-none">
            <div className="w-full aspect-[16/9] max-h-[500px] overflow-hidden relative rounded-t-[20px]">
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
            <div className="relative bg-white/15 backdrop-blur-[15px] w-full h-auto flex flex-col rounded-b-[20px] p-4 sm:p-6 md:p-8 border-t border-white/20">
            <div className="w-full h-[46px] flex justify-between items-center relative z-10">
              <div className="relative bg-white/20 backdrop-blur-[15px] border border-white/30 w-auto h-[40px] rounded-[12px] px-[16px] flex items-center shadow-[0_4px_16px_0_rgba(31,38,135,0.15)] before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/15 before:to-transparent before:rounded-[12px] before:pointer-events-none">
                <div className="w-full h-[26px] flex items-center relative z-10">
                  <div className="w-[18px] h-[18px] flex justify-center items-center">
                    <Calendar size={18} className="text-gray-600" />
                  </div>
                  <div className="w-auto h-[17px] text-gray-700 leading-[18px] text-[14px] font-sans flex ml-[6px]">
                    {formatDate(diaryEntry.createdAt)}
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link
                  href={`/${id}/edit`}
                  className="relative bg-white/20 backdrop-blur-[15px] border border-white/30 w-[82px] h-[46px] rounded-[12px] flex justify-center items-center cursor-pointer shadow-[0_4px_16px_0_rgba(31,38,135,0.15)] hover:bg-white/25 hover:shadow-[0_6px_20px_0_rgba(31,38,135,0.25)] hover:scale-105 transition-all duration-300 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/15 before:to-transparent before:rounded-[12px] before:pointer-events-none"
                >
                  <div className="w-auto h-[19px] text-gray-700 text-[14px] font-sans relative z-10">
                    編集
                  </div>
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="relative bg-white/15 backdrop-blur-[15px] border border-white/25 w-[96px] h-[46px] rounded-[12px] flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_16px_0_rgba(31,38,135,0.1)] hover:bg-red-400/20 hover:border-red-400/30 hover:shadow-[0_6px_20px_0_rgba(239,68,68,0.2)] transition-all duration-300 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:rounded-[12px] before:pointer-events-none"
                >
                  <Trash2 size={16} className="text-red-600 relative z-10" />
                  <span className="text-[13.6px] text-red-600 font-sans relative z-10">
                    削除
                  </span>
                </button>
              </div>
            </div>
            {/* ペットの特徴表示（存在する場合） */}
            {diaryEntry.petCharacteristics && (
              <div className="w-full h-auto flex flex-col mt-[24px] mb-4 relative z-10">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ペットの特徴・性格
                </label>
                <div className="relative w-full p-3 bg-white/15 backdrop-blur-[15px] border border-white/30 rounded-[12px] text-sm text-gray-700 shadow-[0_2px_8px_0_rgba(31,38,135,0.1)] before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:rounded-[12px] before:pointer-events-none">
                  <span className="relative z-10">{diaryEntry.petCharacteristics}</span>
                </div>
              </div>
            )}

            <div className="w-full h-auto flex text-[15.3px] text-gray-800 leading-[34px] mt-[24px] relative z-10">
              <div className="w-full whitespace-pre-wrap">
                {diaryEntry.content}
              </div>
            </div>
            {(diaryEntry.petName || diaryEntry.authour) && (
              <div className="w-full h-auto flex items-center mt-[16px] relative z-10">
                <div className="text-[14px] text-gray-600 font-sans">
                  ペット名: {diaryEntry.petName || diaryEntry.authour}
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* 削除確認ダイアログ - router使用 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="relative bg-white/90 backdrop-blur-[15px] border border-white/60 p-6 rounded-[20px] shadow-[0_16px_48px_0_rgba(0,0,0,0.15)] w-[400px]">
            <div className="relative z-10">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                削除の確認
              </h3>
              <p className="text-gray-700 mb-6">
                {isUsingFallback
                  ? 'サンプルデータは削除できません。'
                  : 'この日記を削除してもよろしいですか？この操作は取り消せません。'}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-[12px] hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  キャンセル
                </button>
                {!isUsingFallback && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-[12px] hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleting ? '削除中...' : '削除'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
