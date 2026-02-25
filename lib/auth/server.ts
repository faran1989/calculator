import { headers } from "next/headers";

type AuthPayload = {
  userId: string;
  email: string;
  name?: string;
};

function safeBase64Decode(input: string) {
  try {
    return Buffer.from(input, "base64").toString("utf-8");
  } catch {
    return null;
  }
}

export async function getAuthUser(): Promise<AuthPayload | null> {
  // ✅ Next 16: headers() is async
  const h = await headers();

  const encoded = h.get("x-auth-user");
  if (!encoded) return null;

  const json = safeBase64Decode(encoded);
  if (!json) return null;

  try {
    const obj = JSON.parse(json);
    if (!obj?.userId || !obj?.email) return null;
    return { userId: String(obj.userId), email: String(obj.email), name: obj.name ? String(obj.name) : undefined };
  } catch {
    return null;
  }
}
