// src/components/PetSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { SavedPetInfo } from '@/types/pet-info';
import {
  getSavedPetInfo,
  updateLastUsed,
  deletePetInfo,
} from '@/lib/pet-info-storage';

interface PetSelectorProps {
  onSelectPet: (
    petName: string,
    characteristics: string,
    firstPersonPronoun: string
  ) => void;
  currentPetName?: string;
  currentCharacteristics?: string;
  currentFirstPersonPronoun?: string;
  disabled?: boolean;
}

export default function PetSelector({
  onSelectPet,
  currentPetName = '',
  currentCharacteristics = '',
  currentFirstPersonPronoun = '',
  disabled = false,
}: PetSelectorProps) {
  const [savedPets, setSavedPets] = useState<SavedPetInfo[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadSavedPets();
  }, []);

  const loadSavedPets = () => {
    const pets = getSavedPetInfo();
    setSavedPets(pets);
  };

  const handleSelectPet = (pet: SavedPetInfo) => {
    updateLastUsed(pet.id);
    onSelectPet(
      pet.petName,
      pet.petCharacteristics,
      pet.firstPersonPronoun || 'ぼく'
    );
    setShowDropdown(false);
    loadSavedPets(); // 使用順序を更新するため再読み込み
  };

  const handleDeletePet = (petId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    deletePetInfo(petId);
    loadSavedPets();
    setShowDeleteConfirm(null);
  };

  const formatLastUsed = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '今日';
    if (days === 1) return '昨日';
    if (days < 7) return `${days}日前`;
    if (days < 30) return `${Math.floor(days / 7)}週間前`;
    return `${Math.floor(days / 30)}ヶ月前`;
  };

  if (savedPets.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={disabled}
        className={`w-full text-gray-600  p-2 text-sm border border-gray-300 rounded-lg text-left flex justify-between items-center ${
          disabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white hover:bg-gray-50'
        }`}
      >
        <span>
          {currentPetName
            ? `${currentPetName}（${currentFirstPersonPronoun || 'ぼく'}）を編集中`
            : '保存済みペット情報から選択'}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 text-xs text-gray-500 border-b">
            保存済みのペット情報（{savedPets.length}件）
          </div>

          {savedPets.map(pet => (
            <div key={pet.id} className="relative">
              <button
                type="button"
                onClick={() => handleSelectPet(pet)}
                className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate flex items-center gap-2">
                      {pet.petName}
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        {pet.firstPersonPronoun || 'ぼく'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {pet.petCharacteristics.length > 60
                        ? `${pet.petCharacteristics.substring(0, 60)}...`
                        : pet.petCharacteristics}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      最後に使用: {formatLastUsed(pet.lastUsedAt)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={e => setShowDeleteConfirm(pet.id)}
                    className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    title="削除"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </button>

              {/* 削除確認ダイアログ */}
              {showDeleteConfirm === pet.id && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-xl w-80">
                    <h3 className="text-lg font-semibold mb-2">
                      ペット情報の削除
                    </h3>
                    <p className="text-gray-600 mb-4">
                      「{pet.petName}
                      」の保存された情報を削除してもよろしいですか？
                    </p>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={e => handleDeletePet(pet.id, e)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
