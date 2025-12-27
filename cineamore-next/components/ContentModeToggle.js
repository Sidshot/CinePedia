'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ContentModeToggle() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Determine current mode from URL or localStorage
    const [mode, setMode] = useState('films');

    useEffect(() => {
        // Check URL first
        if (pathname.startsWith('/series')) {
            setMode('series');
        } else if (pathname.startsWith('/anime')) {
            setMode('anime');
        } else {
            // Check localStorage for preference
            const savedMode = localStorage.getItem('contentMode');
            if (savedMode === 'series' && !pathname.startsWith('/movie') && !pathname.startsWith('/tmdb')) {
                setMode('series');
            } else if (savedMode === 'anime' && !pathname.startsWith('/movie') && !pathname.startsWith('/tmdb')) {
                setMode('anime');
            } else {
                setMode('films');
            }
        }
    }, [pathname]);

    const handleToggle = (newMode) => {
        if (newMode === mode) return;

        // Trigger Loading UI immediately
        window.dispatchEvent(new Event('start-loading'));

        setMode(newMode);
        localStorage.setItem('contentMode', newMode);

        if (newMode === 'series') {
            router.push('/series');
        } else if (newMode === 'anime') {
            router.push('/anime');
        } else {
            router.push('/');
        }
    };

    return (
        <div className="flex items-center bg-white/5 backdrop-blur-md rounded-full p-1 border border-white/10">
            <button
                onClick={() => handleToggle('films')}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${mode === 'films'
                    ? 'bg-[var(--accent)] text-black shadow-lg'
                    : 'text-[var(--muted)] hover:text-white'
                    }`}
            >
                Films
            </button>
            <button
                onClick={() => handleToggle('series')}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${mode === 'series'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'text-[var(--muted)] hover:text-white'
                    }`}
            >
                Series
            </button>
            <button
                onClick={() => handleToggle('anime')}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${mode === 'anime'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-[var(--muted)] hover:text-white'
                    }`}
            >
                Anime
            </button>
        </div>
    );
}
