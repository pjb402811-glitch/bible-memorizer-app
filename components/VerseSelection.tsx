
import React, { useState } from 'react';
import { Verse } from '../types';
import { ChevronLeftIcon, CheckCircleIcon, CircleIcon } from './icons';

interface VerseSelectionProps {
  verses: Verse[];
  onStart: (selectedVerses: Verse[]) => void;
  onCancel: () => void;
}

const VerseSelection: React.FC<VerseSelectionProps> = ({ verses, onStart, onCancel }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleVerse = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(verseId => verseId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.length === verses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(verses.map(v => v.id));
    }
  };

  const handleStart = () => {
    const verseMap = new Map(verses.map(v => [v.id, v]));
    const selectedVerses = selectedIds.map(id => verseMap.get(id)).filter((v): v is Verse => v !== undefined);
    onStart(selectedVerses);
  };

  return (
    <div className="fixed inset-0 bg-slate-100 z-40 flex flex-col p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">복습할 구절 선택</h2>
          <button 
            onClick={onCancel} 
            className="flex items-center bg-white text-slate-700 font-semibold px-4 py-2 rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all"
            aria-label="목록으로 돌아가기"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-2" />
            <span>목록으로</span>
          </button>
        </div>
      </div>
      
      <div className="flex-grow w-full max-w-4xl mx-auto overflow-y-auto bg-white rounded-xl shadow-md p-2">
        <ul className="space-y-1">
          {verses.map(verse => {
            const isSelected = selectedIds.includes(verse.id);
            return (
              <li 
                key={verse.id} 
                onClick={() => toggleVerse(verse.id)}
                className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-sky-100' : 'hover:bg-slate-50'}`}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && toggleVerse(verse.id)}
              >
                {isSelected 
                  ? <CheckCircleIcon className="h-6 w-6 text-sky-600 flex-shrink-0" /> 
                  : <CircleIcon className="h-6 w-6 text-slate-400 flex-shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{verse.reference}</p>
                  <p className="text-slate-500 text-sm truncate">{verse.text}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="w-full max-w-4xl mx-auto mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-white rounded-xl shadow-md">
          <button 
            onClick={handleSelectAll}
            className="text-sm font-semibold text-sky-600 hover:underline"
          >
            {selectedIds.length === verses.length ? '전체 해제' : '전체 선택'}
          </button>
          <div className="text-center">
            <p className="font-bold text-lg text-slate-800">{selectedIds.length}개 구절 선택됨</p>
            <p className="text-sm text-slate-500">총 {verses.length}개 중</p>
          </div>
          <button 
            onClick={handleStart}
            disabled={selectedIds.length === 0}
            className="bg-green-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-green-700 transition-transform hover:scale-105 text-lg disabled:bg-slate-300 disabled:cursor-not-allowed disabled:transform-none"
          >
            플래시카드 시작
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerseSelection;