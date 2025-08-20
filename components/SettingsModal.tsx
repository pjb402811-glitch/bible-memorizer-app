import React, { useState, useEffect } from 'react';

const XIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const KeyIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7h2a2 2 0 012 2v6a2 2 0 01-2 2h-2m-6-4h.01M9 12h.01M7 12h.01m-2.586 4.414a2 2 0 01-2.828 0L.586 12.414a2 2 0 010-2.828L4.586 5.586a2 2 0 012.828 0L9 7m-7 10h6" />
    </svg>
);

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (apiKey: string) => void;
    currentApiKey: string | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentApiKey }) => {
    const [apiKeyInput, setApiKeyInput] = useState('');

    useEffect(() => {
        if (isOpen) {
            setApiKeyInput(currentApiKey || '');
        }
    }, [isOpen, currentApiKey]);


    if (!isOpen) {
        return null;
    }

    const handleSaveClick = () => {
        onSave(apiKeyInput);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden transform transition-all">
                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <h2 className="text-xl font-bold text-slate-100">설정</h2>
                        <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="mt-6">
                        <label htmlFor="api-key" className="block text-sm font-medium text-slate-300">
                            Google AI API Key
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <KeyIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="password"
                                name="api-key"
                                id="api-key"
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-4 py-3 border-2 border-white bg-slate-700 text-slate-100 rounded-md"
                                placeholder="••••••••••••••••••••"
                            />
                        </div>
                         <p className="mt-2 text-xs text-slate-400">
                            API Key는 구절 AI 분석 기능에 사용되며, 브라우저에만 저장됩니다.
                        </p>
                    </div>

                    <div className="mt-6 bg-slate-900 bg-opacity-50 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-md font-semibold text-slate-200">Google AI API Key 발급방법</h3>
                        <ol className="mt-2 list-decimal list-inside text-sm text-slate-300 space-y-1">
                            <li>
                                <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Google AI Studio</a> 페이지로 이동하여 로그인합니다.
                            </li>
                            <li>'Get API Key' 버튼을 클릭합니다.</li>
                            <li>생성된 API Key를 복사합니다.</li>
                            <li>복사한 Key를 위 입력창에 붙여넣고 '설정 저장' 버튼을 누릅니다.</li>
                        </ol>
                    </div>
                </div>

                <div className="bg-slate-900 px-6 py-4">
                    <button
                        type="button"
                        onClick={handleSaveClick}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 sm:text-sm"
                    >
                        설정 저장
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;