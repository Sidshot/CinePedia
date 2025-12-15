const mongoose = require('mongoose');
const config = require('./config');
const Movie = require('./models/Movie');

const audit = async () => {
    try {
        if (!config.MONGO_URI) {
            console.error("No MONGO_URI in config");
            return;
        }
        await mongoose.connect(config.MONGO_URI);
        console.log("Connected to DB");

        const count = await Movie.countDocuments();
        console.log(`Total Documents: ${count}`);

        const sample = await Movie.find().limit(5).lean();
        console.log("Sample Data (First 5):");
        sample.forEach(doc => {
            console.log(`_id: ${doc._id} (Type: ${typeof doc._id}) | __id: ${doc.__id}`);
        });

        // Check for missing _id (impossible in Mongo, but good to check access)
        const missingId = await Movie.countDocuments({ _id: { $exists: false } });
        console.log(`Docs missing _id: ${missingId}`);

        const missingCustomId = await Movie.countDocuments({ __id: { $exists: false } });
        console.log(`Docs missing __id: ${missingCustomId}`);

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

audit();
