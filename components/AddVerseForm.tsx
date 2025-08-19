import React, { useState } from 'react';
import { Verse } from '../types';
import { fetchVerses } from '../services/geminiService';
import { CloseIcon, SparklesIcon } from './icons';
import { useApiKey } from '../hooks/useApiKey';

interface AddVerseFormProps {
  onAddVerses: (verses: Pick<Verse, 'reference' | 'text'>[]) => void;
  onClose: () => void;
}

const AddVerseForm: React.FC<AddVerseFormProps> = ({ onAddVerses, onClose }) => {
  const [reference, setReference] = useState('');
  const [fetchedVerses, setFetchedVerses] = useState<Pick<Verse, 'reference' | 'text'>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { apiKey, setIsApiKeyModalOpen } = useApiKey();

  const handleFetchVerse = async () => {
    if (!reference) {
      setError('구절 주소를 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setFetchedVerses([]);
    try {
      const verses = await fetchVerses(reference, apiKey);
      setFetchedVerses(verses);
    } catch (err: any) {
      setError(err.message);
      if (err.message.includes("API 키가 설정되지 않았습니다")) {
        setIsApiKeyModalOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fetchedVerses.length > 0) {
      onAddVerses(fetchedVerses);
      setReference('');
      setFetchedVerses([]);
    } else {
        setError('저장할 구절을 먼저 가져와주세요.')
    }
  };
  
  const handleClear = () => {
    setReference('');
    setFetchedVerses([]);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all" role="dialog" aria-modal="true">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-800">새 구절 추가</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">{error}</div>}
            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-slate-700 mb-1">
                구절 입력 (예: 요한복음 3:16 또는 로마서 1:1-10)
              </label>
              <div className="flex space-x-2">
                <input
                  id="reference"
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="flex-grow block w-full px-4 py-3 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-sky-500 text-xl bg-white text-slate-900"
                  placeholder="요한복음 3:16"
                />
                <button
                  type="button"
                  onClick={handleFetchVerse}
                  disabled={isLoading}
                  className="flex items-center justify-center bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200 disabled:bg-sky-300 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <SparklesIcon className="h-5 w-5 mr-2" />
                      가져오기
                    </>
                  )}
                </button>
              </div>
            </div>
            {fetchedVerses.length > 0 && (
                <div>
                    <div className="flex justify-between items-center mt-4 mb-2">
                        <h3 className="text-md font-semibold text-slate-700">가져온 구절 ({fetchedVerses.length}개)</h3>
                        <button type="button" onClick={handleClear} className="text-sm text-sky-600 hover:underline font-medium">
                        초기화
                        </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto bg-slate-50 p-3 rounded-md border border-slate-200 space-y-2">
                        {fetchedVerses.map((verse, index) => (
                        <div key={index} className="p-2 bg-white rounded-sm border-l-4 border-sky-200">
                            <p className="font-semibold text-sm text-slate-800">{verse.reference}</p>
                            <p className="text-slate-600 text-sm mt-1">{verse.text}</p>
                        </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
          <div className="px-6 py-4 bg-slate-50 rounded-b-xl flex justify-end">
            <button
              type="submit"
              disabled={fetchedVerses.length === 0 || isLoading}
              className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {fetchedVerses.length > 0 ? `${fetchedVerses.length}개 구절 저장` : '구절 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVerseForm;