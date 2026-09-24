// Browser session storage for Supabase Auth.
//
// The previous implementation brokered sessions through Lovable preview
// frames. That coupling is not needed for Vercel deployments and could leave
// the app waiting on a preview editor that does not exist.
export function browserAuthStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}
