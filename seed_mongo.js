const config = require('./config');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Movie = require('./models/Movie');

// Usage: node seed_mongo.js [--force]

const URI = config.MONGO_URI;

if (!URI) {
    console.error('❌ No MONGO_URI found in config/env.');
    process.exit(1);
}

const DATA_PATH = path.join(__dirname, 'data', 'cinepedia.data.json');

// Reusing ID logic to ensure consistency
function generateId(film) {
    const fp = [
        film.title || '', film.original || '', film.year || '', film.director || ''
    ].join('|').toLowerCase();

    let h1 = 0xdeadbeef ^ fp.length, h2 = 0x41c6ce57 ^ fp.length;
    for (let i = 0; i < fp.length; i++) {
        const c = fp.charCodeAt(i);
        h1 = Math.imul(h1 ^ c, 2654435761);
        h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = (h1 ^ (h1 >>> 16)) >>> 0;
    h2 = (h2 ^ (h2 >>> 13)) >>> 0;
    const hash = (h2 * 4294967296 + h1).toString(36);
    // Note: server.js appends timestamp, but for deterministic seeding based on content,
    // we strictly stick to the hash if we want idempotency, OR we trust the source __id if present.
    // Since we are upserting, we prefer the existing __id.
    return `fm_${hash}_Init`;
}

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(URI);
        console.log('✅ Connected.');

        const force = process.argv.includes('--force');
        const count = await Movie.countDocuments();

        if (count > 0 && !force) {
            console.log(`ℹ️ Database has ${count} records. Skipping seed.`);
            console.log('   Use --force to update/upsert existing records.');
            process.exit(0);
        }

        console.log('Reading local data...');
        if (!fs.existsSync(DATA_PATH)) {
            console.error(`❌ Data file not found at ${DATA_PATH}`);
            process.exit(1);
        }

        const raw = fs.readFileSync(DATA_PATH, 'utf8');
        const movies = JSON.parse(raw);
        console.log(`Found ${movies.length} movies in file.`);

        console.log('Preparing bulk operations...');
        const ops = movies.map(m => {
            // Use existing ID if present, else generate deterministic one
            // We use 'Init' suffix for seed data to match legacy logic if needed,
            // or just rely on the stored __id.
            const id = m.__id || generateId(m);

            return {
                updateOne: {
                    filter: { __id: id },
                    update: { $set: { ...m, __id: id } }, // Ensure ID is set
                    upsert: true
                }
            };
        });

        if (ops.length > 0) {
            console.log(`Executing ${ops.length} operations...`);
            const res = await Movie.bulkWrite(ops);
            console.log('✅ Seed Complete.');
            console.log(`   Upserted: ${res.upsertedCount}`);
            console.log(`   Modified: ${res.modifiedCount}`);
            console.log(`   Matched:  ${res.matchedCount}`);
        } else {
            console.log('No operations to perform.');
        }

        process.exit(0);

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

seed();
