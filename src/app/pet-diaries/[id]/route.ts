// src/app/pet-diaries/[id]/route.ts
// 緊急用：完全にメモリベースのAPI（ファイルシステム操作なし）

import { readPetDiaries, writePetDiaries } from '@/lib/fs';
import type { PetDiary } from '@/types/pet-diary';

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
  const p = await params;
  try {
    console.log('GET /pet-diaries/[id] - Emergency memory mode, ID:', p.id);
    console.log('GET /pet-diaries/[id] - Memory storage items:');

    // メモリから直接検索（ファイルシステム操作なし）
    const items = await readPetDiaries();
    console.log('GET /pet-diaries/[id] - Total items in memory:', items.length);

    const item = items.find(it => it.id === p.id);
    console.log('GET /pet-diaries/[id] - Found item:', item ? 'Yes' : 'No');

    if (!item) {
      console.log('GET /pet-diaries/[id] - Item not found for ID:', p.id);
      console.log(
        'GET /pet-diaries/[id] - Available IDs:',
        items.map(i => i.id)
      );
      return Response.json({ message: 'Not Found' }, { status: 404 });
    }

    console.log('GET /pet-diaries/[id] - Item details:', {
      id: item.id,
      petName: item.petName,
      authour: item.authour,
      hasContent: !!item.content,
      contentLength: item.content?.length || 0,
      hasCharacteristics: !!item.petCharacteristics,
      firstPersonPronoun: item.firstPersonPronoun || 'not set',
    });

    // シリアライズしてレスポンス
    const serializedItem = serializePetDiary(item);
    console.log('GET /pet-diaries/[id] - Returning item');

    return Response.json(serializedItem, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Data-Source': 'memory',
      },
    });
  } catch (error) {
    console.error('GET /pet-diaries/[id] - Unexpected error:', error);

    if (error instanceof Error) {
      console.error('GET /pet-diaries/[id] - Error name:', error.name);
      console.error('GET /pet-diaries/[id] - Error message:', error.message);
      console.error('GET /pet-diaries/[id] - Error stack:', error.stack);
    }

    return Response.json(
      {
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: Params }) {
  const p = await params;
  try {
    console.log('PUT /pet-diaries/[id] - Emergency memory mode, ID:', p.id);

    // リクエストボディの取得と検証
    const body = await req.json().catch(() => null);

    if (!body) {
      console.log('PUT /pet-diaries/[id] - Empty or invalid JSON body');
      return Response.json({ message: 'Invalid JSON' }, { status: 400 });
    }

    console.log(
      'PUT /pet-diaries/[id] - Request body keys:',
      Object.keys(body)
    );

    // 型チェックによるバリデーション
    if (body.petName !== undefined && typeof body.petName !== 'string') {
      console.log(
        'PUT /pet-diaries/[id] - Invalid petName type:',
        typeof body.petName
      );
      return Response.json(
        { message: 'Invalid petName: expected string' },
        { status: 400 }
      );
    }

    if (body.imageUrl !== undefined && typeof body.imageUrl !== 'string') {
      console.log(
        'PUT /pet-diaries/[id] - Invalid imageUrl type:',
        typeof body.imageUrl
      );
      return Response.json(
        { message: 'Invalid imageUrl: expected string' },
        { status: 400 }
      );
    }

    if (body.content !== undefined && typeof body.content !== 'string') {
      console.log(
        'PUT /pet-diaries/[id] - Invalid content type:',
        typeof body.content
      );
      return Response.json(
        { message: 'Invalid content: expected string' },
        { status: 400 }
      );
    }

    if (body.createdAt !== undefined && typeof body.createdAt !== 'string') {
      console.log(
        'PUT /pet-diaries/[id] - Invalid createdAt type:',
        typeof body.createdAt
      );
      return Response.json(
        { message: 'Invalid createdAt: expected string' },
        { status: 400 }
      );
    }

    if (
      body.petCharacteristics !== undefined &&
      typeof body.petCharacteristics !== 'string'
    ) {
      console.log(
        'PUT /pet-diaries/[id] - Invalid petCharacteristics type:',
        typeof body.petCharacteristics
      );
      return Response.json(
        { message: 'Invalid petCharacteristics: expected string' },
        { status: 400 }
      );
    }

    if (
      body.firstPersonPronoun !== undefined &&
      typeof body.firstPersonPronoun !== 'string'
    ) {
      console.log(
        'PUT /pet-diaries/[id] - Invalid firstPersonPronoun type:',
        typeof body.firstPersonPronoun
      );
      return Response.json(
        { message: 'Invalid firstPersonPronoun: expected string' },
        { status: 400 }
      );
    }

    // メモリから検索
    const items = await readPetDiaries();
    const idx = items.findIndex(it => it.id === p.id);

    if (idx === -1) {
      console.log('PUT /pet-diaries/[id] - Item not found for ID:', p.id);
      console.log(
        'PUT /pet-diaries/[id] - Available IDs:',
        items.map(i => i.id)
      );
      return Response.json({ message: 'Not Found' }, { status: 404 });
    }

    const current = items[idx];
    console.log('PUT /pet-diaries/[id] - Current item found:', {
      id: current.id,
      petName: current.petName,
      authour: current.authour,
      currentFirstPersonPronoun: current.firstPersonPronoun || 'not set',
    });

    // 更新用データを作成（既存のデータをベースに更新）
    const updated: PetDiary = {
      authour: current.authour, // 作成者は変更不可
      petName: body.petName !== undefined ? body.petName : current.petName,
      id: current.id, // IDは変更不可
      imageUrl: body.imageUrl !== undefined ? body.imageUrl : current.imageUrl,
      createdAt: body.createdAt ? new Date(body.createdAt) : current.createdAt,
      content: body.content !== undefined ? body.content : current.content,
      petCharacteristics:
        body.petCharacteristics !== undefined
          ? body.petCharacteristics.trim() || undefined // 空文字列の場合はundefinedにする
          : current.petCharacteristics, // ペット特徴フィールドの更新
      firstPersonPronoun:
        body.firstPersonPronoun !== undefined
          ? body.firstPersonPronoun.trim() || 'ぼく' // 空文字列の場合はデフォルト値
          : current.firstPersonPronoun || 'ぼく', // 一人称フィールドの更新（既存データがない場合はデフォルト値）
    };

    console.log('PUT /pet-diaries/[id] - Update details:', {
      updatedPetName: updated.petName,
      updatedFirstPersonPronoun: updated.firstPersonPronoun,
      updatedCharacteristics: updated.petCharacteristics
        ? 'has value'
        : 'no value',
      contentLength: updated.content.length,
    });

    // メモリストレージを更新（ファイルシステム操作なし）
    items[idx] = updated;
    console.log('PUT /pet-diaries/[id] - Updated item in memory');
    await writePetDiaries(items);
    console.log('PUT /pet-diaries/[id] - Memory storage written');

    // シリアライズしてレスポンス
    const serializedUpdated = serializePetDiary(updated);

    return Response.json(serializedUpdated, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Data-Source': 'memory',
      },
    });
  } catch (error) {
    console.error('PUT /pet-diaries/[id] - Error:', error);

    if (error instanceof Error) {
      console.error('PUT /pet-diaries/[id] - Error name:', error.name);
      console.error('PUT /pet-diaries/[id] - Error message:', error.message);
      console.error('PUT /pet-diaries/[id] - Error stack:', error.stack);
    }

    return Response.json(
      {
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const p = await params;
  try {
    console.log('DELETE /pet-diaries/[id] - Emergency memory mode, ID:', p.id);

    // メモリから検索
    const diaries = await readPetDiaries();
    console.log(
      'DELETE /pet-diaries/[id] - Total items before deletion:',
      diaries.length
    );

    const idx = diaries.findIndex(it => it.id === p.id);

    if (idx === -1) {
      console.log('DELETE /pet-diaries/[id] - Item not found for ID:', p.id);
      console.log(
        'DELETE /pet-diaries/[id] - Available IDs:',
        diaries.map(i => i.id)
      );
      return Response.json({ message: 'Not Found' }, { status: 404 });
    }

    const itemToDelete = diaries[idx];
    console.log('DELETE /pet-diaries/[id] - Item to delete:', {
      id: itemToDelete.id,
      petName: itemToDelete.petName,
      authour: itemToDelete.authour,
    });

    // 削除処理（フィルターを使用してインデックス以外の要素を保持）
    const filtered = diaries.filter((diary, filterIdx) => idx !== filterIdx);
    console.log(
      'DELETE /pet-diaries/[id] - Items after deletion:',
      filtered.length
    );

    // メモリストレージを更新
    await writePetDiaries(filtered);
    console.log('DELETE /pet-diaries/[id] - Memory storage updated');

    console.log(
      'DELETE /pet-diaries/[id] - Deleted from memory, remaining items:',
      filtered.length
    );

    // 204 No Content で成功を返す（削除成功時の標準的なレスポンス）
    return new Response(null, {
      status: 204,
      headers: {
        'X-Data-Source': 'memory',
      },
    });
  } catch (error) {
    console.error('DELETE /pet-diaries/[id] - Error:', error);

    if (error instanceof Error) {
      console.error('DELETE /pet-diaries/[id] - Error name:', error.name);
      console.error('DELETE /pet-diaries/[id] - Error message:', error.message);
      console.error('DELETE /pet-diaries/[id] - Error stack:', error.stack);
    }

    return Response.json(
      {
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
