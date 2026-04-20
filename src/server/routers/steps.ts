import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";

const StepInput = z.object({
  name: z.string().min(1),
  goal: z.string().optional(),
  duration_estimate_minutes: z.number().optional(),
  key_phrases: z.array(z.string()).optional(),
  questions: z.array(z.string()).optional(),
  tips: z.array(z.string()).optional(),
});

export const stepsRouter = router({
  update: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: StepInput.partial() }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("steps")
        .update(input.data)
        .eq("id", input.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }),
});
