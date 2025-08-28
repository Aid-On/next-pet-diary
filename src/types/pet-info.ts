// src/types/pet-info.ts
export interface SavedPetInfo {
  id: string;
  petName: string;
  petCharacteristics: string;
  firstPersonPronoun: string; // 一人称を追加
  createdAt: Date;
  lastUsedAt: Date;
}
