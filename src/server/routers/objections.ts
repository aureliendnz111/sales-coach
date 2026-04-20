import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";

const ObjectionInput = z.object({
  label: z.string().min(1),
  category: z.string(),
  trigger_phrases: z.array(z.string()).optional(),
  applicable_step_orders: z.array(z.number()).optional(),
  responses: z.array(z.string()).optional(),
  key_reframe: z.string().optional(),
});

export const objectionsRouter = router({
  update: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: ObjectionInput.partial() }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("objections")
        .update(input.data)
        .eq("id", input.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }),

  create: protectedProcedure
    .input(z.object({ script_id: z.string().uuid(), data: ObjectionInput }))
    .mutation(async ({ ctx, input }) => {
      const { count } = await ctx.supabase
        .from("objections")
        .select("*", { count: "exact", head: true })
        .eq("script_id", input.script_id);
      const { data, error } = await ctx.supabase
        .from("objections")
        .insert({ ...input.data, script_id: input.script_id, order: (count ?? 0) + 1 })
        .select()
        .single();
      if (error) throw error;
      return data;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase.from("objections").delete().eq("id", input.id);
      if (error) throw error;
      return { success: true };
    }),
});
