import { PrismaClient } from "../../generated/prisma";
import { dev } from "$app/environment";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (dev) {
  globalForPrisma.prisma = prisma;
}
