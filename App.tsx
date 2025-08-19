import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Verse, MemorizationStatus, AppView, StreakData } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import AddVerseForm from './components/AddVerseForm';
import VerseList from './components/VerseList';
import ProgressTracker from './components/ProgressTracker';
import FlashcardMode from './components/FlashcardMode';
import PracticeMode from './components/PracticeMode';
import VerseSelection from './components/VerseSelection';
import { BookIcon, CardsIcon, PlusIcon, SettingsIcon, KeyIcon } from './components/icons';
import { useApiKey } from './hooks/useApiKey';
import ApiKeyModal from './components/ApiKeyModal';

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

type ActiveTab = 'inProgress' | 'completed';

const App: React.FC = () => {
  const [verses, setVerses] = useLocalStorage<Verse[]>('bible-verses', []);
  const [view, setView] = useState<AppView>(AppView.List);
  const [isAddFormVisible, setIsAddFormVisible] = useState<boolean>(false);
  const [practicingVerse, setPracticingVerse] = useState<Verse | null>(null);
  const [streak, setStreak] = useLocalStorage<StreakData>('bible-streak', { count: 0, lastDate: null });
  const [flashcardSessionVerses, setFlashcardSessionVerses] = useState<Verse[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('inProgress');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const { isApiKeyModalOpen, setIsApiKeyModalOpen } = useApiKey();

  // Close settings menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (isSettingsOpen && settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
            setIsSettingsOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  const updateStreak = useCallback(() => {
    setStreak(prevStreak => {
      const today = new Date();
      if (prevStreak.lastDate) {
        const lastDate = new Date(prevStreak.lastDate);
        if (isSameDay(today, lastDate)) {
          return prevStreak; // already updated today
        }
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        if (isSameDay(yesterday, lastDate)) {
          return { count: prevStreak.count + 1, lastDate: today.toISOString() }; // increment streak
        }
      }
      return { count: 1, lastDate: today.toISOString() }; // start new streak
    });
  }, [setStreak]);
  
  // Check streak on initial load
  useEffect(() => {
    if (streak.lastDate) {
        const today = new Date();
        const lastDate = new Date(streak.lastDate);
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (!isSameDay(today, lastDate) && !isSameDay(yesterday, lastDate)) {
            // It's been more than a day, reset streak
            setStreak({ count: 0, lastDate: null });
        }
    }
  }, []); // Run only once on mount

  const addVerses = (versesData: Pick<Verse, 'reference' | 'text'>[]) => {
    const newVerses: Verse[] = versesData.map((verseData, index) => ({
      ...verseData,
      id: `${Date.now()}-${index}`, // Ensure unique IDs for batch add
      status: MemorizationStatus.NotStarted,
      lastReviewed: null,
      dueDate: null,
      interval: 0,
    }));
    setVerses(prev => [...prev, ...newVerses]);
    setIsAddFormVisible(false);
    if (newVerses.length > 0) {
        updateStreak();
    }
  };

  const updateVerseStatus = (id: string, status: MemorizationStatus) => {
    setVerses(prev =>
      prev.map(verse => {
        if (verse.id !== id) return verse;

        const now = new Date();
        let newInterval = verse.interval;
        let finalStatus = status;

        if (status === MemorizationStatus.InProgress) {
            newInterval = (verse.status === MemorizationStatus.InProgress) 
                ? Math.min(180, Math.max(2, (verse.interval || 1) * 2))
                : 3;
            // Automatically master the verse if the interval is long enough
            if (newInterval >= 180) {
                finalStatus = MemorizationStatus.Mastered;
            }
        } else if (status === MemorizationStatus.Mastered) {
            newInterval = 180; // or a symbolic large number
        } else { // NotStarted
            newInterval = 0;
        }
        
        const newDueDate = new Date(now);
        if (newInterval > 0 && finalStatus !== MemorizationStatus.Mastered) {
            newDueDate.setDate(now.getDate() + newInterval);
        }

        return { 
            ...verse, 
            status: finalStatus, 
            interval: newInterval,
            lastReviewed: now.toISOString(),
            dueDate: (newInterval > 0 && finalStatus !== MemorizationStatus.Mastered) ? newDueDate.toISOString() : null
        };
      })
    );
    updateStreak();
  };

  const deleteVerse = (id: string) => {
    setVerses(prev => prev.filter(verse => verse.id !== id));
  };

  const handlePracticeVerse = (verseId: string) => {
    const verseToPractice = verses.find(v => v.id === verseId);
    if (verseToPractice) {
      setPracticingVerse(verseToPractice);
    }
  };

  const handleStartFlashcards = (selectedVerses: Verse[]) => {
    if (selectedVerses.length > 0) {
        setFlashcardSessionVerses(selectedVerses);
        setView(AppView.Flashcards);
    }
  };
  
  const dueVerses = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Include all of today
    return verses.filter(v => 
        v.status !== MemorizationStatus.Mastered && 
        (!v.dueDate || new Date(v.dueDate) <= today)
    );
  }, [verses]);

  const activeVerses = useMemo(() => 
    verses.filter(v => v.status !== MemorizationStatus.Mastered), 
    [verses]
  );
  const completedVerses = useMemo(() => 
    verses.filter(v => v.status === MemorizationStatus.Mastered), 
    [verses]
  );

  return (
    <div className="min-h-screen bg-slate-100/50">
      <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-10 border-b border-slate-200/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookIcon className="h-6 w-6 sm:h-8 sm:w-8 text-sky-600" />
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 tracking-tight">성경 암송</h1>
          </div>
          <div className="flex items-center space-x-2" ref={settingsRef}>
            {view === AppView.List && !practicingVerse && activeTab === 'inProgress' && (
              <>
                <button
                    onClick={() => setIsAddFormVisible(true)}
                    className="flex items-center justify-center bg-sky-600 text-white font-semibold px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200"
                    aria-label="구절 추가"
                >
                    <PlusIcon className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
                    <span className="hidden md:inline">구절 추가</span>
                    <span className="md:hidden text-xs font-semibold">구절+</span>
                </button>
                {activeVerses.length > 0 && (
                   <button
                    onClick={() => setView(AppView.VerseSelection)}
                    className="flex items-center justify-center bg-amber-500 text-white font-semibold px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg shadow-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 transition-all duration-200"
                    aria-label="복습하기"
                    >
                    <CardsIcon className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
                     <span className="hidden md:inline">복습하기 ({activeVerses.length})</span>
                     <span className="md:hidden text-xs font-semibold">복습</span>
                    </button>
                )}
              </>
            )}
            <div className="relative">
                <button
                    onClick={() => setIsSettingsOpen(prev => !prev)}
                    className="flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 text-slate-600 rounded-full bg-white border-b-4 border-slate-200 active:border-b-2 shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-px focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-sky-500 transition-all duration-200"
                    aria-label="환경설정"
                >
                    <SettingsIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-xs font-medium mt-1">설정</span>
                </button>
                {isSettingsOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black/5 z-20">
                        <div className="p-2">
                             <button
                                onClick={() => { setIsApiKeyModalOpen(true); setIsSettingsOpen(false); }}
                                className="w-full flex items-center text-left px-3 py-1.5 rounded-md text-sm text-slate-700 hover:bg-slate-100"
                            >
                                <KeyIcon className="h-4 w-4 mr-2" />
                                API Key 설정
                            </button>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {view === AppView.Flashcards && (
            <FlashcardMode verses={flashcardSessionVerses} onExit={() => setView(AppView.VerseSelection)} />
        )}

        {view === AppView.VerseSelection && (
            <VerseSelection 
                verses={activeVerses} 
                onStart={handleStartFlashcards} 
                onCancel={() => setView(AppView.List)} 
            />
        )}
        
        {view === AppView.List && (
            <>
                <ProgressTracker verses={verses} dueCount={dueVerses.length} />
                
                <div className="mb-6">
                    <div className="flex space-x-1 sm:space-x-2 rounded-lg bg-slate-200 p-1">
                        <button
                            onClick={() => setActiveTab('inProgress')}
                            className={`w-full rounded-md py-2 text-sm sm:text-base font-semibold transition-all duration-300 ${
                                activeTab === 'inProgress'
                                ? 'bg-white text-sky-600 shadow'
                                : 'text-slate-600 hover:bg-slate-300/50'
                            }`}
                        >
                            진행 중 <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === 'inProgress' ? 'bg-sky-100 text-sky-600' : 'bg-slate-300 text-slate-700'}`}>{activeVerses.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`w-full rounded-md py-2 text-sm sm:text-base font-semibold transition-all duration-300 ${
                                activeTab === 'completed'
                                ? 'bg-white text-sky-600 shadow'
                                : 'text-slate-600 hover:bg-slate-300/50'
                            }`}
                        >
                            완료 <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === 'completed' ? 'bg-sky-100 text-sky-600' : 'bg-slate-300 text-slate-700'}`}>{completedVerses.length}</span>
                        </button>
                    </div>
                </div>
                
                <VerseList 
                    verses={activeTab === 'inProgress' ? activeVerses : completedVerses} 
                    onUpdateStatus={updateVerseStatus} 
                    onDelete={deleteVerse} 
                    onPractice={handlePracticeVerse}
                    listType={activeTab}
                />
            </>
        )}
      </main>

      {isAddFormVisible && (
        <AddVerseForm onAddVerses={addVerses} onClose={() => setIsAddFormVisible(false)} />
      )}

      {practicingVerse && (
          <PracticeMode 
            verse={practicingVerse} 
            onClose={() => setPracticingVerse(null)}
            onStatusUpdate={(status) => {
              updateVerseStatus(practicingVerse.id, status);
              setPracticingVerse(null);
            }}
          />
      )}
      
      {isApiKeyModalOpen && <ApiKeyModal />}
    </div>
  );
};

export default App;