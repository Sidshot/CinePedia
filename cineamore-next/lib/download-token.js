
import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = process.env.DOWNLOAD_SECRET || process.env.JWT_SECRET || 'fallback-secret-key-download-protection';
const key = new TextEncoder().encode(SECRET_KEY);

export async function signDownloadToken(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30s') // Short life: Scraper must click NOW
        .sign(key);
}

export async function verifyDownloadToken(token) {
    try {
        const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
        return payload;
    } catch (e) {
        return null;
    }
}
