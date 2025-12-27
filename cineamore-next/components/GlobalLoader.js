'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function GlobalLoader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    // Delay threshold in ms. 
    // If loading takes less than this, user sees nothing (smooth).
    // If more, they see the loader.
    const DELAY_MS = 300;

    useEffect(() => {
        // Stop loading immediately when path changes (navigation complete)
        setIsLoading(false);
    }, [pathname, searchParams]);

    useEffect(() => {
        let timer;

        const handleStart = () => {
            // Only show loader if it takes longer than DELAY_MS
            timer = setTimeout(() => {
                setIsLoading(true);
            }, DELAY_MS);
        };

        const handleStop = () => {
            clearTimeout(timer);
            setIsLoading(false);
        };

        window.addEventListener('start-loading', handleStart);
        window.addEventListener('stop-loading', handleStop);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('start-loading', handleStart);
            window.removeEventListener('stop-loading', handleStop);
        };
    }, []);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="flex flex-col items-center gap-4">
                {/* Logo Spinner */}
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-[var(--accent)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                </div>
                <div className="text-white font-medium tracking-wider animate-pulse">LOADING...</div>
            </div>
        </div>
    );
}
