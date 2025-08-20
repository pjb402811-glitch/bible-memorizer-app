import React from 'react';

const RefreshCwIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);

const ChevronLeftIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="15 18 9 12 15 6"></polyline></svg>
);

const ChevronRightIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6"></polyline></svg>
);


interface ControlsProps {
    hidePercentage: number;
    onPercentageChange: (value: number) => void;
    onReset: () => void;
    onPrev: () => void;
    onNext: () => void;
    disabled: boolean;
}

const Controls: React.FC<ControlsProps> = ({ hidePercentage, onPercentageChange, onReset, onPrev, onNext, disabled }) => {
    const buttonStyles = "px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500 text-text-primary rounded-md transition flex items-center justify-center gap-2";

    return (
        <div className="mt-8 space-y-6">
            <div className="flex items-center gap-4">
                <label htmlFor="hide-percentage" className="text-sm font-medium text-text-secondary whitespace-nowrap">단어 숨기기</label>
                <input
                    id="hide-percentage"
                    type="range"
                    min="0"
                    max="100"
                    value={hidePercentage}
                    onChange={(e) => onPercentageChange(parseInt(e.target.value, 10))}
                    disabled={disabled}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span className="text-sm font-semibold text-text-primary w-12 text-center">{hidePercentage}%</span>
            </div>
            <div className="flex justify-between items-center gap-4">
                <button onClick={onReset} disabled={disabled} className={buttonStyles}>
                    <RefreshCwIcon className="w-4 h-4" />
                    초기화
                </button>
                <div className="flex gap-2">
                    <button onClick={onPrev} disabled={disabled} className={buttonStyles}>
                       <ChevronLeftIcon className="w-5 h-5" />
                       이전
                    </button>
                    <button onClick={onNext} disabled={disabled} className={buttonStyles}>
                       다음
                       <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Controls;