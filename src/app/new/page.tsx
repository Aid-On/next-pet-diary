'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PetDiary } from '@/types/pet-diary';
import { useRouter } from 'next/navigation';

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
  const [remarks, setRemarks] = useState<string>('');
  // 備考フィールドを追加
  const [memo, setMemo] = useState<string>('');

  useEffect(() => {
    fetchDiaries();
  }, []);

  const fetchDiaries = async () => {
    try {
      const response = await fetch('/pet-diaries');
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

    if (!remarks.trim()) {
      setError('備考を入力してください');
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

      // ペット日記作成API呼び出し - 備考も含める
      const diaryResponse = await fetch('/pet-diaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authour: authorName,
          petName: petName,
          imageUrl: imageUrl,
          memo: memo.trim() || null, // 備考が空の場合はnullを送信
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
      setRemarks('');
      setMemo('');

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
    setError(null);
    setUploadSuccess(false);
    setRemarks('');
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
            <Link href={'/new'}>
              <div className="w-[50px] h-[19px] text-white text-[16px] leading-[20px] font-sans">
                ホーム
              </div>
            </Link>
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
            <Link href={'/'}>
              <div className="w-[64px] h-[19px] text-white text-[16px] leading-[20px] font-sans">
                日記一覧
              </div>
            </Link>
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

                {/* 備考・出来事フィールド - 「日記を作成」ボタンの前に配置 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    今日の出来事・備考
                    <span className="text-xs text-gray-500 ml-1">（任意）</span>
                  </label>
                  <textarea
                    value={memo}
                    onChange={e => setMemo(e.target.value)}
                    className="w-full p-3 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9333EA] focus:border-transparent resize-vertical min-h-[100px] max-h-[200px]"
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
                ペット名・飼い主名を入力し、必要に応じて今日の出来事を記録します
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
                AIが写真と入力情報を分析し、ペットの様子を自動で日記にします
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
