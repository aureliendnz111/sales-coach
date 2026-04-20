import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";

export const scriptsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("scripts")
      .select("*, steps(count), objections(count)")
      .eq("user_id", ctx.userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }),

  getWithDetails: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("scripts")
        .select("*, steps(*), objections(*)")
        .eq("id", input.id)
        .eq("user_id", ctx.userId)
        .order("order", { referencedTable: "steps", ascending: true })
        .order("order", { referencedTable: "objections", ascending: true })
        .single();
      if (error) throw error;
      return data;
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), goal: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("scripts")
        .insert({ ...input, user_id: ctx.userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(1).optional(),
      goal: z.string().optional(),
      reminders: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const { data, error } = await ctx.supabase
        .from("scripts")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", ctx.userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("scripts")
        .delete()
        .eq("id", input.id)
        .eq("user_id", ctx.userId);
      if (error) throw error;
      return { success: true };
    }),
});
