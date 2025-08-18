// src/lib/image-utils.ts
export function normalizeImageUrl(url: string): string {
  if (!url) return '';

  // 既に完全なURLの場合はそのまま返す
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // 絶対パス（/で始まる）の場合はそのまま返す
  if (url.startsWith('/')) {
    return url;
  }

  // 相対パスの場合は絶対パスに変換
  if (url.startsWith('images/')) {
    return `/${url}`;
  }

  // その他の場合は/imagesディレクトリとして扱う
  return `/images/${url}`;
}

export function validateImageUrl(url: string): {
  isValid: boolean;
  message?: string;
} {
  if (!url.trim()) {
    return { isValid: false, message: '画像URLを入力してください' };
  }

  // HTTPSまたはHTTPで始まる場合
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      new URL(url);
      return { isValid: true };
    } catch {
      return { isValid: false, message: '有効なURLを入力してください' };
    }
  }

  // 相対パスの場合（/で始まるか、images/で始まる）
  if (url.startsWith('/') || url.startsWith('images/')) {
    // 基本的な拡張子チェック
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const hasValidExtension = imageExtensions.some(ext =>
      url.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      return {
        isValid: false,
        message:
          '画像ファイル（.jpg, .png, .gif, .webp, .svg）を指定してください',
      };
    }

    return { isValid: true };
  }

  return {
    isValid: false,
    message: '有効な画像URLまたはパスを入力してください',
  };
}
