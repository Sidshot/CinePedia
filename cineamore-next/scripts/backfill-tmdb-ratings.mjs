#!/usr/bin/env node
/**
 * Backfill TMDB Ratings for All Movies - FAST VERSION
 * 
 * Run: node scripts/backfill-tmdb-ratings.mjs
 * 
 * This script fetches TMDB ratings for all movies that don't have one yet.
 * Processes 5 movies concurrently for faster completion.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const MONGO_URI = process.env.MONGODB_URI;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// SPEED CONFIG
const BATCH_SIZE = 5;      // Process 5 movies concurrently
const PAUSE_EVERY = 40;    // Pause after this many requests
const PAUSE_MS = 3000;     // Pause duration (3 seconds)

if (!MONGO_URI) {
    console.error('❌ MONGODB_URI not set');
    process.exit(1);
}
if (!TMDB_API_KEY) {
    console.error('❌ TMDB_API_KEY not set');
    process.exit(1);
}

// Movie Schema (minimal for this script)
const MovieSchema = new mongoose.Schema({
    title: String,
    year: Number,
    tmdbRating: { type: Number, default: 0 }
}, { strict: false });

const Movie = mongoose.model('Movie', MovieSchema);

async function getTMDBRating(title, year) {
    try {
        const yearParam = year ? `&year=${year}` : '';
        const res = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}${yearParam}&include_adult=false`);
        if (!res.ok) return null;

        const data = await res.json();
        if (data.results && data.results.length > 0) {
            return data.results[0].vote_average || 0;
        }
        return null;
    } catch (e) {
        return null;
    }
}

async function processMovie(movie, index, total) {
    const rating = await getTMDBRating(movie.title, movie.year);

    if (rating !== null && rating > 0) {
        await Movie.updateOne({ _id: movie._id }, { $set: { tmdbRating: rating } });
        console.log(`[${index + 1}/${total}] "${movie.title}" (${movie.year || 'N/A'}) → ✅ ${rating.toFixed(1)}`);
        return true;
    } else {
        console.log(`[${index + 1}/${total}] "${movie.title}" (${movie.year || 'N/A'}) → ⚠️ Not found`);
        return false;
    }
}

async function main() {
    console.log('🎬 TMDB Ratings Backfill Script (FAST)');
    console.log('======================================\n');

    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all movies without a rating (tmdbRating = 0 or missing)
    const movies = await Movie.find({
        $or: [
            { tmdbRating: { $exists: false } },
            { tmdbRating: 0 },
            { tmdbRating: null }
        ]
    }).select('title year tmdbRating').lean();

    console.log(`📊 Found ${movies.length} movies without ratings`);
    console.log(`⚡ Processing ${BATCH_SIZE} at a time\n`);

    let updated = 0;
    let failed = 0;
    let requestCount = 0;

    // Process in batches
    for (let i = 0; i < movies.length; i += BATCH_SIZE) {
        const batch = movies.slice(i, i + BATCH_SIZE);

        const results = await Promise.all(
            batch.map((movie, batchIndex) =>
                processMovie(movie, i + batchIndex, movies.length)
            )
        );

        updated += results.filter(r => r === true).length;
        failed += results.filter(r => r === false).length;
        requestCount += batch.length;

        // Rate limit pause
        if (requestCount >= PAUSE_EVERY) {
            console.log(`\n⏳ Rate limit pause (${PAUSE_MS / 1000}s)...\n`);
            await new Promise(r => setTimeout(r, PAUSE_MS));
            requestCount = 0;
        }
    }

    console.log('\n======================================');
    console.log(`✅ Updated: ${updated}`);
    console.log(`⚠️ Not Found: ${failed}`);
    console.log('======================================\n');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
}

main().catch(console.error);
