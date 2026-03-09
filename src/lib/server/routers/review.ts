import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { prisma } from "../db";
import { reviewCode } from "../ai";

export const reviewRouter = router({
  submit: publicProcedure
    .input(
      z.object({
        content: z.string().min(1, "Code content is required"),
        language: z.string().min(1, "Language is required"),
        filename: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Create pending review
      const codeReview = await prisma.codeReview.create({
        data: {
          content: input.content,
          language: input.language,
          filename: input.filename,
          status: "PENDING",
        },
      });

      try {
        // Get AI review
        const aiResult = await reviewCode({
          content: input.content,
          language: input.language,
          filename: input.filename,
        });

        // Store the result
        const reviewResult = await prisma.reviewResult.create({
          data: {
            codeReviewId: codeReview.id,
            summary: aiResult.summary,
            readability: aiResult.scores.readability,
            structure: aiResult.scores.structure,
            maintainability: aiResult.scores.maintainability,
            comments: {
              create: aiResult.comments.map((comment) => ({
                category: comment.category,
                message: comment.message,
                lineStart: comment.lineStart,
                lineEnd: comment.lineEnd,
              })),
            },
          },
          include: {
            comments: true,
          },
        });

        // Update status
        await prisma.codeReview.update({
          where: { id: codeReview.id },
          data: { status: "COMPLETED" },
        });

        return {
          id: codeReview.id,
          status: "COMPLETED" as const,
          result: reviewResult,
        };
      } catch (error) {
        // Mark as failed
        await prisma.codeReview.update({
          where: { id: codeReview.id },
          data: { status: "FAILED" },
        });

        throw error;
      }
    }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const review = await prisma.codeReview.findUnique({
        where: { id: input.id },
        include: {
          result: {
            include: {
              comments: true,
            },
          },
        },
      });

      if (!review) {
        throw new Error("Review not found");
      }

      return review;
    }),

  list: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().nullish(),
          status: z.enum(["PENDING", "COMPLETED", "FAILED"]).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor;
      const status = input?.status;

      const items = await prisma.codeReview.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: status ? { status } : undefined,
        orderBy: { createdAt: "desc" },
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

      let nextCursor: string | undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.codeReview.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
