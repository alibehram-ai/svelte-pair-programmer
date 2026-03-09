import superjson from "superjson";
import { initTRPC } from "@trpc/server";
import type { RequestEvent } from "@sveltejs/kit";

export type Context = {
  event: RequestEvent;
};

export const createContext = (event: RequestEvent): Context => ({
  event,
});

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
