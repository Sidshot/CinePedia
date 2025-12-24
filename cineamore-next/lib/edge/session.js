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

const secretKey = process.env.JWT_SECRET || 'default-secret-key-change-me-in-prod';
const key = new TextEncoder().encode(secretKey);

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
