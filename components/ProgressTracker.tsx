
import React, { useMemo } from 'react';
import { Verse, MemorizationStatus } from '../types';
import { BellIcon } from './icons';

interface ProgressTrackerProps {
  verses: Verse[];
  dueCount: number;
}

const statusConfig = {
    [MemorizationStatus.Mastered]: { color: 'bg-green-500', text: MemorizationStatus.Mastered },
    [MemorizationStatus.InProgress]: { color: 'bg-amber-500', text: MemorizationStatus.InProgress },
    [MemorizationStatus.NotStarted]: { color: 'bg-slate-400', text: MemorizationStatus.NotStarted },
}

// Explicitly define the order for a left-to-right progression display.
const statusOrder: MemorizationStatus[] = [MemorizationStatus.NotStarted, MemorizationStatus.InProgress, MemorizationStatus.Mastered];


const ProgressTracker: React.FC<ProgressTrackerProps> = ({ verses, dueCount }) => {
  const stats = useMemo(() => {
    const counts = {
      [MemorizationStatus.Mastered]: 0,
      [MemorizationStatus.InProgress]: 0,
      [MemorizationStatus.NotStarted]: 0,
    };
    verses.forEach(verse => {
      counts[verse.status]++;
    });
    return counts;
  }, [verses]);

  const total = verses.length;
  if (total === 0) return null;

  return (
    <div className="mb-8 p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800">나의 진행 상황</h2>
        {dueCount > 0 && (
            <div className="flex items-center text-sm font-semibold text-sky-600 bg-sky-100 px-3 py-1 rounded-full">
                <BellIcon className="h-4 w-4 mr-1.5" />
                <span>오늘 복습할 구절: {dueCount}개</span>
            </div>
        )}
      </div>
      <div>
        <div>
            <div className="flex w-full h-6 bg-slate-200 rounded-full overflow-hidden">
                {statusOrder.map(status => {
                    const percentage = total > 0 ? (stats[status] / total) * 100 : 0;
                    if(percentage === 0) return null;
                    return (
                        <div 
                            key={status}
                            className={`${statusConfig[status].color} transition-all duration-500`} 
                            style={{ width: `${percentage}%` }}
                            title={`${status}: ${stats[status]}`}
                        ></div>
                    )
                })}
            </div>
            <div className="grid grid-cols-3 gap-x-4 mt-4 text-lg font-medium text-slate-600">
                {statusOrder.map(status => (
                    <div key={status} className="flex items-center">
                        <span className={`h-4 w-4 rounded-full mr-2 ${statusConfig[status].color}`}></span>
                        <span>{statusConfig[status].text}: {stats[status]}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;