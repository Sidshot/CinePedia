import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Movie from '@/models/Movie';
import { searchMovies, searchSeries } from '@/lib/tmdb';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const mode = searchParams.get('mode') || 'films'; // 'films' or 'series'

    if (!query || query.trim().length < 2) {
        return NextResponse.json({ catalogue: [], tmdb: [], series: [] });
    }

    const results = { catalogue: [], tmdb: [], series: [] };

    // FILMS MODE: Search local catalogue + TMDB movies
    if (mode === 'films') {
        // 1. Search Local Catalogue
        try {
            await dbConnect();
            const searchRegex = { $regex: query.trim(), $options: 'i' };
            const localMovies = await Movie.find({
                'visibility.state': 'visible',
                $or: [
                    { title: searchRegex },
                    { director: searchRegex },
                    { original: searchRegex }
                ]
            })
                .select('title year director poster __id tmdbRating genre')
                .limit(50) // Increased (Fetch more candidates for better sorting)
                .lean();

            // RELEVANCE SCORING
            const getRelevance = (movie, query) => {
                const title = movie.title.toLowerCase();
                const q = query.toLowerCase();

                // 1. Exact Match (Highest Priority)
                if (title === q) return 100;

                // 2. Starts With (Dictionary Style)
                if (title.startsWith(q)) return 90;

                // 3. Word Starts With (e.g. "The Phoe..." matches "Phoe")
                // Check if any word in the title starts with the query
                const words = title.split(/[\s\W]+/); // Split by non-word chars
                if (words.some(w => w.startsWith(q))) return 80;

                // 4. Contains (Lowest Priority)
                return 10;
            };

            results.catalogue = localMovies
                .map(m => ({
                    _id: m._id?.toString?.() || String(m._id),
                    __id: m.__id,
                    title: m.title,
                    year: m.year,
                    director: m.director,
                    poster: m.poster,
                    tmdbRating: m.tmdbRating || 0,
                    genre: m.genre || [],
                    source: 'catalogue',
                    score: getRelevance(m, query.trim()) // Calculate score
                }))
                .sort((a, b) => b.score - a.score) // Sort by score descending
                .slice(0, 20); // Top 20 relevant results
        } catch (e) {
            console.error('Catalogue search error:', e);
        }

        // 2. Search TMDB Movies
        try {
            const tmdbResults = await searchMovies(query);
            if (Array.isArray(tmdbResults)) {
                const catalogueTitles = new Set(
                    results.catalogue.map(m => `${m.title.toLowerCase()}-${m.year}`)
                );

                results.tmdb = tmdbResults
                    .filter(m => {
                        const year = m.release_date ? m.release_date.split('-')[0] : '';
                        const key = `${m.title.toLowerCase()}-${year}`;
                        return !catalogueTitles.has(key);
                    })
                    .map(m => {
                        // Calculate score for TMDB results too
                        const title = m.title.toLowerCase();
                        const q = query.trim().toLowerCase();
                        let score = 0;
                        if (title === q) score = 100;
                        else if (title.startsWith(q)) score = 90;
                        else if (title.split(/[\s\W]+/).some(w => w.startsWith(q))) score = 80;
                        else score = 10;

                        return {
                            tmdbId: m.id,
                            title: m.title,
                            year: m.release_date ? m.release_date.split('-')[0] : '',
                            poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
                            tmdbRating: m.vote_average || 0,
                            source: 'tmdb',
                            score
                        };
                    })
                    .sort((a, b) => b.score - a.score); // Sort by relevance
            }
        } catch (e) {
            console.error('TMDB search error:', e);
        }
    }

    // SERIES MODE: Search TMDB TV shows only
    if (mode === 'series') {
        try {
            const seriesResults = await searchSeries(query);
            if (Array.isArray(seriesResults)) {
                results.series = seriesResults.map(s => ({
                    tmdbId: s.id,
                    title: s.name,
                    year: s.first_air_date ? s.first_air_date.split('-')[0] : '',
                    poster: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : null,
                    tmdbRating: s.vote_average || 0,
                    source: 'series'
                }));
            }
        } catch (e) {
            console.error('TMDB series search error:', e);
        }
    }

    // ANIME MODE: Search TMDB TV shows -> Filter by Animation (16) + JP
    if (mode === 'anime') {
        try {
            // We search for series, then filter
            const allSeries = await searchSeries(query);
            if (Array.isArray(allSeries)) {
                // Filter for Anime: Must have genre 16 AND origin_country 'JP'
                const animeFiltered = allSeries.filter(s =>
                    s.genre_ids?.includes(16) &&
                    s.origin_country?.includes('JP')
                );

                results.anime = animeFiltered.map(s => ({
                    tmdbId: s.id,
                    title: s.name,
                    year: s.first_air_date ? s.first_air_date.split('-')[0] : '',
                    poster: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : null,
                    tmdbRating: s.vote_average || 0,
                    source: 'anime' // For click handling
                }));
            }
        } catch (e) {
            console.error('TMDB anime search error:', e);
        }
    }

    return NextResponse.json(results);
}
