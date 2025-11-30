import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/signin",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // For OAuth providers, check if user exists
            const email = user.email
            if (!email) {
                return false
            }

            // Check if a user with this email already exists
            const existingUser = await prisma.user.findUnique({
                where: { email }
            })

            if (!existingUser) {
                // No account found for this email
                // Redirect to sign-in page with error
                return `/auth/signin?error=no_account_for_oauth`
            }

            // Allow OAuth for existing users
            return true
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
            }
            return session
        }
    },
    events: {
        async signIn({ user, account, profile, isNewUser }) {
            // OAuth user signed in
            if (isNewUser) {
                console.log("New OAuth user signed in:", user.email)
            }
        }
    }
}