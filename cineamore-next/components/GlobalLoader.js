'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function GlobalLoader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    // Delay threshold in ms. 
    // If loading takes less than this, user sees nothing (smooth).
    // If more, they see the loader.
    const DELAY_MS = 300;

    const timerRef = useRef(null);

    useEffect(() => {
        // Stop loading immediately when path changes (navigation complete)
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsLoading(false);
    }, [pathname, searchParams]);

    useEffect(() => {
        const handleStart = () => {
            if (timerRef.current) clearTimeout(timerRef.current); // Clear any existing timer

            // Only show loader if it takes longer than DELAY_MS
            timerRef.current = setTimeout(() => {
                setIsLoading(true);
            }, DELAY_MS);
        };

        const handleStop = () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            setIsLoading(false);
        };

        window.addEventListener('start-loading', handleStart);
        window.addEventListener('stop-loading', handleStop);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            window.removeEventListener('start-loading', handleStart);
            window.removeEventListener('stop-loading', handleStop);
        };
    }, []);

    // Safety: Auto-dismiss loader if it hangs for more than 5 seconds
    // This handles cases where navigation crashes or stalls indefinitely
    useEffect(() => {
        let safetyTimer;
        if (isLoading) {
            safetyTimer = setTimeout(() => {
                setIsLoading(false);
            }, 5000);
        }
        return () => clearTimeout(safetyTimer);
    }, [isLoading]);

    if (!isLoading) return null;

    if (!isLoading) return null;

    return (
        <div
            // Allow user to click anywhere to force dismiss (Escape hatch)
            onClick={() => setIsLoading(false)}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300 cursor-pointer"
            title="Click to cancel loading"
        >
            <div className="flex flex-col items-center gap-6 pointer-events-none transform scale-100 transition-transform duration-500">
                {/* Brand Ring Animation */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                    {/* Outer glow */}
                    <div className="absolute inset-0 rounded-full bg-[var(--accent)] opacity-20 blur-xl animate-pulse"></div>

                    {/* Rotating Ring */}
                    <div className="absolute inset-0 border-2 border-white/10 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-t-[var(--accent)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin duration-1000"></div>

                    {/* Inner Core */}
                    <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse shadow-[0_0_10px_var(--accent)]"></div>
                </div>

                {/* Typography */}
                <div className="flex flex-col items-center gap-2">
                    <div className="text-white text-xs font-mono tracking-[0.3em] font-bold">LOADING</div>
                    <div className="w-8 h-[1px] bg-white/20"></div>
                </div>

                {/* Subtle Dismiss Hint */}
                <div className="absolute bottom-12 text-white/20 text-[10px] tracking-widest uppercase hover:text-white/40 transition-colors">
                    Click to dismiss
                </div>
            </div>
        </div>
    );
}
