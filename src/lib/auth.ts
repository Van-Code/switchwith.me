import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import * as bcrypt from "bcryptjs"

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
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials")
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    },
                    include: {
                        profile: true
                    }
                })

                if (!user || !user.password) {
                    throw new Error("Invalid credentials")
                }

                const isCorrectPassword = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!isCorrectPassword) {
                    throw new Error("Invalid credentials")
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.profile ? `${user.profile.firstName} ${user.profile.lastInitial}.` : user.email,
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // For OAuth providers (Google, Facebook), check if user exists
            if (account && account.provider !== "credentials") {
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
            }

            // Allow credential sign-ins and OAuth for existing users
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
            // If it's a new OAuth user without a profile, you might want to redirect them
            // to complete their profile later
            if (isNewUser && account?.provider !== "credentials") {
                // New OAuth user - you can add logic here to handle profile creation
                console.log("New OAuth user signed in:", user.email)
            }
        }
    }
}