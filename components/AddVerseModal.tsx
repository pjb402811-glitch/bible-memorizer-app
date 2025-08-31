import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type, Chat } from '@google/genai';
import { BIBLE_BOOKS, LORDS_PRAYER, APOSTLES_CREED } from '../constants';
import type { VerseData, Book } from '../types';

const XIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SparklesIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
    const [addMode, setAddMode] = useState<'ai' | 'manual' | 'creed'>('ai');
    
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
             const chapterNum = parseInt(manualChapter, 10);
            const verseNum = parseInt(manualVerse, 10);
            if (!chapterNum || !verseNum || !manualText.trim()) {
                setError("모든 필드를 올바르게 입력해주세요.");
                return;
            }
             const newVerse: VerseData = {
                bookName: manualBook.name,
                koreanBookName: manualBook.koreanName,
                chapter: chapterNum,
                verse: verseNum,
                text: manualText.trim(),
            };
            onAddVerses([newVerse]);
        } else if (addMode === 'creed' && selectedCreeds.length > 0) {
            onAddVerses(selectedCreeds);
        }
    };

    const handleCreedSelect = (creed: VerseData) => {
        if (!selectedCreeds.some(c => c.bookName === creed.bookName)) {
            setSelectedCreeds(prev => [...prev, creed]);
        }
    };
    
    const getTabClassName = (mode: 'ai' | 'manual' | 'creed') => {
        const baseClasses = 'shrink-0 border-b-2 py-3 px-2 text-sm font-bold transition-colors';
        if (addMode === mode) {
            return `${baseClasses} border-indigo-500 text-indigo-400`;
        }
        return `${baseClasses} border-transparent text-slate-400 hover:border-slate-500 hover:text-slate-200`;
    };

    const isManualFormInvalid = !manualChapter || !manualVerse || !manualText.trim();
    const isSaveDisabled = isLoading || 
        (addMode === 'ai' && fetchedVerses.length === 0) || 
        (addMode === 'manual' && isManualFormInvalid) ||
        (addMode === 'creed' && selectedCreeds.length === 0);

    const getSaveButtonText = () => {
        if (addMode === 'ai') {
            return fetchedVerses.length > 0 ? `${fetchedVerses.length}개 구절 저장` : '구절 저장';
        }
        if (addMode === 'manual') {
            return '직접 입력한 구절 저장';
        }
        if (addMode === 'creed') {
             return selectedCreeds.length > 0 ? `${selectedCreeds.length}개 항목 저장` : '항목 저장';
        }
        return '구절 저장';
    };

    const handleAiTabReset = () => {
        setFetchedVerses([]);
        setVerseReference('');
        setChatSession(null);
        setError(null);
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md transform transition-all flex flex-col max-h-[90vh]">
                <div className="p-6 flex-shrink-0">
                    <div className="flex items-start justify-between">
                        <h2 className="text-xl font-bold text-slate-100">새 구절 추가</h2>
                        <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="mt-4 border-b border-slate-700">
                        <nav className="flex -mb-px gap-4" aria-label="Tabs">
                            <button onClick={() => { setAddMode('ai'); setError(null); }} className={getTabClassName('ai')}>
                                AI로 찾기
                            </button>
                            <button onClick={() => { setAddMode('manual'); setError(null); }} className={getTabClassName('manual')}>
                                직접 입력
                            </button>
                             <button onClick={() => { setAddMode('creed'); setError(null); }} className={getTabClassName('creed')}>
                                주요 기도문
                            </button>
                        </nav>
                    </div>
                </div>

                <div className="overflow-y-auto px-6 pb-6">
                     {addMode === 'ai' && (
                        <div className="mt-6">
                            <label htmlFor="verse-reference" className="block text-sm font-medium text-slate-300 mb-1">
                               구절 입력 (예: 요한복음 3:16 또는 로마서 1:1-10)
                            </label>
                            <div className="grid grid-cols-[1fr_auto] gap-2">
                                <input
                                    type="text"
                                    name="verse-reference"
                                    id="verse-reference"
                                    value={verseReference}
                                    onChange={(e) => setVerseReference(e.target.value)}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full text-lg p-3 bg-slate-700 border-slate-600 rounded-md shadow-sm text-slate-100 placeholder-slate-400"
                                    placeholder="히브리서 11:1-3"
                                />
                                <button
                                    type="button"
                                    onClick={handleFetchVerse}
                                    disabled={isLoading}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                                >
                                    {isLoading && !feedbackText ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <SparklesIcon className="w-5 h-5"/>
                                    )}
                                    <span className="font-bold">가져오기</span>
                                </button>
                            </div>
                            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
                        </div>
                    )}
                    
                    {addMode === 'manual' && (
                         <div className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="manual-book" className="block text-sm font-medium text-slate-300 mb-1">성경</label>
                                <select 
                                    id="manual-book" 
                                    value={manualBook.name} 
                                    onChange={(e) => setManualBook(BIBLE_BOOKS.find(b => b.name === e.target.value) || BIBLE_BOOKS[0])} 
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full p-3 bg-slate-700 border-slate-600 rounded-md shadow-sm text-slate-100"
                                >
                                    {BIBLE_BOOKS.map(book => <option key={book.name} value={book.name}>{book.koreanName}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="manual-chapter" className="block text-sm font-medium text-slate-300 mb-1">장</label>
                                    <input type="number" id="manual-chapter" value={manualChapter} onChange={e => setManualChapter(e.target.value)} placeholder="11" className="focus:ring-blue-500 focus:border-blue-500 block w-full text-lg p-3 bg-slate-700 border-slate-600 rounded-md shadow-sm text-slate-100 placeholder-slate-400"/>
                                </div>
                                <div>
                                    <label htmlFor="manual-verse" className="block text-sm font-medium text-slate-300 mb-1">절</label>
                                    <input type="number" id="manual-verse" value={manualVerse} onChange={e => setManualVerse(e.target.value)} placeholder="1" className="focus:ring-blue-500 focus:border-blue-500 block w-full text-lg p-3 bg-slate-700 border-slate-600 rounded-md shadow-sm text-slate-100 placeholder-slate-400"/>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="manual-text" className="block text-sm font-medium text-slate-300 mb-1">구절 내용</label>
                                <textarea 
                                    id="manual-text" 
                                    rows={4} 
                                    value={manualText}
                                    onChange={e => setManualText(e.target.value)}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full p-3 bg-slate-700 border-slate-600 rounded-md shadow-sm text-slate-100 placeholder-slate-400" 
                                    placeholder="믿음은 바라는 것들의 실상이요..."
                                ></textarea>
                                <p className="mt-2 text-xs text-slate-400">
                                    의미 단위에 따라 줄바꿈(Enter)을 사용하여 가독성을 높일 수 있습니다.
                                </p>
                            </div>
                         </div>
                    )}

                    {addMode === 'creed' && (
                        <div className="mt-6 space-y-4">
                            <p className="text-sm text-slate-400">암송을 위해 주기도문과 사도신경을 추가할 수 있습니다.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button 
                                    type="button" 
                                    onClick={() => handleCreedSelect(LORDS_PRAYER)}
                                    disabled={selectedCreeds.some(c => c.bookName === 'LordsPrayer')}
                                    className="p-4 bg-slate-700 rounded-lg text-left hover:bg-slate-600 disabled:bg-slate-700/50 disabled:cursor-not-allowed transition"
                                >
                                    <h4 className="font-bold text-slate-100">주기도문</h4>
                                    <p className="text-xs text-slate-400 mt-1">새번역 기준</p>
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => handleCreedSelect(APOSTLES_CREED)}
                                    disabled={selectedCreeds.some(c => c.bookName === 'ApostlesCreed')}
                                    className="p-4 bg-slate-700 rounded-lg text-left hover:bg-slate-600 disabled:bg-slate-700/50 disabled:cursor-not-allowed transition"
                                >
                                    <h4 className="font-bold text-slate-100">사도신경</h4>
                                    <p className="text-xs text-slate-400 mt-1">전통적 신앙 고백</p>
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {addMode === 'ai' && fetchedVerses.length > 0 && (
                         <div className="mt-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-slate-200">
                                    가져온 구절 ({fetchedVerses.length}개)
                                </h3>
                                <button onClick={handleAiTabReset} className="text-sm text-slate-400 hover:text-slate-200 font-medium">
                                    초기화
                                </button>
                            </div>
                            <div className="max-h-60 overflow-y-auto border border-slate-700 rounded-md bg-slate-900 p-2 space-y-1">
                                {fetchedVerses.map((verse, index) => (
                                    <div key={index} className="p-3 border-l-4 border-blue-500 bg-slate-800 rounded-r-md">
                                        <p className="font-semibold text-sm text-slate-100">
                                            {verse.koreanBookName} {verse.chapter}:{verse.verse}
                                        </p>
                                        <p className="mt-1 text-slate-300 whitespace-pre-wrap">
                                            {verse.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                             <div className="mt-4 pt-4 border-t border-slate-700">
                                <h4 className="text-sm font-semibold text-slate-300">결과가 정확하지 않나요?</h4>
                                <p className="text-xs text-slate-400 mb-2">AI에게 피드백을 보내 더 정확한 구절을 찾아달라고 요청할 수 있습니다. (예: "새번역이 아니에요")</p>
                                <div className="grid grid-cols-[1fr_auto] gap-2">
                                    <input
                                        type="text"
                                        value={feedbackText}
                                        onChange={(e) => setFeedbackText(e.target.value)}
                                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2 bg-slate-700 border-slate-600 rounded-md shadow-sm text-slate-100 placeholder-slate-400"
                                        placeholder="피드백 입력..."
                                        disabled={isLoading}
                                        onKeyDown={(e) => e.key === 'Enter' && handleFeedbackSubmit()}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleFeedbackSubmit}
                                        disabled={isLoading || !feedbackText.trim()}
                                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                                    >
                                        {isLoading && feedbackText ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        ) : (
                                        '수정 요청'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {addMode === 'creed' && selectedCreeds.length > 0 && (
                        <div className="mt-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-slate-200">
                                    선택된 항목 ({selectedCreeds.length}개)
                                </h3>
                                <button onClick={() => setSelectedCreeds([])} className="text-sm text-slate-400 hover:text-slate-200 font-medium">
                                    초기화
                                </button>
                            </div>
                            <div className="max-h-60 overflow-y-auto border border-slate-700 rounded-md bg-slate-900 p-2 space-y-1">
                                {selectedCreeds.map((verse, index) => (
                                    <div key={index} className="p-3 border-l-4 border-purple-500 bg-slate-800 rounded-r-md">
                                        <p className="font-semibold text-sm text-slate-100">
                                            {verse.koreanBookName}
                                        </p>
                                        <p className="mt-1 text-slate-300 whitespace-pre-wrap">
                                            {verse.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-slate-900 px-6 py-4 mt-auto flex-shrink-0">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaveDisabled}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-3 bg-green-600 text-base font-bold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        {getSaveButtonText()}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddVerseModal;
