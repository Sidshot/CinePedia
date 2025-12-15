const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    __id: { type: String, required: true, unique: true }, // Keeping our custom ID for frontend compatibility
    title: { type: String, required: true },
    original: String,
    year: Number,
    director: String,
    lb: String,    // Letterboxd Link
    notes: String,
    ratingSum: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    downloadLinks: [{
        label: String, // e.g. "Option 1" or "Drive"
        url: String,
        addedAt: { type: Date, default: Date.now }
    }],
    dl: String,   // Deprecated, keeping for safety
    drive: String, // Deprecated, keeping for safety
    addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Movie', MovieSchema);
