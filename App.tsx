import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import AddVerseModal from './components/AddVerseModal';
import GoalProgress from './components/GoalProgress';
import VerseList from './components/VerseList';
import QuizModal from './components/QuizModal';
import FlashcardModal from './components/FlashcardModal';
import GoalSettingsModal from './components/GoalSettingsModal';
import type { MemorizationVerse, VerseStatus, VerseData } from './types';

const MOCK_VERSES: MemorizationVerse[] = [
    {
        id: '1',
        bookName: 'Romans',
        koreanBookName: '로마서',
        chapter: 1,
        verse: 1,
        text: '예수 그리스도의 종 바울은 사도로 부르심을 받아\n하나님의 복음을 위하여 택정함을 입었으니',
        status: 'in-progress',
    },
    {
        id: '2',
        bookName: 'Romans',
        koreanBookName: '로마서',
        chapter: 1,
        verse: 2,
        text: '이 복음은 하나님이 선지자들을 통하여\n그의 아들에 관하여 성경에 미리 약속하신 것이라',
        status: 'in-progress',
    },
    {
        id: '3',
        bookName: 'Hebrews',
        koreanBookName: '히브리서',
        chapter: 11,
        verse: 1,
        text: '믿음은 바라는 것들의 실상이요\n보이지 않는 것들의 증거니',
        status: 'in-progress',
    },
];


const App: React.FC = () => {
    const [verses, setVerses] = useState<MemorizationVerse[]>(() => {
        try {
            const savedVersesJSON = localStorage.getItem('memorizationVerses');
            // If we have data in localStorage, parse and return it.
            // This correctly handles an empty array `[]` if the user deleted all verses.
            if (savedVersesJSON !== null) { 
                const parsed = JSON.parse(savedVersesJSON);
                 // MIGRATION: Convert any lingering 'not-started' to 'in-progress'
                return parsed.map((v: MemorizationVerse) => {
                    if ((v.status as any) === 'not-started') {
                        return { ...v, status: 'in-progress' };
                    }
                    return v;
                });
            }
        } catch (error) {
            console.error("Could not load verses from localStorage", error);
        }
        // If localStorage is empty (first visit) or there was a parsing error,
        // initialize with the mock data.
        return MOCK_VERSES;
    });
    
    const [monthlyGoal, setMonthlyGoal] = useState<number>(() => {
        try {
            const savedGoal = localStorage.getItem('monthlyGoal');
            return savedGoal ? parseInt(savedGoal, 10) : 5; // Default to 5
        } catch (e) {
            console.error("Could not load monthly goal", e);
            return 5;
        }
    });

    const [activeTab, setActiveTab] = useState<'in-progress' | 'completed'>('in-progress');
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isGoalSettingsModalOpen, setIsGoalSettingsModalOpen] = useState(false);
    const [isAddVerseModalOpen, setIsAddVerseModalOpen] = useState(false);
    const [quizVerse, setQuizVerse] = useState<MemorizationVerse | null>(null);
    const [flashcardVerse, setFlashcardVerse] = useState<MemorizationVerse | null>(null);
    const [apiKey, setApiKey] = useState<string | null>(null);

    useEffect(() => {
        const storedApiKey = localStorage.getItem('googleApiKey');
        if (storedApiKey) {
            setApiKey(storedApiKey);
        }
    }, []);

    // Save verses to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('memorizationVerses', JSON.stringify(verses));
        } catch (error) {
            console.error("Could not save verses to localStorage", error);
        }
    }, [verses]);

    useEffect(() => {
        try {
            localStorage.setItem('monthlyGoal', monthlyGoal.toString());
        } catch (error) {
            console.error("Could not save monthly goal to localStorage", error);
        }
    }, [monthlyGoal]);


    const inProgressVerses = useMemo(() => verses.filter(v => v.status !== 'completed'), [verses]);
    const completedVerses = useMemo(() => {
        return verses
            .filter(v => v.status === 'completed')
            .sort((a, b) => {
                if (a.completedAt && b.completedAt) {
                    return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
                }
                return 0;
            });
    }, [verses]);

    const handleAddVerseClick = () => {
        setIsAddVerseModalOpen(true);
    };
    
    const handleSettingsClick = () => {
        setIsSettingsModalOpen(true);
    };

    const handleEditGoalClick = () => {
        setIsGoalSettingsModalOpen(true);
    };

    const handlePracticeVerse = (verseId: string) => {
        const verseToPractice = verses.find(v => v.id === verseId);
        if (verseToPractice) {
            setQuizVerse(verseToPractice);
        }
    };

    const handleFlashcardVerse = (verseId: string) => {
        const verseToPractice = verses.find(v => v.id === verseId);
        if (verseToPractice) {
            setFlashcardVerse(verseToPractice);
        }
    };

    const handleSaveApiKey = (newApiKey: string) => {
        localStorage.setItem('googleApiKey', newApiKey);
        setApiKey(newApiKey);
    };

    const handleSaveGoal = (newGoal: number) => {
        setMonthlyGoal(newGoal);
        setIsGoalSettingsModalOpen(false);
    };

    const handleAddVerses = (versesToAdd: VerseData[]) => {
        const newVerses: MemorizationVerse[] = versesToAdd.map(v => ({
            ...v,
            id: `${v.bookName}-${v.chapter}-${v.verse}-${Date.now()}-${Math.random()}`,
            status: 'in-progress',
        }));
        setVerses(prev => [...prev, ...newVerses]);
        setIsAddVerseModalOpen(false);
    };
    
    const handleDeleteVerse = (id: string) => {
        setVerses(verses.filter(v => v.id !== id));
    };

    const handleUpdateVerseStatus = (id: string, status: VerseStatus) => {
        setVerses(verses.map(v => {
            if (v.id === id) {
                const wasCompleted = v.status === 'completed';
                const isNowCompleted = status === 'completed';
                
                let completedAt = v.completedAt;

                if (isNowCompleted && !wasCompleted) {
                    completedAt = new Date().toISOString();
                } else if (!isNowCompleted && wasCompleted) {
                    completedAt = undefined;
                }
                
                return { ...v, status, completedAt };
            }
            return v;
        }));
    };


    const getTabClassName = (tabName: 'in-progress' | 'completed') => {
        const baseClasses = "w-full flex items-center justify-center gap-3 px-4 py-1.5 rounded-lg border text-base font-bold shadow-sm transition-colors";
        if (activeTab === tabName) {
            return `${baseClasses} bg-slate-700/50 border-indigo-500 text-indigo-300`;
        }
        return `${baseClasses} bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-700/50 hover:text-slate-200`;
    };

    const getBadgeClassName = (tabName: 'in-progress' | 'completed') => {
        const baseClasses = "flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold";
        if (activeTab === tabName) {
            return `${baseClasses} bg-indigo-500 text-white`;
        }
        return `${baseClasses} bg-slate-700 text-slate-300`;
    };
    
    const completedThisMonthCount = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        return verses.filter(v => {
            if (v.status === 'completed' && v.completedAt) {
                try {
                    const completedDate = new Date(v.completedAt);
                    return completedDate.getFullYear() === currentYear && completedDate.getMonth() === currentMonth;
                } catch(e) { return false; }
            }
            return false;
        }).length;
    }, [verses]);

    const versesToDisplay = activeTab === 'in-progress' ? inProgressVerses : completedVerses;

    return (
        <div className="min-h-screen bg-slate-900 font-sans flex flex-col">
            <Header onAddVerseClick={handleAddVerseClick} onSettingsClick={handleSettingsClick} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
                <GoalProgress 
                    goal={monthlyGoal}
                    completedThisMonth={completedThisMonthCount}
                    totalCompleted={completedVerses.length}
                    onEditGoal={handleEditGoalClick}
                />
                
                <div className="mt-8">
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setActiveTab('in-progress')} className={getTabClassName('in-progress')}>
                            <span>진행 중</span>
                            <span className={getBadgeClassName('in-progress')}>{inProgressVerses.length}</span>
                        </button>
                        <button onClick={() => setActiveTab('completed')} className={getTabClassName('completed')}>
                            <span>완료</span>
                            <span className={getBadgeClassName('completed')}>{completedVerses.length}</span>
                        </button>
                    </div>

                    <div className="mt-6">
                        <VerseList 
                            verses={versesToDisplay} 
                            activeTab={activeTab}
                            onDelete={handleDeleteVerse}
                            onStatusChange={handleUpdateVerseStatus}
                            onPractice={handlePracticeVerse}
                            onFlashcard={handleFlashcardVerse}
                        />
                    </div>
                </div>
            </main>
            
            <footer className="text-center py-4 text-slate-500 text-sm">
                made by PJB
            </footer>

            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                onSave={handleSaveApiKey}
                currentApiKey={apiKey}
            />
            <GoalSettingsModal
                isOpen={isGoalSettingsModalOpen}
                onClose={() => setIsGoalSettingsModalOpen(false)}
                onSave={handleSaveGoal}
                currentGoal={monthlyGoal}
            />
            <AddVerseModal
                isOpen={isAddVerseModalOpen}
                onClose={() => setIsAddVerseModalOpen(false)}
                onAddVerses={handleAddVerses}
                apiKey={apiKey}
            />
            {quizVerse && (
                <QuizModal
                    verse={quizVerse}
                    onClose={() => setQuizVerse(null)}
                    apiKey={apiKey}
                />
            )}
            {flashcardVerse && (
                <FlashcardModal
                    verse={flashcardVerse}
                    onClose={() => setFlashcardVerse(null)}
                />
            )}
        </div>
    );
};

export default App;