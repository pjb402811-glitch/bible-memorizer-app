import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { BIBLE_BOOKS } from '../constants';
import { VerseData } from '../types';

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
    const [verseReference, setVerseReference] = useState('');
    const [fetchedVerses, setFetchedVerses] = useState<VerseData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleReset = () => {
        setFetchedVerses([]);
        setError(null);
        setVerseReference('');
    };

    useEffect(() => {
        if (!isOpen) {
            handleReset();
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

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
            const prompt = `사용자 입력값 "${verseReference}"에 해당하는 성경 구절을 '개역개정' 한글 성경 버전으로 찾아줘. 구절의 'text' 내용은 반드시 한글이어야 하며, 다른 언어가 섞이면 안돼. 입력이 구절 범위를 포함하는 경우 (예: 로마서 8:1-10), 범위 내의 모든 구절을 각각 반환해야 해. 결과는 반드시 아래 JSON 스키마를 따르는 JSON 배열이어야 해. 각 객체는 하나의 구절을 나타내.
중요: 'text' 필드에는 구절 본문을 포함하되, 의미 단위나 구두점(쉼표, 마침표 등)을 기준으로 자연스럽게 줄바꿈 문자(\\n)를 삽입하여 가독성을 높여줘.
성경 목록을 참고해서 정확한 영어 'bookName'과 한국어 'koreanBookName'을 사용해줘: [${bibleBookList}]. 다른 설명이나 추가 텍스트는 절대 포함하지 마. 유효한 구절을 찾을 수 없다면 빈 배열을 반환해줘.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
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

    const handleSave = () => {
        if (fetchedVerses.length > 0) {
            onAddVerses(fetchedVerses);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md transform transition-all flex flex-col">
                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <h2 className="text-xl font-bold text-slate-100">새 구절 추가</h2>
                        <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>

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
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    <SparklesIcon className="w-5 h-5"/>
                                )}
                                <span className="font-bold">가져오기</span>
                            </button>
                        </div>
                        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
                    </div>

                    {fetchedVerses.length > 0 && (
                         <div className="mt-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-slate-200">
                                    가져온 구절 ({fetchedVerses.length}개)
                                </h3>
                                <button onClick={handleReset} className="text-sm text-slate-400 hover:text-slate-200 font-medium">
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
                        </div>
                    )}
                </div>

                <div className="bg-slate-900 px-6 py-4 mt-auto">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={fetchedVerses.length === 0 || isLoading}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-3 bg-green-600 text-base font-bold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        {fetchedVerses.length > 0 ? `${fetchedVerses.length}개 구절 저장` : '구절 저장'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddVerseModal;