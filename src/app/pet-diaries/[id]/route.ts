// src/app/pet-diaries/[id]/route.ts
// 緊急用：完全にメモリベースのAPI（ファイルシステム操作なし）

import { readPetDiaries, writePetDiaries } from '@/lib/fs';
import type { PetDiary } from '@/types/pet-diary';
import { read } from 'fs';

type Params = { id: string };

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
    console.log('GET /pet-diaries/[id] - Memory storage items:');

    // メモリから直接検索（ファイルシステム操作なし）
    const items = await readPetDiaries();
    const item = items.find(it => it.id === params.id);
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

    if (!body) {
      return Response.json({ message: 'Invalid JSON' }, { status: 400 });
    } else if (body.petName && typeof body.petName !== 'string') {
      return Response.json({ message: 'Invalid JSON' }, { status: 400 });
    } else if (body.imageUrl && typeof body.imageUrl !== 'string') {
      return Response.json({ message: 'Invalid JSON' }, { status: 400 });
    } else if (body.content && typeof body.content !== 'string') {
      return Response.json({ message: 'Invalid JSON' }, { status: 400 });
    } else if (body.createdAt && typeof body.createdAt !== 'string') {
      return Response.json({ message: 'Invalid JSON' }, { status: 400 });
    }
    // メモリから検索
    const items = await readPetDiaries();
    const idx = items.findIndex(it => it.id === params.id);

    if (idx === -1) {
      return Response.json({ message: 'Not Found' }, { status: 404 });
    }

    const current = items[idx];

    const updated: PetDiary = {
      authour: current.authour,
      petName: body.petName || current.petName,
      id: current.id,
      imageUrl: body.imageUrl ?? current.imageUrl,
      createdAt: body.createdAt ? new Date(body.createdAt) : current.createdAt,
      content: body.content ?? current.content,
    };

    // メモリストレージを更新（ファイルシステム操作なし）
    items[idx] = updated;
    console.log('PUT /pet-diaries/[id] - Updated item in memory');
    await writePetDiaries(items);

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
    const diaries = await readPetDiaries();
    const idx = diaries.findIndex(it => it.id === params.id);
    if (idx === -1) {
      return Response.json({ message: 'Not Found' }, { status: 404 });
    }
    const filtered = diaries.filter((diary, filterIdx) => idx !== filterIdx);
    await writePetDiaries(filtered);

    console.log('DELETE /pet-diaries/[id] - Deleted from memory, remaining:');
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
