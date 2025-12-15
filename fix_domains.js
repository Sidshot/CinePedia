const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'cinepedia.data.json');
let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

console.log(`Scanning ${db.length} films for domain fixes...`);

let fixedCount = 0;

db = db.map(film => {
    let changed = false;

    if (film.downloadLinks) {
        film.downloadLinks.forEach(link => {
            if (link.url && link.url.includes('transfer.it')) {
                link.url = link.url.replace('transfer.it', 'we.tl');
                // Ensure protocol
                if (!link.url.startsWith('http')) link.url = 'https://' + link.url;
                changed = true;
                fixedCount++;
            }
        });
    }

    // Also fix deprecated fields just in case
    if (film.drive && film.drive.includes('transfer.it')) {
        film.drive = film.drive.replace('transfer.it', 'we.tl');
        if (!film.drive.startsWith('http')) film.drive = 'https://' + film.drive;
    }

    return film;
});

if (fixedCount > 0) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    console.log(`✅ database updated.`);
    console.log(`   Fixed Domains (transfer.it -> we.tl): ${fixedCount}`);
} else {
    console.log('✨ Database is already clean.');
}
