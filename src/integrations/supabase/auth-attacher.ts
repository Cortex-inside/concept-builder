// This middleware is used by TanStack Start server functions. It is deliberately
// tolerant of missing Supabase runtime configuration so public pages can still
// render while deployment configuration is being completed.
import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "./client";

export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      return next({
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (error) {
      console.error("[Supabase] Unable to restore session for server function:", error);
      return next({ headers: {} });
    }
  },
);
