import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("Missing DATABASE_URL. Set it in .env.local or environment variables.")
}

const pool = new PrismaPg({ connectionString: connectionString })

export const prisma = new PrismaClient({ adapter: pool })

const globalForPrisma = global as unknown as { prisma: typeof prisma }

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
