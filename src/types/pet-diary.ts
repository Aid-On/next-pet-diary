export interface PetDiary {
  authour: string;
  petName: string;
  id: string;
  imageUrl: string;
  createdAt: Date;
  content: string;
}

export interface DiaryEntry {
  id: number;
  title: string;
  content: string;
  date: string;
  imageUrl: string;
  petName: string;
}
