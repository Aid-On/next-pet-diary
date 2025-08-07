// src/app/items/[id]/route.ts

import { readPetDiaries, writePetDiaries } from '@/lib/fs';

type Params = { id: string };

export async function GET(_req: Request, { params }: { params: Params }) {
  const items = await readPetDiaries();
  const item = items.find(it => it.id === params.id);

  if (!item) {
    return Response.json({ message: 'Not Found' }, { status: 404 });
  }

  return Response.json(item); // status 200 (既定)
}

export async function PUT(req: Request, { params }: { params: Params }) {
  const body = await req.json().catch(() => null);
  if (
    !body ||
    typeof body.imageUrl !== 'string' ||
    typeof body.createdAt !== 'string' ||
    typeof body.content !== 'string'
  ) {
    return Response.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const petDiaries = await readPetDiaries();
  const idx = petDiaries.findIndex(it => it.id === params.id);
  if (idx === -1)
    return Response.json({ message: 'Not Found' }, { status: 404 });

  const current = petDiaries[idx];

  const updated: PetDiary = {
    authour: current.authour,
    id: current.id,
    imageUrl: body.imageUrl ?? current.imageUrl,
    createdAt:
      body.createdAt === undefined
        ? current.createdAt
        : new Date(body.createdAt),
    content: body.content ?? current.content,
  };
  petDiaries[idx] = updated;
  await writePetDiaries(petDiaries);

  return Response.json(updated, { status: 200 });
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const petDiaries = await readPetDiaries();
  const filtered = petDiaries.filter(it => it.id !== params.id);

  if (filtered.length === petDiaries.length) {
    return Response.json({ message: 'Not Found' }, { status: 404 });
  }

  await writePetDiaries(filtered);
  return new Response(null, { status: 204 }); // No Content
}
