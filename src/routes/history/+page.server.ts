import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/server/db";

export const load: PageServerLoad = async ({ url }) => {
  const status = url.searchParams.get("status") as "PENDING" | "COMPLETED" | "FAILED" | null;

  const reviews = await prisma.codeReview.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      result: {
        select: {
          readability: true,
          structure: true,
          maintainability: true,
        },
      },
    },
  });

  return { reviews, currentStatus: status };
};
