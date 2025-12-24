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
                .limit(20)
                .lean();

            results.catalogue = localMovies.map(m => ({
                _id: m._id?.toString?.() || String(m._id),
                __id: m.__id,
                title: m.title,
                year: m.year,
                director: m.director,
                poster: m.poster,
                tmdbRating: m.tmdbRating || 0,
                genre: m.genre || [],
                source: 'catalogue'
            }));
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
                    .map(m => ({
                        tmdbId: m.id,
                        title: m.title,
                        year: m.release_date ? m.release_date.split('-')[0] : '',
                        poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
                        tmdbRating: m.vote_average || 0,
                        source: 'tmdb'
                    }));
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

    return NextResponse.json(results);
}
