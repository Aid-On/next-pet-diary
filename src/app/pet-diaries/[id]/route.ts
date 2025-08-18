// src/app/pet-diaries/[id]/route.ts
// 緊急用：完全にメモリベースのAPI（ファイルシステム操作なし）

import type { PetDiary } from '@/types/pet-diary';

type Params = { id: string };

// メモリ上のデータストレージ（他のAPIルートと共有）
let memoryStorage: PetDiary[] = [
  {
    authour: 'kotone',
    petName: 'ピノ',
    id: '7ec6ccc0-e3e5-4ded-a073-2b197393645a',
    imageUrl: '/images/pino.jpg',
    createdAt: new Date('2025-08-07T00:00:00.000Z'),
    content: '今日もウサギは可愛かった',
  },
  {
    authour: 'kotone',
    petName: 'ユキ',
    id: '7ec6ccc0-e3e5-4ded-a073-2b197393645b',
    imageUrl: '/images/yuki.jpg',
    createdAt: new Date('2025-08-07T00:00:00.000Z'),
    content: '今日もウサギは可愛かった',
  },
  {
    authour: 'kotone',
    petName: 'ウィム',
    id: '7ec6ccc0-e3e5-4ded-a073-2b197393645c',
    imageUrl: '/images/wim.jpg',
    createdAt: new Date('2025-08-07T00:00:00.000Z'),
    content: '今日もウサギは可愛かった',
  },
];

function serializePetDiary(diary: PetDiary) {
  return {
    ...diary,
    createdAt:
      diary.createdAt instanceof Date
        ? diary.createdAt.toISOString()
        : diary.createdAt,
  };
}

export async function GET(_req: Request, { params }: { params: Params }) {
  try {
    console.log(
      'GET /pet-diaries/[id] - Emergency memory mode, ID:',
      params.id
    );
    console.log(
      'GET /pet-diaries/[id] - Memory storage items:',
      memoryStorage.length
    );

    // メモリから直接検索（ファイルシステム操作なし）
    const item = memoryStorage.find(it => it.id === params.id);
    console.log('GET /pet-diaries/[id] - Found item:', item ? 'Yes' : 'No');

    if (!item) {
      console.log('GET /pet-diaries/[id] - Item not found');
      return Response.json({ message: 'Not Found' }, { status: 404 });
    }

    // シリアライズしてレスポンス
    const serializedItem = serializePetDiary(item);
    console.log('GET /pet-diaries/[id] - Returning item');

    return Response.json(serializedItem, {
      headers: {
        'X-Data-Source': 'memory',
      },
    });
  } catch (error) {
    console.error('GET /pet-diaries/[id] - Unexpected error:', error);

    return Response.json(
      {
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: Params }) {
  try {
    console.log(
      'PUT /pet-diaries/[id] - Emergency memory mode, ID:',
      params.id
    );

    const body = await req.json().catch(() => null);

    if (
      !body ||
      typeof body.imageUrl !== 'string' ||
      typeof body.createdAt !== 'string' ||
      typeof body.content !== 'string'
    ) {
      return Response.json({ message: 'Invalid JSON' }, { status: 400 });
    }

    // メモリから検索
    const idx = memoryStorage.findIndex(it => it.id === params.id);

    if (idx === -1) {
      return Response.json({ message: 'Not Found' }, { status: 404 });
    }

    const current = memoryStorage[idx];

    const updated: PetDiary = {
      authour: current.authour,
      petName: body.petName || current.petName,
      id: current.id,
      imageUrl: body.imageUrl ?? current.imageUrl,
      createdAt: body.createdAt ? new Date(body.createdAt) : current.createdAt,
      content: body.content ?? current.content,
    };

    // メモリストレージを更新（ファイルシステム操作なし）
    memoryStorage[idx] = updated;
    console.log('PUT /pet-diaries/[id] - Updated item in memory');

    // シリアライズしてレスポンス
    const serializedUpdated = serializePetDiary(updated);

    return Response.json(serializedUpdated, {
      status: 200,
      headers: {
        'X-Data-Source': 'memory',
      },
    });
  } catch (error) {
    console.error('PUT /pet-diaries/[id] - Error:', error);

    return Response.json(
      {
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  try {
    console.log(
      'DELETE /pet-diaries/[id] - Emergency memory mode, ID:',
      params.id
    );

    // メモリから削除
    const initialLength = memoryStorage.length;
    memoryStorage = memoryStorage.filter(it => it.id !== params.id);

    if (memoryStorage.length === initialLength) {
      return Response.json({ message: 'Not Found' }, { status: 404 });
    }

    console.log(
      'DELETE /pet-diaries/[id] - Deleted from memory, remaining:',
      memoryStorage.length
    );
    return new Response(null, {
      status: 204,
      headers: {
        'X-Data-Source': 'memory',
      },
    });
  } catch (error) {
    console.error('DELETE /pet-diaries/[id] - Error:', error);

    return Response.json(
      {
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
