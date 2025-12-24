'use client';

import Link from 'next/link';
import OptimizedPoster from './OptimizedPoster';

export default function TrendingRow({ movies }) {
    if (!movies || movies.length === 0) return null;

    return (
        <div className="mb-12 animate-fade-in pl-4 md:pl-8">
            {/* Header with Accent Bar */}
            <div className="flex items-center justify-between mb-6 pr-8 border-l-4 border-[var(--accent)] pl-4">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide uppercase">
                    Top of the Day
                </h2>
            </div>

            {/* Scroll Container */}
            <div className="flex overflow-x-auto gap-4 md:gap-8 pb-8 -ml-4 pl-4 scrollbar-hide snap-x">
                {movies.map((movie, index) => {
                    const rank = index + 1;
                    return (
                        <div key={movie._id || movie.__id} className="relative group shrink-0 w-[160px] md:w-[200px] snap-start mt-8">
                            {/* Big Number - Behind but offset */}
                            <div className="absolute -left-6 -bottom-4 z-0 text-[10rem] font-black leading-none text-transparent select-none pointer-events-none"
                                style={{
                                    WebkitTextStroke: '2px rgba(255,255,255,0.15)',
                                    fontFamily: 'Impact, sans-serif'
                                }}>
                                {rank}
                            </div>

                            {/* Card - Shifted slightly right to not block number completely */}
                            <Link href={`/movie/${movie._id || movie.__id}`} className="block relative z-10 ml-6 md:ml-8 transition-transform duration-300 group-hover:-translate-y-4 group-hover:scale-105">
                                <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 aspect-[2/3]">
                                    <OptimizedPoster
                                        src={movie.poster}
                                        title={movie.title}
                                        year={movie.year}
                                        width={200}
                                        height={300}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Glass Overlay on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute bottom-3 left-3 right-3">
                                            <p className="text-white font-bold text-sm truncate">{movie.title}</p>
                                            <p className="text-[var(--accent)] text-xs font-bold">★ {movie.tmdbRating ? movie.tmdbRating.toFixed(1) : 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    );
                })}
                {/* Spacer */}
                <div className="w-8 shrink-0"></div>
            </div>
        </div>
    );
}
