import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface ApiKeyContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  isApiKeyModalOpen: boolean;
  setIsApiKeyModalOpen: (isOpen: boolean) => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useLocalStorage<string>('google-api-key', '');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  return React.createElement(
    ApiKeyContext.Provider,
    { value: { apiKey, setApiKey, isApiKeyModalOpen, setIsApiKeyModalOpen } },
    children
  );
};

export const useApiKey = (): ApiKeyContextType => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
};