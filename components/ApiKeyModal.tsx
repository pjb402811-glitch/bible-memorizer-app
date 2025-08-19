import React, { useState } from 'react';
import { useApiKey } from '../hooks/useApiKey';
import { CloseIcon, KeyIcon } from './icons';

const ApiKeyModal: React.FC = () => {
  const { apiKey, setApiKey, setIsApiKeyModalOpen } = useApiKey();
  const [currentKey, setCurrentKey] = useState(apiKey);

  const handleSave = () => {
    setApiKey(currentKey);
    setIsApiKeyModalOpen(false);
  };
  
  const handleClose = () => {
    setIsApiKeyModalOpen(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all" role="dialog" aria-modal="true">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-800">Google AI API Key 설정</h2>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="text-red-600 font-semibold text-center">
              <p>이 앱을 사용하려면 Google AI API Key가 필요합니다.</p>
              <p>아래에 입력해주세요</p>
            </div>
            
            <div>
              <label htmlFor="api-key-input" className="block text-sm font-medium text-slate-700 mb-1">
                Google AI API Key 입력
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <KeyIcon className="h-5 w-5 text-slate-400"/>
                </div>
                <input
                  id="api-key-input"
                  type="password"
                  value={currentKey}
                  onChange={(e) => setCurrentKey(e.target.value)}
                  className="block w-full rounded-md border-2 border-slate-300 bg-white py-3 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm sm:leading-6"
                  placeholder="AIzaSy..."
                />
              </div>
               <p className="mt-2 text-xs text-slate-500">API Key는 브라우저에만 저장되며, 외부로 전송되지 않습니다.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-md border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-2">Google AI API Key 발급방법</h3>
                <ol className="list-decimal list-inside text-sm space-y-1 text-slate-600">
                    <li><a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Google AI Studio</a> 페이지로 이동하여 로그인합니다.</li>
                    <li>'Get API Key' 버튼을 클릭합니다.</li>
                    <li>생성된 API Key를 복사합니다.</li>
                    <li>복사한 Key를 위 입력창에 붙여넣고 'Key 저장' 버튼을 누릅니다.</li>
                </ol>
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50 rounded-b-xl flex justify-end">
            <button
              onClick={handleSave}
              className="w-full bg-sky-600 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200"
            >
              Key 저장
            </button>
          </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;