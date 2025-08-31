'use client';
import { PetDiary } from '@/types/pet-diary';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Save, Trash2 } from 'lucide-react';
import { validateImageUrl } from '@/lib/image-utils';
import PetSelector from '@/components/PetSelector';
import { savePetInfo } from '@/lib/pet-info-storage';
import GradientText from '@/components/GradientText';
import Header from '@/components/Header';
import GlassButton from '@/components/GlassButton';
import GlassCard from '@/components/GlassCard';
import GlassTag from '@/components/GlassTag';
import GlassInput from '@/components/GlassInput';
import GlassTextarea from '@/components/GlassTextarea';

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
    petCharacteristics: '',
    firstPersonPronoun: 'ぼく',
  });
  // ペット情報保存チェック
  const [shouldSavePetInfo, setShouldSavePetInfo] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const characteristicsRef = useRef<HTMLTextAreaElement>(null);

  const handlePetSelect = (
    selectedPetName: string,
    selectedCharacteristics: string,
    selectedFirstPersonPronoun: string
  ) => {
    setEditData(prev => ({
      ...prev,
      petName: selectedPetName,
      petCharacteristics: selectedCharacteristics,
      firstPersonPronoun: selectedFirstPersonPronoun,
    }));
  };

  const savePetInfoIfNeeded = () => {
    if (
      shouldSavePetInfo &&
      editData.petName.trim() &&
      editData.petCharacteristics.trim()
    ) {
      try {
        savePetInfo({
          petName: editData.petName.trim(),
          petCharacteristics: editData.petCharacteristics.trim(),
          firstPersonPronoun: editData.firstPersonPronoun,
        });
      } catch (error) {
        console.warn('Failed to save pet info:', error);
      }
    }
  };

  // テキストエリアの高さを調整する関数
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const adjustCharacteristicsHeight = () => {
    if (characteristicsRef.current) {
      characteristicsRef.current.style.height = 'auto';
      characteristicsRef.current.style.height = `${characteristicsRef.current.scrollHeight}px`;
    }
  };

  // コンテンツが変更された時に高さを調整
  useEffect(() => {
    adjustTextareaHeight();
  }, [editData.content]);

  useEffect(() => {
    adjustCharacteristicsHeight();
  }, [editData.petCharacteristics]);

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
      const response = await fetch(`/api/pet-diaries/${id}`);
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
        petCharacteristics: data.petCharacteristics || '',
        firstPersonPronoun: data.firstPersonPronoun || 'ぼく',
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

      const response = await fetch(`/api/pet-diaries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: normalizedImageUrl,
          content: editData.content,
          petName: editData.petName,
          petCharacteristics: editData.petCharacteristics,
          firstPersonPronoun: editData.firstPersonPronoun,
          createdAt: diaryEntry.createdAt.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('更新に失敗しました');
      }

      // ペット情報を保存（必要に応じて）
      savePetInfoIfNeeded();

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
      const response = await fetch(`/api/pet-diaries/${id}`, {
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
          href={`/${id}`}
          className="w-full h-[24px] flex items-center cursor-pointer"
        >
          <ArrowLeft size={18} className="text-purple-600/80" />
          <div className="w-auto h-[19px] text-purple-600/80 text-[14px] font-sans ml-[4px]">
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
            className="w-full p-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9333EA] focus:border-transparent text-sm bg-white"
            placeholder="画像URLを入力してください"
          />
        </div>

        <div className="w-full h-auto flex flex-col mt-[32px] relative z-10">
          <GlassCard variant="gray" className="p-0">
            <div className="w-full aspect-[16/9] max-h-[500px] overflow-hidden relative rounded-t-[20px]">
            {editData.imageUrl ? (
              <img
                src={getImageUrl(editData.imageUrl)}
                alt={editData.petName || 'ペット'}
                className="absolute inset-0 w-full h-full object-contain"
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
            <div className="relative bg-gray-50/90 backdrop-blur-[10px] w-full h-auto flex flex-col rounded-b-[20px] p-4 sm:p-6 md:p-8 border-t border-gray-200/40">
              <div className="w-full mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  画像URL
                </label>
                <GlassInput
                  value={editData.imageUrl}
                  onChange={e => setEditData({ ...editData, imageUrl: e.target.value })}
                  placeholder="画像URLを入力してください"
                  variant="gray"
                />
              </div>
              
              <div className="w-full h-[46px] flex justify-between items-center mb-6">
                <GlassTag icon={Calendar} variant="gray" className="h-[40px]">
                  {formatDate(diaryEntry.createdAt)}
                </GlassTag>
                <div className="flex space-x-3">
                  <Link href={`/${id}`}>
                    <GlassButton variant="secondary">
                      キャンセル
                    </GlassButton>
                  </Link>
                  <GlassButton 
                    onClick={handleSave}
                    disabled={saving}
                    variant="primary"
                    icon={Save}
                    iconSize={14}
                  >
                    {saving ? '保存中' : '保存'}
                  </GlassButton>
                  <GlassButton 
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="danger"
                    icon={Trash2}
                    size="md"
                    className="w-[96px]"
                  >
                    削除
                  </GlassButton>
                </div>
              </div>

              {/* ペット情報選択コンポーネントを追加 */}
              <div className="w-full h-auto flex flex-col mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                保存済みペット情報
              </label>
              <PetSelector
                onSelectPet={handlePetSelect}
                currentPetName={editData.petName}
                currentCharacteristics={editData.petCharacteristics}
                currentFirstPersonPronoun={editData.firstPersonPronoun}
                disabled={saving}
              />
            </div>

            {/* 一人称選択フィールドを追加 */}
            <div className="w-full h-auto flex flex-col mt-[24px] mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                日記で使う一人称
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {['ぼく', 'わたし', 'おれ', 'あたし'].map(pronoun => (
                  <button
                    key={pronoun}
                    type="button"
                    onClick={() =>
                      setEditData({
                        ...editData,
                        firstPersonPronoun: pronoun,
                      })
                    }
                    className={`px-3 py-1 text-sm rounded-full border-2 transition-colors ${
                      editData.firstPersonPronoun === pronoun
                        ? 'bg-[#9333EA] text-white border-[#9333EA]'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-[#9333EA]'
                    }`}
                    disabled={saving}
                  >
                    {pronoun}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={editData.firstPersonPronoun}
                onChange={e =>
                  setEditData({
                    ...editData,
                    firstPersonPronoun: e.target.value,
                  })
                }
                className="w-full p-2 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9333EA] focus:border-transparent text-sm bg-white"
                placeholder="カスタム一人称を入力"
                disabled={saving}
                maxLength={10}
              />
            </div>

            {/* ペット特徴編集フィールドを追加 */}
            <div className="w-full h-auto flex flex-col mt-[24px] mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ペットの特徴・性格
              </label>
              <textarea
                ref={characteristicsRef}
                value={editData.petCharacteristics}
                onChange={e =>
                  setEditData({
                    ...editData,
                    petCharacteristics: e.target.value,
                  })
                }
                onInput={adjustCharacteristicsHeight}
                className="w-full text-gray-600 min-h-[80px] p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#9333EA] focus:border-transparent text-sm bg-white"
                placeholder="ペットの特徴や性格を入力してください"
                maxLength={300}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {editData.petCharacteristics.length}/300文字
              </div>

              {/* ペット情報保存のチェックボックス */}
              {editData.petName.trim() &&
                editData.petCharacteristics.trim() && (
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      id="save-pet-info"
                      checked={shouldSavePetInfo}
                      onChange={e => setShouldSavePetInfo(e.target.checked)}
                      className="mr-2"
                      disabled={saving}
                    />
                    <label
                      htmlFor="save-pet-info"
                      className="text-sm text-gray-600"
                    >
                      このペット情報を保存して再利用する
                    </label>
                  </div>
                )}
            </div>

            {/* 内容編集 - 詳細画面と同じ位置・スタイル */}
            <div className="w-full h-auto flex text-[15.3px] text-[#1F2937] leading-[34px]">
              <textarea
                ref={textareaRef}
                value={editData.content}
                onChange={e => {
                  setEditData({ ...editData, content: e.target.value });
                }}
                onInput={adjustTextareaHeight}
                className="w-full min-h-[120px] p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#9333EA] focus:border-transparent text-[15.3px] leading-[34px] bg-white"
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
          </GlassCard>
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
