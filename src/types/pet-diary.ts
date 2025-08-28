export interface PetDiary {
  authour: string;
  petName: string;
  id: string;
  imageUrl: string;
  createdAt: Date;
  content: string;
  petCharacteristics?: string; // ペットの特徴を追加
  firstPersonPronoun?: string; // 一人称を追加
}

export interface DiaryEntry {
  id: number;
  title: string;
  content: string;
  date: string;
  imageUrl: string;
  petName: string;
  petCharacteristics?: string; // ペットの特徴を追加
  firstPersonPronoun?: string; // 一人称を追加
}
