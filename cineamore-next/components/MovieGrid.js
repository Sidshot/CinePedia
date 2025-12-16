'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import SearchBar from './SearchBar';

export default function MovieGrid({ initialMovies }) {
    const [query, setQuery] = useState('');
    const [filterYear, setFilterYear] = useState('all');
    const [filterDirector, setFilterDirector] = useState('all');

    // Extract unique years and directors for options
    const years = useMemo(() => {
        const y = initialMovies.map(m => m.year).filter(Boolean);
        return [...new Set(y)].sort((a, b) => b - a);
    }, [initialMovies]);

    const directors = useMemo(() => {
        const d = initialMovies.map(m => m.director).filter(Boolean);
        return [...new Set(d)].sort();
    }, [initialMovies]);

    // Filtering Logic
    const filteredMovies = useMemo(() => {
        let result = initialMovies;

        // Text Search (Title, Director, Year)
        if (query) {
            const lowQuery = query.toLowerCase();
            result = result.filter(m =>
                (m.title && m.title.toLowerCase().includes(lowQuery)) ||
                (m.director && m.director.toLowerCase().includes(lowQuery)) ||
                (m.year && m.year.toString().includes(lowQuery))
            );
        }

        // Year Filter
        if (filterYear !== 'all') {
            result = result.filter(m => m.year === parseInt(filterYear));
        }

        // Director Filter
        if (filterDirector !== 'all') {
            result = result.filter(m => m.director === filterDirector);
        }

        return result;
    }, [initialMovies, query, filterYear, filterDirector]);

    return (
        <div className="w-full">
            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center bg-[rgba(255,255,255,0.02)] p-4 rounded-2xl border border-[var(--border)] backdrop-blur-sm">
                <SearchBar onSearch={setQuery} />

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <select
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                        className="h-[42px] px-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--border)] text-sm focus:border-[var(--accent)] outline-none"
                    >
                        <option value="all">All Years</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>

                    <select
                        value={filterDirector}
                        onChange={(e) => setFilterDirector(e.target.value)}
                        className="h-[42px] px-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--border)] text-sm focus:border-[var(--accent)] outline-none max-w-[200px]"
                    >
                        <option value="all">All Directors</option>
                        {directors.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="mb-4 text-[var(--muted)] text-sm px-2">
                Showing {filteredMovies.length} results
            </div>

            {/* Grid */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
                {filteredMovies.map((movie) => (
                    <Link
                        key={movie._id || movie.__id}
                        href={`/movie/${movie._id || movie.__id}`}
                        className="group relative flex flex-col p-4 rounded-[var(--radius)] card-gloss transition-all hover:-translate-y-2 hover:shadow-2xl hover:border-white/20"
                    >
                        {/* Poster Placeholder */}
                        <div className="aspect-[2/3] w-full rounded-xl bg-black/40 mb-3 shadow-lg overflow-hidden relative">
                            <img
                                src={`https://tse2.mm.bing.net/th?q=${encodeURIComponent(`"${movie.title}" (${movie.year}) film poster`)}&w=300&h=450&c=7&rs=1&p=0`}
                                alt={movie.title}
                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                loading="lazy"
                            />
                            {/* Gloss Shine */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                        </div>

                        <h3 className="text-lg font-extrabold text-[var(--fg)] tracking-tight leading-snug">{movie.title}</h3>

                        <div className="mt-1 mb-2 text-sm text-[var(--muted)] flex flex-wrap gap-2 items-center">
                            <span className="bg-white/5 px-2 py-0.5 rounded text-xs">{movie.year || 'N/A'}</span>
                            {movie.director && (
                                <span className="truncate max-w-[120px] text-xs opacity-80">{movie.director}</span>
                            )}
                        </div>

                        <div className="mt-auto pt-4 flex flex-wrap gap-2 border-t border-white/5">
                            {movie.ratingCount > 0 && (
                                <div className="flex items-center gap-1 text-xs font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-1 rounded-lg border border-[var(--accent)]/20">
                                    <span>★</span>
                                    <span>{parseFloat(movie.ratingSum / movie.ratingCount).toFixed(1)}</span>
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            {filteredMovies.length === 0 && (
                <div className="py-20 text-center border border-dashed border-[var(--border)] rounded-3xl text-[var(--muted)]">
                    No movies found matching your criteria.
                </div>
            )}
        </div>
    );
}
