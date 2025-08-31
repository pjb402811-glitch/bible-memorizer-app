import React from 'react';
import { MemorizationVerse, VerseStatus } from '../types';

const LightbulbIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const CardIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2m14 0h-2m-2 0h-2" />
    </svg>
);


const SparklesIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 01-1.47-1.47L12.94 18.25l1.188-.648a2.25 2.25 0 011.47 1.47L16.25 20l.648.812a2.25 2.25 0 011.47-1.47l1.188-.648-.648 1.188a2.25 2.25 0 01-1.47 1.47z" />
    </svg>
);

const TrashIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const statusMap: Record<VerseStatus, { text: string, bg: string, text_color: string }> = {
    'in-progress': { text: '진행 중', bg: 'bg-yellow-500 bg-opacity-20', text_color: 'text-yellow-300' },
    'completed': { text: '완료', bg: 'bg-green-500 bg-opacity-20', text_color: 'text-green-300' }
};

const statusIconColorMap: Record<VerseStatus, string> = {
    'in-progress': 'text-yellow-400',
    'completed': 'text-green-400',
};


interface VerseItemProps {
    verse: MemorizationVerse;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, status: VerseStatus) => void;
    onPractice: (id: string) => void;
    onFlashcard: (id: string) => void;
}

const VerseItem: React.FC<VerseItemProps> = ({ verse, onDelete, onStatusChange, onPractice, onFlashcard }) => {
    const reference = (verse.bookName === 'LordsPrayer' || verse.bookName === 'ApostlesCreed')
        ? verse.koreanBookName
        : `${verse.koreanBookName} ${verse.chapter}:${verse.verse}`;
    const currentStatus = statusMap[verse.status];

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onStatusChange(verse.id, e.target.value as VerseStatus);
    };

    return (
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700">
            <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-3 flex-grow min-w-0">
                    <LightbulbIcon className={`w-6 h-6 ${statusIconColorMap[verse.status]} flex-shrink-0`}/>
                    <div className="flex-grow">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-bold text-slate-100">{reference}</h3>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => onFlashcard(verse.id)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-blue-500 rounded-md shadow-sm text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 transition-colors"
                                >
                                    <CardIcon className="w-5 h-5 text-blue-400"/>
                                    <span>카드</span>
                                </button>
                                <button 
                                    onClick={() => onPractice(verse.id)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-indigo-500 rounded-md shadow-sm text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-colors"
                                >
                                    <SparklesIcon className="w-5 h-5 text-indigo-400"/>
                                    <span>퀴즈</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                        value={verse.status}
                        onChange={handleStatusChange}
                        className={`text-sm font-semibold border-none rounded-md py-1.5 pl-2 pr-8 focus:ring-2 focus:ring-indigo-500 appearance-none ${currentStatus.bg} ${currentStatus.text_color}`}
                        style={{ backgroundImage: 'none' }} // Hide default arrow on some browsers
                    >
                        <option value="in-progress" className="bg-slate-700 text-slate-200">진행 중</option>
                        <option value="completed" className="bg-slate-700 text-slate-200">완료</option>
                    </select>
                    <button onClick={() => onDelete(verse.id)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500 hover:bg-opacity-10 rounded-md">
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerseItem;