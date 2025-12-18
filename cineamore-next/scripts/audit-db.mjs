import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env relative to script location
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is missing');
    process.exit(1);
}

// Loose schema for auditing (allows checking for forbidden fields)
const AuditSchema = new mongoose.Schema({
    title: String,
    year: Number,
    dl: String,
    drive: String,
    downloadLinks: Array
}, { strict: false });

const Movie = mongoose.models.Movie || mongoose.model('Movie', AuditSchema);

async function runAudit() {
    console.log('🔍 Starting Database Audit...');

    try {
        await mongoose.connect(MONGODB_URI);
        const total = await Movie.countDocuments();
        console.log(`📊 Scanning ${total} documents...\n`);

        const issues = {
            legacyFields: 0,
            invalidYear: 0,
            shortTitle: 0,
            missingDownloads: 0
        };

        // 1. Check for Forbidden Legacy Fields
        const legacy = await Movie.countDocuments({
            $or: [{ dl: { $exists: true } }, { drive: { $exists: true } }]
        });
        issues.legacyFields = legacy;
        if (legacy > 0) console.error(`❌ INVARIANT FAIL: ${legacy} docs have 'dl' or 'drive' fields.`);

        // 2. Check for Invalid Years
        const badYears = await Movie.countDocuments({
            $or: [
                { year: { $lt: 1880 } },
                { year: { $gt: 2100 } },
                { year: { $type: "string" } } // Should be Number
            ]
        });
        issues.invalidYear = badYears;
        if (badYears > 0) console.error(`❌ INVARIANT FAIL: ${badYears} docs have invalid years.`);

        // 3. Check for Empty Titles
        const shortTitles = await Movie.find({
            $or: [{ title: { $exists: false } }, { title: "" }]
        }).countDocuments();
        issues.shortTitle = shortTitles;
        if (shortTitles > 0) console.error(`❌ INVARIANT FAIL: ${shortTitles} docs have missing titles.`);

        // 4. Check for Orphans (No Downloads) - Warning only
        const orphans = await Movie.countDocuments({
            $and: [
                { downloadLinks: { $size: 0 } },
                { addedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } // Ignore very new docs in progress
            ]
        });
        issues.missingDownloads = orphans;
        if (orphans > 0) console.warn(`⚠️ WARNING: ${orphans} docs have NO download links.`);

        console.log('\n----------------------------------------');
        console.log('📋 AUDIT SUMMARY');
        console.log('----------------------------------------');
        console.log(`Forbidden Fields: ${issues.legacyFields === 0 ? '✅ 0' : '❌ ' + issues.legacyFields}`);
        console.log(`Invalid Years:    ${issues.invalidYear === 0 ? '✅ 0' : '❌ ' + issues.invalidYear}`);
        console.log(`Invalid Titles:   ${issues.shortTitle === 0 ? '✅ 0' : '❌ ' + issues.shortTitle}`);
        console.log(`Orphan Movies:    ${issues.missingDownloads === 0 ? '✅ 0' : '⚠️ ' + issues.missingDownloads}`);
        console.log('----------------------------------------');

        const failed = issues.legacyFields + issues.invalidYear + issues.shortTitle;
        if (failed > 0) {
            console.error(`\n🚨 CRITICAL: Database invariants violated in ${failed} instances.`);
            process.exit(1);
        } else {
            console.log('\n✨ Database is healthly. Invariants held.');
            process.exit(0);
        }

    } catch (e) {
        console.error('Audit crashed:', e);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

runAudit();
