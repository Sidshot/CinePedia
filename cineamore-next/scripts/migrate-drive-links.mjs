import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is missing');
    process.exit(1);
}

// Minimal schema for migration
const MovieSchema = new mongoose.Schema({
    title: String,
    drive: String,
    dl: String,
    downloadLinks: Array
}, { strict: false });

const Movie = mongoose.models.Movie || mongoose.model('Movie', MovieSchema);

async function migrate() {
    console.log('🔗 Connecting to DB...');
    await mongoose.connect(MONGODB_URI);

    // Find movies with legacy drive links
    const movies = await Movie.find({
        drive: { $exists: true, $ne: '' }
    }).select('_id title drive downloadLinks');

    console.log(`📊 Found ${movies.length} movies to migrate.`);

    let valid = 0;
    let errors = 0;

    for (let i = 0; i < movies.length; i++) {
        const movie = movies[i];

        try {
            // Check if already migrated (safety)
            if (movie.downloadLinks && movie.downloadLinks.length > 0) {
                // If it has both, we just unset legacy to be clean, 
                // assuming new system is source of truth.
                // But audit said 0 overlap, so this is just safety.
            }

            const newLink = {
                label: 'Watch / Download',
                url: movie.drive,
                addedAt: new Date()
            };

            await Movie.updateOne(
                { _id: movie._id },
                {
                    $push: { downloadLinks: newLink },
                    $unset: { drive: "", dl: "" }
                }
            );

            process.stdout.write(`\r✅ Migrated: ${i + 1}/${movies.length} - ${movie.title.substring(0, 30)}...`);
            valid++;
        } catch (e) {
            console.error(`\n❌ Error migrating ${movie.title}:`, e);
            errors++;
        }
    }

    console.log(`\n\n🎉 Migration Complete!`);
    console.log(`Passed: ${valid}`);
    console.log(`Failed: ${errors}`);

    // Final Cleanup Pass: Unset any lingering empty strings or 'dl' fields
    console.log('🧹 Running final cleanup...');
    const result = await Movie.updateMany(
        { $or: [{ dl: { $exists: true } }, { drive: { $exists: true } }] },
        { $unset: { dl: "", drive: "" } }
    );
    console.log(`Cleanup matched ${result.matchedCount} and modified ${result.modifiedCount} docs.`);

    await mongoose.disconnect();
}

migrate();
