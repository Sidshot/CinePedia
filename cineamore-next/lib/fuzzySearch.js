import Fuse from 'fuse.js';

/**
 * Enhanced fuzzy search for movies and series
 * Handles typos and partial matches
 */

export function createMovieFuzzySearch(movies) {
    const options = {
        keys: [
            { name: 'title', weight: 0.7 },
            { name: 'director', weight: 0.2 },
            { name: 'year', weight: 0.1 }
        ],
        threshold: 0.3, // Lower = stricter, Higher = more lenient
        includeScore: true,
        minMatchCharLength: 2,
    };

    return new Fuse(movies, options);
}

export function createSeriesFuzzySearch(series) {
    const options = {
        keys: [
            { name: 'title', weight: 0.7 },
            { name: 'name', weight: 0.7 },
            { name: 'creator', weight: 0.2 },
            { name: 'year', weight: 0.1 }
        ],
        threshold: 0.3,
        includeScore: true,
        minMatchCharLength: 2,
    };

    return new Fuse(series, options);
}

/**
 * Search with automatic fuzzy matching
 * @returns Array of results with scores
 */
export function fuzzySearch(fuse, query) {
    if (!query || query.length < 2) return [];

    const results = fuse.search(query);

    // Return items sorted by relevance score
    return results.map(r => ({
        ...r.item,
        score: r.score,
    }));
}
