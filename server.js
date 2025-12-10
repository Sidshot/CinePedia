require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose'); // Database
const Movie = require('./models/Movie'); // Model

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));

// Database Connection
const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.log('⚠️ No MONGO_URI found. Server will start but DB calls will fail.');
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
    }
};
connectDB();

// Helper: ID Generator
function generateId(film) {
    const fp = [
        film.title || '', film.original || '', film.year || '', film.director || ''
    ].join('|').toLowerCase();

    let h1 = 0xdeadbeef ^ fp.length, h2 = 0x41c6ce57 ^ fp.length;
    for (let i = 0; i < fp.length; i++) {
        const c = fp.charCodeAt(i);
        h1 = Math.imul(h1 ^ c, 2654435761);
        h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = (h1 ^ (h1 >>> 16)) >>> 0;
    h2 = (h2 ^ (h2 >>> 13)) >>> 0;
    const hash = (h2 * 4294967296 + h1).toString(36);
    return `fm_${hash}_${Date.now().toString(36)}`;
}

// API Routes

// GET /api/movies - Read all
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await Movie.find();
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
});

// POST /api/movies - Create new
app.post('/api/movies', async (req, res) => {
    try {
        const newFilm = req.body;
        if (!newFilm.title) return res.status(400).json({ error: 'Title required' });

        newFilm.__id = generateId(newFilm);

        const created = await Movie.create(newFilm);
        res.json({ success: true, film: created });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create film' });
    }
});

// PUT /api/movies/:id - Update existing
app.put('/api/movies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;

        const updated = await Movie.findOneAndUpdate({ __id: id }, update, { new: true });

        if (!updated) return res.status(404).json({ error: 'Not found' });

        res.json({ success: true, film: updated });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update' });
    }
});

// POST /api/import - Bulk Import
app.post('/api/import', async (req, res) => {
    try {
        const imports = req.body;
        if (!Array.isArray(imports)) return res.status(400).json({ error: 'Array required' });

        let prep = imports.filter(f => f.title).map(f => ({
            ...f,
            __id: generateId(f)
        }));

        if (prep.length === 0) return res.json({ count: 0 });

        // Use insertMany (efficient)
        // Note: duplicates on __id will throw error if we set unique: true.
        // For simplicity, we might just insert and ignore errors or ordered: false
        try {
            await Movie.insertMany(prep, { ordered: false });
        } catch (e) {
            // Ignore duplicate key errors, continue with others
        }

        res.json({ success: true, count: prep.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Import failed' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
