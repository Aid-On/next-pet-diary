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
    console.log('Reading pet diaries from:', DATA_FILE_PATH);
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    console.log('Raw file data:', data.substring(0, 200) + '...');

    const parsed = JSON.parse(data);
    console.log('Parsed data length:', parsed.length);

    // createdAtをstring→Dateに変換
    const result = parsed.map((item: any, index: number) => {
      try {
        return {
          ...item,
          createdAt: new Date(item.createdAt),
        };
      } catch (dateError) {
        console.error(
          `Error converting date for item ${index}:`,
          dateError,
          item.createdAt
        );
        // デフォルトの日付を設定
        return {
          ...item,
          createdAt: new Date(),
        };
      }
    });

    console.log('Successfully processed items:', result.length);
    return result;
  } catch (error) {
    console.error('Error in readPetDiaries:', error);
    // ファイルが存在しない場合は空配列を返す
    if ((error as any).code === 'ENOENT') {
      console.log('Data file not found, returning empty array');
      return [];
    }
    throw error;
  }
}

// ペット日記データを書き込む
export async function writePetDiaries(diaries: PetDiary[]): Promise<void> {
  try {
    console.log('Writing pet diaries, count:', diaries.length);
    await ensureDataDir();
    // createdAtをDate→stringに変換してから保存
    const dataToSave = diaries.map(diary => ({
      ...diary,
      createdAt:
        diary.createdAt instanceof Date
          ? diary.createdAt.toISOString()
          : diary.createdAt,
    }));

    const jsonString = JSON.stringify(dataToSave, null, 2);
    console.log('Writing JSON length:', jsonString.length);

    await fs.writeFile(DATA_FILE_PATH, jsonString, 'utf-8');
    console.log('Successfully wrote pet diaries');
  } catch (error) {
    console.error('Error in writePetDiaries:', error);
    throw error;
  }
}
