import React, { useState } from 'react';
import { MemorizationVerse } from '../types';

const XIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface FlashcardModalProps {
    verse: MemorizationVerse;
    onClose: () => void;
}

const FlashcardModal: React.FC<FlashcardModalProps> = ({ verse, onClose }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const reference = (verse.bookName === 'LordsPrayer' || verse.bookName === 'ApostlesCreed' || verse.bookName === 'LifeStudy')
        ? verse.koreanBookName
        : `${verse.koreanBookName} ${verse.chapter}:${verse.verse}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-transparent rounded-xl w-full max-w-2xl transform transition-all flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                
                <button onClick={onClose} className="absolute top-4 right-4 text-white text-opacity-80 hover:text-opacity-100 z-10" aria-label="Close">
                    <XIcon className="w-8 h-8" />
                </button>

                <div 
                    className="w-full h-[50vh] min-h-[300px] [perspective:1000px] cursor-pointer" 
                    onClick={() => setIsFlipped(!isFlipped)}
                    role="button"
                    tabIndex={0}
                    aria-label="Flip card"
                    onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && setIsFlipped(!isFlipped)}
                >
                    <div className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                        {/* Front of the card */}
                        <div className="absolute w-full h-full [backface-visibility:hidden] bg-slate-800 rounded-lg shadow-2xl flex items-center justify-center p-6 text-center border border-slate-700">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-100">
                                {reference}
                            </h2>
                        </div>
                        {/* Back of the card */}
                        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-indigo-700 text-white rounded-lg shadow-2xl p-8 sm:p-10 text-left overflow-y-auto">
                            <p className="text-xl sm:text-2xl font-sans font-bold leading-relaxed whitespace-pre-wrap">
                                {verse.text}
                            </p>
                        </div>
                    </div>
                </div>

                <p className="mt-6 text-white text-lg font-medium">
                    카드를 클릭하여 뒤집으세요
                </p>
            </div>
        </div>
    );
};

export default FlashcardModal;
