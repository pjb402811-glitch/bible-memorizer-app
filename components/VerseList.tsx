
import React, { useState } from 'react';
import { Verse, MemorizationStatus } from '../types';
import { TrashIcon, ChevronDownIcon, BrainIcon, BellIcon } from './icons';

interface VerseListItemProps {
  verse: Verse;
  onUpdateStatus: (id: string, status: MemorizationStatus) => void;
  onDelete: (id: string) => void;
  onPractice: (id: string) => void;
  listType: 'inProgress' | 'completed';
}

const statusConfig: Record<MemorizationStatus, { ring: string; buttonClasses: string; }> = {
    [MemorizationStatus.NotStarted]: { 
      ring: 'ring-slate-400', 
      buttonClasses: 'bg-slate-100 text-slate-600',
    },
    [MemorizationStatus.InProgress]: { 
      ring: 'ring-amber-500', 
      buttonClasses: 'bg-amber-100 text-amber-700',
    },
    [MemorizationStatus.Mastered]: { 
      ring: 'ring-green-500', 
      buttonClasses: 'bg-green-100 text-green-700',
    },
  };

const VerseListItem: React.FC<VerseListItemProps> = ({ verse, onUpdateStatus, onDelete, onPractice, listType }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const config = statusConfig[verse.status];
  
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const isDue = verse.status !== MemorizationStatus.Mastered && 
                (!verse.dueDate || new Date(verse.dueDate) <= today);

  return (
    <li className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex items-center justify-between space-x-4">
      <div className="flex-1 min-w-0 flex items-center space-x-3">
        {isDue && <BellIcon className="h-5 w-5 text-sky-500 flex-shrink-0" title="오늘 복습할 구절입니다."/>}
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-slate-800 truncate">{verse.reference}</p>
          <p className="text-slate-500 mt-1 text-sm truncate">{verse.text}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
         {listType === 'inProgress' && (
            <button 
                onClick={() => onPractice(verse.id)} 
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 ring-1 ring-inset ring-slate-200 hover:bg-sky-100 hover:text-sky-600 transition-colors duration-200" 
                title="연습하기"
            >
                <BrainIcon className="h-5 w-5" />
                <span>연습</span>
            </button>
         )}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center px-3 py-1 text-sm font-semibold rounded-full ${config.buttonClasses} ring-1 ring-inset ${config.ring} focus:outline-none`}
          >
            {verse.status}
            <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {isMenuOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black/5 z-10">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                {Object.values(MemorizationStatus).map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      onUpdateStatus(verse.id, status);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    role="menuitem"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button onClick={() => onDelete(verse.id)} className="p-2 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600" title="삭제하기">
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </li>
  );
};

interface VerseListProps {
  verses: Verse[];
  onUpdateStatus: (id: string, status: MemorizationStatus) => void;
  onDelete: (id: string) => void;
  onPractice: (id: string) => void;
  listType: 'inProgress' | 'completed';
}

const VerseList: React.FC<VerseListProps> = ({ verses, onUpdateStatus, onDelete, onPractice, listType }) => {
  if (verses.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-slate-800">
          {listType === 'inProgress' ? '진행 중인 구절이 없습니다' : '완료된 구절이 없습니다'}
        </h3>
        <p className="text-slate-500 mt-2">
          {listType === 'inProgress'
            ? '"구절 추가" 버튼을 클릭하여 암송 여정을 시작하세요!'
            : '구절을 암송 완료하면 이곳으로 이동합니다.'}
        </p>
      </div>
    );
  }

  return (
    <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
            {listType === 'inProgress' ? '내 암송 구절' : '완료한 구절'}
        </h2>
        <ul className="space-y-3">
        {verses.map(verse => (
            <VerseListItem
            key={verse.id}
            verse={verse}
            onUpdateStatus={onUpdateStatus}
            onDelete={onDelete}
            onPractice={onPractice}
            listType={listType}
            />
        ))}
        </ul>
    </div>
  );
};

export default VerseList;