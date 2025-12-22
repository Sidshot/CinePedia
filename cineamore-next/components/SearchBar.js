'use client';

import { useState } from 'react';

export default function SearchBar({ onSearch, placeholder = "Search all films...", defaultValue = '', onFocus }) {
    const [query, setQuery] = useState(defaultValue);

    // Submit on Enter key
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onSearch(query);
        }
    };

    // Submit on blur (when user clicks away)
    const handleBlur = () => {
        if (query !== defaultValue) {
            onSearch(query);
        }
    };

    return (
        <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--muted)]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <input
                type="text"
                className="block w-full p-4 pl-10 text-sm text-[var(--fg)] bg-[rgba(255,255,255,0.03)] border border-[var(--border)] rounded-[14px] focus:ring-[var(--accent)] focus:border-[var(--accent)] placeholder-[var(--muted)] backdrop-blur transition-all"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                onFocus={onFocus}
            />
            {query && (
                <button
                    type="button"
                    onClick={() => { setQuery(''); onSearch(''); }}
                    className="absolute inset-y-0 right-3 flex items-center text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}

