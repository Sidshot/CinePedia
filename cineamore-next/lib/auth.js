import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const secretKey = process.env.JWT_SECRET || 'default-secret-key-change-me-in-prod';
const key = new TextEncoder().encode(secretKey);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function encrypt(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h') // Session lasts 24 hours
        .sign(key);
}

export async function decrypt(input) {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function login(formData) {
    'use server';

    const password = formData.get('password');

    if (password === ADMIN_PASSWORD) {
        // Create the session
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
        const session = await encrypt({ user: 'admin', expires });

        // Save the session in a cookie
        const cookieStore = await cookies();
        cookieStore.set('session', session, {
            expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        });

        redirect('/admin');
    } else {
        // Return error? For simple server actions we might redirect or throw
        // For now, let's redirect back with a query param or handle UI state if using useFormState (React 19)
        // But to keep it simple without client hydration complexity:
        redirect('/login?error=Invalid Credentials');
    }
}

export async function logout() {
    'use server';
    const cookieStore = await cookies();
    cookieStore.set('session', '', { expires: new Date(0) });
    redirect('/login');
}

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get('sessionToVerify')?.value || cookieStore.get('session')?.value;
    if (!session) return null;
    return await decrypt(session);
}
