import { getTrendingSeries, getPopularSeries, getTopRatedSeries, getSeriesByGenre } from '@/lib/tmdb';
import { TV_GENRES } from '@/lib/tv-genres';
import SeriesHero from '@/components/SeriesGrid';
import SeriesClientContent from '@/components/SeriesClientContent';

// ISR: Cache page for 2 minutes
export const revalidate = 120;

export default async function SeriesPage() {
    // Fetch series data with safe fallbacks
    let trending = [];
    let popular = [];
    let topRated = [];
    let genreRows = [];

    try {
        const results = await Promise.allSettled([
            getTrendingSeries(),
            getPopularSeries(),
            getTopRatedSeries()
        ]);

        trending = results[0].status === 'fulfilled' ? (Array.isArray(results[0].value) ? results[0].value : []) : [];
        popular = results[1].status === 'fulfilled' ? (Array.isArray(results[1].value) ? results[1].value : []) : [];
        topRated = results[2].status === 'fulfilled' ? (Array.isArray(results[2].value) ? results[2].value : []) : [];
    } catch (e) {
        console.error('Series page main fetch error:', e);
    }

    // Fetch genre rows (limit to 4 to reduce API load)
    try {
        const genreResults = await Promise.allSettled(
            TV_GENRES.slice(0, 4).map(async genre => ({
                title: genre.name,
                genreId: genre.id,
                series: await getSeriesByGenre(genre.id)
            }))
        );
        genreRows = genreResults
            .filter(r => r.status === 'fulfilled' && Array.isArray(r.value?.series))
            .map(r => r.value)
            .filter(row => row.series.length > 0);
    } catch (e) {
        console.error('Series page genre fetch error:', e);
    }

    // Random hero from trending
    const heroSeries = trending.length > 0
        ? trending[Math.floor(Math.random() * Math.min(5, trending.length))]
        : null;

    return (
        <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
            {/* Hero + Search + Genre Pills */}
            <SeriesHero heroSeries={heroSeries} />

            {/* Client-side cached content for instant switching */}
            <SeriesClientContent
                serverTrending={trending}
                serverPopular={popular}
                serverTopRated={topRated}
                serverGenreRows={genreRows}
            />

            {/* Notice */}
            <div className="text-center py-8 text-[var(--muted)] text-sm">
                All series content is provided via streaming only. No download links available.
            </div>
        </main>
    );
}
