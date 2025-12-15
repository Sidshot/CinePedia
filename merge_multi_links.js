const fs = require('fs');
const path = require('path');

// Paths
const DB_PATH = path.join(__dirname, 'data', 'cinepedia.data.json');
const RAW_PATH = path.join(__dirname, 'films_raw.json');
const OUTPUT_PATH = path.join(__dirname, 'data', 'cinepedia.data.json'); // Overwrite safely

// Load Data
let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const raw = JSON.parse(fs.readFileSync(RAW_PATH, 'utf8'));

console.log(`Initial DB Size: ${db.length}`);
console.log(`New Data Size: ${raw.length}`);

// Helpers
const clean = (str) => str ? str.toString().trim().toLowerCase() : '';
const cleanYear = (str) => str ? str.toString().trim().replace(/[^0-9]/g, '') : '';
const isValidUrl = (str) => str && (str.startsWith('http') || str.startsWith('transfer.it'));

let stats = {
    migrated: 0,
    newFilms: 0,
    linkUpdates: 0,
    garbageRemoved: 0
};

// 1. Migrate Existing Schema (dl/drive -> downloadLinks)
db = db.map(film => {
    if (!film.downloadLinks) {
        film.downloadLinks = [];
    }

    // Migrate 'dl'
    if (film.dl && isValidUrl(film.dl) && !film.downloadLinks.some(l => l.url === film.dl)) {
        film.downloadLinks.push({ label: 'Main Link', url: film.dl });
    } else if (film.dl && !isValidUrl(film.dl)) {
        stats.garbageRemoved++;
    }

    // Migrate 'drive'
    if (film.drive && isValidUrl(film.drive) && !film.downloadLinks.some(l => l.url === film.drive)) {
        film.downloadLinks.push({ label: 'Drive Link', url: film.drive });
    } else if (film.drive && !isValidUrl(film.drive)) {
        stats.garbageRemoved++;
    }

    stats.migrated++;
    return film;
});

// 2. Merge New Data
raw.forEach(row => {
    const title = row['Título'];
    const year = row['Ano'];
    const newLink = row['Link do Drive'];
    const director = row['Diretor'];

    if (!title) return;

    // Find Film
    const searchTitle = clean(title);
    const searchYear = cleanYear(year);

    let film = db.find(f => clean(f.title) === searchTitle && cleanYear(f.year) === searchYear);

    if (!film) {
        // New Film
        film = {
            title: String(title).trim(),
            original: row['Título Original'] ? String(row['Título Original']).trim() : String(title).trim(),
            year: year,
            director: String(director || ''),
            addedAt: new Date().toISOString(),
            downloadLinks: []
        };
        if (isValidUrl(newLink)) {
            film.downloadLinks.push({ label: 'Download', url: newLink });
        }
        db.push(film);
        stats.newFilms++;
    } else {
        // Existing Film - Check Link
        if (isValidUrl(newLink)) {
            // Check if link already exists
            const exists = film.downloadLinks.some(l => clean(l.url) === clean(newLink));

            if (!exists) {
                // Add as new option
                const label = `Option ${film.downloadLinks.length + 1}`;
                film.downloadLinks.push({ label: label, url: newLink });
                stats.linkUpdates++;
            }
        }
    }
});

// Save
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(db, null, 2));

console.log('--- Merge Complete ---');
console.log(`Migrated Films: ${stats.migrated}`);
console.log(`New Films Added: ${stats.newFilms}`);
console.log(`New Links/Options Added: ${stats.linkUpdates}`);
console.log(`Garbage Links Ignored: ${stats.garbageRemoved}`);
console.log(`Total Films in DB: ${db.length}`);
