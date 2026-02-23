// lib/auth/requireAuth.ts
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/server";

type AuthPayload = {
  userId: string;
  email: string;
};

export async function requireAuth(options?: { redirectTo?: string }): Promise<AuthPayload> {
  const user = await getAuthUser();

  if (!user) {
    redirect(options?.redirectTo ?? "/login");
  }

  return user;
}
