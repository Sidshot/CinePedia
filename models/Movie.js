const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    __id: { type: String, required: true, unique: true }, // Keeping our custom ID for frontend compatibility
    title: { type: String, required: true },
    original: String,
    year: Number,
    director: String,
    lb: String,    // Letterboxd Link
    drive: String, // Drive Link
    dl: String,    // Download Link
    notes: String,
    addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Movie', MovieSchema);
