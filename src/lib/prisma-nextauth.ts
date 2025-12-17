import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as { prismaNextAuth?: PrismaClient }

export function getPrismaNextAuth() {
  if (globalForPrisma.prismaNextAuth) return globalForPrisma.prismaNextAuth
  const client = new PrismaClient()
  if (process.env.NODE_ENV !== "production") globalForPrisma.prismaNextAuth = client
  return client
}
