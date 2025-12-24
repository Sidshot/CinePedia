'use client';

import { useState } from 'react';

export default function StreamingPlayer({ tmdbId, title }) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    if (!tmdbId) return null;

    const embedUrl = `https://www.vidking.net/embed/movie/${tmdbId}?color=10b5cc`;

    return (
        <div className="w-full mt-8 animate-fade-in relative z-20">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                    <span className="text-[var(--accent)]">▶</span> Streaming
                </h3>
            </div>

            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                {/* Loading State */}
                {isLoading && !hasError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
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

                {/* VidKing Embed */}
                {!hasError && (
                    <iframe
                        src={embedUrl}
                        className={`w-full h-full transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                        frameBorder="0"
                        allow="fullscreen; picture-in-picture"
                        allowFullScreen
                        onLoad={() => setIsLoading(false)}
                        onError={() => setHasError(true)}
                        title={`Stream ${title}`}
                    />
                )}
            </div>

            <p className="text-center text-xs text-[var(--muted)] mt-3 opacity-60">
                Streaming functionality provided by third-party. Use an ad-blocker for best experience.
            </p>
        </div>
    );
}
