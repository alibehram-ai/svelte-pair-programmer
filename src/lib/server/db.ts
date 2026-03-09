import { PrismaClient } from "$lib/../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { dev } from "$app/environment";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const adapter = new PrismaLibSql({
  url: "file:./prisma/dev.db",
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (dev) {
  globalForPrisma.prisma = prisma;
}
