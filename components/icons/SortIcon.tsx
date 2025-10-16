
import React from 'react';

const SortIcon: React.FC<{ direction?: 'ascending' | 'descending' }> = ({ direction }) => (
    <div className="inline-block text-gray-400 w-4 h-4 ml-1">
        <svg
            className={`absolute w-4 h-2 top-0 left-0 transition-opacity ${direction === 'ascending' ? 'opacity-100 text-sky-600' : 'opacity-30'}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
        <svg
            className={`absolute w-4 h-2 bottom-0 left-0 transition-opacity ${direction === 'descending' ? 'opacity-100 text-sky-600' : 'opacity-30'}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    </div>
);

export default SortIcon;
