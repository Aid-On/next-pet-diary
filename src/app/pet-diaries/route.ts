// src/app/pet-diaries/route.ts
import { readPetDiaries, writePetDiaries } from '@/lib/fs';
import { randomUUID } from 'crypto';
import type { PetDiary } from '@/types/pet-diary';

export async function GET() {
  try {
    const items = await readPetDiaries();

    // Response.jsonを使用してJSONレスポンスを返す
    return Response.json(items, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store', // 開発中は毎回読み直す
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error reading pet diaries:', error);
    return Response.json(
      { message: 'Failed to read pet diaries' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // ─ 1. 受信 JSON を取り出す ─
    const body = await req.json().catch(() => null);

    if (
      !body ||
      typeof body.authour !== 'string' ||
      typeof body.imageUrl !== 'string'
    ) {
      return Response.json(
        {
          message:
            'Invalid JSON: expected { authour: string, imageUrl: string }',
        },
        { status: 400 }
      );
    }

    // ─ 2. 新しいアイテムを作成 ─
    const newPetDiary: PetDiary = {
      id: randomUUID(),
      authour: body.authour,
      petName: body.petName,
      imageUrl: body.imageUrl,
      createdAt: new Date(), // Date型として保存
      content: body.content || 'AIが自動生成する内容', // contentフィールドも受け取れるように
    };

    // ─ 3. 既存データに追加して保存 ─
    const petDiaries = await readPetDiaries();
    petDiaries.push(newPetDiary);
    await writePetDiaries(petDiaries);

    // ─ 4. レスポンス ─
    // Locationヘッダーを削除（必要なければ）、または正しいパスに修正
    return Response.json(newPetDiary, {
      status: 201, // "Created"
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error creating pet diary:', error);
    return Response.json(
      { message: 'Failed to create pet diary' },
      { status: 500 }
    );
  }
}
