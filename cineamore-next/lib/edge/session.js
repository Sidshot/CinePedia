/**
 * ⚠️ EDGE RUNTIME COMPATIBLE ONLY ⚠️
 * 
 * This file MUST NOT import:
 * - 'mongoose'
 * - 'fs'
 * - 'net'
 * - Any Node.js specific modules
 * 
 * It is used by `middleware.js` which runs on the Edge.
 */
import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET env variable is missing in production');
    }
    console.warn('⚠️ using insecure default JWT_SECRET for development');
}
const finalKey = secretKey || 'dev-secret-key-do-not-use-in-prod';
const key = new TextEncoder().encode(finalKey);

/**
 * Encrypt a payload into a JWT
 * @param {Object} payload 
 * @returns {Promise<string>}
 */
export async function encrypt(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);
}

/**
 * Decrypt a JWT into a payload
 * @param {string} token 
 * @returns {Promise<Object|null>}
 */
export async function decrypt(token) {
    try {
        const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
        return payload;
    } catch (error) {
        return null;
    }
}
