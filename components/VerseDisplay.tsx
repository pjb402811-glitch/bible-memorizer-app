
import React from 'react';
import type { VerseWord } from '../types';

interface VerseDisplayProps {
    words: VerseWord[];
    reference: string;
    onWordReveal: (wordId: string) => void;
}

const VerseDisplay: React.FC<VerseDisplayProps> = ({ words, reference, onWordReveal }) => {
    return (
        <div className="text-center">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-serif leading-relaxed text-text-primary">
                {words.map((word, index) => 
                    word.isVisible ? (
                        <span key={word.id}>{word.word} </span>
                    ) : (
                        <span
                            key={word.id}
                            onClick={() => onWordReveal(word.id)}
                            className="inline-block bg-gray-700 rounded-md text-transparent cursor-pointer hover:bg-gray-600 transition-colors mx-1"
                            style={{
                                width: `${word.word.length * 0.9}ch`,
                                minWidth: '20px',
                                height: '1.2em',
                                verticalAlign: 'bottom',
                            }}
                        >
                            {word.word}
                        </span>
                    )
                )}
            </p>
            <p className="mt-6 text-md text-primary font-semibold tracking-wider">
                {reference}
            </p>
        </div>
    );
};

export default VerseDisplay;