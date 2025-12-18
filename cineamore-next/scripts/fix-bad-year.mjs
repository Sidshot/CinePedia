import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function fix() {
    await mongoose.connect(MONGODB_URI);
    const Movie = mongoose.models.Movie || mongoose.model('Movie', new mongoose.Schema({}, { strict: false }));

    // Using ID from previous audit
    const id = "69427d6ef2770f09e2bed04f";

    // Unset year
    const result = await Movie.updateOne(
        { _id: id },
        { $unset: { year: 1 } }
    );

    console.log(`Fix result: matched ${result.matchedCount}, modified ${result.modifiedCount}`);
    await mongoose.disconnect();
}

fix();
