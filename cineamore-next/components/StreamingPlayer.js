'use client';

import { useState, useEffect, useRef } from 'react';

export default function StreamingPlayer({ tmdbId, title, onProgress }) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [currentProgress, setCurrentProgress] = useState(0);
    const iframeRef = useRef(null);

    // Progress tracking via postMessage
    useEffect(() => {
        const handleMessage = (event) => {
            // Only accept messages from VidKing
            if (!event.origin.includes('vidking')) return;

            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

                if (data && typeof data.progress === 'number') {
                    setCurrentProgress(data.progress);

                    // Save to localStorage for resume functionality
                    if (tmdbId) {
                        localStorage.setItem(`movie_progress_${tmdbId}`, JSON.stringify({
                            progress: data.progress,
                            timestamp: Date.now()
                        }));
                    }

                    // Callback to parent if provided
                    if (onProgress) {
                        onProgress(data.progress);
                    }
                }
            } catch (e) {
                // Ignore non-JSON messages
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [tmdbId, onProgress]);

    // Get saved progress for resume
    const getSavedProgress = () => {
        if (!tmdbId) return 0;
        try {
            const saved = localStorage.getItem(`movie_progress_${tmdbId}`);
            if (saved) {
                const { progress, timestamp } = JSON.parse(saved);
                // Only use saved progress if less than 7 days old
                if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
                    return Math.floor(progress);
                }
            }
        } catch (e) { }
        return 0;
    };

    if (!tmdbId) return null;

    const savedProgress = getSavedProgress();
    const embedUrl = `https://www.vidking.net/embed/movie/${tmdbId}?color=fbbf24&autoPlay=true${savedProgress > 60 ? `&progress=${savedProgress}` : ''}`;

    return (
        <div className="w-full mt-10 animate-fade-in relative z-20 max-w-5xl mx-auto">
            {/* Minimalist Glass Header */}
            <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg w-fit">
                <div className="p-2 bg-yellow-500/20 rounded-full">
                    <span className="text-yellow-400 text-lg leading-none">▶</span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-wide">Streaming</h3>
                {savedProgress > 60 && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                        Resuming from {Math.floor(savedProgress / 60)}m
                    </span>
                )}
            </div>

            <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border border-white/5 shadow-[0_0_50px_-10px_rgba(251,191,36,0.3)] group hover:shadow-[0_0_80px_-10px_rgba(251,191,36,0.5)] transition-shadow duration-700">
                {/* Loading State */}
                {isLoading && !hasError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10 pointer-events-none">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[var(--muted)] text-sm font-medium">Loading Player...</span>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {hasError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-20">
                        <div className="text-center p-6">
                            <p className="text-red-400 font-bold mb-2">Stream Unavailable</p>
                            <p className="text-[var(--muted)] text-sm">Could not load the player for this title.</p>
                        </div>
                    </div>
                )}

                {/* VidKing Embed - With Yellow Theme & Autoplay */}
                {!hasError && (
                    <iframe
                        ref={iframeRef}
                        src={embedUrl}
                        className={`w-full h-full transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        playsInline
                        webkit-playsinline="true"
                        allowFullScreen
                        onLoad={() => setIsLoading(false)}
                        onError={() => setHasError(true)}
                        title={`Stream ${title}`}
                    />
                )}
            </div>

            {/* Progress Indicator (shows while watching) */}
            {currentProgress > 0 && (
                <div className="mt-4 text-xs text-[var(--muted)] text-center">
                    Progress saved: {Math.floor(currentProgress / 60)}m {Math.floor(currentProgress % 60)}s
                </div>
            )}
        </div>
    );
}
