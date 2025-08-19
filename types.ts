
export enum MemorizationStatus {
  NotStarted = '시작전',
  InProgress = '진행 중',
  Mastered = '완료',
}

export interface Verse {
  id: string;
  reference: string;
  text: string;
  status: MemorizationStatus;
  lastReviewed: string | null;
  dueDate: string | null;
  interval: number;
}

export enum AppView {
    List = 'list',
    Flashcards = 'flashcards',
    VerseSelection = 'verseSelection'
}

export interface StreakData {
    count: number;
    lastDate: string | null;
}

export interface FillInTheBlanksExercise {
    verseWithBlanks: string;
    correctWords: string[];
    allChoices: string[]; // Correct + distractor words, shuffled
}