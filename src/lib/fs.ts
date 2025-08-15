// src/lib/fs.ts
import { promises as fs } from 'fs';
import path from 'path';

// PetDiary型の定義
interface PetDiary {
  id: string;
  authour: string;
  imageUrl: string;
  createdAt: string;
  content: string;
}

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
    return JSON.parse(data);
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
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(diaries, null, 2), 'utf-8');
}
