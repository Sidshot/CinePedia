#!/usr/bin/env node
/**
 * Import Directory Movies directly to MongoDB
 * Usage: node scripts/import-directory.mjs
 * 
 * Requires MONGODB_URI environment variable to be set (via .env.local or shell)
 */

import mongoose from 'mongoose';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment');
    console.log('Make sure .env.local exists with MONGODB_URI set');
    process.exit(1);
}

// Movie Schema (matching the app's schema)
const MovieSchema = new mongoose.Schema({
    __id: { type: String, required: true, unique: true, immutable: true },
    title: { type: String, required: true, trim: true },
    original: String,
    year: { type: Number, min: 1880, max: 2100 },
    director: String,
    plot: String,
    genre: { type: [String], default: [] },
    lb: String,
    notes: String,
    ratingSum: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    downloadLinks: [{
        label: String,
        url: String,
        addedAt: { type: Date, default: Date.now }
    }],
    addedAt: { type: Date, default: Date.now }
});

/**
 * Generate a unique __id from title and year (like the app does)
 */
function generateId(title, year, director = 'Unknown') {
    const normalizedTitle = title.toLowerCase().trim();
    const normalizedYear = year || 0;
    const normalizedDirector = director.toLowerCase().trim();
    const raw = `${normalizedTitle}|${normalizedYear}|${normalizedDirector}`;
    return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
}

async function importDirectory() {
    const jsonPath = path.join(__dirname, '../../directory_import.json');

    if (!fs.existsSync(jsonPath)) {
        console.error('❌ directory_import.json not found');
        console.log('Run scrape_directory.py first');
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const movies = data.movies;

    console.log(`📦 Found ${movies.length} movies to import`);
    console.log('🔌 Connecting to MongoDB...');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Movie = mongoose.model('Movie', MovieSchema);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    // Process in batches for efficiency
    const batchSize = 50;
    const totalBatches = Math.ceil(movies.length / batchSize);

    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
        const start = batchNum * batchSize;
        const end = Math.min(start + batchSize, movies.length);
        const batch = movies.slice(start, end);

        console.log(`\n📥 Processing batch ${batchNum + 1}/${totalBatches} (items ${start + 1}-${end})`);

        for (const movie of batch) {
            try {
                // If year is missing, try to find it in title if needed, or leave null
                // Scraper should have handled title/year extraction

                const __id = generateId(movie.title, movie.year || 0);

                // Check if already exists
                const existing = await Movie.findOne({ __id });

                if (existing) {
                    // Update download links if the movie already exists
                    const existingUrls = existing.downloadLinks.map(l => l.url);
                    const newLinks = movie.downloadLinks.filter(l => !existingUrls.includes(l.url));

                    if (newLinks.length > 0) {
                        existing.downloadLinks.push(...newLinks);
                        await existing.save();
                        console.log(`  ⬆️  Updated: ${movie.title} (+${newLinks.length} links)`);
                        imported++;
                    } else {
                        skipped++;
                    }
                } else {
                    // Create new entry
                    const newMovie = new Movie({
                        __id,
                        title: movie.title,
                        year: movie.year || null,
                        director: 'Unknown',
                        genre: movie.genre || ['Uncategorized'],
                        downloadLinks: movie.downloadLinks.map(l => ({
                            label: l.label,
                            url: l.url,
                            addedAt: new Date()
                        })),
                        addedAt: new Date()
                    });

                    await newMovie.save();
                    console.log(`  ✅ Imported: ${movie.title}${movie.year ? ` (${movie.year})` : ''}`);
                    imported++;
                }
            } catch (err) {
                if (err.code === 11000) {
                    // Duplicate key error - already exists
                    skipped++;
                } else {
                    console.error(`  ❌ Error: ${movie.title} - ${err.message}`);
                    errors++;
                }
            }
        }

        // Progress update
        const progress = Math.round(((batchNum + 1) / totalBatches) * 100);
        console.log(`📊 Progress: ${progress}% | Imported: ${imported} | Skipped: ${skipped} | Errors: ${errors}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎬 IMPORT COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Imported: ${imported}`);
    console.log(`⏭️  Skipped (duplicates): ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('='.repeat(60));

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
}

importDirectory().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
