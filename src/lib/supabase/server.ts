import { createServerClient } from "@supabase/ssr";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  const { userId } = await auth();

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  // Passer le Clerk user ID à Postgres pour les politiques RLS
  if (userId) {
    await client.rpc("set_config", {
      setting: "app.user_id",
      value: userId,
      is_local: true,
    });
  }

  return client;
}
