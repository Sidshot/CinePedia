/**
 * TMDB Enrichment Script for Quarantined Films
 * 
 * This script enriches the cleaned quarantined films with TMDB metadata.
 * Run with: node enrich_with_tmdb.js
 */

const fs = require('fs');
const path = require('path');

// TMDB Configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const DELAY_MS = 300; // 300ms delay between requests to respect rate limits

if (!TMDB_API_KEY) {
    console.error('❌ Error: TMDB_API_KEY environment variable not set');
    console.error('Set it with: $env:TMDB_API_KEY="your_api_key"');
    process.exit(1);
}

// TMDB API Functions
async function searchMovie(title, year = null) {
    let url = `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`;
    if (year) {
        url += `&year=${year}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error(`  ❌ Search error for "${title}": ${error.message}`);
        return [];
    }
}

async function getMovieDetails(tmdbId) {
    const url = `${BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        // Extract director
        const director = data.credits?.crew?.find(p => p.job === 'Director')?.name || '';

        return {
            tmdbId: data.id,
            title: data.title,
            originalTitle: data.original_title !== data.title ? data.original_title : '',
            year: data.release_date ? parseInt(data.release_date.split('-')[0]) : null,
            director: director,
            plot: data.overview || '',
            genres: data.genres ? data.genres.map(g => g.name) : [],
            posterPath: data.poster_path || '',
            backdropPath: data.backdrop_path || '',
            rating: data.vote_average || 0,
            voteCount: data.vote_count || 0,
            runtime: data.runtime || null
        };
    } catch (error) {
        console.error(`  ❌ Details error for TMDB ID ${tmdbId}: ${error.message}`);
        return null;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main enrichment process
async function enrichFilms() {
    console.log('🎬 TMDB Enrichment Script\n');
    console.log('='.repeat(60));

    // Load input file
    const inputFile = 'quarantined_films_clean_ready_for_tmdb.json';
    console.log(`📂 Loading: ${inputFile}...`);

    const rawData = fs.readFileSync(inputFile, 'utf8');
    const data = JSON.parse(rawData);

    console.log(`   Total films to enrich: ${data.totalFilms}\n`);

    // Track statistics
    const stats = {
        total: data.totalFilms,
        enriched: 0,
        notFound: 0,
        errors: 0,
        skipped: 0
    };

    const enrichedFilms = [];
    const notFoundFilms = [];

    // Process each film
    for (let i = 0; i < data.films.length; i++) {
        const film = data.films[i];
        const progress = `[${i + 1}/${data.totalFilms}]`;

        console.log(`${progress} Processing: ${film.fixedTitle} (${film.fixedYear || 'no year'})`);

        try {
            // Search for the movie
            const searchResults = await searchMovie(film.fixedTitle, film.fixedYear);

            if (searchResults.length === 0) {
                console.log(`  ⚠️  No results found`);
                stats.notFound++;
                notFoundFilms.push(film);
                enrichedFilms.push({
                    ...film,
                    tmdbEnrichment: null,
                    tmdbSearchFailed: true
                });
            } else {
                // Use first result (best match)
                const bestMatch = searchResults[0];
                console.log(`  ✓ Found: ${bestMatch.title} (${bestMatch.release_date?.split('-')[0]}) [ID: ${bestMatch.id}]`);

                // Get detailed info
                const details = await getMovieDetails(bestMatch.id);

                if (details) {
                    enrichedFilms.push({
                        ...film,
                        tmdbEnrichment: details,
                        tmdbId: details.tmdbId,
                        tmdbSearchFailed: false
                    });
                    stats.enriched++;
                    console.log(`  ✓ Enriched with TMDB data`);
                } else {
                    stats.errors++;
                    enrichedFilms.push({
                        ...film,
                        tmdbEnrichment: null,
                        tmdbSearchFailed: true
                    });
                }
            }

            // Rate limiting delay
            await delay(DELAY_MS);

        } catch (error) {
            console.error(`  ❌ Error: ${error.message}`);
            stats.errors++;
            enrichedFilms.push({
                ...film,
                tmdbEnrichment: null,
                tmdbError: error.message
            });
        }

        // Progress update every 50 films
        if ((i + 1) % 50 === 0) {
            console.log(`\n📊 Progress: ${stats.enriched} enriched, ${stats.notFound} not found, ${stats.errors} errors\n`);
        }
    }

    // Save enriched data
    const outputFile = 'quarantined_films_tmdb_enriched.json';
    const outputData = {
        ...data,
        films: enrichedFilms,
        enrichmentStats: stats,
        enrichedAt: new Date().toISOString()
    };

    fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2), 'utf8');
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Saved enriched data to: ${outputFile}`);

    // Save not found list
    if (notFoundFilms.length > 0) {
        const notFoundFile = 'quarantined_films_tmdb_not_found.json';
        fs.writeFileSync(notFoundFile, JSON.stringify({ total: notFoundFilms.length, films: notFoundFilms }, null, 2), 'utf8');
        console.log(`📝 Saved not-found list to: ${notFoundFile}`);
    }

    // Print summary
    console.log(`\n📊 ENRICHMENT SUMMARY:`);
    console.log(`  • Total processed: ${stats.total}`);
    console.log(`  • Successfully enriched: ${stats.enriched} (${(stats.enriched / stats.total * 100).toFixed(1)}%)`);
    console.log(`  • Not found in TMDB: ${stats.notFound} (${(stats.notFound / stats.total * 100).toFixed(1)}%)`);
    console.log(`  • Errors: ${stats.errors}`);
    console.log(`\n✅ Enrichment complete!`);
}

// Run
enrichFilms().catch(err => {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
});
