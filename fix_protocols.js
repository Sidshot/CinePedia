const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'cinepedia.data.json');
let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

console.log(`Scanning ${db.length} films...`);

let fixedCount = 0;
let removedDupes = 0;

const normalizeUrl = (url) => {
    if (!url) return '';
    let clean = url.trim();
    if (clean.startsWith('transfer.it')) return 'https://' + clean;
    if (clean.startsWith('www.transfer.it')) return 'https://' + clean;
    if (clean.startsWith('drive.google.com')) return 'https://' + clean;
    // Add other missing protocols if needed
    if (!clean.startsWith('http')) {
        // Assume https for standard domains if missing
        if (clean.includes('.com') || clean.includes('.it') || clean.includes('.net')) {
            return 'https://' + clean;
        }
    }
    return clean;
};

db = db.map(film => {
    let changed = false;

    if (film.downloadLinks && film.downloadLinks.length > 0) {
        // 1. Fix Protocols
        film.downloadLinks.forEach(link => {
            const newUrl = normalizeUrl(link.url);
            if (newUrl !== link.url) {
                link.url = newUrl;
                changed = true;
                fixedCount++;
            }
        });

        // 2. Deduplicate
        const uniqueLinks = [];
        const seenUrls = new Set();

        film.downloadLinks.forEach(link => {
            const norm = link.url.toLowerCase().replace(/\/$/, ''); // ignore trailing slash case
            if (!seenUrls.has(norm)) {
                seenUrls.add(norm);
                uniqueLinks.push(link);
            } else {
                removedDupes++;
                changed = true;
            }
        });

        film.downloadLinks = uniqueLinks;
    }

    return film;
});

if (fixedCount > 0 || removedDupes > 0) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    console.log(`✅ database updated.`);
    console.log(`   Fixed Protocols: ${fixedCount}`);
    console.log(`   Removed Duplicates: ${removedDupes}`);
} else {
    console.log('✨ Database is already clean.');
}
