import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Verse, FillInTheBlanksExercise, MemorizationStatus } from '../types';
import { generateFillInTheBlanksExercise } from '../services/geminiService';
import { CloseIcon, CheckCircleIcon, XCircleIcon } from './icons';
import { useApiKey } from '../hooks/useApiKey';

interface PracticeModeProps {
  verse: Verse;
  onClose: () => void;
  onStatusUpdate: (status: MemorizationStatus) => void;
}

const formatVerseForDisplay = (text: string): string => {
  // 의미 단위로 줄바꿈을 추가하여 가독성과 암송을 돕습니다.
  // 쉼표, 세미콜론 및 일반적인 한국어 어미 뒤에 줄 바꿈을 삽입합니다.
  return text.replace(/([,;고며니데서요다까라자네으니이며하고하여이라나되므로])(\s)/g, '$1\n');
};

const PracticeMode: React.FC<PracticeModeProps> = ({ verse, onClose, onStatusUpdate }) => {
  const [exercise, setExercise] = useState<FillInTheBlanksExercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const { apiKey, setIsApiKeyModalOpen } = useApiKey();

  const fetchExercise = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setExercise(null);
    setUserAnswers([]);
    setIsSubmitting(false);
    setIsCorrect(null);
    try {
      const generatedExercise = await generateFillInTheBlanksExercise(verse.text, apiKey);
      setExercise(generatedExercise);
    } catch (err: any) {
      setError(err.message);
      if (err.message.includes("API 키가 설정되지 않았습니다")) {
        setIsApiKeyModalOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [verse.text, apiKey, setIsApiKeyModalOpen]);

  useEffect(() => {
    fetchExercise();
  }, [fetchExercise]);

  const handleWordBankClick = (word: string) => {
    if (userAnswers.length < (exercise?.correctWords.length ?? 0)) {
      setUserAnswers([...userAnswers, word]);
    }
  };
  
  const handleAnswerClick = (index: number) => {
    setUserAnswers(userAnswers.filter((_, i) => i !== index));
  }

  const checkAnswer = () => {
    if(!exercise) return;
    setIsSubmitting(true);
    const correct = JSON.stringify(userAnswers) === JSON.stringify(exercise.correctWords);
    setIsCorrect(correct);
  };

  const reset = () => {
    setUserAnswers([]);
    setIsSubmitting(false);
    setIsCorrect(null);
  };
  
  const renderVerseWithBlanks = () => {
      if(!exercise) return null;
      
      const parts = exercise.verseWithBlanks.split('____');
      return (
        <p className="text-2xl md:text-3xl text-slate-800 font-serif leading-relaxed text-center whitespace-pre-line">
            {parts.map((part, index) => (
                <React.Fragment key={index}>
                    {formatVerseForDisplay(part)}
                    {index < parts.length - 1 && (
                        <span 
                            onClick={() => handleAnswerClick(index)}
                            className={`inline-block bg-slate-200 rounded-md px-4 py-1 mx-1 text-center min-w-24 cursor-pointer hover:bg-slate-300
                            ${isSubmitting && (isCorrect ? 'bg-green-200 text-green-800' : (userAnswers[index] === exercise.correctWords[index] ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'))}
                            `}
                        >
                            {userAnswers[index] || '___'}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </p>
      );
  }

  const availableChoices = useMemo(() => {
    if(!exercise) return [];
    const answerCounts = userAnswers.reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return exercise.allChoices.filter(choice => {
        const totalCount = exercise.allChoices.filter(c => c === choice).length;
        const usedCount = answerCounts[choice] || 0;
        return usedCount < totalCount;
    });

  }, [userAnswers, exercise]);


  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col justify-center items-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p className="text-white text-lg">새로운 연습 문제 생성 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center">
            <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4"/>
            <h2 className="text-xl font-semibold text-slate-800">오류 발생</h2>
            <p className="text-slate-600 mt-2 mb-6">{error}</p>
            <button onClick={onClose} className="bg-slate-500 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-slate-600">
                닫기
            </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-slate-100 z-40 flex flex-col p-4 md:p-8" role="dialog" aria-modal="true">
        <div className="w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-sky-700">{verse.reference} 연습</h2>
                <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-200">
                    <CloseIcon className="h-7 w-7" />
                </button>
            </div>
        </div>
        
        <div className="flex-grow w-full max-w-4xl mx-auto flex flex-col justify-center items-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 w-full">
                {renderVerseWithBlanks()}
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center gap-3 w-full">
                {availableChoices.map((word, index) => (
                    <button
                        key={index}
                        onClick={() => handleWordBankClick(word)}
                        disabled={isSubmitting}
                        className="bg-white text-slate-700 font-semibold px-5 py-3 rounded-lg shadow-md border border-slate-300 hover:bg-sky-100 hover:border-sky-300 transition-all text-lg disabled:opacity-50"
                    >
                        {word}
                    </button>
                ))}
            </div>
        </div>

        <div className="w-full max-w-4xl mx-auto">
            {!isSubmitting ? (
                <div className="h-28 flex justify-center items-center">
                    <button 
                        onClick={checkAnswer}
                        disabled={userAnswers.length < (exercise?.correctWords.length ?? 0)}
                        className="bg-green-600 text-white font-bold px-12 py-4 rounded-xl shadow-lg hover:bg-green-700 transition-transform hover:scale-105 text-xl disabled:bg-slate-300 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        확인
                    </button>
                </div>
            ) : (
                <div className={`p-4 rounded-xl mt-6 text-white text-center transition-all duration-300 ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                    <div className="flex items-center justify-center">
                        {isCorrect ? <CheckCircleIcon className="h-8 w-8 mr-3"/> : <XCircleIcon className="h-8 w-8 mr-3"/>}
                        <span className="text-xl font-bold">{isCorrect ? '정답입니다!' : '아쉽네요, 다시 시도해보세요!'}</span>
                    </div>
                     <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
                        {isCorrect ? (
                             <>
                                <button onClick={fetchExercise} className="bg-white/20 hover:bg-white/40 text-white font-semibold py-2 px-6 rounded-lg">
                                    다시 연습하기
                                </button>
                                <button onClick={() => onStatusUpdate(MemorizationStatus.InProgress)} className="bg-white/20 hover:bg-white/40 text-white font-semibold py-2 px-6 rounded-lg">
                                    다음에 또 연습하기
                                </button>
                                <button onClick={() => onStatusUpdate(MemorizationStatus.Mastered)} className="bg-white/20 hover:bg-white/40 text-white font-semibold py-2 px-6 rounded-lg">
                                    이제 완료했어요
                                </button>
                             </>
                        ): (
                             <button onClick={reset} className="bg-white/20 hover:bg-white/40 text-white font-semibold py-2 px-6 rounded-lg">
                                다시 시도
                             </button>
                        )}
                       
                    </div>
                </div>
            )}
        </div>
    </div>
  )
};

export default PracticeMode;