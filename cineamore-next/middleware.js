import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function middleware(request) {
    // 1. Check if route is protected
    const path = request.nextUrl.pathname;
    const isProtectedRoute = path.startsWith('/admin');

    // 2. If not protected, continue
    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    // 3. Decrypt the session from the cookie
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);

    // 4. Redirect to /login if the user is not authenticated
    if (!session?.user) {
        return NextResponse.redirect(new URL('/login', request.nextUrl));
    }

    // 5. Success
    return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
