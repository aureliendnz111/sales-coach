import { router } from "@/server/trpc";
import { scriptsRouter } from "./scripts";
import { stepsRouter } from "./steps";
import { objectionsRouter } from "./objections";

export const appRouter = router({
  scripts: scriptsRouter,
  steps: stepsRouter,
  objections: objectionsRouter,
});

export type AppRouter = typeof appRouter;
