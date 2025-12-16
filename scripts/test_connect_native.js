const { MongoClient } = require('mongodb');

// URI with standard options
const uri = "mongodb+srv://temp:passthegate@cluster0.lallguq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);

async function run() {
    try {
        console.log("Attempting to connect with native driver...");
        await client.connect();

        console.log("✅ Connected successfully to server");

        const db = client.db("cinepedia");
        const count = await db.collection("movies").countDocuments();
        console.log(`Current movie count: ${count}`);

    } catch (err) {
        console.error("❌ Connection failed:", err);
    } finally {
        await client.close();
    }
}
run();
