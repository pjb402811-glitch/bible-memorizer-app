import React from 'react';

const BookOpenIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

const PlusIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

const SettingsIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const Header: React.FC<{ onAddVerseClick: () => void, onSettingsClick: () => void }> = ({ onAddVerseClick, onSettingsClick }) => {
    return (
        <header className="py-4 border-b border-slate-800 bg-slate-950 shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                {/* Left side */}
                <div className="flex items-center gap-3">
                    <BookOpenIcon className="w-8 h-8 text-indigo-500" />
                    <h1 className="text-2xl font-bold text-slate-100">
                        성경 암송
                    </h1>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <button
                        onClick={onAddVerseClick}
                        type="button"
                        className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span className="sm:hidden">구절</span>
                        <span className="hidden sm:inline">구절 추가</span>
                    </button>
                    <button onClick={onSettingsClick} className="flex flex-col items-center text-slate-400 hover:text-slate-200 p-2 rounded-md">
                        <SettingsIcon className="w-6 h-6" />
                        <span className="text-xs font-medium hidden sm:inline">설정</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;