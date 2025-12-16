'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBackdropUrl } from '@/lib/images';

export default function Hero({ movies }) {
    const [randomMovie, setRandomMovie] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (movies && movies.length > 0) {
            const randomIndex = Math.floor(Math.random() * movies.length);
            setRandomMovie(movies[randomIndex]);
        }
    }, [movies]);

    // Don't render generic placeholder on server to avoid hydration mismatch if possible,
    // or render a skeleton. For now, we'll just render nothing or a loading state until client mount.
    // Actually, user wants it to be random every time. "A film for you" dynamic.

    if (!mounted) {
        // Render a placeholder or return null to avoid flash
        return (
            <section className="relative w-full h-[50vh] min-h-[400px] flex items-end p-10 mb-10 rounded-3xl overflow-hidden shadow-2xl bg-[var(--card-bg)] animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            </section>
        );
    }

    return (
        <section className="relative w-full h-[50vh] min-h-[400px] flex items-end p-10 mb-10 rounded-3xl overflow-hidden shadow-2xl bg-[var(--card-bg)] group text-left">
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

            {/* Background Image */}
            {randomMovie && (
                <img
                    src={getBackdropUrl(randomMovie.title, randomMovie.year, randomMovie.backdrop)}
                    alt="Featured Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-[3s]"
                />
            )}

            {/* Content */}
            <div className="relative z-20 w-full max-w-4xl animate-in slide-in-from-bottom-10 fade-in duration-700">
                <div className="text-[var(--accent)] text-sm font-bold tracking-widest uppercase mb-2 drop-shadow-md">✨ A Film For You</div>
                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
                    {randomMovie ? randomMovie.title : "Infinite Cinema"}
                </h1>
                <div className="flex gap-4 items-center mb-6 text-white/90 text-lg">
                    {randomMovie ? (
                        <>
                            <span className="bg-[var(--accent)] text-[var(--bg)] px-3 py-1 rounded-md font-bold text-xs">{randomMovie.year}</span>
                            <span className="backdrop-blur-md bg-white/10 px-3 py-1 rounded-md text-sm border border-white/20">{randomMovie.director}</span>
                        </>
                    ) : (
                        <span className="bg-[var(--accent)] text-[var(--bg)] px-3 py-1 rounded-md font-bold text-xs">V2 BETA</span>
                    )}
                </div>
                {randomMovie && (
                    <Link href={`/movie/${randomMovie._id || randomMovie.__id}`} className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-[var(--accent)] transition-colors">
                        View Details
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </Link>
                )}
            </div>
        </section>
    );
}
