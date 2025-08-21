import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MemorizationVerse, QuizData } from '../types';
import { generateQuiz } from '../services/geminiService';

const XIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const CheckCircleIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XCircleIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const shuffleArray = (array: any[]) => {
    return [...array].sort(() => Math.random() - 0.5);
};

interface QuizModalProps {
    verse: MemorizationVerse;
    onClose: () => void;
    apiKey: string | null;
}

const QuizModal: React.FC<QuizModalProps> = ({ verse, onClose, apiKey }) => {
    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [choices, setChoices] = useState<{ word: string; used: boolean }[]>([]);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const fetchQuiz = useCallback(async (excludeAnswers: string[] = []) => {
        if (!apiKey) {
            setError("API 키가 설정되지 않았습니다.");
            setIsLoading(false);
            return;
        }
        try {
            setIsLoading(true);
            setError(null);
            setQuizData(null);
            setIsConfirmed(false);

            const data = await generateQuiz(verse, apiKey, excludeAnswers);
            setQuizData(data);
            setUserAnswers(new Array(data.answers.length).fill(''));
            const allChoices = shuffleArray([...data.answers, ...data.distractors]);
            setChoices(allChoices.map(word => ({ word, used: false })));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [apiKey, verse]);

    useEffect(() => {
        fetchQuiz();
    }, [fetchQuiz]);

    const handleChoiceClick = (clickedWord: string) => {
        if (isConfirmed) return;
        
        const firstEmptyIndex = userAnswers.findIndex(answer => answer === '');
        if (firstEmptyIndex !== -1) {
            const newAnswers = [...userAnswers];
            newAnswers[firstEmptyIndex] = clickedWord;
            setUserAnswers(newAnswers);

            setChoices(choices.map(c => c.word === clickedWord ? { ...c, used: true } : c));
        }
    };

    const handleBlankClick = (index: number) => {
         if (isConfirmed) return;
        
        const wordInBlank = userAnswers[index];
        if (wordInBlank) {
            const newAnswers = [...userAnswers];
            newAnswers[index] = '';
            setUserAnswers(newAnswers);

            setChoices(choices.map(c => c.word === wordInBlank ? { ...c, used: false } : c));
        }
    };
    
    const handleConfirm = () => {
        if (userAnswers.includes('')) return;
        setIsConfirmed(true);
    };

    const handleRetrySameQuiz = () => {
        setIsConfirmed(false);
        setUserAnswers(new Array(quizData!.answers.length).fill(''));
        const allChoices = shuffleArray([...quizData!.answers, ...quizData!.distractors]);
        setChoices(allChoices.map(word => ({ word, used: false })));
    };
    
    const handlePracticeNewQuiz = () => {
        fetchQuiz(quizData?.answers || []);
    };


    const textParts = useMemo(() => quizData?.quizText.split('__BLANK__'), [quizData]);
    const isCorrect = useMemo(() => {
        if (!isConfirmed || !quizData) return null;
        return JSON.stringify(userAnswers) === JSON.stringify(quizData.answers);
    }, [isConfirmed, userAnswers, quizData]);


    const renderBody = () => {
        if (isLoading) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    <p className="mt-4 text-slate-400">AI가 퀴즈를 만들고 있습니다...</p>
                </div>
            );
        }

        if (error) {
            return <div className="flex-1 flex items-center justify-center p-8"><p className="text-center text-red-400">{error}</p></div>;
        }

        if (!quizData || !textParts) {
            return <div className="flex-1 flex items-center justify-center p-8"><p className="text-center text-slate-400">퀴즈를 불러올 수 없습니다.</p></div>;
        }

        if (isConfirmed && isCorrect) {
            return (
                <div className="p-6 sm:p-8 bg-green-600 text-white text-center">
                    <div className="flex items-center justify-center gap-2">
                        <CheckCircleIcon className="w-8 h-8"/>
                        <h3 className="text-2xl font-bold">정답입니다!</h3>
                    </div>
                    <div className="mt-6 space-y-3">
                        <button 
                            onClick={handlePracticeNewQuiz}
                            className="w-full text-center py-3 px-4 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg font-semibold transition-colors"
                        >
                            다시 연습하기
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-full text-center py-3 px-4 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg font-semibold transition-colors"
                        >
                            다음에 또 연습하기
                        </button>
                    </div>
                </div>
            );
        }

        return (
             <>
                <div className="overflow-y-auto p-6 sm:p-8">
                    <div className="bg-slate-900 shadow-md rounded-lg p-6 w-full text-center mb-6">
                        <p className="text-xl sm:text-2xl font-bold leading-loose text-slate-200 whitespace-pre-wrap">
                            {textParts.map((part, index) => (
                                <React.Fragment key={index}>
                                    {part}
                                    {index < textParts.length - 1 && (
                                        <span
                                            onClick={() => handleBlankClick(index)}
                                            className={`inline-block bg-slate-700 text-slate-200 rounded px-2 py-1 mx-1 min-w-[80px] text-center font-semibold cursor-pointer border-b-2
                                                ${isConfirmed ? 
                                                    (userAnswers[index] === quizData.answers[index] ? 'border-green-500 text-green-300 bg-green-500 bg-opacity-20' : 'border-red-500 text-red-300 bg-red-500 bg-opacity-20')
                                                    : 'border-slate-600'
                                                }
                                            `}
                                        >
                                            {userAnswers[index] || '___'}
                                        </span>
                                    )}
                                </React.Fragment>
                            ))}
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        {choices.map(({ word, used }) => (
                            <button
                                key={word}
                                onClick={() => handleChoiceClick(word)}
                                disabled={used || isConfirmed}
                                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-slate-200 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                            >
                                {word}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="flex-shrink-0">
                    {!isConfirmed && (
                        <div className="p-6 text-center border-t border-slate-700">
                             <button
                                onClick={handleConfirm}
                                disabled={userAnswers.includes('')}
                                className="px-8 py-3 bg-slate-600 text-slate-200 font-bold rounded-lg shadow-md hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                            >
                                확인
                            </button>
                        </div>
                    )}
                    
                    {isConfirmed && !isCorrect && (
                        <div className="p-4 sm:p-6 bg-red-600 text-white text-center">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <XCircleIcon className="w-7 h-7"/>
                                <h3 className="text-xl font-bold">아쉽네요, 다시 시도해보세요!</h3>
                            </div>
                            <button 
                                onClick={handleRetrySameQuiz}
                                className="w-full max-w-xs mx-auto text-center py-3 px-4 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg font-semibold transition-colors"
                            >
                                다시 시도
                            </button>
                        </div>
                    )}
                </div>
            </>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <div className="bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl transform transition-all overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-lg font-bold text-slate-200">{verse.koreanBookName} {verse.chapter}:{verse.verse} 퀴즈</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                {renderBody()}
            </div>
        </div>
    );
};

export default QuizModal;