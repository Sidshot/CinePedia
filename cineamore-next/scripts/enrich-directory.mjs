#!/usr/bin/env node
/**
 * TMDB Enrichment Script for Directory Movies
 * Fetches metadata from TMDB for movies imported from the directory
 * 
 * Adds: poster, backdrop, plot, director, genres, Letterboxd link
 * 
 * Run with: node scripts/enrich-directory.mjs
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found');
    process.exit(1);
}

if (!TMDB_API_KEY) {
    console.error('❌ TMDB_API_KEY not found');
    process.exit(1);
}

// Define schema with all fields we want to enrich
const MovieSchema = new mongoose.Schema({
    __id: String,
    title: String,
    original: String,
    year: Number,
    director: String,
    plot: String,
    genre: [String],
    lb: String,
    poster: String,
    backdrop: String,
    downloadLinks: [{ label: String, url: String, addedAt: Date }],
    addedAt: Date
}, { strict: false });

const Movie = mongoose.models.Movie || mongoose.model('Movie', MovieSchema);

/**
 * Search TMDB for Movies
 */
async function searchTMDB_Movie(title, year) {
    const cleanTitle = title
        .replace(/\s+\([^)]+\)$/i, '')
        .trim();

    const query = encodeURIComponent(cleanTitle);
    const yearParam = year ? `&year=${year}` : '';
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}${yearParam}&include_adult=false`;

    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        return data.results?.[0] || null;
    } catch (e) {
        return null;
    }
}

/**
 * Get movie details including credits
 */
async function getMovieDetails(tmdbId) {
    const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits`;

    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        return null;
    }
}

/**
 * Generate Letterboxd-style slug from title
 */
function generateLetterboxdUrl(title, year) {
    const slug = title
        .toLowerCase()
        .replace(/['']/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    return year
        ? `https://letterboxd.com/film/${slug}-${year}/`
        : `https://letterboxd.com/film/${slug}/`;
}

async function enrichDirectoryMovies() {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected!\n');

    // Find movies that look like they came from directory scraping (Uncategorized)
    // OR just missing data generally
    const movies = await Movie.find({
        $or: [
            { genre: 'Uncategorized' },
            { genre: { $size: 0 } },
            { plot: { $exists: false } },
            { plot: '' }
        ]
    }).select('__id title year director plot genre lb poster backdrop').lean();

    console.log(`📊 Found ${movies.length} movies needing enrichment\n`);

    if (movies.length === 0) {
        console.log('✨ All movies are enriched!');
        await mongoose.disconnect();
        return;
    }

    let enriched = 0;
    let notFound = 0;
    let errors = 0;

    const batchSize = 20;
    const totalBatches = Math.ceil(movies.length / batchSize);

    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
        const start = batchNum * batchSize;
        const end = Math.min(start + batchSize, movies.length);
        const batch = movies.slice(start, end);

        console.log(`\n📥 Batch ${batchNum + 1}/${totalBatches} (items ${start + 1}-${end})`);

        for (const movie of batch) {
            process.stdout.write(`  ${movie.title} (${movie.year || '?'})... `);

            try {
                // Search TMDB (Movie first)
                let searchResult = await searchTMDB_Movie(movie.title, movie.year);
                let details = null;

                if (searchResult) {
                    details = await getMovieDetails(searchResult.id);
                } else if (!movie.year) {
                    // Try without year if first attempt failed and we didn't have a year
                    // (Already handled by searchTMDB_Movie logic if year was undefined, but maybe useful to retry logic if needed)
                }

                if (!details) {
                    console.log('❌ Not found');
                    notFound++;
                    continue;
                }

                // Extract data
                const updates = {};

                // Poster
                if (!movie.poster && (details.poster_path || searchResult.poster_path)) {
                    updates.poster = `https://image.tmdb.org/t/p/w780${details.poster_path || searchResult.poster_path}`;
                }

                // Backdrop
                if (!movie.backdrop && (details.backdrop_path || searchResult.backdrop_path)) {
                    updates.backdrop = `https://image.tmdb.org/t/p/w1280${details.backdrop_path || searchResult.backdrop_path}`;
                }

                // Plot
                if (!movie.plot && (details.overview || searchResult.overview)) {
                    updates.plot = details.overview || searchResult.overview;
                }

                // Director
                if (!movie.director || movie.director === 'Unknown') {
                    if (details.credits?.crew) {
                        const director = details.credits.crew.find(p => p.job === 'Director');
                        if (director) updates.director = director.name;
                    }
                }

                // Genres (replace Uncategorized, merge otherwise)
                if (details.genres?.length > 0) {
                    const tmdbGenres = details.genres.map(g => g.name);
                    const existingGenres = movie.genre || [];

                    // Filter out 'Uncategorized'
                    const cleanExisting = existingGenres.filter(g => g !== 'Uncategorized');

                    const mergedGenres = [...new Set([...cleanExisting, ...tmdbGenres])];
                    if (mergedGenres.length > 0) {
                        updates.genre = mergedGenres;
                    }
                }

                // Letterboxd URL
                if (!movie.lb) {
                    const year = details.release_date?.split('-')[0];
                    updates.lb = generateLetterboxdUrl(movie.title, year || movie.year);
                }

                // Year
                if (!movie.year) {
                    const year = parseInt(details.release_date?.split('-')[0]);
                    if (year && !isNaN(year)) updates.year = year;
                }

                if (Object.keys(updates).length > 0) {
                    await Movie.updateOne({ __id: movie.__id }, { $set: updates });
                    console.log(`✅ (${Object.keys(updates).join(', ')})`);
                    enriched++;
                } else {
                    console.log('⏭️ Already complete');
                }

                // Rate limit
                await new Promise(r => setTimeout(r, 150));

            } catch (e) {
                console.log(`❌ Error: ${e.message}`);
                errors++;
            }
        }

        const progress = Math.round(((batchNum + 1) / totalBatches) * 100);
        console.log(`\n📊 Progress: ${progress}% | Enriched: ${enriched} | Not Found: ${notFound} | Errors: ${errors}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎬 ENRICHMENT COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Enriched: ${enriched}`);
    console.log(`🔍 Not Found on TMDB: ${notFound}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('='.repeat(60));

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
}

enrichDirectoryMovies().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
