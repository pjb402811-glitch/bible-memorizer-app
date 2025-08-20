import React from 'react';

const TrophyIcon: React.FC<{className: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 011.46-5.543 9.75 9.75 0 015.54-1.46h.001c2.063 0 3.998.825 5.463 2.228M15.75 9.75h-7.5a.375.375 0 00-.375.375v11.25c0 .207.168.375.375.375h7.5c.207 0 .375-.168.375-.375V10.125a.375.375 0 00-.375-.375z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l.428-.428a2.25 2.25 0 013.182 0l.428.428M10.5 10.5h3M9 21h6" />
  </svg>
);

const PencilIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);


interface GoalProgressProps {
    goal: number;
    completedThisMonth: number;
    totalCompleted: number;
    onEditGoal: () => void;
}

const GoalProgress: React.FC<GoalProgressProps> = ({ goal, completedThisMonth, totalCompleted, onEditGoal }) => {
    const progress = goal > 0 ? Math.min((completedThisMonth / goal) * 100, 100) : 0;
    const goalMet = completedThisMonth >= goal;

    return (
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-100">이달의 암송 목표</h2>
                    {goalMet && <TrophyIcon className="w-6 h-6 text-yellow-400" />}
                </div>
                <div className="flex items-center gap-3">
                     <span className={`text-lg font-bold ${goalMet ? 'text-red-400' : 'text-slate-300'}`}>
                        {completedThisMonth} / {goal} 개
                    </span>
                    <button onClick={onEditGoal} className="text-slate-400 hover:text-white transition-colors" aria-label="월간 목표 수정">
                        <PencilIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-5">
                <div 
                    className={`${goalMet ? 'bg-red-500' : 'bg-indigo-500'} h-5 rounded-full transition-all duration-500 ease-out`} 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
             {goalMet && (
                <p className="text-center text-sm font-semibold text-red-400 mt-2">
                    축하합니다! 이번 달 목표를 달성했어요!
                </p>
            )}
        </div>
    );
};

export default GoalProgress;