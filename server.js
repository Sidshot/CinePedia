const config = require('./config');
const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose'); // Database
const Movie = require('./models/Movie'); // Model

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = config.PORT;

// Trust Proxy (Required for Render/Heroku to see real IPs)
app.set('trust proxy', 1);

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // relaxed for images/scripts
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased limit for viral traffic
    message: 'Too many requests, please try again later.'
});
app.use(limiter);

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));

// --- REPORT API ROUTES (Placed early to avoid 404) ---
const REPORTS_FILE = path.join(__dirname, 'data', 'reports.txt');
const fs = require('fs');

// POST /api/report
// POST /api/report - FROZEN
app.post('/api/report', (req, res) => {
    res.status(403).json({ error: 'Migration in progress. V1 is Read-Only.' });
});

// GET /api/reports (Admin)
app.get('/api/reports', (req, res) => {
    if (fs.existsSync(REPORTS_FILE)) {
        res.download(REPORTS_FILE, 'reports.txt');
    } else {
        res.status(404).send('No reports found.');
    }
});
// -----------------------------------------------------

// Database Connection
const connectDB = async () => {
    if (!config.MONGO_URI) {
        console.log('⚠️ No MONGO_URI found. Server will start but DB calls will fail.');
        return;
    }
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log('✅ MongoDB Connected');

        // AUTO-SEED: Check if empty
        const count = await Movie.countDocuments();
        if (count === 0) {
            console.log('🌱 Database is empty. Attempting auto-seed...');
            const dataPath = path.join(__dirname, 'data', 'cinepedia.data.json');
            if (fs.existsSync(dataPath)) {
                const raw = fs.readFileSync(dataPath, 'utf8');
                const movies = JSON.parse(raw);

                // Normalize items to ensure IDs
                const validMovies = movies.map(m => {
                    const t = m.title || m.Title; // Handle casing if any
                    // Ensure ID
                    const fp = [t || '', m.year || '', m.director || ''].join('|').toLowerCase();
                    let h1 = 0xdeadbeef ^ fp.length, h2 = 0x41c6ce57 ^ fp.length;
                    for (let i = 0; i < fp.length; i++) {
                        const c = fp.charCodeAt(i);
                        h1 = Math.imul(h1 ^ c, 2654435761);
                        h2 = Math.imul(h2 ^ c, 1597334677);
                    }
                    h1 = (h1 ^ (h1 >>> 16)) >>> 0;
                    h2 = (h2 ^ (h2 >>> 13)) >>> 0;
                    const hash = (h2 * 4294967296 + h1).toString(36);

                    return {
                        ...m,
                        __id: m.__id || `fm_${hash}_Init`,
                        title: t
                    };
                }).filter(m => m.title); // Skip empty

                await Movie.insertMany(validMovies, { ordered: false });
                console.log(`✅ Auto-Seeded ${validMovies.length} movies.`);
            } else {
                console.log('ℹ️ cinepedia.data.json not found, skipping seed.');
            }
        }
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

// Middleware: Require Admin
const requireAdmin = (req, res, next) => {
    const pass = req.headers['x-admin-pass'] || req.body.password;
    if (pass === config.ADMIN_PASS) {
        next();
    } else {
        res.status(403).json({ error: 'Forbidden: Admin Access Required' });
    }
};

// API Routes
// POST /api/auth - Password Check
app.post('/api/auth', (req, res) => {
    const { password } = req.body;
    if (password === config.ADMIN_PASS) {
        return res.json({ success: true });
    }
    return res.json({ success: false });
});

// GET /api/movies - Read all
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await Movie.find();
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
});

// GET /api/movies/:id - Get Single
app.get('/api/movies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let query;

        if (mongoose.Types.ObjectId.isValid(id)) {
            query = { _id: id };
        } else {
            query = { __id: id };
        }

        const movie = await Movie.findOne(query);
        if (!movie) return res.status(404).json({ error: 'Movie not found' });

        res.json(movie);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch movie' });
    }
});

// POST /api/movies - Create new
// POST /api/movies - FROZEN
app.post('/api/movies', requireAdmin, async (req, res) => {
    res.status(403).json({ error: 'Migration in progress. V1 is Read-Only.' });
});

// PUT /api/movies/:id - Update existing
// PUT /api/movies/:id - FROZEN
app.put('/api/movies/:id', requireAdmin, async (req, res) => {
    res.status(403).json({ error: 'Migration in progress. V1 is Read-Only.' });
});

// POST /api/movies/:id/rate - Rate a film
// POST /api/movies/:id/rate - FROZEN
app.post('/api/movies/:id/rate', async (req, res) => {
    res.status(403).json({ error: 'Migration in progress. V1 is Read-Only.' });
});

// GET /api/requests - Export Requests as CSV
app.get('/api/requests', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'data', 'requests.json');
        if (!fs.existsSync(filePath)) {
            return res.send(''); // Empty CSV
        }

        const requests = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        // Convert to CSV with BOM for Excel and CRLF for Windows
        const header = '\uFEFFTitle;Year;Director;Letterboxd;Drive;Download\r\n';
        const rows = requests.map(r => `${r.title};;;;;;`).join('\r\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="requests.csv"');
        res.send(header + rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error exporting requests');
    }
});

// POST /api/import - Bulk Import & Fulfill
// POST /api/import - FROZEN
app.post('/api/import', requireAdmin, async (req, res) => {
    res.status(403).json({ error: 'Migration in progress. V1 is Read-Only.' });
});

// POST /api/request - User Request Film
// POST /api/request - FROZEN
app.post('/api/request', async (req, res) => {
    res.status(403).json({ error: 'Migration in progress. V1 is Read-Only.' });
});

// (Report API routes moved to top of file)


// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
