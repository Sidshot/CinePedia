// sync_db.js
// Reads data/cinepedia.data.json and UPSERTS into local MongoDB
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const config = require('./config'); // Ensure this path is correct
const Movie = require('./models/Movie');

const DATA_FILE = path.join(__dirname, 'data', 'cinepedia.data.json');

const syncData = async () => {
    if (!fs.existsSync(DATA_FILE)) {
        console.error('❌ Data file not found:', DATA_FILE);
        process.exit(1);
    }

    const fileData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    console.log(`📂 Loaded ${fileData.length} records from file.`);

    if (!config.MONGO_URI) {
        console.error('❌ MONGO_URI missing in config.');
        process.exit(1);
    }

    try {
        await mongoose.connect(config.MONGO_URI);
        console.log('✅ Connected to Mongo.');

        // Prepare Bulk Ops
        const ops = fileData.map(f => {
            // Identifier: Title + Year (or __id if present, but file might lack __id for new ones)
            // Ideally we use a generated ID, but for sync we match on title/year
            // If we want to UPSERT, we need a unique key.
            // Let's generate ID if missing
            if (!f.__id) {
                const fp = [f.title || '', f.original || '', f.year || '', f.director || ''].join('|').toLowerCase();

                // Simple hash (same as server.js logic roughly)
                let h1 = 0xdeadbeef ^ fp.length, h2 = 0x41c6ce57 ^ fp.length;
                for (let i = 0; i < fp.length; i++) {
                    const c = fp.charCodeAt(i);
                    h1 = Math.imul(h1 ^ c, 2654435761);
                    h2 = Math.imul(h2 ^ c, 1597334677);
                }
                h1 = (h1 ^ (h1 >>> 16)) >>> 0;
                h2 = (h2 ^ (h2 >>> 13)) >>> 0;
                const hash = (h2 * 4294967296 + h1).toString(36);
                f.__id = `fm_${hash}_Sync`;
            }

            return {
                updateOne: {
                    filter: { title: f.title, year: f.year }, // Match criteria
                    update: { $set: f },
                    upsert: true
                }
            };
        });

        console.log(`🚀 Starting Sync for ${ops.length} items...`);
        const res = await Movie.bulkWrite(ops, { ordered: false });
        console.log(`✅ Sync Complete!`);
        console.log(`   Matched: ${res.matchedCount}`);
        console.log(`   Modified: ${res.modifiedCount}`);
        console.log(`   Upserted: ${res.upsertedCount}`);

        process.exit(0);

    } catch (err) {
        console.error('❌ Sync Failed:', err);
        process.exit(1);
    }
};

syncData();
