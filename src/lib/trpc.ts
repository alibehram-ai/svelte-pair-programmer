import type { AppRouter } from "$lib/server/router";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
    }),
  ],
});
