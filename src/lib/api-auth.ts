import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";
import { config } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.AUTH_SECRET || "fallback-secret";

export interface ApiUser {
  id: string;
  militaryId: string;
  name: string;
  rank: string;
  role: "ADMIN" | "INSTRUCTOR" | "USER";
  specialty: string | null;
}

export async function getApiAuth(req: NextRequest): Promise<ApiUser | null> {
  // 1. Try NextAuth session (web app)
  const session = await getServerSession(config);
  if (session?.user) {
    return {
      id: session.user.id,
      militaryId: session.user.militaryId,
      name: session.user.name,
      rank: session.user.rank,
      role: session.user.role,
      specialty: session.user.specialty,
    };
  }

  // 2. Try Bearer token (mobile app)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, SECRET) as { id: string } & Record<string, unknown>;
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, militaryId: true, name: true, rank: true, role: true, specialty: true, active: true },
      });
      if (user?.active) {
        return user as ApiUser;
      }
    } catch {
      return null;
    }
  }

  return null;
}
