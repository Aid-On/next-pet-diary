// src/app/pet-diaries/route.ts
// 緊急用：完全にメモリベースのAPI（ファイルシステム操作なし）

import { generateAIResponse, generateAIResponseWithImage } from '@/lib/ai';
import { readPetDiaries, writePetDiaries } from '@/lib/fs';
import type { PetDiary } from '@/types/pet-diary';
import { randomUUID } from 'crypto';
import path from 'path';

function serializePetDiary(diary: PetDiary) {
  return {
    ...diary,
    createdAt:
      diary.createdAt instanceof Date
        ? diary.createdAt.toISOString()
        : diary.createdAt,
  };
}

function serializePetDiaries(diaries: PetDiary[]) {
  return diaries.map(serializePetDiary);
}

export async function GET() {
  try {
    console.log('GET /pet-diaries - Emergency memory mode');
    console.log('GET /pet-diaries - Memory storage items:');

    // メモリから直接取得（ファイルシステム操作なし）
    const serializedItems = await readPetDiaries();

    console.log('GET /pet-diaries - Returning serialized items');

    return Response.json(serializedItems, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json; charset=utf-8',
        'X-Data-Source': 'memory', // デバッグ用ヘッダー
      },
    });
  } catch (error) {
    console.error('GET /pet-diaries - Unexpected error:', error);

    // 最終的なフォールバック
    return Response.json(
      [
        {
          authour: 'kotone',
          petName: 'ピノ',
          id: '7ec6ccc0-e3e5-4ded-a073-2b197393645a',
          imageUrl: '/images/pino.jpg',
          createdAt: '2025-08-07T00:00:00.000Z',
          content: '今日もウサギは可愛かった',
        },
        {
          authour: 'kotone',
          petName: 'ユキ',
          id: '7ec6ccc0-e3e5-4ded-a073-2b197393645b',
          imageUrl: '/images/yuki.jpg',
          createdAt: '2025-08-07T00:00:00.000Z',
          content: '今日もウサギは可愛かった',
        },
        {
          authour: 'kotone',
          petName: 'ウィム',
          id: '7ec6ccc0-e3e5-4ded-a073-2b197393645c',
          imageUrl: '/images/wim.jpg',
          createdAt: '2025-08-07T00:00:00.000Z',
          content: '今日もウサギは可愛かった',
        },
      ],
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json; charset=utf-8',
          'X-Data-Source': 'hardcoded-fallback',
        },
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    console.log('POST /pet-diaries - Emergency memory mode');

    // リクエストボディの取得
    let body;
    try {
      body = await req.json();
      console.log('POST /pet-diaries - Request body parsed');
    } catch (parseError) {
      console.error('POST /pet-diaries - Failed to parse JSON:', parseError);
      return Response.json(
        { message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // バリデーション
    if (
      !body ||
      typeof body.authour !== 'string' ||
      typeof body.imageUrl !== 'string'
    ) {
      console.log('POST /pet-diaries - Invalid request body');
      return Response.json(
        {
          message:
            'Invalid request: expected { authour: string, imageUrl: string }',
          received: body,
        },
        { status: 400 }
      );
    }

    const petName = body.petName || body.authour;
    const userMemo = body.memo || ''; // 備考フィールドを正しく取得

    // AIプロンプトに備考を含める
    let aiPrompt = `${petName}というペットの日記を書いてください。`;
    if (userMemo) {
      aiPrompt += `\n\n飼い主からの今日の出来事・備考：\n${userMemo}\n\n`;
    }
    aiPrompt += `画像の内容と上記の情報を参考にして、愛情のこもった日記を作成してください。`;

    // 新しいアイテムを作成
    // imageUrlをファイルシステムパスに変換（/uploads/... -> public/uploads/...）
    const imagePath = path.join(process.cwd(), 'public', body.imageUrl);
    const aiMessage = await generateAIResponseWithImage(aiPrompt, imagePath);
    const newPetDiary: PetDiary = {
      id: randomUUID(),
      authour: body.authour,
      petName: body.petName,
      imageUrl: body.imageUrl,
      createdAt: new Date(),
      content: aiMessage || 'AIが自動生成する内容',
    };

    console.log('POST /pet-diaries - New diary created:', newPetDiary.id);

    // メモリストレージに追加（ファイルシステム操作なし）
    const diaries = await readPetDiaries();
    diaries.push(newPetDiary);
    await writePetDiaries(diaries);
    console.log('POST /pet-diaries - Added to memory storage');

    // シリアライズしてレスポンス
    const serializedDiary = serializePetDiary(newPetDiary);

    return Response.json(serializedDiary, {
      status: 201,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Data-Source': 'memory',
      },
    });
  } catch (error) {
    console.error('POST /pet-diaries - Unexpected error:', error);

    return Response.json(
      {
        message: 'Internal server error while creating diary',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
