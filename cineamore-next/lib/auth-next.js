
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import dbConnect from "./mongodb"
import User from "@/models/User"

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.AUTH_SECRET,
    trustHost: true, // Required for Vercel deployment
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account.provider === "google") {
                try {
                    const db = await dbConnect();
                    if (db) {
                        const existingUser = await User.findOne({ email: user.email });
                        if (!existingUser) {
                            await User.create({
                                name: user.name,
                                email: user.email,
                                image: user.image,
                                role: 'user', // Default role
                            });
                            console.log("✅ New user created:", user.email);
                        } else {
                            console.log("✅ Existing user signed in:", user.email);
                        }
                    } else {
                        console.warn("⚠️ DB not connected, skipping user save");
                    }
                } catch (error) {
                    // Log the error but DON'T block sign-in
                    console.error("⚠️ Error saving user (non-blocking):", error.message);
                }
                // Always allow sign-in even if DB fails
                return true;
            }
            return true;
        },
        async session({ session, token }) {
            // Attach role to session from DB
            await dbConnect();
            const dbUser = await User.findOne({ email: session.user.email }).lean();
            if (dbUser) {
                session.user.id = dbUser._id.toString();
                session.user.role = dbUser.role;
                session.user.isAdmin = isAdmin(dbUser.email);
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        }
    },
    pages: {
        signIn: '/login', // Custom login page if needed
    }
})

// Helper to check admin status
function isAdmin(email) {
    const admins = (process.env.ADMIN_EMAILS || '').split(',');
    return admins.includes(email);
}
