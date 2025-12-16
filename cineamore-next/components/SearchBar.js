'use client';

import { useState, useEffect } from 'react';

export default function SearchBar({ onSearch, placeholder = "Search..." }) {
    const [query, setQuery] = useState('');

    // Debounce effect
    useEffect(() => {
        const handler = setTimeout(() => {
            onSearch(query);
        }, 300);

        return () => clearTimeout(handler);
    }, [query, onSearch]);

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
            />
        </div>
    );
}
