const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_PATH = path.join(__dirname, '../data/cinepedia.data.json');
const MAP_PATH = path.join(__dirname, '../data/id_map.json');
const OUTPUT_PATH = path.join(__dirname, '../data/cinepedia.data.with_ids.json');

function generateId() {
    return crypto.randomBytes(12).toString('hex');
}

function getStableKey(movie) {
    if (movie.lb && movie.lb.length > 5) return movie.lb;
    return `${movie.title}|${movie.year}|${movie.director}`.toLowerCase();
}

try {
    console.log('🔄 Reading source data...');
    const rawData = fs.readFileSync(DATA_PATH, 'utf8');
    const movies = JSON.parse(rawData);

    let idMap = {};
    if (fs.existsSync(MAP_PATH)) {
        console.log('📂 Loading existing ID map...');
        idMap = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
    }

    let updates = 0;

    // Process movies
    const enrichedMovies = movies.map(movie => {
        const key = getStableKey(movie);

        let id;
        if (idMap[key]) {
            id = idMap[key];
        } else {
            id = generateId();
            idMap[key] = id;
            updates++;
        }

        return {
            ...movie,
            _id: id,
            // Ensure __id is also set if missing (using same ID or legacy logic if needed)
            __id: movie.__id || id
        };
    });

    console.log(`✅ Processed ${movies.length} movies.`);
    if (updates > 0) {
        console.log(`🆕 Generated ${updates} new IDs.`);
        console.log('💾 Saving ID map...');
        fs.writeFileSync(MAP_PATH, JSON.stringify(idMap, null, 2));
    } else {
        console.log('✨ No new IDs needed.');
    }

    console.log('💾 Saving enriched data...');
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(enrichedMovies, null, 2));
    console.log('🚀 Done! Now use data/cinepedia.data.with_ids.json for bundling.');

} catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
}
