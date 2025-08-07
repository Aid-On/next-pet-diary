// src/lib/fs.ts

import { promises as fs } from 'fs';
import path from 'path';

/**
 * ファイルの絶対パスを組み立てる
 * process.cwd() は「プロジェクトのルート」を指すため
 * 開発でも本番でもズレません。
 */
const DATA_FILE = path.join(process.cwd(), 'data', 'items.json');

/** Item の形を軽く定義（必須ではないが補完に便利） */
// export type Item = {
//   id: string;
//   name: string;
//   price: number;
//   // フィールドを増やしたいときはここに追加
// };

/** items.json を読み込んで配列で返す */
export async function readPetDiaries(): Promise<PetDiary[]> {
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw) as PetDiary[];
}

/**
 * 配列やオブジェクトをそのまま保存する
 * @param data - JSON 化できる値（配列でも単一オブジェクトでも可）
 */
export async function writePetDiaries(data: PetDiary[]): Promise<void> {
  // 第3引数 'utf-8' を忘れないと文字化けの原因になる
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
