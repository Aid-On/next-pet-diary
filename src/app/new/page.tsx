'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PetDiary } from '@/types/pet-diary';
import { useRouter } from 'next/navigation';
import { Heart, Lightbulb, RefreshCw, PenTool } from 'lucide-react';
import PetSelector from '@/components/PetSelector';
import { savePetInfo } from '@/lib/pet-info-storage';
import Header from '@/components/Header';

export default function NewDiaryPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const characteristicsRef = useRef<HTMLTextAreaElement>(null);
  const memoRef = useRef<HTMLTextAreaElement>(null);

  const [diaries, setDiaries] = useState<PetDiary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // アップロード関連の状態
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [petName, setPetName] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('');
  // 備考フィールドを追加
  const [memo, setMemo] = useState<string>('');
  // ペットの特徴フィールドを追加
  const [petCharacteristics, setPetCharacteristics] = useState<string>('');
  // 一人称の状態を追加
  const [firstPersonPronoun, setFirstPersonPronoun] = useState<string>('ぼく');
  // ペット情報の保存と選択機能
  const [shouldSavePetInfo, setShouldSavePetInfo] = useState<boolean>(true);

  const handlePetSelect = (
    selectedPetName: string,
    selectedCharacteristics: string,
    selectedFirstPersonPronoun: string
  ) => {
    setPetName(selectedPetName);
    setPetCharacteristics(selectedCharacteristics);
    setFirstPersonPronoun(selectedFirstPersonPronoun);
  };

  const savePetInfoIfNeeded = () => {
    if (shouldSavePetInfo && petName.trim() && petCharacteristics.trim()) {
      try {
        savePetInfo({
          petName: petName.trim(),
          petCharacteristics: petCharacteristics.trim(),
          firstPersonPronoun: firstPersonPronoun,
        });
      } catch (error) {
        console.warn('Failed to save pet info:', error);
      }
    }
  };

  // テキストエリアの高さを調整する関数
  const adjustCharacteristicsHeight = () => {
    if (characteristicsRef.current) {
      characteristicsRef.current.style.height = 'auto';
      characteristicsRef.current.style.height = `${characteristicsRef.current.scrollHeight}px`;
    }
  };

  const adjustMemoHeight = () => {
    if (memoRef.current) {
      memoRef.current.style.height = 'auto';
      memoRef.current.style.height = `${memoRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustCharacteristicsHeight();
  }, [petCharacteristics]);

  useEffect(() => {
    adjustMemoHeight();
  }, [memo]);

  useEffect(() => {
    fetchDiaries();
  }, []);

  const fetchDiaries = async () => {
    try {
      const response = await fetch('/api/pet-diaries');
      if (!response.ok) {
        throw new Error('Failed to fetch diaries');
      }
      const data = await response.json();
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

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return url;
    return `/${url}`;
  };

  // ファイル選択処理
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('ファイルサイズは10MB以下にしてください');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // プレビュー用のURLを作成
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ドラッグ&ドロップ処理
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // ファイル選択ボタンクリック処理
  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // アップロード処理
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('画像を選択してください');
      return;
    }

    if (!petName.trim()) {
      setError('ペット名を入力してください');
      return;
    }

    if (!authorName.trim()) {
      setError('飼い主名を入力してください');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // 画像をBase64に変換
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve(base64String.split(',')[1]); // データURIからBase64部分を抽出
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(selectedFile);
      const base64Data = await base64Promise;

      // 画像アップロードAPI呼び出し
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Data,
          filename: selectedFile.name,
        }),
      });

      if (!uploadResponse.ok) {
        throw new Error('画像のアップロードに失敗しました');
      }

      const { imageUrl } = await uploadResponse.json();

      // ペット情報を保存（必要に応じて）
      savePetInfoIfNeeded();

      // ペット日記作成API呼び出し - 特徴と一人称も含める
      const diaryResponse = await fetch('/api/pet-diaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authour: authorName,
          petName: petName,
          imageUrl: imageUrl,
          memo: memo.trim() || null,
          petCharacteristics: petCharacteristics.trim() || null,
          firstPersonPronoun: firstPersonPronoun,
        }),
      });

      if (!diaryResponse.ok) {
        throw new Error('日記の作成に失敗しました');
      }

      const newDiary = await diaryResponse.json();

      setUploadSuccess(true);
      setSelectedFile(null);
      setPreviewUrl(null);
      setPetName('');
      setAuthorName('');
      setMemo('');
      setPetCharacteristics('');
      setFirstPersonPronoun('ぼく');

      // 作成した日記の詳細ページに遷移
      setTimeout(() => {
        router.push(`/${newDiary.id}`);
      }, 1500);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('アップロード中にエラーが発生しました');
      }
    } finally {
      setUploading(false);
    }
  };

  // クリア処理
  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPetName('');
    setAuthorName('');
    setMemo('');
    setPetCharacteristics('');
    setFirstPersonPronoun('ぼく');
    setShouldSavePetInfo(true);
    setError(null);
    setUploadSuccess(false);
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
      <div className="flex-1 flex flex-col py-[20px] sm:py-[30px] md:py-[40px] px-[20px] sm:px-[40px] md:px-[80px] lg:px-[160px] xl:px-[240px] overflow-y-auto">
        <div className="w-full h-auto flex flex-col items-center">
          <div className="relative mb-4">
            <h1 
              className="text-6xl font-black bg-gradient-to-r from-pink-400 via-purple-400 via-indigo-400 to-cyan-400 text-transparent bg-clip-text text-center relative z-10"
              style={{
                backgroundSize: '200% 200%',
                animation: 'gradientShift 6s ease-in-out infinite',
                filter: 'drop-shadow(0 8px 24px rgba(219, 39, 119, 0.25)) drop-shadow(0 4px 12px rgba(6, 182, 212, 0.2)) drop-shadow(0 2px 8px rgba(168, 85, 247, 0.15))'
              }}
            >
              ペット日記
            </h1>
            <div 
              className="absolute inset-0 text-6xl font-black text-center bg-gradient-to-r from-pink-300/30 via-purple-300/30 via-indigo-300/30 to-cyan-300/30 text-transparent bg-clip-text blur-sm"
              style={{
                backgroundSize: '200% 200%',
                animation: 'gradientShift 6s ease-in-out infinite reverse'
              }}
            >
              ペット日記
            </div>
          </div>
          <style jsx>{`
            @keyframes gradientShift {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
          `}</style>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto text-center px-4 mb-8">
            写真をアップロードするだけで、ペットの日記を自動生成します。
            <br />
            大切なペットの成長を記録しましょう。
          </p>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mt-4">
            {error}
          </div>
        )}

        {/* 成功メッセージ */}
        {uploadSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mt-4">
            日記を作成しました！詳細ページに移動します...
          </div>
        )}

        {/* 入力フォーム（画像選択前） */}
        {!previewUrl && (
          <>
            {/* アップロードエリア */}
            <div
              className={`bg-white/25 backdrop-blur-xl border border-white/40 w-full h-auto min-h-[280px] sm:min-h-[308px] md:min-h-[336px] flex flex-col items-center shadow-2xl rounded-3xl mt-[24px] sm:mt-[32px] md:mt-[42px] pt-[24px] sm:pt-[28px] md:pt-[32px] pb-[24px] sm:pb-[28px] md:pb-[32px] transition-all duration-300 ${
                dragActive ? 'bg-white/40 border-2 border-white/60 shadow-3xl' : ''
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="bg-white w-[72px] sm:w-[84px] md:w-[96px] h-[72px] sm:h-[84px] md:h-[96px] rounded-[50%] shadow-[0_8px_32px_0_rgba(255,105,180,0.3)] flex items-center justify-center"></div>
              <div className="w-auto h-[18px] sm:h-[20px] md:h-[21.5px] text-[#1F2937] text-[13px] sm:text-[14px] md:text-[15.3px] font-sans mt-[20px] sm:mt-[24px] md:mt-[27px] px-4 text-center">
                ここに写真をドラッグ＆ドロップ
              </div>
              <div className="w-auto h-[14px] sm:h-[15px] md:h-[16.5px] text-[#4B5563] text-[10px] sm:text-[11px] md:text-[11.9px] mt-[7px] sm:mt-[8px] md:mt-[9px]">
                または
              </div>
              <div 
                onClick={handleFileInputClick}
                className="bg-white/25 backdrop-blur-xl border border-white/40 w-[112px] sm:w-[120px] md:w-[128px] h-[40px] sm:h-[44px] md:h-[48px] mt-[14px] sm:mt-[16px] md:mt-[18px] rounded-2xl flex justify-center items-center shadow-xl hover:bg-white/30 hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className="w-auto h-auto text-gray-800 text-[12px] sm:text-[12.8px] md:text-[13.6px] font-semibold">
                  写真を選択
                </div>
              </div>
              <div className="w-auto h-[14px] sm:h-[15px] md:h-[16.5px] text-[#4B5563] text-[10px] sm:text-[11px] md:text-[11.9px] mt-[14px] sm:mt-[16px] md:mt-[17.5px]">
                PNG, JPG, GIF 最大 10MB
              </div>
            </div>
          </>
        )}

        {/* プレビューと入力フォーム（画像選択後） */}
        {previewUrl && (
          <div className="bg-white shadow-2xl rounded-[16px] mt-[24px] sm:mt-[32px] md:mt-[42px] p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* 画像プレビュー */}
              <div className="lg:w-1/2">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={previewUrl}
                    alt="プレビュー"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={handleClear}
                  className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                >
                  画像を変更
                </button>
              </div>

              {/* 入力フォーム */}
              <div className="lg:w-1/2 flex flex-col gap-4">
                {/* ペット情報選択コンポーネント */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    保存済みペット情報
                  </label>
                  <PetSelector
                    onSelectPet={handlePetSelect}
                    currentPetName={petName}
                    currentCharacteristics={petCharacteristics}
                    currentFirstPersonPronoun={firstPersonPronoun}
                    disabled={uploading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ペット名 *
                  </label>
                  <input
                    type="text"
                    value={petName}
                    onChange={e => setPetName(e.target.value)}
                    className="w-full p-3 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9333EA] focus:border-transparent"
                    placeholder="例：ポチ"
                    disabled={uploading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    飼い主名 *
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    className="w-full p-3 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9333EA] focus:border-transparent"
                    placeholder="例：山田太郎"
                    disabled={uploading}
                  />
                </div>

                {/* 一人称選択フィールドを追加 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    日記で使う一人称
                    <span className="text-xs text-gray-500 ml-1">（任意）</span>
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['ぼく', 'わたし', 'おれ', 'あたし'].map(pronoun => (
                      <button
                        key={pronoun}
                        type="button"
                        onClick={() => setFirstPersonPronoun(pronoun)}
                        className={`px-3 py-1 text-sm rounded-full border-2 transition-colors ${
                          firstPersonPronoun === pronoun
                            ? 'bg-[#9333EA] text-white border-[#9333EA]'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-[#9333EA]'
                        }`}
                        disabled={uploading}
                      >
                        {pronoun}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={firstPersonPronoun}
                    onChange={e => setFirstPersonPronoun(e.target.value)}
                    className="w-full p-2 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9333EA] focus:border-transparent text-sm"
                    placeholder="カスタム一人称を入力"
                    disabled={uploading}
                    maxLength={10}
                  />
                </div>

                {/* ペットの特徴フィールド */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ペットの特徴・性格
                    <span className="text-xs text-gray-500 ml-1">（任意）</span>
                  </label>
                  <textarea
                    ref={characteristicsRef}
                    value={petCharacteristics}
                    onChange={e => setPetCharacteristics(e.target.value)}
                    onInput={adjustCharacteristicsHeight}
                    className="w-full p-3 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9333EA] focus:border-transparent resize-none min-h-[80px]"
                    placeholder="例：とても活発で人懐っこい性格。ボール遊びが大好き。少し怖がりな面もある。"
                    disabled={uploading}
                    maxLength={300}
                  />
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {petCharacteristics.length}/300文字
                  </div>

                  {/* ペット情報保存のチェックボックス */}
                  {petName.trim() && petCharacteristics.trim() && (
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        id="save-pet-info"
                        checked={shouldSavePetInfo}
                        onChange={e => setShouldSavePetInfo(e.target.checked)}
                        className="mr-2"
                        disabled={uploading}
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

                {/* 備考・出来事フィールド */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    今日の出来事・備考
                    <span className="text-xs text-gray-500 ml-1">（任意）</span>
                  </label>
                  <textarea
                    ref={memoRef}
                    value={memo}
                    onChange={e => setMemo(e.target.value)}
                    onInput={adjustMemoHeight}
                    className="w-full p-3 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9333EA] focus:border-transparent resize-none min-h-[100px]"
                    placeholder="例：今日は公園でボール遊びをしました。とても元気に走り回っていました。"
                    disabled={uploading}
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {memo.length}/500文字
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={uploading || !petName.trim() || !authorName.trim()}
                  className={`mt-4 w-full py-3 px-6 rounded-2xl font-semibold transition-all duration-300 ${
                    uploading || !petName.trim() || !authorName.trim()
                      ? 'bg-gray-300/50 backdrop-blur-md text-gray-500 cursor-not-allowed border border-gray-300/30'
                      : 'bg-white/20 backdrop-blur-xl border border-white/40 text-gray-800 font-semibold shadow-2xl hover:shadow-3xl hover:bg-white/25 hover:scale-105'
                  }`}
                >
                  {uploading ? 'アップロード中...' : '日記を作成'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 使い方セクション */}
        <div className="w-full h-auto flex flex-col lg:flex-row justify-between mt-[32px] sm:mt-[48px] md:mt-[64px] gap-[24px] sm:gap-[32px] lg:gap-[40px]">
          <div className="bg-white/25 backdrop-blur-2xl border border-white/30 shadow-2xl w-full lg:w-[48%] h-auto min-h-[280px] sm:min-h-[308px] md:min-h-[336px] flex flex-col justify-between p-[20px] sm:p-[26px] md:p-[32px] rounded-[12px] sm:rounded-[14px] md:rounded-[16px]">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Lightbulb size={24} className="text-purple-600 mr-2" />
              使い方
            </h2>
            <ol className="flex-1 flex flex-col justify-evenly text-gray-700">
              <li className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  <RefreshCw size={18} className="text-purple-600" />
                </div>
                <span>ペットの写真をアップロードします</span>
              </li>
              <li className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  <PenTool size={18} className="text-pink-600" />
                </div>
                <span>AIが写真を分析し、ペットの様子を自動で日記にします</span>
              </li>
              <li className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  <Heart
                    size={18}
                    className="text-orange-500"
                  />
                </div>
                <span>必要に応じて日記の内容を編集できます</span>
              </li>
              <li className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  <Heart
                    size={18}
                    className="text-red-500"
                  />
                </div>
                <span>日々の記録を振り返って、ペットの成長を楽しみましょう</span>
              </li>
            </ol>
          </div>
          <div className="bg-white/25 backdrop-blur-lg border border-white/40 shadow-lg w-full lg:w-[48%] h-[280px] sm:h-[308px] md:h-[336px] flex items-center justify-center rounded-[12px] sm:rounded-[14px] md:rounded-[16px]">
            <div className="text-center">
              <div className="mb-6">
                <Heart size={64} className="text-pink-400 mx-auto animate-pulse" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">
                大切な思い出を残そう
              </h3>
              <p className="mt-2 text-gray-700">
                毎日のかわいい瞬間を逃さず記録しましょう
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
