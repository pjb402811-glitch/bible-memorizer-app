export interface Book {
    name: string; // English name for API calls
    koreanName: string; // Korean name for display
    chapters: number;
}

export interface VerseWord {
    id: string;
    word: string;
    isVisible: boolean;
}

export type VerseStatus = 'in-progress' | 'completed';

export interface MemorizationVerse {
    id: string;
    bookName: string;
    koreanBookName: string;
    chapter: number;
    verse: number;
    status: VerseStatus;
    text: string;
    completedAt?: string;
}

export interface VerseData {
    bookName: string;
    koreanBookName: string;
    chapter: number;
    verse: number;
    text: string;
}

export interface QuizData {
    quizText: string;
    answers: string[];
    distractors: string[];
}