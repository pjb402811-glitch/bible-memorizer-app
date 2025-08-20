import React from 'react';
import { MemorizationVerse } from '../types';

const BellIcon: React.FC<{className: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);


const ProgressSummary: React.FC<{ verses: MemorizationVerse[] }> = ({ verses }) => {
    const total = verses.length;
    const inProgress = verses.filter(v => v.status === 'in-progress').length;
    const completed = verses.filter(v => v.status === 'completed').length;

    const inProgressPercent = total > 0 ? (inProgress / total) * 100 : 0;
    const completedPercent = total > 0 ? (completed / total) * 100 : 0;

    return (
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-100">나의 진행 상황</h2>
                <div className="flex items-center gap-2 text-sm font-medium text-blue-300 bg-blue-500 bg-opacity-20 px-3 py-1 rounded-full">
                    <BellIcon className="w-5 h-5"/>
                    <span>오늘 복습할 구절: 3개</span>
                </div>
            </div>
            <div className="mt-4">
                <div className="flex h-5 rounded-full overflow-hidden bg-slate-700">
                    <div style={{ width: `${completedPercent}%` }} className="bg-green-500"></div>
                    <div style={{ width: `${inProgressPercent}%` }} className="bg-yellow-500"></div>
                </div>
                <div className="mt-3 flex justify-around text-sm text-slate-200">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span>진행 중: {inProgress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span>완료: {completed}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressSummary;