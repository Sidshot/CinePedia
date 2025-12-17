
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import dbConnect from "./mongodb"
import User from "@/models/User"

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.AUTH_SECRET,
    trustHost: true, // Required for Vercel deployment
    session: {
        strategy: "jwt", // Use JWT for serverless compatibility
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
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
        async jwt({ token, user, account }) {
            // Persist user info in the token on initial sign-in
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.picture = user.image;
            }
            return token;
        },
        async session({ session, token }) {
            // Pass token data to session (no DB call needed for basic session)
            if (token) {
                session.user.id = token.id || token.sub;
                session.user.email = token.email;
                session.user.name = token.name;
                session.user.image = token.picture;
            }

            // Optionally enrich with DB data (non-blocking)
            try {
                const db = await dbConnect();
                if (db) {
                    const dbUser = await User.findOne({ email: session.user.email }).lean();
                    if (dbUser) {
                        session.user.id = dbUser._id.toString();
                        session.user.role = dbUser.role;
                        session.user.isAdmin = isAdmin(dbUser.email);
                    }
                }
            } catch (error) {
                console.warn("⚠️ Could not enrich session from DB:", error.message);
            }

            return session;
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
