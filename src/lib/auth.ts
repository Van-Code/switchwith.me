import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import type { GoogleProfile } from "next-auth/providers/google"

export const buildAuthOptions: NextAuthOptions = {
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
      allowDangerousEmailAccountLinking: true,
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
        where: { email },
      })

      if (!existingUser) {
        const googleProfile = profile as GoogleProfile
        const lastInitial =
          googleProfile.family_name && googleProfile.family_name.length > 0
            ? googleProfile.family_name.charAt(0)
            : null

        await prisma.user.create({
          data: {
            email: email,
            emailNotificationsEnabled: true,
            profile: {
              create: {
                firstName: googleProfile.given_name ?? user.name ?? "",
                lastInitial,
                emailVerified: true,
              },
            },
          },
          include: {
            profile: true,
          },
        })
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
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // OAuth user signed in
      if (isNewUser) {
        console.log("New OAuth user signed in:", user.email)
      }
    },
  },
}
