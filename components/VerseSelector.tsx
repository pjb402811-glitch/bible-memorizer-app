import React from 'react';
import type { Book } from '../types';
import { BIBLE_BOOKS } from '../constants';

interface VerseSelectorProps {
    selectedBook: Book;
    setSelectedBook: (book: Book) => void;
    selectedChapter: number;
    setSelectedChapter: (chapter: number) => void;
    selectedVerse: number;
    setSelectedVerse: (verse: number) => void;
    chapterVerseCount: number;
}

const VerseSelector: React.FC<VerseSelectorProps> = ({
    selectedBook,
    setSelectedBook,
    selectedChapter,
    setSelectedChapter,
    selectedVerse,
    setSelectedVerse,
    chapterVerseCount,
}) => {
    
    const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const book = BIBLE_BOOKS.find(b => b.name === e.target.value);
        if (book) {
            setSelectedBook(book);
            setSelectedChapter(1);
            setSelectedVerse(1);
        }
    };
    
    const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const chapter = parseInt(e.target.value, 10);
        setSelectedChapter(chapter);
        setSelectedVerse(1);
    };

    const handleVerseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedVerse(parseInt(e.target.value, 10));
    };

    const chapterOptions = Array.from({ length: selectedBook.chapters }, (_, i) => i + 1);
    const verseOptions = chapterVerseCount > 0 ? Array.from({ length: chapterVerseCount }, (_, i) => i + 1) : [];

    const selectStyles = "w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-text-primary focus:ring-2 focus:ring-primary-focus focus:border-primary-focus transition";

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
                <label htmlFor="book" className="block text-sm font-medium text-text-secondary mb-1">성경</label>
                <select id="book" value={selectedBook.name} onChange={handleBookChange} className={selectStyles}>
                    {BIBLE_BOOKS.map(book => (
                        <option key={book.name} value={book.name}>{book.koreanName}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="chapter" className="block text-sm font-medium text-text-secondary mb-1">장</label>
                <select id="chapter" value={selectedChapter} onChange={handleChapterChange} className={selectStyles}>
                    {chapterOptions.map(chapter => (
                        <option key={chapter} value={chapter}>{chapter}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="verse" className="block text-sm font-medium text-text-secondary mb-1">절</label>
                <select id="verse" value={selectedVerse} onChange={handleVerseChange} className={selectStyles}>
                    {verseOptions.map(verse => (
                        <option key={verse} value={verse}>{verse}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default VerseSelector;