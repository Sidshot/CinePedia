const fs = require('fs');
const path = require('path');

const RAW_FILE = 'films_raw.json';
const DB_FILE = 'data/cinepedia.data.json';

if (!fs.existsSync(RAW_FILE) || !fs.existsSync(DB_FILE)) {
    console.error('❌ Missing source or database file.');
    process.exit(1);
}

const newFilms = JSON.parse(fs.readFileSync(RAW_FILE, 'utf8'));
const dbFilms = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

console.log(`🔍 Checking ${dbFilms.length} existing films against ${newFilms.length} new entries...`);

let updatedCount = 0;

newFilms.forEach(newFilm => {
    const title = newFilm['Film Title'];
    const year = parseInt(newFilm['Film Year']);
    const newLink = newFilm['Download Link'];

    if (!newLink) return; // Nothing to update with

    // Find in DB
    const dbFilm = dbFilms.find(f =>
        f.title.toLowerCase() === title.toLowerCase() &&
        (f.year === year || !f.year) // Looser match if year is missing in DB
    );

    if (dbFilm) {
        // Check if DB needs this link
        // We prioritise 'drive' field for these transfer.it links based on previous schema observation
        if (!dbFilm.drive || dbFilm.drive.trim() === '') {
            dbFilm.drive = newLink;
            // Also update duplicate fields if they exist/matter, but drive seems primary
            updatedCount++;
            console.log(`✅ Updated Link for: "${dbFilm.title}" (${dbFilm.year})`);
        }
    }
});

if (updatedCount > 0) {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbFilms, null, 2));
    console.log(`💾 Saved! Backfilled links for ${updatedCount} films.`);
} else {
    console.log('✨ No existing films needed link updates.');
}
