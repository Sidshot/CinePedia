const fs = require('fs');
const path = require('path');

const RAW_FILE = 'films_raw.json';
const DB_FILE = 'data/cinepedia.data.json';
const IMPORT_READY_FILE = 'import_ready.json';

// Read Files
const newFilmsRaw = JSON.parse(fs.readFileSync(RAW_FILE, 'utf8'));
let dbFilms = [];
if (fs.existsSync(DB_FILE)) {
    dbFilms = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

// Map New Films
const mappedNewFilms = newFilmsRaw.map(f => ({
    title: f['Film Title'],
    original: f['Film Title'], // Default original to title
    year: parseInt(f['Film Year']) || 0,
    director: f['Director'],
    lb: '', // Placeholder
    drive: f['Download Link'],
    dl: '',
    notes: f['Notes'] || ''
}));

console.log(`🔍 Processing ${mappedNewFilms.length} new films...`);
let addedCount = 0;

// Merge loop
mappedNewFilms.forEach(newFilm => {
    // Check for duplicate by Title + Year
    const exists = dbFilms.some(existing =>
        existing.title.toLowerCase() === newFilm.title.toLowerCase() &&
        existing.year === newFilm.year
    );

    if (!exists) {
        dbFilms.push(newFilm);
        addedCount++;
    }
});

console.log(`✅ Merged ${addedCount} films into database.`);

// Save DB File
fs.writeFileSync(DB_FILE, JSON.stringify(dbFilms, null, 2));
console.log(`💾 Updated ${DB_FILE}`);

// Save Ready File (for user convenience)
fs.writeFileSync(IMPORT_READY_FILE, JSON.stringify(mappedNewFilms, null, 2));
console.log(`💾 Created ${IMPORT_READY_FILE}`);
