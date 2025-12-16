import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    message: {
        type: String,
        required: [true, 'Please provide a message'],
        maxlength: [500, 'Message cannot be more than 500 characters'],
    },
    movieId: {
        type: String, // Can be ObjectId or custom ID
        required: false,
    },
    movieTitle: {
        type: String,
        required: false,
    },
    resolved: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);
