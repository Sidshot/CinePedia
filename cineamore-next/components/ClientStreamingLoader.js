'use client';

import { useState, useEffect } from 'react';
import { searchMovies } from '@/lib/tmdb';
import StreamingPlayer from './StreamingPlayer';

/**
 * Client-side streaming loader - fetches TMDB ID on mount
 * This prevents caching issues with ISR
 */
export default function ClientStreamingLoader({ title, year }) {
    const [tmdbId, setTmdbId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTmdbId() {
            try {
                const results = await searchMovies(title, year);
                if (results && results.length > 0) {
                    setTmdbId(results[0].id);
                }
            } catch (e) {
                console.error('TMDB lookup failed:', e);
            } finally {
                setLoading(false);
            }
        }

        fetchTmdbId();
    }, [title, year]);

    if (loading) {
        return (
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 backdrop-blur-md">
                <div className="flex items-center gap-3 text-[var(--muted)]">
                    <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading streaming options...</span>
                </div>
            </div>
        );
    }

    if (!tmdbId) return null;

    return <StreamingPlayer tmdbId={tmdbId} title={title} />;
}
