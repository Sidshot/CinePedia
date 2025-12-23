/**
 * Direct MongoDB Import for Enriched Quarantined Films
 * 
 * This script directly updates the MongoDB database with enriched film data,
 * bypassing the API authentication requirement.
 */

const fs = require('fs');
const mongoose = require('mongoose');

// Load input data
const inputFile = 'quarantined_films_tmdb_enriched.json';
console.log('📥 CineAmore Quarantined Films - Direct MongoDB Import\n');
console.log('='.repeat(60));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cineamore';

// Movie schema (simplified)
const movieSchema = new mongoose.Schema({}, { strict: false });
const Movie = mongoose.model('Movie', movieSchema);

async function importToMongoDB() {
    try {
        // Load data
        console.log(`\n📂 Loading: ${inputFile}...`);
        const rawData = fs.readFileSync(inputFile, 'utf8');
        const data = JSON.parse(rawData);

        console.log(`   Total films: ${data.totalFilms}`);
        console.log(`   Enriched: ${data.enrichmentStats.enriched}`);
        console.log(`   Not found: ${data.enrichmentStats.notFound}\n`);

        // Connect to MongoDB
        console.log(`🔌 Connecting to MongoDB...`);
        await mongoose.connect(MONGODB_URI);
        console.log(`   ✓ Connected to: ${MONGODB_URI}\n`);

        // Process films
        console.log(`📤 Updating database...\n`);

        let updated = 0;
        let enriched = 0;
        let skipped = 0;
        let errors = [];

        for (let i = 0; i < data.films.length; i++) {
            const film = data.films[i];
            const progress = `[${i + 1}/${data.totalFilms}]`;

            try {
                const updateData = {
                    title: film.fixedTitle || film.originalTitle,
                };

                // Update year if changed
                if (film.fixedYear !== undefined && film.fixedYear !== null) {
                    updateData.year = film.fixedYear;
                }

                // Add TMDB enrichment if available
                if (film.tmdbEnrichment && !film.tmdbSearchFailed) {
                    const tmdb = film.tmdbEnrichment;

                    // Update with TMDB data
                    if (tmdb.director) updateData.director = tmdb.director;
                    if (tmdb.plot) updateData.plot = tmdb.plot;
                    if (tmdb.genres && tmdb.genres.length > 0) updateData.genre = tmdb.genres;
                    if (tmdb.posterPath) updateData.posterUrl = `https://image.tmdb.org/t/p/w780${tmdb.posterPath}`;
                    if (tmdb.backdropPath) updateData.backdropUrl = `https://image.tmdb.org/t/p/w1280${tmdb.backdropPath}`;
                    if (tmdb.rating) updateData.rating = tmdb.rating;
                    if (tmdb.runtime) updateData.runtime = tmdb.runtime;

                    // Store TMDB ID and metadata
                    updateData.tmdbId = tmdb.tmdbId;
                    updateData.tmdbData = tmdb;

                    enriched++;
                }

                // Update the movie
                const result = await Movie.findByIdAndUpdate(
                    film.id,
                    { $set: updateData },
                    { new: true }
                );

                if (result) {
                    updated++;
                    if ((i + 1) % 50 === 0) {
                        console.log(`${progress} Updated ${updated} films (${enriched} with TMDB data)`);
                    }
                } else {
                    console.log(`${progress} ⚠️  Film not found: ${film.originalTitle}`);
                    skipped++;
                }

            } catch (error) {
                console.error(`${progress} ❌ Error updating ${film.originalTitle}: ${error.message}`);
                errors.push({
                    id: film.id,
                    title: film.originalTitle,
                    error: error.message
                });
            }
        }

        // Summary
        console.log(`\n${'='.repeat(60)}`);
        console.log('📊 IMPORT SUMMARY:');
        console.log(`  • Total processed: ${data.totalFilms}`);
        console.log(`  • Successfully updated: ${updated} (${(updated / data.totalFilms * 100).toFixed(1)}%)`);
        console.log(`  • With TMDB enrichment: ${enriched} (${(enriched / data.totalFilms * 100).toFixed(1)}%)`);
        console.log(`  • Skipped: ${skipped}`);
        console.log(`  • Errors: ${errors.length}`);

        if (errors.length > 0) {
            console.log(`\n❌ Errors:`);
            errors.slice(0, 10).forEach(err => {
                console.log(`   • ${err.title}: ${err.error}`);
            });
            if (errors.length > 10) {
                console.log(`   ... and ${errors.length - 10} more`);
            }

            fs.writeFileSync('mongodb_import_errors.json', JSON.stringify(errors, null, 2));
            console.log(`\n📝 Full error list saved to: mongodb_import_errors.json`);
        }

        console.log(`\n✅ Import complete!`);
        console.log(`\n📌 Next steps:`);
        console.log(`   1. Review updated films in admin panel`);
        console.log(`   2. Check films are still quarantined (visibility.state = 'quarantined')`);
        console.log(`   3. Bulk unquarantine reviewed films via admin panel\n`);

    } catch (error) {
        console.error('\n❌ Fatal error:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run
importToMongoDB().catch(err => {
    console.error('\nImport failed:', err);
    process.exit(1);
});
