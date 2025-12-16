const config = require('./config');
const mongoose = require('mongoose');
const Movie = require('./models/Movie');

async function migrateIdentity() {
    console.log('🚀 Starting Identity Migration (V1 -> V2)...');

    try {
        await mongoose.connect(config.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const movies = await Movie.find({});
        console.log(`📊 Found ${movies.length} movies to process.`);

        let migratedCount = 0;
        let diffCount = 0;

        for (const movie of movies) {
            let changed = false;

            // 1. Ensure __id (legacy) exists - we shouldn't create it if it's missing, just log it.
            // But realistically, all V1 movies rely on it.
            if (!movie.__id) {
                console.warn(`⚠️ Movie missing legacy __id: ${movie.title} (${movie.year})`);
            }

            // 2. We don't actually need to change the _id itself because MongoDB provides it automatically.
            // The goal here is to verify that everyone *has* a valid _id and that we acknowledge it as the new master key.
            // However, we might want to "lock" the record or mark it as migrated version 2.

            // For this migration, we are simply verifying data integrity and logging the mapping.
            // If we needed to generate UUIDs, we would do it here. But we are sticking to Mongo ObjectIds.

            // Let's add a schema version flag if not present, to track V2 status.
            if (!movie.schemaVersion || movie.schemaVersion < 2) {
                movie.schemaVersion = 2;
                changed = true;
            }

            if (changed) {
                await movie.save();
                migratedCount++;
                if (migratedCount % 50 === 0) process.stdout.write('.');
            }
        }

        console.log('\n');
        console.log(`✅ Migration Complete.`);
        console.log(`Updated ${migratedCount} documents to Schema V2.`);

    } catch (error) {
        console.error('❌ Migration Failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected');
    }
}

migrateIdentity();
