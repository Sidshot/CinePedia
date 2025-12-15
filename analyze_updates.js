const fs = require('fs');
const path = require('path');

// Paths
const DB_PATH = path.join(__dirname, 'data', 'cinepedia.data.json');
const RAW_PATH = path.join(__dirname, 'films_raw.json');

// Load Data
const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const raw = JSON.parse(fs.readFileSync(RAW_PATH, 'utf8'));

console.log(`Loading... DB: ${db.length}, New RAW: ${raw.length}`);

// Normalizer
const clean = (str) => str ? str.toString().trim().toLowerCase() : '';
const cleanYear = (str) => str ? str.toString().trim().replace(/[^0-9]/g, '') : '';

const stats = {
    newFilms: [],
    exactDuplicates: 0,
    linkUpdates: [] // { title, year, oldLink, newLink }
};

raw.forEach(row => {
    // Map Columns from Portuguese Excel
    // "Título" -> Title
    // "Ano" -> Year
    // "Link do Drive" -> Link
    // "Diretor" -> Director
    const title = row['Título'];
    const year = row['Ano'];
    const link = row['Link do Drive'];

    if (!title) return; // Skip empty rows

    // Find in DB
    const existing = db.find(f => clean(f.title) === clean(title) && cleanYear(f.year) === cleanYear(year));

    if (!existing) {
        stats.newFilms.push({ title, year, link, director: row['Diretor'] });
    } else {
        // Compare Links
        // Existing might have 'dl' or 'drive'
        const existingLink = existing.dl || existing.drive || '';
        if (clean(existingLink) === clean(link)) {
            stats.exactDuplicates++;
        } else {
            // Check if it's already in a list? (Project doesn't support list yet)
            // Or if existing is empty?
            if (!existingLink && link) {
                // Just a backfill, count as link update but less critical
                stats.linkUpdates.push({ type: 'fill', title, year, oldLink: 'MISSING', newLink: link });
            } else if (link && existingLink) {
                // Conflict / Alternate
                stats.linkUpdates.push({ type: 'alternate', title, year, oldLink: existingLink, newLink: link });
            }
        }
    }
});

console.log('--- Analysis Report ---');
console.log(`New Films to Add: ${stats.newFilms.length}`);
console.log(`Exact Duplicates (Ignored): ${stats.exactDuplicates}`);
console.log(`Link Updates/Alternates: ${stats.linkUpdates.length}`);

if (stats.linkUpdates.length > 0) {
    console.log('\n--- Link Conflicts (First 10) ---');
    stats.linkUpdates.slice(0, 10).forEach(u => {
        console.log(`[${u.type.toUpperCase()}] ${u.title} (${u.year})`);
        console.log(`   Current: ${u.oldLink}`);
        console.log(`   New:     ${u.newLink}`);
    });
}

// Prepare Import Preview
fs.writeFileSync('import_analysis.json', JSON.stringify(stats, null, 2));
console.log('\nSaved full report to import_analysis.json');
