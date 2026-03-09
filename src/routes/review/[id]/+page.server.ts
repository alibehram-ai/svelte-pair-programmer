import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/server/db";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
  const review = await prisma.codeReview.findUnique({
    where: { id: params.id },
    include: {
      result: {
        include: {
          comments: {
            orderBy: { lineStart: "asc" },
          },
        },
      },
    },
  });

  if (!review) {
    throw error(404, "Review not found");
  }

  return { review };
};
