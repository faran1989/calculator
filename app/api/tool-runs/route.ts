// app/api/tool-runs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

type AuthUser = { userId: string; email?: string | null };

/**
 * Primary: JWT cookie (takhmino_auth)
 * Fallback: x-auth-user header set by middleware (auth bridge)
 *
 * This makes ToolRun logging consistent with the rest of the app's auth model
 * without any breaking change to JWT/middleware.
 */
async function getAuthUserFromRequest(req: NextRequest): Promise<AuthUser | null> {
  // 1) Cookie (primary)
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (token) {
    try {
      const user = await verifyAuthToken(token);
      if (user?.userId) return user;
    } catch {
      // fallthrough to header
    }
  }

  // 2) Header bridge (fallback)
  const headerVal = req.headers.get("x-auth-user");
  if (!headerVal) return null;

  try {
    const parsed = JSON.parse(headerVal) as AuthUser;
    if (parsed?.userId) return parsed;
    return null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHENTICATED" },
      { status: 401, headers: { "cache-control": "no-store" } }
    );
  }

  const toolRuns = await prisma.toolRun.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      result: {
        select: {
          version: true,
          rawData: true,
          summary: true,
        },
      },
    },
  });

  return NextResponse.json(
    { ok: true, toolRuns },
    { headers: { "cache-control": "no-store" } }
  );
}

export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHENTICATED" },
      { status: 401, headers: { "cache-control": "no-store" } }
    );
  }

  const body = await req.json().catch(() => null);

  const toolSlug = body?.toolSlug;
  const toolName = body?.toolName;
  const summary = body?.summary ?? null;
  const rawData = body?.rawData ?? {};
  const version = body?.version ?? 1;

  if (!toolSlug || !toolName) {
    return NextResponse.json({ ok: false, error: "INVALID_PAYLOAD" }, { status: 400 });
  }

  const created = await prisma.toolRun.create({
    data: {
      userId: user.userId,
      toolSlug,
      toolName,
      result: {
        create: {
          version,
          rawData: JSON.stringify(rawData ?? {}),
          summary,
        },
      },
    },
  });

  return NextResponse.json(
    { ok: true, id: created.id },
    { headers: { "cache-control": "no-store" } }
  );
}