// src/app/items/route.ts
import { readPetDiaries, writePetDiaries } from '@/lib/fs';
import { randomUUID } from 'crypto';

export async function GET() {
  const items = await readPetDiaries();

  return Response.json(items, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' }, // 開発中は毎回読み直す
  });
}

export async function POST(req: Request) {
  // ─ 1. 受信 JSON を取り出す ─
  const body = await req.json().catch(() => null);

  if (
    !body ||
    typeof body.authour !== 'string' ||
    typeof body.imageUrl !== 'string'
  ) {
    return Response.json(
      { message: 'Invalid JSON: expected { name:string, price:number }' },
      { status: 400 }
    );
  }

  // ─ 2. 新しいアイテムを作成 ─
  const newPetDiary: PetDiary = {
    id: randomUUID(),
    authour: body.authour,
    imageUrl: body.imageUrl,
    createdAt: new Date(),
    content: 'AIが自動生成する',
  };

  // ─ 3. 既存データに追加して保存 ─
  const petDiaries = await readPetDiaries();
  petDiaries.push(newPetDiary);
  await writePetDiaries(petDiaries);

  // ─ 4. レスポンス ─
  return Response.json(newPetDiary, {
    status: 201, // “Created”
    headers: {
      Location: `/items/${newPetDiary.id}`, // リソース URL を示す
      'Content-Type': 'application/json',
    },
  });
}
