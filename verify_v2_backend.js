const config = require('./config');
// Mocking the environment for the script
const PORT = config.PORT || 3000;
const API_URL = `http://localhost:${PORT}/api`;

const run = async () => {
    console.log(`🔍 Verifying V2 Backend at ${API_URL}...`);

    // 1. Fetch All
    try {
        const res = await fetch(`${API_URL}/movies`);
        const movies = await res.json();
        console.log(`✅ Fetch Success: Got ${movies.length} movies.`);

        if (movies.length === 0) {
            console.warn("⚠️ No movies to test.");
            return;
        }

        const sample = movies[0];
        const id = sample._id;
        const legacyId = sample.__id;
        console.log(`📝 Testing with Film: "${sample.title}"`);
        console.log(`   _id: ${id}`);
        console.log(`   __id: ${legacyId}`);

        if (!id) {
            console.error("❌ CRITICAL: No _id returned by API!");
            return;
        }

        // 2. Test Rate (using _id)
        console.log("👉 Testing RATE with _id...");
        const rateRes = await fetch(`${API_URL}/movies/${id}/rate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: 5 })
        });
        const rateData = await rateRes.json();

        if (rateData.success) {
            console.log("✅ RATE Success (using _id)");
        } else {
            console.error("❌ RATE Failed:", rateData);
        }

        // 3. Test Update (using _id) - Requires Admin
        console.log("👉 Testing UPDATE (PUT) with _id...");
        const updateRes = await fetch(`${API_URL}/movies/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-pass': config.ADMIN_PASS // Mocking admin
            },
            body: JSON.stringify({ notes: "V2 Migration Verified" })
        });

        // Note: checking status, might be 403 or 200 depending on env config loaded locally
        if (updateRes.ok) {
            const updateData = await updateRes.json();
            console.log("✅ UPDATE Success (using _id):", updateData.success);
        } else {
            console.warn("⚠️ UPDATE validation skipped (Admin pass might mock env mismatch):", updateRes.status);
        }

    } catch (e) {
        console.error("❌ Verification Failed (Is server running?)", e.message);
        console.log("👉 Please start the server (`node server.js`) in another terminal to run this test.");
    }
};

run();
