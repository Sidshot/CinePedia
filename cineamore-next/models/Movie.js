import mongoose from 'mongoose';

const MovieSchema = new mongoose.Schema({
    __id: {
        type: String,
        required: true,
        unique: true,
        immutable: true // LEGACY ALIAS: Never allow this to change once set
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        minlength: [1, 'Title must be at least 1 character'],
        trim: true
    },
    original: String,
    year: {
        type: Number,
        min: [1880, 'Year must be after 1880'],
        max: [2100, 'Year cannot be in the distant future']
    },
    director: String,
    plot: String, // Plot Summary
    genre: { type: [String], default: [] }, // Genre Tags
    lb: String,
    notes: String, // Editor's Notes
    ratingSum: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    downloadLinks: [{
        label: String,
        url: String,
        addedAt: { type: Date, default: Date.now }
    }],
    addedAt: { type: Date, default: Date.now }
});

// Indexes for homepage performance
MovieSchema.index({ addedAt: -1 });
MovieSchema.index({ year: -1 });
MovieSchema.index({ title: 'text', director: 'text' }); // Optimized text search



// FORCE REFRESH: Delete the stale model from Mongoose cache to ensure new schema fields (genre) are recognized
// This fixes the Next.js hot-reload issue where schema updates aren't applied
if (mongoose.models.Movie) {
    delete mongoose.models.Movie;
}

export default mongoose.model('Movie', MovieSchema);
