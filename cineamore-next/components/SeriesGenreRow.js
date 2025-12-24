'use client';

import Link from 'next/link';
import { useRef } from 'react';

export default function SeriesGenreRow({ title, genreId, series }) {
    const scrollRef = useRef(null);

    if (!series || series.length === 0) return null;

    const scrollLeft = () => {
        scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
    };

    const scrollRight = () => {
        scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
    };

    return (
        <section className="mb-10 group/row">
            {/* Header with View All */}
            <div className="flex items-center justify-between mb-4 px-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-1 h-6 rounded-full bg-orange-500"></span>
                    {title}
                </h2>
                {genreId && (
                    <Link
                        href={`/series/genre/${genreId}`}
                        className="text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors bg-orange-500/10 hover:bg-orange-500/20 px-4 py-2 rounded-full border border-orange-500/30"
                    >
                        View All
                    </Link>
                )}
            </div>

            {/* Scrollable Row - py-4 for scale overflow space */}
            <div className="relative">
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto py-4 px-4 scrollbar-hide"
                >
                    {series.map(s => (
                        <SeriesCard key={s.id} series={s} />
                    ))}
                </div>

                {/* Scroll Arrows - scoped to row hover */}
                <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover/row:opacity-100 transition-opacity z-10 hover:bg-black/90"
                    onClick={scrollLeft}
                >
                    ←
                </button>
                <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover/row:opacity-100 transition-opacity z-10 hover:bg-black/90"
                    onClick={scrollRight}
                >
                    →
                </button>
            </div>
        </section>
    );
}

// Series Card Component - each card is its own group
function SeriesCard({ series }) {
    const posterUrl = series.poster_path
        ? `https://image.tmdb.org/t/p/w500${series.poster_path}`
        : null;
    const year = series.first_air_date?.split('-')[0] || '';

    return (
        <Link
            href={`/series/${series.id}`}
            className="group/card flex-none w-[160px] sm:w-[180px] relative"
        >
            <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[var(--card-bg)] border border-white/10 group-hover/card:border-orange-600/50 transition-all group-hover/card:scale-105 duration-300 shadow-lg">
                {posterUrl ? (
                    <img
                        src={posterUrl}
                        alt={series.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                        No Poster
                    </div>
                )}

                {/* Rating Badge */}
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md border border-white/20 px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-white text-xs font-bold">
                        {series.vote_average ? series.vote_average.toFixed(1) : 'NR'}
                    </span>
                </div>

                {/* Stream Badge */}
                <div className="absolute top-2 right-2 bg-orange-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    STREAM
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-white font-bold text-sm line-clamp-2">{series.name}</span>
                </div>
            </div>

            <div className="mt-2 px-1">
                <h3 className="font-bold text-[var(--fg)] text-sm truncate group-hover/card:text-orange-400 transition-colors">
                    {series.name}
                </h3>
                <p className="text-xs text-[var(--muted)]">{year || '—'}</p>
            </div>
        </Link>
    );
}
