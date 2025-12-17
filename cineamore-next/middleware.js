import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'default-secret-key-change-me-in-prod';
const key = new TextEncoder().encode(secretKey);

async function verifySession(token) {
    try {
        const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
        return payload;
    } catch {
        return null;
    }
}

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Only protect /admin routes
    if (pathname.startsWith('/admin')) {
        const sessionCookie = request.cookies.get('session')?.value;
        const session = sessionCookie ? await verifySession(sessionCookie) : null;

        if (!session || !session.user) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
