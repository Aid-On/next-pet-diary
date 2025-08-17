// src/lib/fs.ts
import { PetDiary } from '@/types/pet-diary';
import { promises as fs } from 'fs';
import path from 'path';

// データファイルのパス
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'items.json');

// データディレクトリが存在しない場合は作成
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// ペット日記データを読み込む
export async function readPetDiaries(): Promise<PetDiary[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    // createdAtをstring→Dateに変換
    return parsed.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
    }));
  } catch (error) {
    // ファイルが存在しない場合は空配列を返す
    if ((error as any).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// ペット日記データを書き込む
export async function writePetDiaries(diaries: PetDiary[]): Promise<void> {
  await ensureDataDir();
  // createdAtをDate→stringに変換してから保存
  const dataToSave = diaries.map(diary => ({
    ...diary,
    createdAt:
      diary.createdAt instanceof Date
        ? diary.createdAt.toISOString()
        : diary.createdAt,
  }));
  await fs.writeFile(
    DATA_FILE_PATH,
    JSON.stringify(dataToSave, null, 2),
    'utf-8'
  );
}
