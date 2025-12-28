'use client';

import { useEffect, useState } from 'react';
import { getCache, setCache, CACHE_KEYS } from '@/lib/dataCache';
import AnimeGenreRow from './AnimeGenreRow';

/**
 * Client-side Anime content wrapper
 * - Uses cached data for instant display
 * - Falls back to server-provided data
 * - Caches server data for next visit
 */
export default function AnimeClientContent({
    serverTrending = [],
    serverPopular = [],
    serverTopRated = [],
    serverGenreRows = []
}) {
    const [trending, setTrending] = useState(serverTrending);
    const [popular, setPopular] = useState(serverPopular);
    const [topRated, setTopRated] = useState(serverTopRated);
    const [genreRows, setGenreRows] = useState(serverGenreRows);
    const [fromCache, setFromCache] = useState(false);

    useEffect(() => {
        // Try to load from cache first for instant display
        const cachedTrending = getCache(CACHE_KEYS.ANIME_TRENDING);
        const cachedPopular = getCache(CACHE_KEYS.ANIME_POPULAR);
        const cachedTopRated = getCache(CACHE_KEYS.ANIME_TOP_RATED);
        const cachedGenres = getCache(CACHE_KEYS.ANIME_GENRES);

        if (cachedTrending?.length || cachedPopular?.length) {
            setFromCache(true);
            if (cachedTrending?.length) setTrending(cachedTrending);
            if (cachedPopular?.length) setPopular(cachedPopular);
            if (cachedTopRated?.length) setTopRated(cachedTopRated);
            if (cachedGenres?.length) setGenreRows(cachedGenres);
        }

        // Cache server data for next visit
        if (serverTrending.length) setCache(CACHE_KEYS.ANIME_TRENDING, serverTrending);
        if (serverPopular.length) setCache(CACHE_KEYS.ANIME_POPULAR, serverPopular);
        if (serverTopRated.length) setCache(CACHE_KEYS.ANIME_TOP_RATED, serverTopRated);
        if (serverGenreRows.length) setCache(CACHE_KEYS.ANIME_GENRES, serverGenreRows);
    }, [serverTrending, serverPopular, serverTopRated, serverGenreRows]);

    return (
        <div className="mt-4">
            <AnimeGenreRow
                title="Trending This Week"
                genreId={null}
                series={trending}
            />
            <AnimeGenreRow
                title="Popular Anime"
                genreId={null}
                series={popular}
            />
            <AnimeGenreRow
                title="Top Rated"
                genreId={null}
                series={topRated}
            />

            {/* Genre-specific rows */}
            {genreRows.map((row, i) => (
                <AnimeGenreRow
                    key={row.genreId || i}
                    title={row.title}
                    genreId={row.genreId}
                    series={row.series}
                />
            ))}
        </div>
    );
}
