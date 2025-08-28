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
          firstPersonPronoun: 'ぼく',
        },
        {
          authour: 'kotone',
          petName: 'ユキ',
          id: '7ec6ccc0-e3e5-4ded-a073-2b197393645b',
          imageUrl: '/images/yuki.jpg',
          createdAt: '2025-08-07T00:00:00.000Z',
          content: '今日もウサギは可愛かった',
          firstPersonPronoun: 'わたし',
        },
        {
          authour: 'kotone',
          petName: 'ウィム',
          id: '7ec6ccc0-e3e5-4ded-a073-2b197393645c',
          imageUrl: '/images/wim.jpg',
          createdAt: '2025-08-07T00:00:00.000Z',
          content: '今日もウサギは可愛かった',
          firstPersonPronoun: 'おれ',
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

    // 追加のバリデーション
    if (body.petName && typeof body.petName !== 'string') {
      return Response.json(
        { message: 'Invalid petName: expected string' },
        { status: 400 }
      );
    }

    if (body.memo && typeof body.memo !== 'string') {
      return Response.json(
        { message: 'Invalid memo: expected string' },
        { status: 400 }
      );
    }

    if (
      body.petCharacteristics &&
      typeof body.petCharacteristics !== 'string'
    ) {
      return Response.json(
        { message: 'Invalid petCharacteristics: expected string' },
        { status: 400 }
      );
    }

    if (
      body.firstPersonPronoun &&
      typeof body.firstPersonPronoun !== 'string'
    ) {
      return Response.json(
        { message: 'Invalid firstPersonPronoun: expected string' },
        { status: 400 }
      );
    }

    const petName = body.petName || body.authour;
    const userMemo = body.memo || ''; // 備考フィールドを正しく取得
    const firstPersonPronoun = body.firstPersonPronoun || 'ぼく'; // 一人称を取得
    const petCharacteristics = body.petCharacteristics || ''; // ペット特徴を取得

    // AIプロンプトに備考と特徴を含める
    let aiPrompt = `${petName}というペットの日記を書いてください。`;

    if (petCharacteristics) {
      aiPrompt += `\n\nペットの特徴・性格：\n${petCharacteristics}\n\n`;
    }

    if (userMemo) {
      aiPrompt += `\n\n飼い主からの今日の出来事・備考：\n${userMemo}\n\n`;
    }

    aiPrompt += `画像の内容と上記の情報を参考にして、愛情のこもった日記を作成してください。`;

    console.log('POST /pet-diaries - AI prompt created for pet:', petName);
    console.log(
      'POST /pet-diaries - First person pronoun:',
      firstPersonPronoun
    );

    // 新しいアイテムを作成
    // imageUrlをファイルシステムパスに変換（/uploads/... -> public/uploads/...）
    const imagePath = path.join(process.cwd(), 'public', body.imageUrl);
    console.log('POST /pet-diaries - Image path:', imagePath);

    // AI生成（一人称を含める）
    const aiMessage = await generateAIResponseWithImage(
      aiPrompt,
      imagePath,
      firstPersonPronoun
    ); // 一人称を渡す

    const newPetDiary: PetDiary = {
      id: randomUUID(),
      authour: body.authour,
      petName: body.petName,
      imageUrl: body.imageUrl,
      createdAt: new Date(),
      content: aiMessage || 'AIが自動生成する内容',
      petCharacteristics: body.petCharacteristics?.trim() || undefined, // ペット特徴
      firstPersonPronoun: firstPersonPronoun, // 一人称を保存
    };

    console.log('POST /pet-diaries - New diary created:', newPetDiary.id);
    console.log(
      'POST /pet-diaries - Diary content length:',
      newPetDiary.content.length
    );

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

    // エラーの詳細をログ出力
    if (error instanceof Error) {
      console.error('POST /pet-diaries - Error name:', error.name);
      console.error('POST /pet-diaries - Error message:', error.message);
      console.error('POST /pet-diaries - Error stack:', error.stack);
    }

    return Response.json(
      {
        message: 'Internal server error while creating diary',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
