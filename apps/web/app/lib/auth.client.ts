// apps/web/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
});

// Explicitly export the helpers to satisfy TypeScript's isolated declarations/type checking
export const signIn = authClient.signIn;
export const signOut = authClient.signOut;
export const useSession: typeof authClient.useSession = authClient.useSession;