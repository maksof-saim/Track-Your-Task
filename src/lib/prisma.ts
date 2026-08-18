import dns from "node:dns";
import type { PoolConfig } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Some hosts resolve Neon's pooler to an IPv6 address that isn't reachable,
// causing intermittent connection timeouts. Forcing IPv4 resolution avoids that.
type LookupFn = (
  hostname: string,
  options: unknown,
  callback: (err: NodeJS.ErrnoException | null, address: string, family: number) => void,
) => void;

const poolConfig: PoolConfig & { lookup?: LookupFn } = {
  connectionString: process.env.DATABASE_URL,
  lookup: (hostname, _options, callback) => dns.lookup(hostname, { family: 4 }, callback),
};

const adapter = new PrismaPg(poolConfig);

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
