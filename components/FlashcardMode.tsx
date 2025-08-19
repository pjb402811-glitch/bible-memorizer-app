import React, { useState, useEffect, useCallback } from 'react';
import { Verse } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface FlashcardModeProps {
  verses: Verse[];
  onExit: () => void;
}

const formatVerseForDisplay = (text: string): string => {
  // 의미 단위로 줄바꿈을 추가하여 가독성과 암송을 돕습니다.
  // 쉼표, 세미콜론 및 일반적인 한국어 어미 뒤에 줄 바꿈을 삽입합니다.
  return text.replace(/([,;고며니데서요다까라자네으니이며하고하여이라나되므로])(\s)/g, '$1\n');
};

const Flashcard: React.FC<{ verse: Verse; isFlipped: boolean; onFlip: () => void }> = ({ verse, isFlipped, onFlip }) => {
  return (
    <div className="w-full h-full perspective cursor-pointer" onClick={onFlip}>
      <div className={`relative w-full h-full transform-style-3d transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front of card */}
        <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl shadow-xl flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 text-center">
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 font-serif">{verse.reference}</h2>
          <p className="mt-4 text-sm text-slate-500">클릭해서 구절 확인하기</p>
        </div>
        {/* Back of card */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-sky-600 rounded-2xl shadow-xl flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 text-center">
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white font-serif leading-relaxed sm:leading-relaxed whitespace-pre-line">
            {formatVerseForDisplay(verse.text)}
          </p>
        </div>
      </div>
    </div>
  );
};


const FlashcardMode: React.FC<FlashcardModeProps> = ({ verses, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    // When a new set of verses is passed (new session), reset the state.
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [verses]);

  const currentVerse = verses[currentIndex];

  const goToNext = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % verses.length);
    }, 150); // allow card to start flipping back
  }, [verses.length]);

  const goToPrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + verses.length) % verses.length);
    }, 150);
  };

  if (verses.length === 0 || !currentVerse) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">복습할 구절이 없습니다!</h2>
        <p>복습할 구절을 선택하지 않았거나, 복습할 구절이 없습니다.</p>
        <button onClick={onExit} className="mt-4 bg-sky-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-sky-700">
            목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-100 z-40 flex flex-col p-2 sm:p-4">
       <div className="relative flex justify-center items-center mb-4 w-full max-w-4xl mx-auto h-14 sm:h-16">
        <button
            onClick={onExit}
            className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center bg-white text-slate-700 font-bold px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow-md border border-slate-200 hover:bg-slate-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200 transform hover:-translate-y-0.5"
            aria-label="목록으로 돌아가기"
        >
            <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6 sm:mr-2" />
            <span className="hidden sm:inline text-base sm:text-lg">목록으로</span>
        </button>
        <h2 className="text-base sm:text-lg font-bold text-slate-700">복습 모드</h2>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-4xl aspect-[10/9] sm:aspect-[16/9] mx-auto relative flex items-center justify-center">
            {verses.length > 1 && (
                <>
                    <button onClick={goToPrev} className="absolute left-0 -translate-x-full p-2 rounded-full bg-white shadow-md hover:bg-slate-100 text-slate-600 hidden md:block">
                        <ChevronLeftIcon className="h-8 w-8" />
                    </button>
                    <Flashcard verse={currentVerse} isFlipped={isFlipped} onFlip={() => setIsFlipped(!isFlipped)} />
                    <button onClick={goToNext} className="absolute right-0 translate-x-full p-2 rounded-full bg-white shadow-md hover:bg-slate-100 text-slate-600 hidden md:block">
                        <ChevronRightIcon className="h-8 w-8" />
                    </button>
                </>
            )}
             {verses.length <= 1 && (
                <Flashcard verse={currentVerse} isFlipped={isFlipped} onFlip={() => setIsFlipped(!isFlipped)} />
             )}
        </div>
      </div>
      
      <div className="text-center mt-4 text-slate-500 font-medium text-sm">
        카드 {currentIndex + 1} / {verses.length}
      </div>

      {/* Mobile navigation */}
      {verses.length > 1 && (
        <div className="mt-4 flex justify-center items-center gap-4 md:hidden">
          <button onClick={goToPrev} className="p-3 rounded-full bg-white shadow-md hover:bg-slate-100 text-slate-600">
            <ChevronLeftIcon className="h-7 w-7" />
          </button>
          <button onClick={goToNext} className="p-3 rounded-full bg-white shadow-md hover:bg-slate-100 text-slate-600">
            <ChevronRightIcon className="h-7 w-7" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FlashcardMode;