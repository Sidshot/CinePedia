import mongoose from 'mongoose';

const RequestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a movie title'],
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'rejected'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Request || mongoose.model('Request', RequestSchema);
