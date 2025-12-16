const mongoose = require('mongoose');
const Movie = require('../models/Movie'); // Uses V1 model which is compatible
const config = require('../config');

// User provided URI (Sanitized)
const REMOTE_URI = 'mongodb+srv://temp:passthegate@cluster0.lallguq.mongodb.net/cinepedia?appName=Cluster0&authSource=admin';

async function seedRemote() {
    console.log('🚀 Starting Data Migration (Local -> Atlas)...');

    try {
        // 1. Connect to Local
        console.log('🔌 Connecting to LOCAL DB...');
        await mongoose.connect(config.MONGO_URI);
        const localMovies = await Movie.find({}).lean();
        console.log(`✅ Loaded ${localMovies.length} movies from Local DB.`);
        await mongoose.disconnect();

        // 2. Connect to Remote
        console.log('☁️ Connecting to REMOTE DB (Atlas)...');
        // We use a separate connection for remote to avoid confusion
        const remoteConn = await mongoose.createConnection(REMOTE_URI).asPromise();
        console.log('✅ Connected to Atlas.');

        // Define model on remote connection
        // We reuse the schema from the local model
        const RemoteMovie = remoteConn.model('Movie', Movie.schema);

        // 3. Upsert Data
        console.log('📦 Uploading data...');
        let count = 0;
        const total = localMovies.length;

        // Batch processing
        const BATCH_SIZE = 50;
        for (let i = 0; i < total; i += BATCH_SIZE) {
            const batch = localMovies.slice(i, i + BATCH_SIZE);
            const ops = batch.map(doc => ({
                updateOne: {
                    filter: { __id: doc.__id }, // Match by legacy ID to prevent dupes
                    update: { $set: doc },
                    upsert: true
                }
            }));

            await RemoteMovie.bulkWrite(ops);
            count += batch.length;
            process.stdout.write(`\rProgress: ${count}/${total} (${Math.round(count / total * 100)}%)`);
        }

        console.log('\n✨ Migration Complete!');
        console.log(`Synced ${count} documents to MongoDB Atlas.`);

        await remoteConn.close();

    } catch (err) {
        console.error('\n❌ Migration Failed:', err);
    }
}

seedRemote();
