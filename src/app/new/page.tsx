'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PetDiary } from '@/types/pet-diary';
import { useRouter } from 'next/navigation';
import { Heart, Lightbulb } from 'lucide-react';

export default function NewDiaryPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      // ペット日記作成API呼び出し
      const diaryResponse = await fetch('/api/pet-diaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authour: authorName,
          petName: petName,
          imageUrl: imageUrl,
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
    setError(null);
    setUploadSuccess(false);
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
                  <Link href="/" className="flex items-center gap-2 px-5 py-2.5 rounded-xl hover:bg-white/10 transition-all duration-300">
                    <span className="font-medium">日記一覧</span>
                  </Link>
                </li>
                <li>
                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
                    <div className="p-1.5 rounded-full bg-white/20">
                      <img
                        src="/images/本.svg"
                        alt="本"
                        className="w-[18px] h-[18px] object-contain"
                      />
                    </div>
                    <span className="font-medium">新しい日記</span>
                    <img
                      src="/images/星.svg"
                      alt="星"
                      className="w-[12px] h-[12px] object-contain ml-1 animate-pulse"
                    />
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
      <div className="flex-1 flex flex-col py-[20px] sm:py-[30px] md:py-[40px] px-[20px] sm:px-[40px] md:px-[80px] lg:px-[160px] xl:px-[240px] overflow-y-auto">
        <div className="w-full h-auto flex flex-col items-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-transparent bg-clip-text mb-4 text-center">
            ペット日記
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto text-center px-4">
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
              className={`bg-gray-100 w-full h-auto min-h-[280px] sm:min-h-[308px] md:min-h-[336px] flex flex-col items-center shadow-2xl rounded-[12px] sm:rounded-[14px] md:rounded-[16px] mt-[24px] sm:mt-[32px] md:mt-[42px] pt-[24px] sm:pt-[28px] md:pt-[32px] pb-[24px] sm:pb-[28px] md:pb-[32px] cursor-pointer transition-all ${
                dragActive ? 'bg-purple-50 border-2 border-purple-400' : ''
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={handleFileInputClick}
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
              <div className="bg-gradient-to-r from-[#9333EA] to-[#DB2777] w-[112px] sm:w-[120px] md:w-[128px] h-[40px] sm:h-[44px] md:h-[48px] mt-[14px] sm:mt-[16px] md:mt-[18px] rounded-[10px] sm:rounded-[11px] md:rounded-[12px] flex justify-center items-center">
                <div className="w-auto h-auto text-white text-[12px] sm:text-[12.8px] md:text-[13.6px] font-sans">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ペット名 *
                  </label>
                  <input
                    type="text"
                    value={petName}
                    onChange={e => setPetName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9333EA] focus:border-transparent"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9333EA] focus:border-transparent"
                    placeholder="例：山田太郎"
                    disabled={uploading}
                  />
                </div>

                <button
                  onClick={handleUpload}
                  disabled={uploading || !petName.trim() || !authorName.trim()}
                  className={`mt-4 w-full py-3 px-6 rounded-lg font-medium transition-all ${
                    uploading || !petName.trim() || !authorName.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#9333EA] to-[#DB2777] text-white hover:opacity-90'
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
          <div className="bg-white/30 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full lg:w-[48%] h-auto min-h-[280px] sm:min-h-[308px] md:min-h-[336px] flex flex-col p-[20px] sm:p-[26px] md:p-[32px] rounded-[12px] sm:rounded-[14px] md:rounded-[16px]">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <Lightbulb size={24} className="text-purple-600 mr-2" />
              使い方
            </h2>
            <ol className="space-y-4 text-gray-700">
              <li className="flex items-start">
                <div className="p-2 mr-3 mt-0.5">
                  <img
                    src="/images/更新.png"
                    alt="更新"
                    className="w-[18px] h-[18px] object-contain"
                  />
                </div>
                <span>ペットの写真をアップロードします</span>
              </li>
              <li className="flex items-start">
                <div className="p-2 mr-3 mt-0.5">
                  <img
                    src="/images/えんぴつ.png"
                    alt="えんぴつ"
                    className="w-[18px] h-[18px] object-contain"
                  />
                </div>
                <span>AIが写真を分析し、ペットの様子を自動で日記にします</span>
              </li>
              <li className="flex items-start">
                <div className="p-2 mr-3 mt-0.5">
                  <Heart
                    size={18}
                    className="text-orange-500"
                  />
                </div>
                <span>必要に応じて日記の内容を編集できます</span>
              </li>
              <li className="flex items-start">
                <div className="p-2 mr-3 mt-0.5">
                  <Heart
                    size={18}
                    className="text-red-500"
                  />
                </div>
                <span>日々の記録を振り返って、ペットの成長を楽しみましょう</span>
              </li>
            </ol>
          </div>
          <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full lg:w-[48%] h-[280px] sm:h-[308px] md:h-[336px] flex items-center justify-center rounded-[12px] sm:rounded-[14px] md:rounded-[16px]">
            <div className="text-center">
              <div className="w-28 h-28 mx-auto mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
                <div className="relative bg-white/50 backdrop-blur-sm rounded-full p-6 flex items-center justify-center">
                  <Heart size={56} className="text-pink-600" />
                </div>
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
