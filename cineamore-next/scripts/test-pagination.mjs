import dotenv from 'dotenv';
import path from 'path';

// Load env before anything else
dotenv.config({ path: '.env.local' });

async function verifyPagination() {
    console.log('🔍 Starting Pagination Verification...');
    console.log('Using Mongodb URI:', process.env.MONGODB_URI ? 'Defined' : 'MISSING');

    // Dynamic import to ensure env is loaded first
    const { default: dbConnect } = await import('../lib/mongodb.js');
    const { default: Movie } = await import('../models/Movie.js');

    try {
        await dbConnect();

        // 1. Check Page 1
        const PAGE_SIZE = 48;
        console.log(`\n📄 Fetching Page 1 (Limit: ${PAGE_SIZE})...`);
        const page1 = await Movie.find({})
            .sort({ addedAt: -1 }) // Primary Sort
            .limit(PAGE_SIZE)
            .select('title _id addedAt')
            .lean();

        console.log(`✅ Page 1 Count: ${page1.length}`);
        if (page1.length > PAGE_SIZE) throw new Error('❌ Page 1 exceeded limit!');

        if (page1.length === 0) {
            console.log('⚠️ Database empty, cannot test pagination.');
            process.exit(0);
        }

        // 2. Check Page 2
        console.log(`\n📄 Fetching Page 2 (Skip: ${PAGE_SIZE}, Limit: ${PAGE_SIZE})...`);
        const page2 = await Movie.find({})
            .sort({ addedAt: -1 })
            .skip(PAGE_SIZE)
            .limit(PAGE_SIZE)
            .select('title _id addedAt')
            .lean();

        console.log(`✅ Page 2 Count: ${page2.length}`);
        if (page2.length > PAGE_SIZE) throw new Error('❌ Page 2 exceeded limit!');

        // 3. Verify Determinism (No Overlap)
        if (page2.length > 0) {
            const lastOfPage1 = page1[page1.length - 1];
            const firstOfPage2 = page2[0];

            console.log(`\n🔗 Boundary Check:`);
            console.log(`   Page 1 End: "${lastOfPage1.title}" (${lastOfPage1._id})`);
            console.log(`   Page 2 Start: "${firstOfPage2.title}" (${firstOfPage2._id})`);

            const overlap = page1.some(p1 => page2.some(p2 => p2._id.toString() === p1._id.toString()));
            if (overlap) {
                throw new Error('❌ CRITICAL: Duplicate movies found between Page 1 and Page 2. Sort is unstable!');
            }
            console.log('✅ No overlap detected. Pagination is stable.');
        }

        console.log('\n🎉 VERIFICATION PASSED: Pagination is deterministic and bounded.');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED:', error.message);
        process.exit(1);
    }
}

verifyPagination();
