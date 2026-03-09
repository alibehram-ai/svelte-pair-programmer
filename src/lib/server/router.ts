import { publicProcedure, router } from "./trpc";
import { reviewRouter } from "./routers/review";

export const appRouter = router({
  health: publicProcedure.query(() => ({
    status: "ok" as const,
  })),
  review: reviewRouter,
});
export type AppRouter = typeof appRouter;
