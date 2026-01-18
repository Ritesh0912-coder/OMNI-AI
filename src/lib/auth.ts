import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";
import connectToDatabase from "./mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sendLoginNotification } from "./email";

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                await connectToDatabase();
                const user = await User.findOne({ email: credentials.email }).select('+password');

                if (!user || !user.password) {
                    throw new Error("Invalid credentials");
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error("Invalid credentials");
                }

                return { id: user._id.toString(), name: user.name, email: user.email, image: user.image };
            }
        })
    ],
    pages: {
        signIn: "/sign-in",
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_dev_only",
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    debug: process.env.NODE_ENV === "development",
    cookies: {
        callbackUrl: {
            name: `next-auth.callback-url`,
            options: {
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production'
            }
        },
        state: {
            name: `next-auth.state`,
            options: {
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production'
            }
        },
    },
    callbacks: {
        async signIn({ user, account }) {
            try {
                console.log(`[AUTH] Sign-in (${account?.provider}): ${user.email} (${user.name})`);
                await connectToDatabase();

                // For Google Auth, update/create user
                if (account?.provider === 'google') {
                    const savedUser = await User.findOneAndUpdate(
                        { email: user.email },
                        {
                            name: user.name || user.email?.split('@')[0],
                            image: user.image,
                            lastLogin: new Date()
                        },
                        { upsert: true, new: true }
                    );

                    // Send notification if it's a new login
                    await sendLoginNotification(user.email!, user.name!, 'Google');
                    console.log(`[AUTH] Profile Sync OK: ${savedUser.email}`);
                } else if (account?.provider === 'credentials') {
                    // For credentials, just update last login
                    await User.findOneAndUpdate(
                        { email: user.email },
                        { lastLogin: new Date() }
                    );
                    // Send notification
                    await sendLoginNotification(user.email!, user.name!, 'Password');
                }

                return true;
            } catch (error) {
                console.error("[AUTH] Profile Sync Failed:", error);
                return true;
            }
        },
        async session({ session }: any) {
            await connectToDatabase();
            const user = await User.findOne({ email: session.user.email });
            if (user) {
                session.user.id = user._id.toString();
                session.user.usage = user.usage;
            }
            return session;
        },
    },
};
