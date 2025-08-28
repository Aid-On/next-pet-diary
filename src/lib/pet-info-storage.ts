// src/lib/pet-info-storage.ts
import { SavedPetInfo } from '@/types/pet-info';

const STORAGE_KEY = 'saved-pet-info';

// ペット情報をローカルストレージから取得
export function getSavedPetInfo(): SavedPetInfo[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    return parsed.map((item: any) => ({
      ...item,
      firstPersonPronoun: item.firstPersonPronoun || 'ぼく', // デフォルト値を設定
      createdAt: new Date(item.createdAt),
      lastUsedAt: new Date(item.lastUsedAt),
    }));
  } catch (error) {
    console.error('Error loading saved pet info:', error);
    return [];
  }
}

// ペット情報をローカルストレージに保存
export function savePetInfo(
  petInfo: Omit<SavedPetInfo, 'id' | 'createdAt' | 'lastUsedAt'>
): SavedPetInfo {
  const newPetInfo: SavedPetInfo = {
    ...petInfo,
    firstPersonPronoun: petInfo.firstPersonPronoun || 'ぼく', // デフォルト値を設定
    id: Date.now().toString(),
    createdAt: new Date(),
    lastUsedAt: new Date(),
  };

  const existing = getSavedPetInfo();

  // 同じ名前のペットが既に存在する場合は更新
  const existingIndex = existing.findIndex(
    item => item.petName === petInfo.petName
  );

  if (existingIndex >= 0) {
    existing[existingIndex] = {
      ...existing[existingIndex],
      petCharacteristics: petInfo.petCharacteristics,
      firstPersonPronoun: petInfo.firstPersonPronoun || 'ぼく',
      lastUsedAt: new Date(),
    };
  } else {
    existing.push(newPetInfo);
  }

  // 最新使用順でソート（最近使ったものが上に）
  existing.sort((a, b) => b.lastUsedAt.getTime() - a.lastUsedAt.getTime());

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (error) {
    console.error('Error saving pet info:', error);
  }

  return existingIndex >= 0 ? existing[existingIndex] : newPetInfo;
}

// ペット情報の使用記録を更新
export function updateLastUsed(petId: string): void {
  const existing = getSavedPetInfo();
  const petIndex = existing.findIndex(item => item.id === petId);

  if (petIndex >= 0) {
    existing[petIndex].lastUsedAt = new Date();
    existing.sort((a, b) => b.lastUsedAt.getTime() - a.lastUsedAt.getTime());

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch (error) {
      console.error('Error updating last used:', error);
    }
  }
}

// ペット情報を削除
export function deletePetInfo(petId: string): void {
  const existing = getSavedPetInfo();
  const filtered = existing.filter(item => item.id !== petId);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting pet info:', error);
  }
}
