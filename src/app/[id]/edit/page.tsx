'use client';
import { PetDiary } from '@/types/pet-diary';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { validateImageUrl } from '@/lib/image-utils';

export default function PetEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [diaryEntry, setDiaryEntry] = useState<PetDiary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  // 編集用の状態
  const [editData, setEditData] = useState({
    imageUrl: '',
    content: '',
    petName: '',
  });

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
      setEditData({
        imageUrl: data.imageUrl,
        content: data.content,
        petName: data.petName || data.authour || '',
      });
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

  const handleSave = async () => {
    if (!diaryEntry) return;

    // URL validation
    const urlValidation = validateImageUrl(editData.imageUrl);
    if (!urlValidation.isValid) {
      setError(urlValidation.message || '無効な画像URLです');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const normalizedImageUrl = getImageUrl(editData.imageUrl);

      const response = await fetch(`/pet-diaries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: normalizedImageUrl,
          content: editData.content,
          petName: editData.petName,
          createdAt: diaryEntry.createdAt.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('更新に失敗しました');
      }

      // 更新成功後、詳細ページにリダイレクト
      router.push(`/${id}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('更新中にエラーが発生しました');
      }
      setSaving(false);
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
              日記編集
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
      <div className="flex-1 flex flex-col px-4 sm:px-8 md:px-16 lg:px-[240px] py-[40px] max-w-4xl mx-auto w-full">
        <Link
          href={`/${id}`}
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
            詳細に戻る
          </div>
        </Link>

        {/* 画像URL入力フィールド */}
        <div className="w-full mt-[32px] mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            画像URL
          </label>
          <input
            type="text"
            value={editData.imageUrl}
            onChange={e =>
              setEditData({ ...editData, imageUrl: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9333EA] focus:border-transparent text-sm"
            placeholder="画像URLを入力してください"
          />
        </div>

        <div className="w-full h-auto flex flex-col">
          <div className="w-full aspect-[16/9] max-h-[500px] overflow-hidden relative rounded-t-[16px]">
            {editData.imageUrl ? (
              <img
                src={getImageUrl(editData.imageUrl)}
                alt={editData.petName || 'ペット'}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                onError={e => {
                  e.currentTarget.src = '/images/placeholder.jpg';
                }}
              />
            ) : (
              <div className="absolute inset-0 w-full h-full bg-gray-100 flex items-center justify-center rounded-t-[16px]">
                <div className="text-gray-400 text-lg">画像プレビュー</div>
              </div>
            )}
          </div>
          <div className="bg-[#e8e3e8] w-full h-auto flex flex-col rounded-b-[16px] shadow-2xl p-4 sm:p-6 md:p-8">
            <div className="w-full h-[46px] flex justify-between items-center">
              <div className="bg-[#F3E8FF] w-[170px] h-[40px] rounded-[9px] px-[16px] flex items-center">
                <div className=" w-full h-[26px] flex items-center">
                  <div className="w-[26px] h-[26px] rounded-[50%] flex justify-center items-center">
                    <img
                      src="/images/日付.png"
                      alt="日付"
                      className="w-[18px] h-[18px] object-cover"
                    />
                  </div>
                  <div className="w-[100px] h-[17px] text-[#6B7280] leading-[18px] text-[14px] font-sans flex ml-[6px]">
                    {formatDate(diaryEntry.createdAt)}
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link
                  href={`/${id}`}
                  className="bg-white w-[82px] h-[46px] border-[#6B7280] border-[1px] rounded-[12px] flex justify-center items-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="w-auto h-[19px] text-[#6B7280] text-[14px] font-sans">
                    キャンセル
                  </div>
                </Link>
                <div className="bg-white w-[82px] h-[46px] border-[#9333EA] border-[1px] rounded-[12px] flex justify-center items-center cursor-pointer hover:bg-[#F3E8FF] transition-colors">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-auto h-[19px] text-[#9333EA] text-[14px] font-sans disabled:opacity-50"
                  >
                    {saving ? '保存中' : '保存'}
                  </button>
                </div>
                <div className="w-[96px] h-[46px] py-[13.5px] px-[20px] flex justify-between cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="bg-[#e5bdff] w-[16px] h-[16px]">
                    <img
                      src="/images/ゴミ箱.png"
                      alt="ゴミ箱"
                      className="w-[16px] h-[16px] object-cover"
                    />
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-[32px] h-[19px] text-[13.6px] text-white font-sans leading-[18px]"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>

            {/* 内容編集 - 詳細画面と同じ位置・スタイル */}
            <div className="w-full h-auto flex text-[15.3px] text-[#1F2937] leading-[34px] mt-[24px]">
              <textarea
                value={editData.content}
                onChange={e =>
                  setEditData({ ...editData, content: e.target.value })
                }
                className="w-full min-h-[120px] p-4 border border-gray-300 rounded-lg resize-y focus:ring-2 focus:ring-[#9333EA] focus:border-transparent text-[15.3px] leading-[34px] bg-white"
                placeholder="日記の内容を入力してください"
              />
            </div>

            {/* ペット名編集 - 詳細画面と同じ位置・スタイル */}
            <div className="w-full h-auto flex items-center mt-[16px]">
              <div className="text-[14px] text-[#6B7280] font-sans mr-2">
                ペット名:
              </div>
              <input
                type="text"
                value={editData.petName}
                onChange={e =>
                  setEditData({ ...editData, petName: e.target.value })
                }
                className="px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-[#9333EA] focus:border-transparent text-[14px] text-[#6B7280] bg-white"
                placeholder="ペット名を入力してください"
              />
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
