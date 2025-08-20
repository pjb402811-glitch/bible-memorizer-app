import React, { useState, useEffect } from 'react';

const XIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface GoalSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goal: number) => void;
    currentGoal: number;
}

const GoalSettingsModal: React.FC<GoalSettingsModalProps> = ({ isOpen, onClose, onSave, currentGoal }) => {
    const [goalInput, setGoalInput] = useState(currentGoal);

    useEffect(() => {
        if (isOpen) {
            setGoalInput(currentGoal);
        }
    }, [isOpen, currentGoal]);

    if (!isOpen) {
        return null;
    }

    const handleSaveClick = () => {
        onSave(goalInput);
        onClose();
    };

    const handleGoalChange = (amount: number) => {
        setGoalInput(prev => Math.max(1, prev + amount)); // Goal must be at least 1
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-sm overflow-hidden transform transition-all">
                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <h2 className="text-xl font-bold text-slate-100">이달의 암송 목표 설정</h2>
                        <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <label htmlFor="monthly-goal" className="block text-sm font-medium text-slate-300">
                            한 달에 암송할 구절 수
                        </label>
                        <div className="mt-2 flex items-center justify-center gap-2">
                            <button onClick={() => handleGoalChange(-1)} className="px-5 py-2 bg-slate-700 rounded-md hover:bg-slate-600 font-bold text-xl leading-none">-</button>
                            <input
                                type="number"
                                id="monthly-goal"
                                value={goalInput}
                                onChange={(e) => setGoalInput(parseInt(e.target.value, 10) || 1)}
                                onBlur={(e) => { if (parseInt(e.target.value) < 1) setGoalInput(1) }}
                                className="w-24 text-center bg-slate-700 text-slate-100 rounded-md py-2 text-2xl font-bold border border-slate-600 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button onClick={() => handleGoalChange(1)} className="px-5 py-2 bg-slate-700 rounded-md hover:bg-slate-600 font-bold text-xl leading-none">+</button>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 px-6 py-4">
                    <button
                        type="button"
                        onClick={handleSaveClick}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 sm:text-sm"
                    >
                        목표 저장
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GoalSettingsModal;