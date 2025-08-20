import React from 'react';

const Spinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-text-secondary">구절 로딩 중...</p>
        </div>
    );
};

export default Spinner;