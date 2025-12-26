import { getSeriesByGenre } from '@/lib/tmdb';
import { TV_GENRES } from '@/lib/tv-genres';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SeriesGenrePage({ params }) {
    const { id } = await params; // Next.js 15+ requires awaiting params
    const genreId = parseInt(id);

    // Find the genre name
    const genre = TV_GENRES.find(g => g.id === genreId);
    const genreName = genre ? genre.name : 'Series';

    // Fetch series for this genre
    let series = [];
    try {
        series = await getSeriesByGenre(genreId);
    } catch (e) {
        console.error(`Failed to fetch series for genre ${genreId}:`, e);
    }

    return (
        <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)] p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <Link
                    href="/series"
                    className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 mb-4 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Series
                </Link>
                <h1 className="text-4xl font-extrabold text-white mb-2">
                    {genreName}
                </h1>
                <p className="text-[var(--muted)]">
                    {series.length} series available
                </p>
            </div>

            {/* Series Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {series.map(s => {
                    const posterUrl = s.poster_path
                        ? `https://image.tmdb.org/t/p/w500${s.poster_path}`
                        : null;
                    const year = s.first_air_date?.split('-')[0] || '';

                    return (
                        <Link
                            key={s.id}
                            href={`/series/${s.id}`}
                            className="group relative"
                        >
                            <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[var(--card-bg)] border border-white/10 group-hover:border-orange-600/50 transition-all group-hover:scale-105 duration-300 shadow-lg">
                                {posterUrl ? (
                                    <img
                                        src={posterUrl}
                                        alt={s.name}
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
                                        {s.vote_average ? s.vote_average.toFixed(1) : 'NR'}
                                    </span>
                                </div>

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                    <span className="text-white font-bold text-sm line-clamp-2">{s.name}</span>
                                </div>
                            </div>

                            <div className="mt-2 px-1">
                                <h3 className="font-bold text-[var(--fg)] text-sm truncate group-hover:text-orange-400 transition-colors">
                                    {s.name}
                                </h3>
                                <p className="text-xs text-[var(--muted)]">{year || '—'}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Empty State */}
            {series.length === 0 && (
                <div className="max-w-7xl mx-auto text-center py-20">
                    <p className="text-[var(--muted)] text-lg">No series found in this genre.</p>
                </div>
            )}
        </main>
    );
}
