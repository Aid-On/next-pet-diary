// /app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// 画像保存ディレクトリを確保
async function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, filename } = body;

    if (!image) {
      return NextResponse.json(
        { error: '画像データが送信されていません' },
        { status: 400 }
      );
    }

    // ユニークなIDを生成
    const id = randomUUID();

    // ファイル拡張子を取得（デフォルトはpng）
    const ext = filename ? path.extname(filename).toLowerCase() : '.png';
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = validExtensions.includes(ext) ? ext : '.png';

    // ファイル名を生成（[id]/pet.png の形式）
    const petImageDir = path.join(process.cwd(), 'public', 'uploads', id);
    await fs.mkdir(petImageDir, { recursive: true });

    const fileName = `pet${fileExtension}`;
    const filePath = path.join(petImageDir, fileName);

    // Base64データをBufferに変換
    const buffer = Buffer.from(image, 'base64');

    // ファイルを保存
    await fs.writeFile(filePath, buffer);

    // 公開URLパスを返す
    const publicUrl = `/uploads/${id}/${fileName}`;

    console.log('Image uploaded successfully:', publicUrl);

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      id: id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: '画像のアップロードに失敗しました' },
      { status: 500 }
    );
  }
}
