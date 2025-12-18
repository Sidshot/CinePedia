/**
 * CineAmore Structural Logger
 * Centralizes logging to ensure visibility into critical system events.
 */
const logger = {
    info: (action, message, meta = {}) => {
        console.log(JSON.stringify({
            level: 'INFO',
            timestamp: new Date().toISOString(),
            action,
            message,
            ...meta
        }));
    },

    warn: (action, message, meta = {}) => {
        console.warn(JSON.stringify({
            level: 'WARN',
            timestamp: new Date().toISOString(),
            action,
            message,
            ...meta
        }));
    },

    error: (action, message, meta = {}) => {
        console.error(JSON.stringify({
            level: 'ERROR',
            timestamp: new Date().toISOString(),
            action,
            message,
            ...meta
        }));
    },

    /**
     * Log administrative actions for audit trails
     */
    audit: (userEmail, action, targetId, details = {}) => {
        console.log(JSON.stringify({
            level: 'AUDIT',
            timestamp: new Date().toISOString(),
            user: userEmail,
            action,
            targetId,
            details
        }));
    }
};

export default logger;
