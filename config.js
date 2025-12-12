require('dotenv').config();

module.exports = {
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.PORT || 3000,
    ADMIN_PASS: process.env.ADMIN_PASSWORD || '2025'
};
