import React from 'react';
import { MemorizationVerse, VerseStatus } from '../types';
import VerseItem from './VerseItem';

interface VerseListProps {
    verses: MemorizationVerse[];
    activeTab: 'in-progress' | 'completed';
    onDelete: (id: string) => void;
    onStatusChange: (id: string, status: VerseStatus) => void;
    onPractice: (id: string) => void;
    onFlashcard: (id: string) => void;
}

const VerseList: React.FC<VerseListProps> = ({ verses, activeTab, onDelete, onStatusChange, onPractice, onFlashcard }) => {
    if (verses.length === 0) {
        return (
            <div className="text-center bg-slate-800 p-12 rounded-lg shadow-lg">
                <h3 className="text-lg font-medium text-slate-100">해당 상태의 구절이 없습니다</h3>
                <p className="mt-2 text-sm text-slate-400">
                    "구절 추가" 버튼을 클릭하여 암송 여정을 시작하세요!
                </p>
            </div>
        );
    }
    
    // For 'completed' tab, render with month grouping
    if (activeTab === 'completed') {
        const groupedByMonth: { [key: string]: MemorizationVerse[] } = {};

        verses.forEach(verse => {
            if (verse.completedAt) {
                const date = new Date(verse.completedAt);
                const year = date.getFullYear();
                const month = date.getMonth();
                const key = `${year}-${month}`;

                if (!groupedByMonth[key]) {
                    groupedByMonth[key] = [];
                }
                groupedByMonth[key].push(verse);
            }
        });
        
        return (
            <div>
                {Object.keys(groupedByMonth).map(key => {
                    const [year, month] = key.split('-');
                    const monthName = new Date(parseInt(year), parseInt(month)).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                    });
                    
                    return (
                        <div key={key} className="mt-6 first:mt-0">
                            <h2 className="bg-slate-700 px-4 py-3 rounded-lg text-lg font-bold text-slate-200 mb-4">
                                {monthName}
                            </h2>
                            <div className="space-y-4">
                                {groupedByMonth[key].map(verse => (
                                    <VerseItem 
                                        key={verse.id}
                                        verse={verse}
                                        onDelete={onDelete}
                                        onStatusChange={onStatusChange}
                                        onPractice={onPractice}
                                        onFlashcard={onFlashcard}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    // For 'in-progress' tab, render a simple list without the redundant header.
    return (
        <div className="space-y-4">
            {verses.map(verse => (
                <VerseItem 
                    key={verse.id}
                    verse={verse}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    onPractice={onPractice}
                    onFlashcard={onFlashcard}
                />
            ))}
        </div>
    );
};

export default VerseList;