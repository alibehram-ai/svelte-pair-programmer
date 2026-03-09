import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { RequestHandler } from "@sveltejs/kit";
import { appRouter } from "$lib/server/router";
import { createContext } from "$lib/server/trpc";

const handler: RequestHandler = async (event) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: event.request,
    router: appRouter,
    createContext: () => createContext(event),
  });
};

export const GET = handler;
export const POST = handler;
