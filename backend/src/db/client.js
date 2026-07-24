import { PrismaClient } from "@prisma/client";

// Single shared Prisma instance. In dev with --watch this file is
// re-evaluated on change, so we stash the client on globalThis to avoid
// exhausting SQLite connections across reloads.
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}
