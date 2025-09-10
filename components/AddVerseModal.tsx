import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type, Chat } from '@google/genai';
import { BIBLE_BOOKS, LORDS_PRAYER, APOSTLES_CREED } from '../constants';
import type { VerseData, Book } from '../types';

const XIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SparklesIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 01-1.47-1.47L12.94 18.25l1.188-.648a2.25 2.25 0 011.47 1.47L16.25 20l.648.812a2.25 2.25 0 011.47-1.47l1.188-.648-.648 1.188a2.25 2.25 0 01-1.47 1.47z" />
    </svg>
);

interface AddVerseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddVerses: (verses: VerseData[]) => void;
    apiKey: string | null;
}

const AddVerseModal: React.FC<AddVerseModalProps> = ({ isOpen, onClose, onAddVerses, apiKey }) => {
    const [addMode, setAddMode] = useState<'ai' | 'manual' | 'creed' | 'study'>('ai');
    
    // AI Mode state
    const [verseReference, setVerseReference] = useState('');
    const [fetchedVerses, setFetchedVerses] = useState<VerseData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [feedbackText, setFeedbackText] = useState('');

    // Manual Mode state
    const [manualBook, setManualBook] = useState<Book>(BIBLE_BOOKS[0]);
    const [manualChapter, setManualChapter] = useState('');
    const [manualVerse, setManualVerse] = useState('');
    const [manualText, setManualText] = useState('');
    
    // Creed Mode state
    const [selectedCreeds, setSelectedCreeds] = useState<VerseData[]>([]);

    // Study Mode state
    const [studyTitle, setStudyTitle] = useState('');
    const [studyContent, setStudyContent] = useState('');


    const handleReset = () => {
        // AI State
        setFetchedVerses([]);
        setError(null);
        setVerseReference('');
        setIsLoading(false);
        setChatSession(null);
        setFeedbackText('');
        // Manual State
        setManualBook(BIBLE_BOOKS[0]);
        setManualChapter('');
        setManualVerse('');
        setManualText('');
        // Creed State
        setSelectedCreeds([]);
        // Study State
        setStudyTitle('');
        setStudyContent('');
        // General state
        setAddMode('ai');
    };

    useEffect(() => {
        if (!isOpen) {
            setTimeout(handleReset, 300); // Reset after closing animation
        }
    }, [isOpen]);

    const handleFetchVerse = async () => {
        if (!apiKey) {
            setError("Google AI API 키를 설정 메뉴에서 입력해주세요.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setFetchedVerses([]);

        try {
            const ai = new GoogleGenAI({ apiKey });
            const bibleBookList = BIBLE_BOOKS.map(b => `${b.koreanName} (${b.name})`).join(', ');
            
            const systemInstruction = `You are a Bible verse expert specializing in the '새번역' (New Korean Revised Version) of the Korean Bible. Your task is to find and return Bible verses based on user requests.
- Always provide verses from the '새번역' version.
- The user may provide feedback if your result is not from the '새번역' version. Use this feedback to correct your search and provide the right version.
- The response must be a JSON array following the provided schema.
- Each object in the array represents a single verse.
- For the 'text' field, include the verse content and insert newline characters (\\n) for readability, preferably at natural breaks in the phrase. Even short verses should have newlines.
- Use the provided Bible book list to ensure the correct English 'bookName' and Korean 'koreanBookName': [${bibleBookList}].
- If you cannot find a valid verse, return an empty array. Do not include any other explanations or text outside the JSON array.`;

            const newChat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                bookName: { type: Type.STRING },
                                koreanBookName: { type: Type.STRING },
                                chapter: { type: Type.INTEGER },
                                verse: { type: Type.INTEGER },
                                text: { 
                                    type: Type.STRING,
                                    description: "The verse text, with newlines (\\n) for readability."
                                }
                            },
                            required: ["bookName", "koreanBookName", "chapter", "verse", "text"]
                        }
                    }
                }
            });

            setChatSession(newChat);

            const initialPrompt = `사용자 입력값 "${verseReference}"에 해당하는 성경 구절을 찾아줘.`;
            const response = await newChat.sendMessage({ message: initialPrompt });
            const versesData = JSON.parse(response.text) as VerseData[];

            if (!versesData || versesData.length === 0) {
                setError("구절을 찾을 수 없습니다. 입력을 확인해주세요.");
            } else {
                setFetchedVerses(versesData);
            }

        } catch (e) {
            console.error(e);
            setError("구절을 가져오는 중 오류가 발생했습니다. 입력한 구절이 정확한지, API 키가 유효한지 확인해주세요.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFeedbackSubmit = async () => {
        if (!chatSession || !feedbackText.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await chatSession.sendMessage({ message: feedbackText });
            const versesData = JSON.parse(response.text) as VerseData[];

            if (!versesData || versesData.length === 0) {
                setError("피드백을 바탕으로 구절을 찾을 수 없습니다. 다시 시도해주세요.");
                 setFetchedVerses([]);
            } else {
                setFetchedVerses(versesData);
            }
            setFeedbackText('');
        } catch (e) {
             console.error(e);
            setError("피드백 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        if (addMode === 'ai' && fetchedVerses.length > 0) {
            onAddVerses(fetchedVerses);
        } else if (addMode === 'manual') {
            if (manualBook && manualChapter && manualVerse && manualText.trim()) {
                const newVerse: VerseData = {
                    bookName: manualBook.name,
                    koreanBookName: manualBook.koreanName,
                    chapter: parseInt(manualChapter, 10),
                    verse: parseInt(manualVerse, 10),
                    text: manualText.trim(),
                };
                onAddVerses([newVerse]);
            }
        } else if (addMode === 'creed') {
            if (selectedCreeds.length > 0) {
                onAddVerses(selectedCreeds);
            }
        } else if (addMode === 'study') {
            if (studyTitle.trim() && studyContent.trim()) {
                const studyVerse: VerseData = {
                    bookName: 'LifeStudy',
                    koreanBookName: studyTitle.trim(),
                    chapter: 1,
                    verse: 1,
                    text: studyContent.trim(),
                };
                onAddVerses([studyVerse]);
            }
        }
    };
    
    const isSaveDisabled = () => {
        if (isLoading) return true;
        if (addMode === 'ai') return fetchedVerses.length === 0;
        if (addMode === 'manual') return !(manualBook && manualChapter && manualVerse && manualText.trim());
        if (addMode === 'creed') return selectedCreeds.length === 0;
        if (addMode === 'study') return !(studyTitle.trim() && studyContent.trim());
        return true;
    };

    const getTabClassName = (tabName: 'ai' | 'manual' | 'creed' | 'study') => {
        const base = "px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 w-full";
        if (addMode === tabName) {
            return `${base} bg-indigo-600 text-white`;
        }
        return `${base} bg-slate-700 text-slate-300 hover:bg-slate-600`;
    };
    
    const handleCreedToggle = (creed: VerseData) => {
        setSelectedCreeds(prev =>
            prev.some(c => c.bookName === creed.bookName)
                ? prev.filter(c => c.bookName !== creed.bookName)
                : [...prev, creed]
        );
    };


    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-700 flex-shrink-0">
                    <div className="flex items-start justify-between">
                        <h2 className="text-xl font-bold text-slate-100">새 구절 추가</h2>
                        <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900 p-1 rounded-lg">
                        <button onClick={() => setAddMode('ai')} className={getTabClassName('ai')}>AI로 추가</button>
                        <button onClick={() => setAddMode('manual')} className={getTabClassName('manual')}>직접 추가</button>
                        <button onClick={() => setAddMode('creed')} className={getTabClassName('creed')}>주요 기도문</button>
                        <button onClick={() => setAddMode('study')} className={getTabClassName('study')}>삶공부</button>
                    </div>
                </div>

                <div className="overflow-y-auto p-6 flex-grow">
                    {/* AI Mode */}
                    {addMode === 'ai' && (
                         <div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    value={verseReference}
                                    onChange={(e) => setVerseReference(e.target.value)}
                                    placeholder="예: 요한복음 3:16-18, 시편 23편"
                                    className="flex-grow bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                />
                                <button
                                    onClick={handleFetchVerse}
                                    disabled={isLoading || !verseReference.trim() || !apiKey}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-500 disabled:cursor-not-allowed"
                                >
                                    <SparklesIcon className="w-5 h-5" />
                                    <span>구절 찾기</span>
                                </button>
                            </div>
                            {!apiKey && <p className="mt-2 text-xs text-yellow-400">AI 기능을 사용하려면 설정에서 API 키를 입력해주세요.</p>}

                            {isLoading && <div className="text-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto"></div><p className="mt-2 text-slate-400">AI가 구절을 찾고 있습니다...</p></div>}
                            {error && <p className="mt-4 text-center text-red-400 bg-red-500/10 p-3 rounded-md">{error}</p>}
                            
                            {fetchedVerses.length > 0 && (
                                <div className="mt-6 space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-200">검색 결과 ({fetchedVerses.length}개)</h3>
                                    <div className="max-h-60 overflow-y-auto space-y-3 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                        {fetchedVerses.map(v => (
                                            <div key={`${v.bookName}-${v.chapter}-${v.verse}`} className="p-3 bg-slate-800 rounded">
                                                <p className="font-bold text-indigo-300">{v.koreanBookName} {v.chapter}:{v.verse}</p>
                                                <p className="mt-1 text-slate-300 whitespace-pre-wrap">{v.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4">
                                        <label htmlFor="feedback" className="text-sm font-medium text-slate-400">결과가 '새번역' 성경이 아닌가요? 피드백을 남겨주세요.</label>
                                        <div className="flex gap-2 mt-1">
                                             <input
                                                type="text"
                                                id="feedback"
                                                value={feedbackText}
                                                onChange={(e) => setFeedbackText(e.target.value)}
                                                placeholder="예: '개역개정' 같아요. '새번역'으로 찾아주세요."
                                                className="flex-grow bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-slate-100 focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <button onClick={handleFeedbackSubmit} disabled={!feedbackText.trim() || isLoading} className="px-4 py-2 bg-slate-600 text-slate-200 rounded-md hover:bg-slate-500 disabled:bg-slate-700 disabled:cursor-not-allowed">
                                                전송
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Manual Mode */}
                    {addMode === 'manual' && (
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="manual-book" className="block text-sm font-medium text-slate-300 mb-1">성경</label>
                                <select id="manual-book" value={manualBook.name} onChange={(e) => setManualBook(BIBLE_BOOKS.find(b => b.name === e.target.value) || BIBLE_BOOKS[0])} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-slate-100 focus:ring-2 focus:ring-indigo-500">
                                    {BIBLE_BOOKS.map(b => <option key={b.name} value={b.name}>{b.koreanName}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="manual-chapter" className="block text-sm font-medium text-slate-300 mb-1">장</label>
                                    <input type="number" id="manual-chapter" value={manualChapter} onChange={e => setManualChapter(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-slate-100"/>
                                </div>
                                <div>
                                    <label htmlFor="manual-verse" className="block text-sm font-medium text-slate-300 mb-1">절</label>
                                    <input type="number" id="manual-verse" value={manualVerse} onChange={e => setManualVerse(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-slate-100"/>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="manual-text" className="block text-sm font-medium text-slate-300 mb-1">내용</label>
                                <textarea id="manual-text" rows={5} value={manualText} onChange={e => setManualText(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-slate-100"></textarea>
                            </div>
                        </div>
                    )}
                    
                    {/* Creed Mode */}
                    {addMode === 'creed' && (
                        <div className="space-y-4">
                            {[LORDS_PRAYER, APOSTLES_CREED].map(creed => (
                                <div
                                    key={creed.bookName}
                                    onClick={() => handleCreedToggle(creed)}
                                    className={`p-4 rounded-lg cursor-pointer border-2 transition-colors ${selectedCreeds.some(c => c.bookName === creed.bookName) ? 'bg-indigo-500/20 border-indigo-500' : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'}`}
                                >
                                    <h3 className="font-bold text-lg text-slate-100">{creed.koreanBookName}</h3>
                                    <p className="mt-2 text-sm text-slate-300 whitespace-pre-wrap">{creed.text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Study Mode */}
                    {addMode === 'study' && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="study-title" className="block text-sm font-medium text-slate-300 mb-1">
                                    제목
                                </label>
                                <input
                                    type="text"
                                    id="study-title"
                                    value={studyTitle}
                                    onChange={(e) => setStudyTitle(e.target.value)}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                    placeholder="예: 제자훈련 1과"
                                />
                            </div>
                            <div>
                                <label htmlFor="study-content" className="block text-sm font-medium text-slate-300 mb-1">
                                    내용
                                </label>
                                <textarea
                                    id="study-content"
                                    value={studyContent}
                                    onChange={(e) => setStudyContent(e.target.value)}
                                    rows={8}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                    placeholder="암송할 내용을 입력하세요."
                                ></textarea>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-slate-900 px-6 py-4 flex-shrink-0">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaveDisabled()}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:bg-slate-500 disabled:cursor-not-allowed sm:text-sm"
                    >
                        {isLoading ? '로딩 중...' : '암송 목록에 추가'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddVerseModal;
