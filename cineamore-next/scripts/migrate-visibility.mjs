import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

// Inline Schema (Minimal) to avoid validation errors during migration
const MovieSchema = new mongoose.Schema({
    hidden: Boolean,
    visibility: {
        state: { type: String, enum: ['visible', 'hidden', 'quarantined'], default: 'visible' },
        reason: String
    }
}, { strict: false }); // Strict false allows us to see/manipulate fields not in schema

const Movie = mongoose.models.Movie || mongoose.model('Movie', MovieSchema);

async function migrate() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected.');

        console.log('🔍 Analyzing database...');
        const allMovies = await Movie.find({});
        console.log(`📊 Found ${allMovies.length} movies.`);

        let quarantined = 0;
        let visible = 0;
        let alreadyMigrated = 0;

        const bulkOps = [];

        for (const movie of allMovies) {
            // Check if already migrated
            if (movie.visibility && movie.visibility.state && movie.hidden === undefined) {
                alreadyMigrated++;
                continue;
            }

            const update = {
                $unset: { hidden: "" },
                $set: {}
            };

            // Logic: hidden=true -> quarantined
            // Logic: hidden=false/undefined -> visible
            // Logic: preserve existing visibility if set? No, verify against legacy flag.

            if (movie.hidden === true) {
                update.$set.visibility = {
                    state: 'quarantined',
                    reason: 'Legacy hidden flag migration',
                    updatedAt: new Date()
                };
                quarantined++;
            } else {
                // Default to visible if not hidden
                // Only set if visibility isn't already set to something else (e.g. if we partially migrated)
                // But for safety, we assume "hidden" boolean is the source of truth right now.
                update.$set.visibility = {
                    state: 'visible',
                    reason: null,
                    updatedAt: new Date()
                };
                visible++;
            }

            bulkOps.push({
                updateOne: {
                    filter: { _id: movie._id },
                    update: update
                }
            });
        }

        if (bulkOps.length > 0) {
            console.log(`🚀 Executing ${bulkOps.length} updates...`);
            await Movie.bulkWrite(bulkOps);
            console.log('✅ Migration Complete.');
            console.log(`   - Quarantined: ${quarantined}`);
            console.log(`   - Visible: ${visible}`);
        } else {
            console.log('✅ No updates needed (Already migrated).');
        }

    } catch (error) {
        console.error('❌ Migration Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected.');
    }
}

migrate();
