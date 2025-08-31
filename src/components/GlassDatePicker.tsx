'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface GlassDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function GlassDatePicker({ 
  value, 
  onChange, 
  disabled = false,
  placeholder = "日付を選択"
}: GlassDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(value.getFullYear(), value.getMonth()));
  const containerRef = useRef<HTMLDivElement>(null);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // 前月の空白日を追加
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // 当月の日付を追加
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateClick = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === value.toDateString();
  };

  // クリック外しで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });

  return (
    <div ref={containerRef} className="relative">
      {/* 日付入力フィールド */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="relative w-full p-3 bg-white/15 backdrop-blur-[15px] border border-white/30 rounded-[12px] text-gray-700 shadow-[0_2px_8px_0_rgba(31,38,135,0.15)] focus:bg-white/20 focus:border-white/50 focus:shadow-[0_4px_12px_0_rgba(31,38,135,0.25)] focus:outline-none transition-all duration-300 text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>{formatDate(value)}</span>
        <Calendar size={16} className="text-gray-500" />
      </button>

      {/* カレンダードロップダウン */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white/25 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl z-50 p-4">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="p-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full hover:bg-white/30 transition-all duration-200"
            >
              <ChevronLeft size={16} className="text-gray-700" />
            </button>
            <h3 className="text-lg font-semibold text-gray-800">{monthName}</h3>
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full hover:bg-white/30 transition-all duration-200"
            >
              <ChevronRight size={16} className="text-gray-700" />
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
              <div
                key={day}
                className={`text-center text-xs font-medium py-2 ${
                  index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日付グリッド */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => (
              <div key={index} className="aspect-square">
                {date ? (
                  <button
                    type="button"
                    onClick={() => handleDateClick(date)}
                    className={`w-full h-full text-sm rounded-lg transition-all duration-200 ${
                      isSelected(date)
                        ? 'bg-gradient-to-r from-pink-400 to-cyan-400 text-white font-semibold shadow-lg'
                        : isToday(date)
                        ? 'bg-white/40 backdrop-blur-md border border-white/50 text-gray-800 font-medium'
                        : 'bg-white/10 backdrop-blur-sm border border-white/20 text-gray-700 hover:bg-white/20 hover:border-white/40'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                ) : (
                  <div className="w-full h-full"></div>
                )}
              </div>
            ))}
          </div>

          {/* 今日ボタン */}
          <div className="mt-4 pt-3 border-t border-white/20">
            <button
              type="button"
              onClick={() => handleDateClick(new Date())}
              className="w-full py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-gray-700 font-medium hover:bg-white/30 transition-all duration-200"
            >
              今日
            </button>
          </div>
        </div>
      )}
    </div>
  );
}