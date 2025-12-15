const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'cinepedia.data.json');
let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

console.log(`Scanning ${db.length} films for domain revert...`);

let fixedCount = 0;

db = db.map(film => {
    let changed = false;

    if (film.downloadLinks) {
        film.downloadLinks.forEach(link => {
            if (link.url && link.url.includes('we.tl')) {
                link.url = link.url.replace('we.tl', 'transfer.it');
                // Ensure protocol is kept/added so it's clickable
                if (!link.url.startsWith('http')) link.url = 'https://' + link.url;
                changed = true;
                fixedCount++;
            }
        });
    }

    // Also revert legacy fields
    if (film.drive && film.drive.includes('we.tl')) {
        film.drive = film.drive.replace('we.tl', 'transfer.it');
        if (!film.drive.startsWith('http')) film.drive = 'https://' + film.drive;
    }

    return film;
});

if (fixedCount > 0) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    console.log(`✅ database updated.`);
    console.log(`   Reverted Domains (we.tl -> transfer.it): ${fixedCount}`);
} else {
    console.log('✨ Database is already clean.');
}
